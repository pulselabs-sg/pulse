"""
DeepFilterNet v3 — Modal Serverless Inference Service
======================================================
Deploys a CPU-only FastAPI endpoint on Modal that accepts a noisy audio file
and returns a noise-suppressed WAV using DeepFilterNet3.

Optimized for Zero Disk I/O (RAM-to-RAM processing) and Concurrency.
"""

import io
import os
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
    .pip_install(
        "torch==2.2.2",
        "torchaudio==2.2.2",
        index_url="https://download.pytorch.org/whl/cpu",
    )
    .pip_install(
        "deepfilternet==0.5.6",
        "soundfile",
        "fastapi",
        "uvicorn",
        "python-multipart",
    )
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
    docs_url=None,
    redoc_url=None,
)

@web_app.middleware("http")
async def require_modal_auth(request: Request, call_next):
    if request.url.path in ("/", "/health"):
        return await call_next(request)

    expected_key    = os.environ.get("MODAL_TOKEN_ID", "")
    expected_secret = os.environ.get("MODAL_TOKEN_SECRET", "")
    key    = request.headers.get("Modal-Key", "")
    secret = request.headers.get("Modal-Secret", "")

    if key != expected_key or secret != expected_secret:
        from fastapi.responses import JSONResponse
        return JSONResponse({"detail": "Unauthorized"}, status_code=401)

    return await call_next(request)

@web_app.get("/health")
async def health():
    return {"status": "ok", "model": "DeepFilterNet3"}


# ---------------------------------------------------------------------------
# Modal class
# ---------------------------------------------------------------------------

@app.cls(
    image=image,
    gpu=None,
    cpu=2.0,
    memory=3072,       # Increased to 3GB for safe in-memory RAM-to-RAM piping
    timeout=120,       
    scaledown_window=30,
    secrets=[modal.Secret.from_name("voicelab-modal-auth")],
)
@modal.concurrent(max_inputs=4) # <--- Enabled concurrency for CPU inference
class DeepFilterService:
    
    @modal.enter()
    def load_model(self):
        from df.enhance import init_df
        self.model, self.df_state, _ = init_df(model_base_dir="DeepFilterNet3")
        print("DeepFilterNet3 model loaded into memory.")

    @modal.asgi_app()
    def fastapi_app(self):
        service = self

        @web_app.post(
            "/enhance",
            response_class=Response,
            responses={200: {"content": {"audio/wav": {}}}},
        )
        async def enhance_audio(file: UploadFile = File(...)):
            import subprocess
            import soundfile as sf
            import torchaudio
            from df.enhance import enhance

            raw_bytes = await file.read()

            try:
                # ----------------------------------------------------------------
                # IN-MEMORY PIPING (Zero Disk I/O)
                # Pass raw bytes directly to ffmpeg stdin and read from stdout.
                # ----------------------------------------------------------------
                result = subprocess.run(
                    [
                        "ffmpeg", "-y",
                        "-i", "pipe:0",       # Input from stdin
                        "-ar", "48000",       # DeepFilterNet requires 48kHz
                        "-ac", "1",           # Mono
                        "-f", "wav",          # Output format
                        "pipe:1",             # Output to stdout
                    ],
                    input=raw_bytes,
                    capture_output=True,
                    timeout=60,
                )
                
                if result.returncode != 0:
                    stderr = result.stderr.decode(errors="replace")
                    raise HTTPException(
                        status_code=422,
                        detail=f"Audio decoding failed: {stderr[-500:]}",
                    )

                # Output WAV bytes straight from RAM
                wav_bytes = result.stdout

                # Load directly from BytesIO buffer using Torchaudio
                audio_tensor, sample_rate = torchaudio.load(io.BytesIO(wav_bytes))

                # Process via DeepFilterNet
                enhanced = enhance(service.model, service.df_state, audio_tensor)

                # Encode the enhanced tensor back to WAV bytes in RAM
                out_buf = io.BytesIO()
                sf.write(out_buf, enhanced.squeeze().numpy(), service.df_state.sr(), format="WAV")
                final_wav_bytes = out_buf.getvalue()

            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

            return Response(
                content=final_wav_bytes,
                media_type="audio/wav",
                headers={"Content-Disposition": 'attachment; filename="enhanced.wav"'},
            )

        return web_app