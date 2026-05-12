import os
import io
import time
import tempfile
import urllib.request
import base64
import threading
import sys
import modal
import requests
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, JSONResponse

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
        "vector-quantize-pytorch>=1.18.5", "einx[torch]", "omegaconf",
        "hydra-core", "hydra-colorlog", "pyrootutils", "loguru",
        "natsort", "huggingface_hub[cli]", "hf_transfer", "transformers",
        "accelerate", "peft", "lightning", "timm", "einops",
        "bitsandbytes", "sentencepiece", "safetensors", "loralib",
        "wandb", "librosa", "soundfile", "funasr", "silero-vad",
        "descript-audio-codec", "pydub", "zstandard", "resampy",
        "numpy", "pillow", "fastapi", "uvicorn", "kui", "pydantic",
        "requests", "tiktoken", "cachetools", "ormsgpack",
        "modelscope", "opencc-python-reimplemented", "grpcio"
    )
    .run_commands(
        "git clone --branch v1.5.0 https://github.com/fishaudio/fish-speech.git /workspace/fish-speech",
        "cd /workspace/fish-speech && pip install -e .",
        "export HF_HUB_ENABLE_HF_TRANSFER=1 && hf download fishaudio/fish-speech-1.5 --local-dir /workspace/fish-speech/checkpoints/fish-speech-1.5",
        "cp /workspace/fish-speech/checkpoints/fish-speech-1.5/firefly-gan-vq-fsq-8x1024-21hz-generator.pth /workspace/fish-speech/checkpoints/fish-speech-1.5/codec.pth"
    )
)


@app.cls(
    image=image,
    gpu="L4",
    timeout=300,
    scaledown_window=30,
    secrets=[modal.Secret.from_name("voicelab-modal-auth")],
)
@modal.concurrent(max_inputs=2) # <--- CORRECT MODAL 1.0 WAY
class FishSpeechInference:
    
    @modal.enter()
    def load_model(self):
        """
        Load the model only once when the container starts (Cold Start).
        COMPLETELY REMOVED SUBPROCESS, running directly via Python Native.
        """
        print("--- [COLD START] Starting internal Python Engine to load VRAM... ---")
        sys.path.append("/workspace/fish-speech")
        
        def run_python_engine():
            # Pass mock arguments to activate Fish Speech's api_server
            sys.argv = [
                "api_server.py",
                "--listen", "127.0.0.1:8080",
                "--llama-checkpoint-path", "/workspace/fish-speech/checkpoints/fish-speech-1.5",
                "--decoder-checkpoint-path", "/workspace/fish-speech/checkpoints/fish-speech-1.5/codec.pth",
                "--device", "cuda"
            ]
            import runpy
            # runpy runs the module directly within the current process (NO subprocess spawned)
            try:
                runpy.run_module("tools.api_server", run_name="__main__")
            except Exception as e:
                print(f"Engine exited: {e}")

        # Run engine on a background thread
        self.engine_thread = threading.Thread(target=run_python_engine, daemon=True)
        self.engine_thread.start()
        
        # Wait for Engine to load weights into GPU (Only wait the very first time)
        print("Waiting for Engine to load Weights into GPU (about 30-60s)...")
        start_time = time.time()
        ready = False
        while time.time() - start_time < 180:
            try:
                res = requests.get("http://127.0.0.1:8080/v1/tts", timeout=2)
                # Their API returns 405 (Method Not Allowed for GET), which means the server is alive and ready
                if res.status_code in [200, 404, 405, 422]:
                    print("--- [READY] Successfully loaded the model into GPU! ---")
                    ready = True
                    break
            except Exception:
                pass
            time.sleep(3)
            
        if not ready:
            raise Exception("Error: Cannot start internal Fish Speech Engine.")

    @modal.asgi_app()
    def fastapi_app(self):
        web_app = FastAPI(docs_url=None, redoc_url=None)

        @web_app.middleware("http")
        async def require_modal_auth(request: Request, call_next):
            if request.url.path in ("/", "/health"):
                return await call_next(request)

            expected_key = os.environ.get("MODAL_TOKEN_ID", "")
            expected_secret = os.environ.get("MODAL_TOKEN_SECRET", "")
            key = request.headers.get("Modal-Key", "")
            secret = request.headers.get("Modal-Secret", "")

            if key != expected_key or secret != expected_secret:
                return JSONResponse({"detail": "Unauthorized"}, status_code=401)

            return await call_next(request)

        @web_app.get("/health")
        async def health():
            return {"status": "ok", "model": "fish-speech-1.5-native-class"}

        @web_app.post("/v1/tts")
        async def tts_endpoint(request: Request):
            body = await request.json()
            text = body.get("text")
            ref_url = body.get("reference_audio_url")
            ref_text = body.get("reference_text", "")
            format_ext = body.get("format", "mp3")

            if not text:
                raise HTTPException(status_code=400, detail="Missing 'text' field")

            # 1. Download Reference Audio
            ref_audio_content = None
            if ref_url:
                try:
                    req_urllib = urllib.request.Request(ref_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req_urllib) as response:
                        raw_audio = response.read()
                        
                        from pydub import AudioSegment
                        audio_segment = AudioSegment.from_file(io.BytesIO(raw_audio))
                        if len(audio_segment) > 30000:
                            audio_segment = audio_segment[:30000]
                        
                        out_io = io.BytesIO()
                        audio_segment.export(out_io, format="wav")
                        ref_audio_content = out_io.getvalue()
                except Exception as e:
                    print(f"Error downloading reference audio: {e}")

            # 2. Process Audio Generation Logic
            try:
                payload = {
                    "text": text,
                    "format": format_ext,
                    "normalize": True,
                    "latency": "normal"
                }

                if ref_audio_content:
                    audio_b64 = base64.b64encode(ref_audio_content).decode("utf-8")
                    payload["references"] = [{"audio": audio_b64, "text": ref_text}]

                # Call directly via loopback. No network overhead as it only communicates RAM-to-RAM.
                # Does not waste time creating processes like subprocess.
                response = requests.post("http://127.0.0.1:8080/v1/tts", json=payload, stream=True)
                
                if response.status_code != 200:
                    raise Exception(f"Internal Engine Error {response.status_code}: {response.text}")

                # 3. Return the file to Next.js
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=f".{format_ext}")
                for chunk in response.iter_content(chunk_size=16384):
                    temp_file.write(chunk)
                temp_file.close()

                media_type = f"audio/{'mpeg' if format_ext == 'mp3' else format_ext}"
                return FileResponse(temp_file.name, media_type=media_type)
                
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

        return web_app