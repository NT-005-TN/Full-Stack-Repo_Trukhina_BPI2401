from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/polls", tags=["Опросы"])


@router.get("", response_model=list[schemas.PollRead])
def read_polls(db: Session = Depends(get_db)):
    return crud.list_polls(db)


@router.get("/{poll_id}", response_model=schemas.PollRead)
def read_poll(poll_id: int, db: Session = Depends(get_db)):
    poll = crud.get_poll(db, poll_id)
    if poll is None:
        raise HTTPException(status_code=404, detail="Опрос не найден")
    return poll


@router.post("", response_model=schemas.PollRead, status_code=status.HTTP_201_CREATED)
def create_poll(data: schemas.PollCreate, db: Session = Depends(get_db)):
    poll = crud.create_poll(db, data)
    if poll is None:
        raise HTTPException(status_code=404, detail="Владелец опроса не найден")
    return poll


@router.patch("/{poll_id}", response_model=schemas.PollRead)
def update_poll(
    poll_id: int, data: schemas.PollUpdate, db: Session = Depends(get_db)
):
    poll = crud.get_poll(db, poll_id)
    if poll is None:
        raise HTTPException(status_code=404, detail="Опрос не найден")
    return crud.update_poll(db, poll, data)


@router.delete("/{poll_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_poll(poll_id: int, db: Session = Depends(get_db)):
    poll = crud.get_poll(db, poll_id)
    if poll is None:
        raise HTTPException(status_code=404, detail="Опрос не найден")
    crud.delete_poll(db, poll)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
