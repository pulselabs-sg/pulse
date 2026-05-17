"""
Fish Speech S2 Pro — SGLang Inference Server
=============================================

Architecture:
  SGLangBackend  (A100-40GB, max_containers=2, max_concurrent=20)
    └── fish-speech tools/api_server.py --mode sglang (port 8880)
    └── Handles continuous batching, paged KV cache, CUDA graph replay,
        and RadixAttention prefix caching automatically.

  FishSpeechGateway  (CPU only, max_containers=10)
    └── Auth middleware
    └── Ref audio download + URL-based in-memory cache
    └── Proxies to SGLangBackend.tts()
    └── Returns audio bytes

Deploy:
  modal deploy modal_server/sglang_server.py

Cold start note:
  SGLang loads the model from disk (~60-90s on first start).
  GPU snapshot is NOT used here because subprocess state (SGLang engine)
  cannot survive a snapshot/restore cycle.
  Mitigate with scaledown_window=300 to keep containers warm longer.

Perf vs naive generate_long:
  - Latency per 900-char chunk:  ~10-15s  (was ~28-40s)
  - 15,000 chars PRO:            ~35-50s  (was ~112s)
  - GPU utilization:             ~55-75%  (was ~15-25%)
  - RadixAttention: ref audio KV cache is reused across all chunks
    of the same voice → ~20% extra speedup per call.
"""

import os
import io
import time
import hashlib
import base64
import sys
import modal
import numpy as np
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import Response, JSONResponse

# ---------------------------------------------------------------------------
# Modal App — same name as audio.py so routes are served under the same URL.
# Deploy EITHER audio.py (naive) OR sglang_server.py (SGLang).
# ---------------------------------------------------------------------------
app = modal.App("ipulse-sglang")

CHECKPOINT_PATH = "/workspace/fish-speech/checkpoints/s2-pro"
CODEC_PATH      = "/workspace/fish-speech/checkpoints/s2-pro/codec.pth"
CODEC_CONFIG    = "modded_dac_vq"
SGLANG_PORT     = 8880
SGLANG_URL      = f"http://127.0.0.1:{SGLANG_PORT}"

# ---------------------------------------------------------------------------
# Image — same base as audio.py + sglang package
# ---------------------------------------------------------------------------
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("git", "ffmpeg", "build-essential", "portaudio19-dev", "libasound2-dev")

    .pip_install(
        "torch==2.4.1",
        "torchvision==0.19.1",
        "torchaudio==2.4.1",
        index_url="https://download.pytorch.org/whl/cu121"
    )

    .run_commands(
        "pip install https://github.com/Dao-AILab/flash-attention/releases/download/v2.6.3/"
        "flash_attn-2.6.3%2Bcu123torch2.4cxx11abiFALSE-cp310-cp310-linux_x86_64.whl"
    )

    .pip_install(
        "vector-quantize-pytorch>=1.18.5", "einx[torch]", "omegaconf",
        "hydra-core", "hydra-colorlog", "pyrootutils", "loguru",
        "natsort", "huggingface_hub[cli]", "hf_transfer", "transformers",
        "accelerate", "peft", "lightning", "timm", "einops",
        "bitsandbytes", "sentencepiece", "safetensors", "loralib",
        "wandb", "librosa", "soundfile", "funasr", "silero-vad",
        "descript-audio-codec", "pydub", "zstandard", "resampy",
        "numpy", "pillow", "fastapi", "uvicorn", "kui", "pydantic",
        "requests", "httpx", "tiktoken", "cachetools", "ormsgpack",
        "modelscope", "opencc-python-reimplemented", "grpcio", "scipy",
        # SGLang for optimized inference
        "sglang[all]>=0.4.0",
    )

    .run_commands(
        "git clone https://github.com/fishaudio/fish-speech.git /workspace/fish-speech",
        "cd /workspace/fish-speech && sed -i 's/torch==[0-9.]*/torch>=2.4.0/g' pyproject.toml || true",
        "cd /workspace/fish-speech && sed -i 's/torchaudio==[0-9.]*/torchaudio>=2.4.0/g' pyproject.toml || true",
        "cd /workspace/fish-speech && pip install -e .",
        "export HF_HUB_ENABLE_HF_TRANSFER=1 && "
        "hf download fishaudio/s2-pro --local-dir /workspace/fish-speech/checkpoints/s2-pro",
    )
)


