import os
import time
import base64
import requests
from typing import Optional
from crewai.tools import tool
import config


def get_base64_image(image_path: str) -> str:
    """Helper to convert a local image file to a base64 data-uri string."""
    try:
        with open(image_path, "rb") as image_file:
            encoded_bytes = base64.b64encode(image_file.read())
            ext = os.path.splitext(image_path)[1].lower().replace(".", "")
            if ext == "jpg":
                ext = "jpeg"
            return f"data:image/{ext};base64,{encoded_bytes.decode('utf-8')}"
    except Exception as e:
        print(f"Error encoding image to base64: {e}")
        return ""


def download_video(video_url: str, output_path: str) -> bool:
    """Helper to download a video file from a URL to a local path."""
    try:
        response = requests.get(video_url, stream=True, timeout=60)
        if response.status_code == 200:
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            return True
        else:
            print(f"Failed to download video. Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error downloading video: {e}")
        return False


def poll_video_status(request_id: str) -> Optional[str]:
    """Poll the Grok Video status API until compilation is complete."""
    headers = {
        "Authorization": f"Bearer {config.GROK_API_KEY}"
    }
    url = config.GROK_STATUS_ENDPOINT.format(request_id=request_id)

    max_attempts = 60  # 60 attempts * 5 seconds = 5 minutes max
    attempt = 0

    print(f"Polling status for video generation request: {request_id}")
    while attempt < max_attempts:
        try:
            res = requests.get(url, headers=headers, timeout=15)
            if res.status_code == 200:
                data = res.json()
                status = data.get("status")
                print(f"[Media Generator Agent] [Grok API] Polling... Attempt {attempt+1}: Status = {status}")

                if status == "done":
                    return data.get("video", {}).get("url")
                elif status in ["failed", "expired"]:
                    print(f"[Media Generator Agent] [Grok API] Generation ended with state: {status}")
                    return None
            else:
                print(f"[Media Generator Agent] [Grok API] Non-200 polling response: {res.status_code}")
        except Exception as e:
            print(f"[Media Generator Agent] Polling error: {e}")

        attempt += 1
        time.sleep(5)

    print("[Media Generator Agent] Polling timed out after 5 minutes.")
    return None


@tool("Grok Text-to-Video and Image-to-Video Generation Tool")
def generate_first_clip(
    prompt: str,
    image_path: Optional[str] = None,
    reference_image_b64: Optional[str] = None,
    duration: int = 15,
) -> str:
    """
    Generates the first video clip using the Grok Imagine Video API.

    Provide a text prompt describing the visual scene.

    Optional image inputs (mutually exclusive, image_path takes priority):
    - image_path: Local filesystem path to a reference image file (for image-to-video).
    - reference_image_b64: Raw base64 data-uri string if no local file is available.

    These allow animating an uploaded character or scene reference image.
    Returns the local file path to the downloaded video clip.
    """
    if not config.GROK_API_KEY:
        return "Error: GROK_API_KEY is not set."

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {config.GROK_API_KEY}"
    }

    payload = {
        "model": "grok-imagine-video",
        "prompt": prompt,
        "duration": min(duration, config.MAX_VIDEO_DURATION)
    }

    # Resolve reference image — prefer file path, fall back to b64 string
    image_b64 = None
    if image_path and os.path.exists(image_path):
        image_b64 = get_base64_image(image_path)
        print(f"[Media Generator Agent] Reference image loaded from path: {image_path}")
    elif reference_image_b64 and reference_image_b64.startswith("data:image"):
        image_b64 = reference_image_b64
        print(f"[Media Generator Agent] Reference image loaded from base64 (data-uri).")

    if image_b64:
        payload["image"] = {"url": image_b64}
        print(f"[Media Generator Agent] Image-to-video mode activated — seeding clip from reference image.")

    # Retry logic
    retries = 3
    for attempt in range(retries):
        try:
            print(
                f"[Media Generator Agent] [Grok API] Sending video generation request "
                f"(attempt {attempt+1}/{retries}). Prompt: '{prompt[:60]}...'"
            )
            res = requests.post(config.GROK_GEN_ENDPOINT, headers=headers, json=payload, timeout=30)
            if res.status_code == 200:
                data = res.json()
                request_id = data.get("request_id")

                print(f"[Media Generator Agent] [Grok API] Task queued. ID: {request_id}. Polling status...")
                video_url = poll_video_status(request_id)
                if video_url:
                    local_filename = f"clip_start_{int(time.time())}.mp4"
                    local_path = os.path.join(config.VIDEOS_DIR, local_filename)
                    if download_video(video_url, local_path):
                        print(
                            f"[Media Generator Agent] [Grok API] Success! Original clip downloaded. "
                            f"Saved to: videos/{local_filename}"
                        )
                        return local_path
                    return f"Generated successfully but failed to download. Video URL: {video_url}"
                else:
                    return "Error: Video generation finished but returned no URL or failed."
            else:
                print(f"[Media Generator Agent] Error starting video generation (status {res.status_code}): {res.text}")
        except Exception as e:
            print(f"[Media Generator Agent] Exception during video generation: {e}")

        time.sleep(3)

    return "Error: Failed to generate video clip after multiple attempts."


