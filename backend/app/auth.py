from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models, schemas
from .config import settings
from .database import get_db
from .security import (
    create_access_token,
    create_refresh_token,
    hash_token,
    read_access_token,
    verify_password,
)

bearer = HTTPBearer(auto_error=False)


def authenticate(db: Session, email: str, password: str) -> models.User | None:
    user = db.scalar(select(models.User).where(models.User.email == email.lower()))
    if user is None or not verify_password(password, user.password_hash):
        return None
    return user


def issue_tokens(db: Session, user: models.User) -> schemas.TokenPair:
    refresh = create_refresh_token()
    db.add(models.RefreshToken(
        token_hash=hash_token(refresh),
        user=user,
        expires_at=datetime.utcnow() + timedelta(days=settings.refresh_token_days),
    ))
    db.commit()
    return schemas.TokenPair(
        access_token=create_access_token(user.id), refresh_token=refresh
    )


def use_refresh_token(db: Session, token: str) -> models.User | None:
    saved = db.scalar(select(models.RefreshToken).where(
        models.RefreshToken.token_hash == hash_token(token)
    ))
    if saved is None or saved.revoked or saved.expires_at <= datetime.utcnow():
        return None
    return saved.user


def revoke_refresh_token(db: Session, token: str) -> bool:
    saved = db.scalar(select(models.RefreshToken).where(
        models.RefreshToken.token_hash == hash_token(token)
    ))
    if saved is None or saved.revoked:
        return False
    saved.revoked = True
    db.commit()
    return True


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    db: Session = Depends(get_db),
) -> models.User:
    user_id = read_access_token(credentials.credentials) if credentials else None
    user = db.get(models.User, user_id) if user_id is not None else None
    if user is None:
        raise HTTPException(status_code=401, detail="Требуется вход в систему")
    return user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    db: Session = Depends(get_db),
) -> Optional[models.User]:
    if credentials is None:
        return None
    user_id = read_access_token(credentials.credentials)
    return db.get(models.User, user_id) if user_id is not None else None
