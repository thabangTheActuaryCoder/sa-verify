from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "SA Verify"
    DATABASE_URL: str = "sqlite:////tmp/sa_verify.db"
    SECRET_KEY: str = "sa-verify-prototype-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    SALARY_BRACKETS: list[str] = [
        "R0-R10k",
        "R10k-R20k",
        "R20k-R30k",
        "R30k-R50k",
        "R50k-R80k",
        "R80k-R120k",
        "R120k+",
    ]

    class Config:
        env_file = ".env"


settings = Settings()
