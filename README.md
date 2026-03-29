# Video-Context Search Engine

A multimodal video search engine that transcribes audio with Whisper, captions frames with BLIP/CLIP, stores semantic embeddings in ChromaDB, and exposes a REST API built with FastAPI.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.9+ |
| Node.js | 18+ |
| PostgreSQL | 13+ |
| ffmpeg | any recent version |

Install ffmpeg:

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows (via Chocolatey)
choco install ffmpeg
```

---

## Backend Setup

```bash
cd backend

# 1. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # macOS/Linux
# .venv\Scripts\activate         # Windows

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Open .env and set your PostgreSQL credentials:
#   DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/video_search_db
```

### Create the PostgreSQL database

```bash
psql -U postgres -c "CREATE DATABASE video_search_db;"
```

### Run database migrations

```bash
# Inside backend/ with the venv active
alembic upgrade head
```

### Start the API server

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

---

## Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Usage

### Upload a video

Use the frontend upload button, or via the API:

```bash
curl -X POST http://localhost:8000/api/videos/upload \
  -F "file=@/path/to/your/video.mp4"
```

The response includes the `id` of the newly created video record. Ingestion
(transcription + frame captioning + embedding) runs in the background.
Poll `GET /api/videos/{id}` and wait for `"status": "ready"`.

### Ingest from YouTube

```bash
curl -X POST http://localhost:8000/api/videos/youtube \
  -H "Content-Type: application/json" \
  -d '{"source_url": "https://www.youtube.com/watch?v=EXAMPLE"}'
```

### Search across all videos

```bash
curl -X POST http://localhost:8000/api/search/ \
  -H "Content-Type: application/json" \
  -d '{"query": "machine learning gradient descent", "top_k": 5}'
```

### Search within a specific video

```bash
curl -X POST http://localhost:8000/api/search/ \
  -H "Content-Type: application/json" \
  -d '{"query": "introduction to neural networks", "video_id": "<uuid>", "top_k": 10}'
```

### Other useful endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/videos/` | List all videos |
| GET | `/api/videos/{id}` | Get video details |
| DELETE | `/api/videos/{id}` | Delete video and all data |
| GET | `/api/videos/{id}/stream` | Stream video (range-request aware) |
| GET | `/api/videos/{id}/chunks` | List all chunks for a video |
| GET | `/api/health` | Service health check |
| GET | `/api/stats` | Aggregate counts |

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `WHISPER_MODEL` | `base` | Whisper model size (tiny/base/small/medium/large) |
| `FRAME_INTERVAL_SECONDS` | `3` | Extract one frame every N seconds |
| `CHUNK_WINDOW_SECONDS` | `20` | Duration of each context chunk |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | Sentence-Transformers model |
| `CHROMA_PERSIST_DIR` | `../chroma_data` | ChromaDB persistence directory |
| `VIDEO_STORAGE_DIR` | `./storage/videos` | Where uploaded videos are stored |
| `MAX_UPLOAD_SIZE_MB` | `500` | Maximum upload size in MB |
