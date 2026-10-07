"""HTTP-маршруты опросов, голосования и результатов."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import crud, schemas, services
from ..database import get_db

router = APIRouter(prefix="/polls", tags=["Опросы"])


def handle_vote_error(error: services.VoteError):
    """Преобразует ошибку бизнес-логики в ответ FastAPI."""
    raise HTTPException(status_code=error.status_code, detail=error.detail)


@router.get("", response_model=list[schemas.PollRead])
def read_polls(db: Session = Depends(get_db)):
    """Возвращает все опросы."""
    return crud.list_polls(db)


@router.get("/{poll_id}", response_model=schemas.PollRead)
def read_poll(poll_id: int, db: Session = Depends(get_db)):
    """Возвращает один опрос или ошибку 404."""
    poll = crud.get_poll(db, poll_id)
    if poll is None:
        raise HTTPException(status_code=404, detail="Опрос не найден")
    return poll


@router.post("", response_model=schemas.PollRead, status_code=status.HTTP_201_CREATED)
def create_poll(data: schemas.PollCreate, db: Session = Depends(get_db)):
    """Создаёт опрос с вопросами и вариантами."""
    poll = crud.create_poll(db, data)
    if poll is None:
        raise HTTPException(status_code=404, detail="Владелец опроса не найден")
    return poll


@router.patch("/{poll_id}", response_model=schemas.PollRead)
def update_poll(
    poll_id: int, data: schemas.PollUpdate, db: Session = Depends(get_db)
):
    """Частично изменяет настройки опроса."""
    poll = crud.get_poll(db, poll_id)
    if poll is None:
        raise HTTPException(status_code=404, detail="Опрос не найден")
    return crud.update_poll(db, poll, data)


@router.delete("/{poll_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_poll(poll_id: int, db: Session = Depends(get_db)):
    """Удаляет опрос и возвращает пустой ответ 204."""
    poll = crud.get_poll(db, poll_id)
    if poll is None:
        raise HTTPException(status_code=404, detail="Опрос не найден")
    crud.delete_poll(db, poll)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{poll_id}/submissions",
    response_model=schemas.SubmissionRead,
    status_code=status.HTTP_201_CREATED,
)
def submit_poll(
    poll_id: int, data: schemas.SubmissionCreate, db: Session = Depends(get_db)
):
    """Принимает и проверяет ответы участника."""
    try:
        return services.submit_answers(db, poll_id, data)
    except services.VoteError as error:
        handle_vote_error(error)


@router.get("/{poll_id}/results", response_model=schemas.PollResults)
def read_results(poll_id: int, db: Session = Depends(get_db)):
    """Возвращает опубликованную агрегированную статистику."""
    try:
        return services.get_results(db, poll_id)
    except services.VoteError as error:
        handle_vote_error(error)
