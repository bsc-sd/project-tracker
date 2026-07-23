"""
Authentication API endpoints.
"""

from uuid import uuid4

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import DbSession, CurrentUser
from app.auth.backend import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, session: DbSession):
    """Authenticate user and return JWT token pair."""
    query = select(User).where(User.email == request.email)
    result = await session.execute(query)
    user = result.scalar_one_or_none()

    if user is None or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    access_token = create_access_token(subject=user.user_id, role=user.role)
    refresh_token = create_refresh_token(subject=user.user_id, role=user.role)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
async def register(request: RegisterRequest, session: DbSession):
    """Register a new user account."""
    query = select(User).where(User.email == request.email)
    result = await session.execute(query)
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        user_id=str(uuid4()),
        email=request.email,
        hashed_password=hash_password(request.password),
        full_name=request.full_name,
        role=request.role.value,
        is_active=True,
        is_verified=False,
    )
    session.add(user)
    await session.flush()

    access_token = create_access_token(subject=user.user_id, role=user.role)
    refresh_token = create_refresh_token(subject=user.user_id, role=user.role)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str, session: DbSession):
    """Refresh an access token using a valid refresh token."""
    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("sub")
    user = await session.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated",
        )

    new_access_token = create_access_token(subject=user.user_id, role=user.role)
    new_refresh_token = create_refresh_token(subject=user.user_id, role=user.role)

    return TokenResponse(access_token=new_access_token, refresh_token=new_refresh_token)


@router.get("/me")
async def get_current_user_info(current_user: CurrentUser):
    """Get current authenticated user profile."""
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
    }
