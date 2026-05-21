import os
import sys
import json
import time
import base64
import uuid
# Add current directory to path so it can be imported from root folder
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import re
import subprocess
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from main import main
import config
from prompt_filter import validate_prompt

app = FastAPI(
    title="iPulse CrewAI Video Creator API",
    description="Production-ready API wrapper for the iPulse CrewAI video generation pipeline"
)

# Enable CORS for Next.js frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to your specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VideoPromptRequest(BaseModel):
    prompt: str
    reference_image: Optional[str] = None   # base64 data-uri OR https:// URL
    intent: Optional[str] = None             # pre-classified intent from client (optional)
    aspect_ratio: Optional[str] = "16:9"
    quality: Optional[str] = "720p"
    duration: Optional[int] = 30


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def save_reference_image(reference_image: str) -> Optional[str]:
    """
    Saves a base64 data-uri reference image to the images directory.
    Returns the local file path, or None on failure.
    """
    if not reference_image:
        return None
    try:
        # Handle data-uri format: data:image/png;base64,<data>
        if reference_image.startswith("data:image"):
            header, b64data = reference_image.split(",", 1)
            ext = header.split(";")[0].split("/")[-1]
            if ext == "jpeg":
                ext = "jpg"
            image_bytes = base64.b64decode(b64data)
            filename = f"ref_image_{uuid.uuid4().hex[:8]}.{ext}"
            filepath = os.path.join(config.IMAGES_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(image_bytes)
            print(f"[iPulse Agent] Reference image saved: {filepath}")
            return filepath
        # Handle plain https:// URL — download it
        elif reference_image.startswith("https://"):
            import requests as _req
            resp = _req.get(reference_image, timeout=15)
            if resp.status_code == 200:
                content_type = resp.headers.get("Content-Type", "image/jpeg")
                ext = content_type.split("/")[-1].split(";")[0]
                filename = f"ref_image_{uuid.uuid4().hex[:8]}.{ext}"
                filepath = os.path.join(config.IMAGES_DIR, filename)
                with open(filepath, "wb") as f:
                    f.write(resp.content)
                print(f"[iPulse Agent] Reference image downloaded from URL: {filepath}")
                return filepath
    except Exception as e:
        print(f"[iPulse Agent] Failed to save reference image: {e}")
    return None


def upload_to_r2(file_path: str, filename: str) -> str:
    """Uploads a file to Cloudflare R2 and returns its public URL."""
    try:
        import boto3
        from botocore.client import Config
        
        account_id = os.getenv("R2_ACCOUNT_ID")
        access_key = os.getenv("R2_ACCESS_KEY_ID")
        secret_key = os.getenv("R2_SECRET_ACCESS_KEY")
        bucket = os.getenv("R2_BUCKET_NAME", "ipulse")
        public_url = os.getenv("R2_PUBLIC_URL", "https://cdn.ipulselabs.net").rstrip("/")
        
        if not all([account_id, access_key, secret_key]):
            print("[iPulse Agent] R2 credentials missing. Skipping upload.")
            return f"/{filename}"
            
        s3 = boto3.client('s3',
            endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            config=Config(signature_version='s3v4'),
            region_name="auto"
        )
        
        content_type = "video/mp4"
        if filename.endswith(".mp3"): content_type = "audio/mpeg"
        elif filename.endswith(".m4a"): content_type = "audio/mp4"
        
        object_name = f"videos/{filename}"
        
        print(f"[iPulse Agent] Uploading {filename} to R2 bucket {bucket} at {object_name}...")
        s3.upload_file(
            file_path,
            bucket,
            object_name,
            ExtraArgs={'ContentType': content_type}
        )
        
        final_url = f"{public_url}/{object_name}"
        print(f"[iPulse Agent] Successfully uploaded to R2: {final_url}")
        return final_url
    except Exception as e:
        print(f"[iPulse Agent] R2 Upload Error: {e}")
        return f"/{filename}"


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "iPulse Video Agent API is online."}


@app.post("/api/agent/generate")
def generate_video(request: VideoPromptRequest):
    """
    Kicks off the CrewAI multi-agent sequence with prompt validation,
    conditional routing, and optional image-to-video support.
    """
    has_image = bool(request.reference_image)
    filter_result = validate_prompt(request.prompt, has_reference_image=has_image)

    if not filter_result["allowed"]:
        raise HTTPException(status_code=400, detail=filter_result["reason"])

    intent = request.intent or filter_result["intent"]
    clean_prompt = filter_result["clean_prompt"]

    # Save reference image if provided
    reference_image_path = None
    if has_image:
        reference_image_path = save_reference_image(request.reference_image)

    try:
        print(f"[iPulse Agent] Received API request — intent={intent}, image={'YES' if reference_image_path else 'NO'}")
        final_video_path = main(clean_prompt, intent=intent, reference_image_path=reference_image_path)

        if not final_video_path or not os.path.exists(final_video_path):
            raise HTTPException(status_code=500, detail="Video assembly failed. No file generated.")

        filename = os.path.basename(final_video_path)
        video_url = f"/api/videos/{filename}"
        try:
            video_url = upload_to_r2(final_video_path, filename)
        except Exception as e:
            print(f"Failed to upload to R2: {e}")

        return {
            "status": "success",
            "video_filename": filename,
            "local_path": final_video_path,
            "url": video_url
        }

    except Exception as e:
        print(f"[iPulse Agent] API generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/agent/generate/stream")
