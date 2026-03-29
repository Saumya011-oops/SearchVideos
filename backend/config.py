from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://username:password@localhost:5432/video_search_db"
    WHISPER_MODEL: str = "base"
    FRAME_INTERVAL_SECONDS: int = 3
    CHUNK_WINDOW_SECONDS: int = 20
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    CHROMA_PERSIST_DIR: str = "../chroma_data"
    VIDEO_STORAGE_DIR: str = "./storage/videos"
    MAX_UPLOAD_SIZE_MB: int = 500

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
