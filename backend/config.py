import os
from pathlib import Path
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# Also load .env from BASE_DIR
env_path = BASE_DIR / ".env"
if env_path.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(env_path)
    except Exception:
        pass

DB_PATH = DATA_DIR / "fatos.db"
SOURCES_FILE = BACKEND_DIR / "ingestion" / "sources.json"

# Server
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Ingestion & Clustering Settings
REQUEST_TIMEOUT = 18.0  # seconds per RSS feed

MAX_ARTICLES_PER_SOURCE = 30
CLUSTERING_SIMILARITY_THRESHOLD = 0.28  # Cosine similarity threshold for grouping
CLUSTERING_TIME_WINDOW_HOURS = 48  # Look back window in hours

# Optional Free Cloud AI (Google Gemini Free Tier / Groq Free Tier)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()

# Local LLM / Ollama Settings
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
USE_OLLAMA = os.getenv("USE_OLLAMA", "auto")  # 'auto', 'true', 'false'

