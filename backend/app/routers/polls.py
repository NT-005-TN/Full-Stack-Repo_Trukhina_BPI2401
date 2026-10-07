"""API опросов, личной истории, голосования и результатов."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import auth, crud, models, schemas, services
from ..database import get_db

router = APIRouter(prefix="/polls", tags=["Опросы"])


def handle_vote_error(error: services.VoteError):
    """Преобразует ошибку бизнес-логики в HTTP-ответ."""
    raise HTTPException(status_code=error.status_code, detail=error.detail)


@router.get("", response_model=list[schemas.PollRead])
def read_polls(db: Session = Depends(get_db)):
    """Возвращает публичные активные опросы."""
    return crud.list_polls(db)


@router.get("/mine", response_model=list[schemas.PollRead])
def read_my_polls(
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    """Возвращает опросы текущего владельца."""
    return crud.list_user_polls(db, user.id)


@router.get("/participated", response_model=list[schemas.PollRead])
def read_participated_polls(
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    """Возвращает историю участий текущего пользователя."""
    return crud.list_participated_polls(db, user.id)


@router.get("/{poll_id}", response_model=schemas.PollRead)
def read_poll(
    poll_id: int,
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(auth.get_optional_user),
):
    """Показывает опрос, скрывая чужие черновики."""
    poll = crud.get_poll(db, poll_id)
    if poll is None:
        raise HTTPException(status_code=404, detail="Опрос не найден")
    if poll.status == "draft" and (user is None or poll.owner_id != user.id):
        raise HTTPException(status_code=403, detail="Черновик доступен только владельцу")
    return poll


@router.post("", response_model=schemas.PollRead, status_code=status.HTTP_201_CREATED)
def create_poll(
    data: schemas.PollCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    """Создаёт опрос от имени текущего пользователя."""
    poll = crud.create_poll(db, data.model_copy(update={"owner_id": user.id}))
    if poll is None:
        raise HTTPException(status_code=404, detail="Владелец опроса не найден")
    return poll


@router.patch("/{poll_id}", response_model=schemas.PollRead)
def update_poll(
    poll_id: int,
    data: schemas.PollUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    """Позволяет владельцу изменить свой опрос."""
    poll = crud.get_poll(db, poll_id)
    if poll is None:
        raise HTTPException(status_code=404, detail="Опрос не найден")
    if poll.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Можно изменять только свои опросы")
    return crud.update_poll(db, poll, data)


@router.delete("/{poll_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_poll(
    poll_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    """Позволяет владельцу удалить свой опрос."""
    poll = crud.get_poll(db, poll_id)
    if poll is None:
        raise HTTPException(status_code=404, detail="Опрос не найден")
    if poll.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Можно удалять только свои опросы")
    crud.delete_poll(db, poll)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{poll_id}/submissions",
    response_model=schemas.SubmissionRead,
    status_code=status.HTTP_201_CREATED,
)
def submit_poll(
    poll_id: int,
    data: schemas.SubmissionCreate,
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(auth.get_optional_user),
):
    """Принимает ответы гостя или авторизованного участника."""
    try:
        safe_data = data.model_copy(update={"user_id": user.id if user else None})
        return services.submit_answers(db, poll_id, safe_data)
    except services.VoteError as error:
        handle_vote_error(error)


@router.get("/{poll_id}/results", response_model=schemas.PollResults)
def read_results(poll_id: int, db: Session = Depends(get_db)):
    """Возвращает разрешённую агрегированную статистику."""
    try:
        return services.get_results(db, poll_id)
    except services.VoteError as error:
        handle_vote_error(error)
