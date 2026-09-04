from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/users", tags=["Пользователи"])


@router.get("", response_model=list[schemas.UserRead])
def read_users(db: Session = Depends(get_db)):
    return crud.list_users(db)


@router.get("/{user_id}", response_model=schemas.UserRead)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user


@router.post("", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def create_user(data: schemas.UserCreate, db: Session = Depends(get_db)):
    user = crud.create_user(db, data)
    if user is None:
        raise HTTPException(status_code=409, detail="Такая почта уже зарегистрирована")
    return user


@router.patch("/{user_id}", response_model=schemas.UserRead)
def update_user(
    user_id: int, data: schemas.UserUpdate, db: Session = Depends(get_db)
):
    user = crud.get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    updated_user = crud.update_user(db, user, data)
    if updated_user is None:
        raise HTTPException(status_code=409, detail="Такая почта уже зарегистрирована")
    return updated_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    if not crud.delete_user(db, user):
        raise HTTPException(status_code=409, detail="Сначала удалите опросы пользователя")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
