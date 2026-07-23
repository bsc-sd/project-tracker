from pydantic import BaseModel, EmailStr
from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.USER


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
