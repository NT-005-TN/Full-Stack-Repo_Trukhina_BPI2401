from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))

    polls: Mapped[list[Poll]] = relationship(back_populates="owner")
    participations: Mapped[list[Participation]] = relationship(back_populates="user")


class Poll(Base):
    __tablename__ = "polls"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(String(1000), default="")
    status: Mapped[str] = mapped_column(String(20), default="draft")
    access: Mapped[str] = mapped_column(String(20), default="public")
    results_access: Mapped[str] = mapped_column(String(20), default="after_finish")
    end_date: Mapped[date]
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    owner: Mapped[User] = relationship(back_populates="polls")
    questions: Mapped[list[Question]] = relationship(
        back_populates="poll", cascade="all, delete-orphan"
    )
    participations: Mapped[list[Participation]] = relationship(
        back_populates="poll", cascade="all, delete-orphan"
    )
    submissions: Mapped[list[Submission]] = relationship(
        back_populates="poll", cascade="all, delete-orphan"
    )


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True)
    text: Mapped[str] = mapped_column(String(500))
    poll_id: Mapped[int] = mapped_column(ForeignKey("polls.id", ondelete="CASCADE"))

    poll: Mapped[Poll] = relationship(back_populates="questions")
    options: Mapped[list[Option]] = relationship(
        back_populates="question", cascade="all, delete-orphan"
    )


class Option(Base):
    __tablename__ = "options"

    id: Mapped[int] = mapped_column(primary_key=True)
    text: Mapped[str] = mapped_column(String(300))
    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE")
    )

    question: Mapped[Question] = relationship(back_populates="options")


class Participation(Base):
    __tablename__ = "participations"
    __table_args__ = (
        UniqueConstraint("poll_id", "user_id", name="uq_participation_poll_user"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    poll_id: Mapped[int] = mapped_column(ForeignKey("polls.id", ondelete="CASCADE"))
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    poll: Mapped[Poll] = relationship(back_populates="participations")
    user: Mapped[Optional[User]] = relationship(back_populates="participations")


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[int] = mapped_column(primary_key=True)
    poll_id: Mapped[int] = mapped_column(ForeignKey("polls.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    poll: Mapped[Poll] = relationship(back_populates="submissions")
    answers: Mapped[list[Answer]] = relationship(
        back_populates="submission", cascade="all, delete-orphan"
    )


class Answer(Base):
    __tablename__ = "answers"
    __table_args__ = (
        UniqueConstraint("submission_id", "question_id", name="uq_answer_question"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    submission_id: Mapped[int] = mapped_column(
        ForeignKey("submissions.id", ondelete="CASCADE")
    )
    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE")
    )
    option_id: Mapped[int] = mapped_column(ForeignKey("options.id", ondelete="CASCADE"))

    submission: Mapped[Submission] = relationship(back_populates="answers")
    question: Mapped[Question] = relationship()
    option: Mapped[Option] = relationship()