def generate_video_stream(request: VideoPromptRequest):
    """
    Validates the prompt, saves reference image, then executes the agent pipeline
    as a subprocess and streams per-agent SSE log events to the frontend.
    """
    # ── Prompt filter ─────────────────────────────────────────────────────────
    has_image = bool(request.reference_image)
    filter_result = validate_prompt(request.prompt, has_reference_image=has_image)

    if not filter_result["allowed"]:
        raise HTTPException(status_code=400, detail=filter_result["reason"])

    intent = request.intent or filter_result["intent"]
    clean_prompt = filter_result["clean_prompt"]

    # Save reference image to disk for subprocess access
    reference_image_path = None
    if has_image:
        reference_image_path = save_reference_image(request.reference_image)

    # ── Noise filters ─────────────────────────────────────────────────────────
    NOISE_PATTERNS = [
        r"LiteLLM:WARNING",
        r"LiteLLM:INFO",
        r"could not pre-load",
        r"event-stream decoding will be unavailable",
        r"No module named 'botocore'",
        r"^\s*$",
        r"\x1b\[",
        r"Polling status for video generation request",
        r"Non-200 polling response",
        r"Cleanup error:",
        r"Final Answer:",
        r"Task Started",
        r"Agent Started",
        r"Task Execution",
        r"ERROR:root:",
        r"ERROR:crewai",
        r"LLM Call Failed",
        r"Crew Execution Failed",
        r"Crew Execution Completed",
        r"Error executing listener",
        r"Quota exceeded for metric",
        r"Please retry in",
        r"An unknown error occurred",
        r"Error details:",
        r"CrewAIEventsBus",
        r"Warning: Event pairing mismatch",
        r"Task Failed",
        r"Crew Failure",
        r"Tracing Status",
        r"Info: Tracing is disabled",
        r"To enable tracing",
        r"Set tracing=True",
        r"Run: crewai traces enable",
        r"\[CrewAIEventsBus\]",
        r"expected 'task_started'",
        r"expected 'crew_kickoff_started'",
        r"Name: crew",
        r"^ID: ",
        r"^\s*\{\s*$",
        r"^\s*\}\s*$",
        r"^\s*\[\s*$",
        r"^\s*\]\s*$",
        r"^\s*\}\,?\s*$",
        r"^\s*\]\,?\s*$",
        r"\"scene_id\":",
        r"\"duration\":",
        r"\"grok_prompt\":",
        r"\"style_reference\":",
        r"\"storyboard\":",
        r"\"total_duration\":",
        r"\"instructions_to_media_generator_agent\":",
        r"Task:",
        r"Args:",
    ]
    noise_re = re.compile("|".join(NOISE_PATTERNS), re.IGNORECASE)
    ansi_escape = re.compile(r"\x1b(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])")

    def is_noise(line: str) -> bool:
        return bool(noise_re.search(line))

    def event_generator():
        # Build subprocess command with intent and optional image path args
        cmd = [
            sys.executable, "-u", "main.py", 
            clean_prompt, 
            f"--intent={intent}",
            f"--aspect_ratio={request.aspect_ratio}",
            f"--quality={request.quality}",
            f"--duration={request.duration}"
        ]
        if reference_image_path:
            cmd.append(f"--image={reference_image_path}")

        env = os.environ.copy()
        env["PYTHONIOENCODING"] = "utf-8"

        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
            cwd=os.path.dirname(os.path.abspath(__file__)),
            env=env
        )

        current_agent = "Bully"
        last_payload_str = ""
        is_demo_mode = False

        for line in iter(process.stdout.readline, ""):
            raw_line_str = ansi_escape.sub("", line).strip()

            if not raw_line_str or is_noise(raw_line_str):
                continue

            # ── Final video path interception ──────────────────────────────────
            # We must intercept the REAL path before masking it
            if "FINAL VIDEO GENERATED AT:" in raw_line_str:
                parts = raw_line_str.split("FINAL VIDEO GENERATED AT:")
                final_path = parts[1].strip()
                filename = os.path.basename(final_path)

                # Upload to Cloudflare R2
                video_url = f"/{filename}"
                try:
                    video_url = upload_to_r2(final_path, filename)
                except Exception as upload_err:
                    print(f"Failed to upload to R2: {upload_err}")

                complete_payload = {
                    "videoUrl": video_url,
                    "script": f"Pipeline successful! Final video assembled: {filename}\nSaved remotely at: {video_url}",
                    "prompts": [clean_prompt],
                    "demoMode": is_demo_mode
                }
                yield f"event: complete\ndata: {json.dumps(complete_payload)}\n\n"

            # Apply UI masks for the frontend stream
            line_str = raw_line_str
            # Remove box drawing characters and formatting noise
            line_str = re.sub(r"[│─┌└┐┘├┤┬┴┼]+", "", line_str).strip()
            line_str = line_str.replace("print(\"[INFO]", "")
            line_str = line_str.replace("[INFO]", "").strip()
            
            if not line_str:
                continue

            # Mask model names and API references
            line_str = re.sub(r"(?i)\bGrok\b", "Neural", line_str)
            line_str = re.sub(r"(?i)\bGemini\b", "Neural", line_str)
            line_str = re.sub(r"(?i)\bAPI\b", "Engine", line_str)

            # Mask paths
            line_str = re.sub(r"(?i)(?:final|videos|temp)[\\/][\w_.-]+\.(?:mp4|mp3|m4a)", "[secure_media_asset]", line_str)
            line_str = re.sub(r"(?i)[A-Z]:\\[\w\\_.-]+\.mp4", "[secure_media_asset]", line_str)
            
            # Mask UUIDs
            line_str = re.sub(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", "[ID_HIDDEN]", line_str)

            if "DEMO_MODE: true" in line_str:
                is_demo_mode = True
                continue

            if line_str.startswith("[iPulse Agent]"):
                if "Running DEMO pipeline" in line_str or "Grok API" in line_str:
                    note_payload = {
                        "agent": "System",
                        "status": "working",
                        "message": "Switching to Demo Mode",
                        "reasoning": line_str.replace("[iPulse Agent] ", "⚠ ")
                    }
                    yield f"event: agent_status\ndata: {json.dumps(note_payload)}\n\n"
                continue

            if line_str.startswith("--- iPulse Agent") or line_str.startswith("User Request:"):
                continue

            # ── Agent detection (extended for @-mention style logs) ──────────
            if any(k in line_str for k in ["Creative Video Idea Generator", "task_idea", "Idea Generator Agent", "[Idea Generator Agent]", "[Bully]", "Bully"]):
                current_agent = "Bully"
            elif any(k in line_str for k in ["Real-time Research Analyst", "task_research", "Research Agent", "[Research Agent]", "[Raffa]", "Raffa"]):
                current_agent = "Raffa"
            elif any(k in line_str for k in ["Screenwriter", "task_script", "Script Writer", "[Script Writer", "[Monker]", "Monker"]):
                current_agent = "Monker"
            elif any(k in line_str for k in ["Art Director", "task_visual_planning", "Visual Planner", "[Visual Planner", "[Intruder]", "Intruder"]):
                current_agent = "Intruder"
            elif any(k in line_str for k in ["AI Video Director", "task_generation", "Media Generator", "[Media Generator", "[Tupac]", "Tupac"]):
                current_agent = "Tupac"
            elif any(k in line_str for k in ["Post-production Editor", "task_editing", "Editor", "[Editor", "[Sam]", "Sam"]):
                current_agent = "Sam"

            # ── Status detection ──────────────────────────────────────────────
            is_agent_error = (
                ("exception" in line_str.lower() or
                 ("failed" in line_str.lower() and "pre-flight" not in line_str.lower() and "[iPulse Agent]" not in line_str)) and
                "error" in line_str.lower()
            )
            if is_agent_error:
                status = "failed"
                message = "Error encountered"
            elif any(k in line_str.lower() for k in ["completed", "success", "assembly completed", "assembled successfully", "final cut complete", "✅"]):
                status = "success"
                message = "Task completed"
            elif "→ @" in line_str:
                # Inter-agent @-mention handoff messages
                status = "working"
                message = "Communicating with team..."
            else:
                status = "working"
                message = "Synthesizing..."

            payload = {
                "agent": current_agent,
                "status": status,
                "message": message,
                "reasoning": line_str
            }
            payload_str = json.dumps(payload)

            if payload_str == last_payload_str:
                continue
            last_payload_str = payload_str

            yield f"event: agent_status\ndata: {payload_str}\n\n"

            # The "FINAL VIDEO GENERATED AT:" logic has been moved up before masking

        process.stdout.close()
        exit_code = process.wait()

        if exit_code != 0:
            err_payload = {
                "agent": current_agent,
                "status": "failed",
                "message": f"Subprocess exited with code {exit_code}",
                "reasoning": "The agent pipeline terminated unexpectedly. Check server logs for details."
            }
            yield f"event: agent_status\ndata: {json.dumps(err_payload)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
