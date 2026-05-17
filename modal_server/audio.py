import os
import io
import time
import base64
import sys
import modal
import numpy as np
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import Response, JSONResponse

app = modal.App("ipulse-0.1")

# ---------------------------------------------------------------------------
# Image — S2 Pro BF16 + Flash Attention 2
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
        "modelscope", "opencc-python-reimplemented", "grpcio", "scipy"
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

CHECKPOINT_PATH = "/workspace/fish-speech/checkpoints/s2-pro"
CODEC_PATH      = "/workspace/fish-speech/checkpoints/s2-pro/codec.pth"
# Confirmed from build log: fish_speech/configs/modded_dac_vq.yaml
CODEC_CONFIG    = "modded_dac_vq"

# ---------------------------------------------------------------------------
# Full GPU Snapshot strategy:
#
#   snap=True  — Load LLaMA + codec into GPU VRAM in the MAIN process.
#                Modal snapshots both CPU RAM + GPU VRAM.
#                First cold start: ~100s. Subsequent cold starts: ~15-25s.
#
#   snap=False — Model already in VRAM from snapshot.
#                Start FastAPI directly (no subprocess, no reloading).
#                Ready in seconds.
# ---------------------------------------------------------------------------
@app.cls(
    image=image,
    gpu="A100-40GB",
    timeout=600,
    scaledown_window=60,
    max_containers=10,
    secrets=[modal.Secret.from_name("voicelab-modal-auth")],
    enable_memory_snapshot=True,
    experimental_options={"enable_gpu_snapshot": True},
)
@modal.concurrent(max_inputs=1)
class FishSpeechInference:

    # -----------------------------------------------------------------------
    # PHASE 1: Load everything into GPU VRAM → snapshot.
    # Only runs ONCE (first container ever). All subsequent cold starts
    # restore GPU VRAM from snapshot in ~15-25s instead of ~100s.
    # -----------------------------------------------------------------------
    @modal.enter(snap=True)
    def load_model(self):
        import torch
        sys.path.insert(0, "/workspace/fish-speech")

        try:
            import flash_attn
            print(f"[SNAP] Flash Attention {flash_attn.__version__} loaded")
        except ImportError:
            print("[SNAP] Flash Attention not found — SDPA fallback")

        print("[SNAP] Loading S2 Pro LLaMA into A100 VRAM...")
        from fish_speech.models.text2semantic.inference import init_model
        # init_model returns (model, decode_one_token) for fish-speech 2.0
        # decode_one_token is a closure/wrapper created by init_model for DualAR
        _init_result = init_model(
            checkpoint_path=CHECKPOINT_PATH,
            device="cuda",
            precision=torch.bfloat16,
            compile=False,
        )
        self.llama_model   = _init_result[0]
        self.decode_one_token = _init_result[1]  # NOT tokenizer — the decode function
        print(f"[SNAP] init_model returned {len(_init_result)} values: "
              f"{[type(r).__name__ for r in _init_result]}")
        self.device = "cuda"
        print("[SNAP] LLaMA loaded ✓")

        print("[SNAP] Loading ModifiedDAC codec (modded_dac_vq) into A100 VRAM...")
        from fish_speech.models.dac.inference import load_model as load_dac
        self.decoder_model = load_dac(
            config_name=CODEC_CONFIG,   # confirmed: modded_dac_vq
            checkpoint_path=CODEC_PATH,
            device="cuda",
        )
        print("[SNAP] Codec loaded ✓")

        # Warmup: run a tiny inference to prime CUDA kernels before snapshot
        self._warmup()
        print("[SNAP] GPU snapshot complete — subsequent cold starts will be ~15-25s")

    def _warmup(self):
        """Prime CUDA kernels with minimal inference before snapshot."""
        import torch
        try:
            from fish_speech.models.text2semantic.inference import generate_long
            with torch.no_grad():
                list(generate_long(
                    model=self.llama_model,
                    device=self.device,
                    decode_one_token=self.decode_one_token,
                    text="Hi.",
                    num_samples=1,
                    max_new_tokens=64,
                    top_p=0.7,
                    repetition_penalty=1.2,
                    temperature=0.7,
                    compile=False,
                    iterative_prompt=False,
                ))
            print("[SNAP] Warmup inference complete ✓")
        except Exception as e:
            print(f"[SNAP] Warmup skipped (non-fatal): {e}")

    # -----------------------------------------------------------------------
    # PHASE 2: GPU VRAM restored from snapshot. Just log and proceed.
    # The FastAPI server starts immediately — no model loading needed.
    # -----------------------------------------------------------------------
    @modal.enter(snap=False)
    def post_restore(self):
        print("[RESTORE] GPU snapshot restored. Model in VRAM. Ready immediately.")

    # -----------------------------------------------------------------------
    # FastAPI — direct Python inference, no subprocess
    # -----------------------------------------------------------------------
    @modal.asgi_app()
    def fastapi_app(self):
        import torch
        from scipy.io import wavfile

        web_app = FastAPI(docs_url=None, redoc_url=None)

        @web_app.middleware("http")
        async def auth(request: Request, call_next):
            if request.url.path in ("/", "/health"):
                return await call_next(request)
            if (request.headers.get("Modal-Key", "") != os.environ.get("MODAL_TOKEN_ID", "") or
                    request.headers.get("Modal-Secret", "") != os.environ.get("MODAL_TOKEN_SECRET", "")):
                return JSONResponse({"detail": "Unauthorized"}, status_code=401)
            return await call_next(request)

        @web_app.get("/health")
        async def health():
            return {"status": "ok"}

        def _decode_audio(decoder_model, codes):
            """
            Decode VQ integer codes → audio waveform.
            fish-speech ModifiedDAC official API (from modded_dac.py):
                model.from_indices(codes)  # codes: [B, n_codebooks, T] int64
            which internally calls:
                z_q = quantizer.decode(codes)  # DownsampleResidualVectorQuantize.decode
                audio = decoder(z_q)
            """
            import torch
            errors = []
            with torch.no_grad():
                # Path 1 (CORRECT): model.from_indices — official fish-speech API
                # See modded_dac.py: def from_indices(self, indices): ...
                try:
                    out = decoder_model.from_indices(codes)
                    print(f"[TTS] Decode Path1(from_indices) OK, output shape={out.shape}")
                    return out
                except Exception as e:
                    errors.append(f"Path1(from_indices): {e}")
                    print(f"[TTS] Decode {errors[-1]}")
                # Path 2: quantizer.decode → decoder (same as from_indices, manual)
                try:
                    z_q = decoder_model.quantizer.decode(codes)
                    out = decoder_model.decode(z_q)
                    print(f"[TTS] Decode Path2(quantizer.decode→decode) OK, output shape={out.shape}")
                    return out
                except Exception as e:
                    errors.append(f"Path2(quantizer.decode): {e}")
                    print(f"[TTS] Decode {errors[-1]}")
                # Path 3: quantizer.decode → decoder.model (skip DAC.decode wrapper)
                try:
                    z_q = decoder_model.quantizer.decode(codes)
                    out = decoder_model.decoder(z_q)
                    print(f"[TTS] Decode Path3(quantizer.decode→decoder.model) OK, output shape={out.shape}")
                    return out
                except Exception as e:
                    errors.append(f"Path3(decoder.model): {e}")
                    print(f"[TTS] Decode {errors[-1]}")
            raise RuntimeError(f"All decode paths failed: {' | '.join(errors)}")

        @web_app.post("/v1/tts")
        async def tts(request: Request):
            import urllib.request
            from fish_speech.models.text2semantic.inference import generate_long

            body       = await request.json()
            text       = body.get("text", "")
            ref_url    = body.get("reference_audio_url")
            ref_text   = body.get("reference_text", "")
            format_ext = body.get("format", "mp3")

            if not text:
                raise HTTPException(400, "Missing 'text'")

            # 1. Encode reference audio → VQ prompt tokens
            prompt_tokens = None
            prompt_text   = None
            if ref_url:
                try:
                    import io as _io
                    from pydub import AudioSegment
                    req = urllib.request.Request(
                        ref_url, headers={"User-Agent": "Mozilla/5.0"}
                    )
                    with urllib.request.urlopen(req) as r:
                        raw = r.read()
                    seg = AudioSegment.from_file(_io.BytesIO(raw))
                    if len(seg) > 30000:
                        seg = seg[:30000]
                    seg = seg.set_frame_rate(44100).set_channels(1)
                    samples = np.array(seg.get_array_of_samples()).astype(np.float32) / 32768.0
                    audio_t = torch.tensor(samples, device=self.device).unsqueeze(0).unsqueeze(0)
                    with torch.no_grad():
                        # ModifiedDAC.encode() may return a tuple of mixed types:
                        # (z_q, codes, latents, commit_loss, cb_loss) like DAC, or just codes.
                        # codes should be int64 tensor with dim >= 2 and shape[0] = n_codebooks (>1).
                        # We scan all elements to find it rather than hard-coding an index.
                        _enc = self.decoder_model.encode(audio_t)
                        print(f"[TTS] encode() returned type={type(_enc).__name__}, "
                              f"len={len(_enc) if isinstance(_enc, (tuple,list)) else 'N/A'}")
                        if isinstance(_enc, (tuple, list)):
                            codes = None
                            for _i, _v in enumerate(_enc):
                                if isinstance(_v, torch.Tensor) and _v.dim() >= 2 and _v.shape[0] > 1:
                                    print(f"[TTS] encode()[{_i}] chosen as codes: shape={_v.shape}, dtype={_v.dtype}")
                                    codes = _v
                                    break
                            if codes is None:
                                # Fall back: pick the element with largest number of dims
                                codes = max(
                                    (_v for _v in _enc if isinstance(_v, torch.Tensor)),
                                    key=lambda x: x.dim(),
                                    default=None
                                )
                            if codes is None:
                                raise ValueError(f"No tensor found in encode() output: {[type(v) for v in _enc]}")
                        else:
                            codes = _enc
                        # Normalize to [n_codebooks, T] — remove batch dim if present
                        if codes.dim() == 3:
                            prompt_tokens = codes[0]   # [n_codebooks, T]
                        elif codes.dim() == 2:
                            prompt_tokens = codes      # already [n_codebooks, T]
                        else:
                            raise ValueError(f"Unexpected codes shape after scan: {codes.shape}")
                        print(f"[TTS] Ref audio encoded OK: prompt_tokens shape={prompt_tokens.shape}")
                    # generate_long checks: use_prompt = bool(prompt_text) AND bool(prompt_tokens)
                    # If prompt_text is None/empty → use_prompt=False → reference audio IGNORED.
                    # Always pass a non-empty prompt_text so voice cloning activates.
                    # If user didn't provide transcript, use a space — model still conditions on audio.
                    prompt_tokens = [prompt_tokens]
                    prompt_text   = [ref_text if ref_text.strip() else " "]
                except Exception as e:
                    print(f"[TTS] Ref audio encode error (non-fatal): {e}")
                    prompt_tokens = None
                    prompt_text = None

            # 2. Generate VQ codes from text
            try:
                with torch.no_grad():
                    gen = generate_long(
                        model=self.llama_model,
                        device=self.device,
                        decode_one_token=self.decode_one_token,
                        text=text,
                        num_samples=1,
                        max_new_tokens=2048,
                        top_p=0.7,
                        repetition_penalty=1.2,
                        temperature=0.7,
                        compile=False,
                        iterative_prompt=True,
                        prompt_tokens=prompt_tokens,         # List[Tensor] or None
                        prompt_text=prompt_text,             # List[str] or None
                    )
                    # Collect items from generator safely
                    # generate_long may yield: raw tensors, NamedTuples with .codes,
                    # or dataclass-like objects — handle all cases
                    raw_items = []
                    for item in gen:
                        raw_items.append(item)

                print(f"[TTS] generate_long: {len(raw_items)} items yielded")
                if raw_items:
                    s0 = raw_items[0]
                    print(f"[TTS] First item type={type(s0).__name__}, "
                          f"value={s0 if not isinstance(s0, torch.Tensor) else f'Tensor{list(s0.shape)}'}")

                # Extract codebook tensors from whatever generate_long yielded
                # GenerateResponse yields 2 items:
                #   item 0: action='sample', codes=<tensor [n_codebooks, T]>
                #   item 1: action='finish', codes=None  ← must skip
                codes_list = []
                for item in raw_items:
                    t = None
                    if isinstance(item, torch.Tensor):
                        t = item
                    elif hasattr(item, 'codes'):
                        # GenerateResponse / NamedTuple — codes may be None on finish
                        t = item.codes
                    elif isinstance(item, (tuple, list)) and len(item) > 0:
                        t = item[0] if isinstance(item[0], torch.Tensor) else None
                    else:
                        print(f"[TTS] Skipping unknown item type: {type(item)}")

                    # Guard: skip None (finish signal) and 0-d scalars (EOS)
                    if t is None:
                        print(f"[TTS] Skipping item with codes=None (finish signal)")
                        continue
                    if not isinstance(t, torch.Tensor):
                        print(f"[TTS] Skipping non-tensor codes: {type(t)}")
                        continue
                    if t.dim() == 0:
                        print(f"[TTS] Skipping 0-d scalar: {t.item()}")
                        continue
                    codes_list.append(t)

            except Exception as e:
                import traceback
                print(f"[TTS] Generation exception: {traceback.format_exc()}")
                raise HTTPException(500, f"Generation failed: {e}")

            if not codes_list:
                raise HTTPException(500, "No audio generated")

            # 3. Decode VQ codes → waveform
            try:
                # Handle different output shapes from generate_long:
                #   [n_codebooks, T]  → cat along T (dim=-1)
                #   [n_codebooks]     → stack along new T dim
                #   [T] or [1]        → just cat
                first = codes_list[0]
                if first.dim() >= 2:
                    codes_tensor = torch.cat(codes_list, dim=-1).unsqueeze(0)
                elif first.dim() == 1 and first.shape[0] > 1:
                    # Each item is [n_codebooks] → stack → [T, n_codebooks] → permute
                    codes_tensor = torch.stack(codes_list, dim=1).unsqueeze(0)  # [1, n_cb, T]
                else:
                    codes_tensor = torch.cat(codes_list, dim=0).unsqueeze(0).unsqueeze(0)

                print(f"[TTS] codes_tensor shape: {codes_tensor.shape}")
                audio_array = _decode_audio(self.decoder_model, codes_tensor)
                audio_np = audio_array.squeeze().cpu().float().numpy()
            except Exception as e:
                raise HTTPException(500, f"Decode failed: {e}")


            # 4. Export to requested format
            try:
                buf = io.BytesIO()
                if format_ext == "wav":
                    wavfile.write(buf, 44100, (audio_np * 32767).astype(np.int16))
                    return Response(content=buf.getvalue(), media_type="audio/wav")
                else:
                    from pydub import AudioSegment
                    pcm = (audio_np * 32767).astype(np.int16).tobytes()
                    seg = AudioSegment(data=pcm, sample_width=2, frame_rate=44100, channels=1)
                    seg.export(buf, format="mp3")
                    return Response(content=buf.getvalue(), media_type="audio/mpeg")
            except Exception as e:
                raise HTTPException(500, f"Export failed: {e}")

        return web_app