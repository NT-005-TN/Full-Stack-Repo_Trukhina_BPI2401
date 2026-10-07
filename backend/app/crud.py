"""Простые CRUD-операции над пользователями и опросами."""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from . import models, schemas
from .security import hash_password



def list_users(db: Session) -> list[models.User]:
    """Возвращает всех пользователей."""
    return list(db.scalars(select(models.User)).all())


def get_user(db: Session, user_id: int) -> Optional[models.User]:
    """Ищет пользователя по первичному ключу."""
    return db.get(models.User, user_id)


def create_user(db: Session, data: schemas.UserCreate) -> Optional[models.User]:
    """Создаёт пользователя или возвращает None при занятой почте."""
    user = models.User(
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return None
    db.refresh(user)
    return user


def update_user(
    db: Session, user: models.User, data: schemas.UserUpdate
) -> Optional[models.User]:
    """Изменяет переданные поля пользователя."""
    if data.email is not None:
        user.email = data.email
    if data.password is not None:
        user.password_hash = hash_password(data.password)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return None
    db.refresh(user)
    return user


def delete_user(db: Session, user: models.User) -> bool:
    """Удаляет пользователя, если у него нет созданных опросов."""
    if user.polls:
        return False
    db.delete(user)
    db.commit()
    return True


def list_polls(db: Session) -> list[models.Poll]:
    """Возвращает опросы вместе с вопросами и вариантами."""
    statement = select(models.Poll).options(
        selectinload(models.Poll.questions).selectinload(models.Question.options)
    )
    return list(db.scalars(statement).all())


def get_poll(db: Session, poll_id: int) -> Optional[models.Poll]:
    """Загружает один опрос и его вложенные сущности."""
    statement = (
        select(models.Poll)
        .where(models.Poll.id == poll_id)
        .options(
            selectinload(models.Poll.questions).selectinload(models.Question.options)
        )
    )
    return db.scalar(statement)


def create_poll(db: Session, data: schemas.PollCreate) -> Optional[models.Poll]:
    """Создаёт опрос только для существующего владельца."""
    if db.get(models.User, data.owner_id) is None:
        return None

    poll = models.Poll(**data.model_dump(exclude={"questions"}))
    poll.questions = [
        models.Question(
            text=question.text,
            options=[models.Option(text=option.text) for option in question.options],
        )
        for question in data.questions
    ]
    db.add(poll)
    db.commit()
    return get_poll(db, poll.id)


def update_poll(
    db: Session, poll: models.Poll, data: schemas.PollUpdate
) -> models.Poll:
    """Применяет только переданные поля частичного обновления."""
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(poll, field, value)
    db.commit()
    return get_poll(db, poll.id) or poll


def delete_poll(db: Session, poll: models.Poll) -> None:
    """Удаляет опрос вместе с зависимыми записями."""
    db.delete(poll)
    db.commit()