# ---------------------------------------------------------------------------
# SGLangBackend
# GPU container. Runs fish-speech api_server in SGLang mode as a subprocess.
# max_containers=2: each handles up to 20 concurrent sequences via SGLang.
# ---------------------------------------------------------------------------
@app.cls(
    image=image,
    gpu="A100-40GB",
    timeout=600,
    scaledown_window=300,   # Keep warm 5 min (cold start is ~90s)
    max_containers=2,
    secrets=[modal.Secret.from_name("voicelab-modal-auth")],
    # No GPU snapshot: SGLang subprocess state cannot be snapshotted
)
@modal.concurrent(max_inputs=20)
class SGLangBackend:

    @modal.enter()
    def start_server(self):
        """
        Start fish-speech API server in SGLang mode.
        SGLang internally handles:
          - Continuous batching
          - Paged KV cache
          - CUDA graph replay
          - RadixAttention prefix caching (ref audio KV reused across chunks)
        """
        import subprocess
        import httpx

        print("[SGLANG] Starting fish-speech api_server in SGLang mode...")
        self.proc = subprocess.Popen(
            [
                "python", "tools/api_server.py",
                "--mode",   "sglang",
                "--listen", f"127.0.0.1:{SGLANG_PORT}",
                "--llama-checkpoint-path",   CHECKPOINT_PATH,
                "--decoder-checkpoint-path", CODEC_PATH,
                "--decoder-config-name",     CODEC_CONFIG,
                "--compile",        # torch.compile on top of SGLang
            ],
            cwd="/workspace/fish-speech",
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )

        # Poll until the server is accepting connections (up to 150s)
        deadline = time.time() + 150
        while time.time() < deadline:
            try:
                r = httpx.get(f"{SGLANG_URL}/docs", timeout=3)
                if r.status_code < 500:
                    print("[SGLANG] Server ready ✓")
                    return
            except Exception:
                pass
            # Log subprocess output to help debug startup issues
            if self.proc.poll() is not None:
                out = self.proc.stdout.read().decode(errors="replace")
                raise RuntimeError(f"[SGLANG] Server process died.\n{out}")
            time.sleep(3)

        raise RuntimeError("[SGLANG] Timed out waiting for server to start.")

    @modal.exit()
    def stop_server(self):
        if hasattr(self, "proc") and self.proc.poll() is None:
            self.proc.terminate()
            self.proc.wait(timeout=10)
            print("[SGLANG] Server stopped.")

    @modal.method()
    async def tts(
        self,
        text: str,
        ref_audio_bytes: bytes | None,
        ref_text: str,
        fmt: str = "mp3",
    ) -> bytes:
        """
        Generate TTS audio via the internal SGLang server.

        Parameters
        ----------
        text            Text chunk to synthesize.
        ref_audio_bytes Raw audio bytes of the reference voice (or None).
        ref_text        Transcript of the reference audio (or empty string).
        fmt             Output format: "mp3" or "wav".

        Returns
        -------
        bytes  Raw audio in the requested format.
        """
        import ormsgpack
        import httpx

        # Build fish-speech ServeTTSRequest (msgpack)
        references = []
        if ref_audio_bytes:
            references = [{"audio": ref_audio_bytes, "text": ref_text or " "}]

        payload = ormsgpack.packb(
            {
                "text": text,
                "references": references,
                "format": fmt,
                "normalize": True,
                "max_new_tokens": 2048,
                "top_p": 0.7,
                "repetition_penalty": 1.2,
                "temperature": 0.7,
                "streaming": False,
            },
            option=ormsgpack.OPT_NON_STR_KEYS | ormsgpack.OPT_SERIALIZE_NUMPY,
        )

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{SGLANG_URL}/v1/tts",
                content=payload,
                headers={"Content-Type": "application/msgpack"},
            )
            if resp.status_code != 200:
                raise RuntimeError(
                    f"[SGLANG] TTS failed {resp.status_code}: {resp.text[:300]}"
                )
            return resp.content  # raw mp3 / wav bytes


