import os
import time
import subprocess
import tempfile
import urllib.request
import base64
import modal
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse

# Configure Modal App
app = modal.App("fish-speech-v1-5-server")

# Define Image with FULL dependencies
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("git", "ffmpeg", "build-essential", "portaudio19-dev", "libasound2-dev")
    .pip_install(
        "torch==2.4.1", 
        "torchaudio==2.4.1",
        index_url="https://download.pytorch.org/whl/cu121"
    )
    .pip_install(
        "vector-quantize-pytorch>=1.18.5", 
        "einx[torch]",
        "omegaconf",
        "hydra-core",
        "hydra-colorlog",
        "pyrootutils",
        "loguru",
        "natsort",
        "huggingface_hub[cli]",
        "hf_transfer", 
        "transformers",
        "accelerate",
        "peft",
        "lightning",
        "timm",
        "einops",
        "bitsandbytes",
        "sentencepiece",
        "safetensors",
        "loralib",
        "wandb",
        "librosa",
        "soundfile",
        "funasr",
        "silero-vad",
        "descript-audio-codec",
        "pydub",
        "zstandard",
        "resampy",
        "numpy",
        "pillow",
        "fastapi",
        "uvicorn",
        "kui",
        "pydantic",
        "requests",
        "tiktoken",
        "cachetools",
        "ormsgpack",
        "modelscope",
        "opencc-python-reimplemented",
        "grpcio"
    )
    .run_commands(
        "git clone --branch v1.5.0 https://github.com/fishaudio/fish-speech.git /workspace/fish-speech",
        "cd /workspace/fish-speech && pip install -e .",
        "export HF_HUB_ENABLE_HF_TRANSFER=1 && hf download fishaudio/fish-speech-1.5 --local-dir /workspace/fish-speech/checkpoints/fish-speech-1.5",
        "cp /workspace/fish-speech/checkpoints/fish-speech-1.5/firefly-gan-vq-fsq-8x1024-21hz-generator.pth /workspace/fish-speech/checkpoints/fish-speech-1.5/codec.pth"
    )
)

web_app = FastAPI(
    # Disable auto-generated docs — reduces attack surface on a private API.
    docs_url=None,
    redoc_url=None,
)

# ---------------------------------------------------------------------------
# Auth middleware — validates Modal-Key / Modal-Secret headers sent by
# the Next.js backend (text-to-speech and voice-changer routes).
# ---------------------------------------------------------------------------

@web_app.middleware("http")
async def require_modal_auth(request: Request, call_next):
    """Reject requests that don't carry valid Modal-Key/Modal-Secret credentials."""
    # Allow Modal internal health-check probes through without auth.
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
    """Modal health-check probe."""
    return {"status": "ok", "model": "fish-speech-1.5"}


def is_api_running(url):
    """Check if the internal API server is responding"""
    try:
        import requests
        # Send a GET request to /v1/tts. If Fish Speech is running, it returns 405 Method Not Allowed (since the tts endpoint requires POST).
        res = requests.get(f"{url}/v1/tts", timeout=2)
        if res.status_code in [200, 404, 405]:
            return True
    except requests.exceptions.RequestException:
        pass
    return False

def wait_for_api(url, timeout=180):
    """Wait for the Fish Speech server to fully start after being called"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        if is_api_running(url):
            print("--- Fish Speech API is ready! ---")
            return True
        time.sleep(5)
        print(f"Waiting for API server ({int(time.time() - start_time)}s elapsed)...")
    return False

@web_app.post("/v1/tts")
async def tts_endpoint(request: Request):
    import requests
    
    body = await request.json()
    text = body.get("text")
    ref_url = body.get("reference_audio_url")
    
    # Fish Speech voice cloning works best when you provide the transcript of the original audio file
    # If 'reference_text' is passed from your Next.js app, we receive it here. Otherwise, default to an empty string.
    ref_text = body.get("reference_text", "")

    if not text:
        raise HTTPException(status_code=400, detail="Missing 'text' field")
    
    checkpoint_path = "/workspace/fish-speech/checkpoints/fish-speech-1.5"
    local_api_url = "http://127.0.0.1:8080"

    # Start the background Fish Speech API if it hasn't been started yet
    if not is_api_running(local_api_url):
        print("Starting internal Fish Speech API server on port 8080...")
        subprocess.Popen([
            "python", "-m", "tools.api_server",
            "--listen", "127.0.0.1:8080", 
            "--llama-checkpoint-path", checkpoint_path,
            "--decoder-checkpoint-path", f"{checkpoint_path}/codec.pth",
            "--device", "cuda"
        ], cwd="/workspace/fish-speech")
        
        if not wait_for_api(local_api_url):
            raise HTTPException(status_code=500, detail="Internal API Server failed to start in time.")

    # Download reference audio if provided
    ref_audio_content = None
    if ref_url:
        try:
            req = urllib.request.Request(ref_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                ref_audio_content = response.read()
        except Exception as e:
            print(f"Error downloading reference audio: {e}")

    # Create standard JSON Payload for Fish Speech
    try:
        payload = {
            "text": text,
            "format": "wav",
            "normalize": True,
            "latency": "normal"
        }

        # If there is reference audio, encode it to Base64 and add it to the 'references' list
        if ref_audio_content:
            audio_b64 = base64.b64encode(ref_audio_content).decode("utf-8")
            payload["references"] = [
                {
                    "audio": audio_b64,
                    "text": ref_text
                }
            ]

        # IMPORTANT: Use `json=payload` instead of `data=` and `files=`
        # This ensures the HTTP Request has Content-Type: application/json -> Resolves the 415 error completely
        response = requests.post(f"{local_api_url}/v1/tts", json=payload, stream=True)
        
        if response.status_code != 200:
            error_detail = response.text
            raise Exception(f"Local API error: Status {response.status_code} - {error_detail}")

        # Save to temporary file and return to the Next.js client
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        for chunk in response.iter_content(chunk_size=16384):
            temp_file.write(chunk)
        temp_file.close()
                
        return FileResponse(temp_file.name, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.function(
    image=image,
    # L4 has the same 24 GB VRAM as A10G but costs ~27% less ($0.000222/s vs $0.000306/s).
    # Fish Speech 1.5 fits comfortably within 12 GB, so L4 is sufficient.
    gpu="L4",
    # 5-minute hard cap; prevents runaway billing if a request hangs.
    timeout=300,
    # 30s idle window before scale-down (was 120s).
    # This is the single biggest cost saving: each request no longer burns
    # 2 minutes of GPU time after it finishes.
    scaledown_window=30,
    # Inject auth credentials so the middleware can validate incoming requests.
    secrets=[modal.Secret.from_name("voicelab-modal-auth")],
)
@modal.asgi_app()
def fastapi_app():
    return web_app