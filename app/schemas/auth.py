from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str


class UserInfo(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    citizen_id: int | None = None
    company_id: int | None = None

    class Config:
        from_attributes = True
