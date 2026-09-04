from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from . import models, schemas


def list_polls(db: Session) -> list[models.Poll]:
    statement = select(models.Poll).options(
        selectinload(models.Poll.questions).selectinload(models.Question.options)
    )
    return list(db.scalars(statement).all())


def get_poll(db: Session, poll_id: int) -> Optional[models.Poll]:
    statement = (
        select(models.Poll)
        .where(models.Poll.id == poll_id)
        .options(
            selectinload(models.Poll.questions).selectinload(models.Question.options)
        )
    )
    return db.scalar(statement)


def create_poll(db: Session, data: schemas.PollCreate) -> Optional[models.Poll]:
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
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(poll, field, value)
    db.commit()
    return get_poll(db, poll.id) or poll


def delete_poll(db: Session, poll: models.Poll) -> None:
    db.delete(poll)
    db.commit()
