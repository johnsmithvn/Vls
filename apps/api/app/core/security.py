"""
Security utilities: Supabase JWT verification.
Extracts user_id from Supabase JWT and injects into request state.
"""

import uuid

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_db
from app.core.exceptions import ForbiddenException, UnauthorizedException

bearer_scheme = HTTPBearer(auto_error=False)


def _decode_supabase_jwt(token: str) -> dict:
    """Decode and verify a Supabase JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except JWTError as e:
        raise UnauthorizedException(f"Invalid token: {e}")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> uuid.UUID:
    """
    Extract user_id from JWT.
    Use as dependency in protected routes.
    """
    if credentials is None:
        raise UnauthorizedException("Missing authorization header")

    payload = _decode_supabase_jwt(credentials.credentials)
    sub = payload.get("sub")
    if not sub:
        raise UnauthorizedException("Token missing 'sub' claim")

    try:
        return uuid.UUID(sub)
    except ValueError:
        raise UnauthorizedException("Invalid user ID in token")


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> uuid.UUID | None:
    """
    Extract user_id if token present, otherwise return None.
    Use for routes that work both authenticated and anonymous.
    """
    if credentials is None:
        return None
    try:
        payload = _decode_supabase_jwt(credentials.credentials)
        sub = payload.get("sub")
        return uuid.UUID(sub) if sub else None
    except (UnauthorizedException, ValueError):
        return None


async def get_owner_user(
    user_id: uuid.UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> uuid.UUID:
    """
    Verify user has 'owner' role. Use for admin-only routes.
    Raises ForbiddenException if not owner.
    """
    from sqlalchemy import select
    from app.modules.auth.models import User

    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if user is None or user.role != "owner":
        raise ForbiddenException("Owner access required")

    return user_id