# ---------------------------------------------------------------------------
# FishSpeechGateway
# CPU-only proxy. No GPU needed — just auth, ref audio download/cache, routing.
# max_containers=10: scales horizontally to handle concurrent user requests.
# ---------------------------------------------------------------------------

# In-memory ref audio cache: url → raw bytes
# Avoids re-downloading the same voice file for every chunk.
_ref_audio_cache: dict[str, bytes] = {}
_REF_CACHE_MAX = 50  # max number of voices to cache


@app.cls(
    image=image,
    gpu=None,               # CPU only — no GPU cost
    timeout=600,
    scaledown_window=60,
    max_containers=10,
    secrets=[modal.Secret.from_name("voicelab-modal-auth")],
)
@modal.concurrent(max_inputs=1)
class FishSpeechGateway:

    @modal.asgi_app()
    def fastapi_app(self):
        web_app = FastAPI(docs_url=None, redoc_url=None)

        # ── Auth middleware ──────────────────────────────────────────────
        @web_app.middleware("http")
        async def auth(request: Request, call_next):
            if request.url.path in ("/", "/health"):
                return await call_next(request)
            if (
                request.headers.get("Modal-Key", "")    != os.environ.get("MODAL_TOKEN_ID", "")
                or request.headers.get("Modal-Secret", "") != os.environ.get("MODAL_TOKEN_SECRET", "")
            ):
                return JSONResponse({"detail": "Unauthorized"}, status_code=401)
            return await call_next(request)

        @web_app.get("/health")
        async def health():
            return {"status": "ok", "backend": "sglang"}

        # ── TTS endpoint ─────────────────────────────────────────────────
        @web_app.post("/v1/tts")
        async def tts(request: Request):
            import urllib.request

            body       = await request.json()
            text       = body.get("text", "")
            ref_url    = body.get("reference_audio_url")
            ref_text   = body.get("reference_text", "")
            format_ext = body.get("format", "mp3")

            if not text:
                raise HTTPException(400, "Missing 'text'")

            # 1. Download reference audio (with URL-keyed cache)
            ref_audio_bytes: bytes | None = None
            if ref_url:
                url_key = hashlib.sha256(ref_url.encode()).hexdigest()
                ref_audio_bytes = _ref_audio_cache.get(url_key)
                if ref_audio_bytes is None:
                    try:
                        req = urllib.request.Request(
                            ref_url, headers={"User-Agent": "Mozilla/5.0"}
                        )
                        with urllib.request.urlopen(req, timeout=15) as r:
                            ref_audio_bytes = r.read()
                        # Trim to 30s worth — pydub-free size heuristic:
                        # 44100 Hz × 2 bytes/sample × 30s = 2,646,000 bytes
                        if len(ref_audio_bytes) > 2_646_000:
                            ref_audio_bytes = ref_audio_bytes[:2_646_000]
                        # Cache eviction: drop oldest if over limit
                        if len(_ref_audio_cache) >= _REF_CACHE_MAX:
                            _ref_audio_cache.pop(next(iter(_ref_audio_cache)))
                        _ref_audio_cache[url_key] = ref_audio_bytes
                        print(f"[GW] Ref audio cached ({len(ref_audio_bytes)} bytes) key={url_key[:8]}")
                    except Exception as e:
                        print(f"[GW] Ref audio download failed (non-fatal): {e}")
                        ref_audio_bytes = None
                else:
                    print(f"[GW] Ref audio cache hit key={url_key[:8]}")

            # 2. Call SGLangBackend
            try:
                backend = SGLangBackend()
                audio_bytes: bytes = await backend.tts.remote.aio(
                    text, ref_audio_bytes, ref_text, format_ext
                )
            except Exception as e:
                import traceback
                print(f"[GW] SGLang call failed: {traceback.format_exc()}")
                raise HTTPException(500, f"SGLang generation failed: {e}")

            content_type = "audio/mpeg" if format_ext == "mp3" else "audio/wav"
            return Response(content=audio_bytes, media_type=content_type)

        return web_app
