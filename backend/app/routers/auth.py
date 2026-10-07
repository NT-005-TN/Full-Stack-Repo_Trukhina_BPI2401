"""HTTP-маршруты регистрации, входа, обновления токенов и выхода."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import auth, crud, models, schemas
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["Авторизация"])


@router.post("/register", response_model=schemas.TokenPair, status_code=201)
def register(data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Создаёт пользователя и сразу возвращает пару токенов."""
    user = crud.create_user(db, data)
    if user is None:
        raise HTTPException(status_code=409, detail="Такая почта уже зарегистрирована")
    return auth.issue_tokens(db, user)


@router.post("/login", response_model=schemas.TokenPair)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Проверяет учётные данные и выдаёт токены."""
    user = auth.authenticate(db, data.email, data.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Неверная почта или пароль")
    return auth.issue_tokens(db, user)


@router.post("/refresh", response_model=schemas.TokenPair)
def refresh(data: schemas.RefreshRequest, db: Session = Depends(get_db)):
    """Заменяет использованный refresh token новой парой токенов."""
    user = auth.use_refresh_token(db, data.refresh_token)
    if user is None:
        raise HTTPException(status_code=401, detail="Refresh token недействителен")
    auth.revoke_refresh_token(db, data.refresh_token)
    return auth.issue_tokens(db, user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(data: schemas.RefreshRequest, db: Session = Depends(get_db)):
    """Отзывает refresh token текущей сессии."""
    auth.revoke_refresh_token(db, data.refresh_token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=schemas.UserRead)
def current_user(user: models.User = Depends(auth.get_current_user)):
    """Возвращает профиль владельца access token."""
    return user
