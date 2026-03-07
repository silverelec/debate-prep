from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Anthropic
    anthropic_api_key: str

    # Database
    database_url: str
    database_echo: bool = False

    # FastAPI
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    backend_reload: bool = True
    allowed_origins: str = "http://localhost:3000"

    # Debate defaults
    default_total_rounds: int = 3
    max_argument_tokens: int = 600
    max_judge_tokens: int = 800

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()