@tool("Grok Video Extension Tool")
def extend_video_clip(prompt: str, input_video_path: str, duration: int = 10) -> str:
    """
    Extends an existing video clip from its last frame using the Grok Imagine Video Extension API.

    Takes the path of the existing video file to extend and a prompt describing the next scene.
    Returns the local file path of the downloaded extended video segment.
    Use this to build long continuous videos by chaining scenes together.
    """
    if not config.GROK_API_KEY:
        return "Error: GROK_API_KEY is not set."

    if not os.path.exists(input_video_path):
        return f"Error: Input video file not found at {input_video_path}"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {config.GROK_API_KEY}"
    }

    # Encode existing video as base64 for extension API
    try:
        with open(input_video_path, "rb") as video_file:
            encoded_video = base64.b64encode(video_file.read()).decode('utf-8')
            video_payload_url = f"data:video/mp4;base64,{encoded_video}"
    except Exception as e:
        return f"Error encoding video file for extension: {e}"

    payload = {
        "model": "grok-imagine-video",
        "prompt": prompt,
        "duration": min(duration, config.MAX_VIDEO_DURATION),
        "video": {"url": video_payload_url}
    }

    # Retry logic
    retries = 3
    for attempt in range(retries):
        try:
            print(
                f"[Media Generator Agent] [Grok API] Sending video extension request "
                f"(attempt {attempt+1}/{retries}). Source: '{os.path.basename(input_video_path)}'. "
                f"Prompt: '{prompt[:60]}...'"
            )
            res = requests.post(config.GROK_EXT_ENDPOINT, headers=headers, json=payload, timeout=45)
            if res.status_code == 200:
                data = res.json()
                request_id = data.get("request_id")

                print(f"[Media Generator Agent] [Grok API] Extension task queued. ID: {request_id}. Polling status...")
                video_url = poll_video_status(request_id)
                if video_url:
                    local_filename = f"clip_ext_{int(time.time())}.mp4"
                    local_path = os.path.join(config.VIDEOS_DIR, local_filename)
                    if download_video(video_url, local_path):
                        print(
                            f"[Media Generator Agent] [Grok API] Success! Extension clip downloaded. "
                            f"Saved to: videos/{local_filename}"
                        )
                        return local_path
                    return f"Extended successfully but failed to download. Video URL: {video_url}"
                else:
                    return "Error: Video extension finished but returned no URL or failed."
            else:
                print(f"[Media Generator Agent] Error starting video extension (status {res.status_code}): {res.text}")
        except Exception as e:
            print(f"[Media Generator Agent] Exception during video extension: {e}")

        time.sleep(3)

    return "Error: Failed to extend video clip after multiple attempts."
