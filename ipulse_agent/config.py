import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.join(BASE_DIR, "scripts")
IMAGES_DIR = os.path.join(BASE_DIR, "images")
VIDEOS_DIR = os.path.join(BASE_DIR, "videos")
FINAL_DIR = os.path.join(BASE_DIR, "final")

# Ensure directories exist
for directory in [SCRIPTS_DIR, IMAGES_DIR, VIDEOS_DIR, FINAL_DIR]:
    os.makedirs(directory, exist_ok=True)

# API Keys
GROK_API_KEY = os.getenv("GROK_API_KEY") or os.getenv("XAI_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Models
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini/gemini-3.5-flash")
GROK_MODEL = os.getenv("GROK_MODEL", "xai/grok-4.3")

# Force Mock Data Mode (Set True for local frontend UI testing without calling real APIs)
FORCE_MOCK = os.getenv("FORCE_MOCK", "True").lower() == "true"

# Video settings
DEFAULT_VIDEO_DURATION = 5  # default duration per clip in seconds
MAX_VIDEO_DURATION = 15     # max duration per clip
MAX_TOTAL_DURATION = 60     # Target total video duration in seconds

# Grok Imagine API Endpoints
GROK_GEN_ENDPOINT = "https://api.x.ai/v1/videos/generations"
GROK_EXT_ENDPOINT = "https://api.x.ai/v1/videos/extensions"
GROK_STATUS_ENDPOINT = "https://api.x.ai/v1/videos/{request_id}"
