"""
DeepFilterNet v3 — Modal Serverless Inference Service
======================================================
Deploys a CPU-only FastAPI endpoint on Modal that accepts a noisy audio file
and returns a noise-suppressed WAV using DeepFilterNet3.

Deploy:
    modal deploy modal_server/deepfilter.py

The deployed URL becomes MODAL_CLEAN_AUDIO_URL in your .env.
"""

import io
import os
import base64
import tempfile
import modal
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import Response

# ---------------------------------------------------------------------------
# App & Image
# ---------------------------------------------------------------------------

app = modal.App("deepfilter-v3-server")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "git")
    # Install CPU PyTorch first (smaller, faster to pull than CUDA wheels)
    .pip_install(
        "torch==2.2.2",
        "torchaudio==2.2.2",
        index_url="https://download.pytorch.org/whl/cpu",
    )
    # Install DeepFilterNet (pulls model identifier "DeepFilterNet3" automatically)
    .pip_install(
        "deepfilternet==0.5.6",
        "soundfile",
        "fastapi",
        "uvicorn",
        "python-multipart",
    )
    # Pre-bake the DeepFilterNet3 model weights into the image so there is
    # zero cold-start download latency.
    .run_commands(
        "python -c \""
        "from df.enhance import init_df; "
        "init_df(model_base_dir='DeepFilterNet3'); "
        "print('DeepFilterNet3 weights cached.')"
        "\""
    )
)

# ---------------------------------------------------------------------------
# FastAPI web app
# ---------------------------------------------------------------------------

web_app = FastAPI(
    title="DeepFilterNet v3 Enhancement API",
    # Disable automatic docs in production — reduces attack surface.
    docs_url=None,
    redoc_url=None,
)

# ---------------------------------------------------------------------------
# Auth middleware — validates Basic Auth sent by the Next.js backend.
# Credentials: MODAL_TOKEN_ID:MODAL_TOKEN_SECRET (same env vars as Fish Speech).
# ---------------------------------------------------------------------------

@web_app.middleware("http")
async def require_basic_auth(request: Request, call_next):
    """Reject any request that doesn't carry valid Basic Auth credentials."""
    # Allow Modal health-check probes through without auth.
    if request.url.path in ("/", "/health"):
        return await call_next(request)

    token_id     = os.environ.get("MODAL_TOKEN_ID", "")
    token_secret = os.environ.get("MODAL_TOKEN_SECRET", "")
    expected     = base64.b64encode(f"{token_id}:{token_secret}".encode()).decode()

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Basic ") or auth_header[6:] != expected:
        from fastapi.responses import JSONResponse
        return JSONResponse({"detail": "Unauthorized"}, status_code=401)

    return await call_next(request)


@web_app.get("/health")
async def health():
    """Modal health-check probe."""
    return {"status": "ok", "model": "DeepFilterNet3"}


# ---------------------------------------------------------------------------
# Modal class — loads model once per container lifecycle
# ---------------------------------------------------------------------------

@app.cls(
    image=image,
    # CPU-only: DF3 is designed for real-time CPU inference (~5–10× RT).
    # No GPU needed → significantly cheaper than A10G.
    gpu=None,
    cpu=2,
    memory=2048,       # 2 GB — comfortable headroom for DF3 + torch on CPU
    timeout=120,       # Max 2-minute processing window
    scaledown_window=30,
    # Inject auth credentials so the middleware can validate incoming requests.
    secrets=[modal.Secret.from_name("voicelab-modal-auth")],
)
class DeepFilterService:
    """Loads DeepFilterNet3 once per warm container and serves /enhance requests."""

    @modal.enter()
    def load_model(self):
        """Called once when the container starts — warms the model into memory."""
        from df.enhance import init_df
        self.model, self.df_state, _ = init_df(model_base_dir="DeepFilterNet3")
        print("DeepFilterNet3 model loaded and ready.")

    @modal.asgi_app()
    def fastapi_app(self):
        """Returns the FastAPI ASGI application bound to this instance."""

        # We need a reference to self inside the route handler.
        service = self

        @web_app.post(
            "/enhance",
            response_class=Response,
            responses={200: {"content": {"audio/wav": {}}}},
        )
        async def enhance_audio(file: UploadFile = File(...)):
            """
            Accept a noisy audio file (any format/sample-rate) and return
            a noise-suppressed 48 kHz WAV.

            The input is first resampled to 48 kHz via ffmpeg if required,
            then processed by DeepFilterNet3, and the result is returned as
            raw WAV bytes.
            """
            import subprocess
            import numpy as np
            import soundfile as sf
            from df.enhance import enhance, load_audio

            raw_bytes = await file.read()

            # ----------------------------------------------------------------
            # Step 1: Write the incoming file to a temp file so ffmpeg can
            #         determine its format without needing to know it upfront.
            # ----------------------------------------------------------------
            suffix = _safe_suffix(file.filename or "audio.wav")
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_in:
                tmp_in.write(raw_bytes)
                tmp_in_path = tmp_in.name

            try:
                # ----------------------------------------------------------------
                # Step 2: Resample to 48 kHz WAV (required by DeepFilterNet).
                #         ffmpeg handles any input format the OS can decode.
                # ----------------------------------------------------------------
                with tempfile.NamedTemporaryFile(
                    delete=False, suffix=".wav"
                ) as tmp_resampled:
                    tmp_resampled_path = tmp_resampled.name

                result = subprocess.run(
                    [
                        "ffmpeg", "-y",
                        "-i", tmp_in_path,
                        "-ar", "48000",   # 48 kHz required by DeepFilterNet
                        "-ac", "1",       # mono — DF3 is mono
                        "-f", "wav",
                        tmp_resampled_path,
                    ],
                    capture_output=True,
                    timeout=60,
                )
                if result.returncode != 0:
                    stderr = result.stderr.decode(errors="replace")
                    raise HTTPException(
                        status_code=422,
                        detail=f"Audio conversion failed: {stderr[-500:]}",
                    )

                # ----------------------------------------------------------------
                # Step 3: Load the 48 kHz WAV and run DeepFilterNet3 enhancement.
                # ----------------------------------------------------------------
                audio, _ = load_audio(tmp_resampled_path, sr=service.df_state.sr())
                enhanced = enhance(service.model, service.df_state, audio)

                # ----------------------------------------------------------------
                # Step 4: Encode the enhanced audio as WAV and return it.
                # ----------------------------------------------------------------
                out_buf = io.BytesIO()
                sf.write(out_buf, enhanced.T, service.df_state.sr(), format="WAV")
                wav_bytes = out_buf.getvalue()

            finally:
                # Always clean up temp files even on error.
                _safe_remove(tmp_in_path)
                _safe_remove(tmp_resampled_path if "tmp_resampled_path" in dir() else None)

            return Response(
                content=wav_bytes,
                media_type="audio/wav",
                headers={"Content-Disposition": 'attachment; filename="enhanced.wav"'},
            )

        return web_app


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _safe_suffix(filename: str) -> str:
    """Extract a safe file extension, defaulting to .wav."""
    _, ext = os.path.splitext(filename)
    allowed = {".wav", ".mp3", ".m4a", ".ogg", ".flac", ".aac", ".opus", ".webm"}
    return ext.lower() if ext.lower() in allowed else ".wav"


def _safe_remove(path: str | None) -> None:
    """Delete a file path, silently ignoring errors."""
    if path:
        try:
            os.unlink(path)
        except OSError:
            pass
