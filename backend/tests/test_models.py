from datetime import date

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.database import Base
from app.models import Answer, Option, Participation, Poll, Question, Submission, User


def test_related_records_are_saved() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        owner = User(email="owner@example.com", password_hash="hash")
        poll = Poll(
            title="Учебный опрос",
            end_date=date(2026, 12, 31),
            owner=owner,
        )
        question = Question(text="Выберите вариант", poll=poll)
        first_option = Option(text="Первый", question=question)
        second_option = Option(text="Второй", question=question)
        participation = Participation(poll=poll, user=owner)
        submission = Submission(poll=poll)
        answer = Answer(
            submission=submission,
            question=question,
            option=first_option,
        )
        session.add_all([second_option, participation, answer])
        session.commit()

        saved_poll = session.query(Poll).one()
        assert saved_poll.owner.email == "owner@example.com"
        assert len(saved_poll.questions) == 1
        assert len(saved_poll.questions[0].options) == 2
        assert len(saved_poll.participations) == 1
        assert len(saved_poll.submissions[0].answers) == 1


def test_submission_does_not_store_user_identity() -> None:
    assert "user_id" not in Submission.__table__.columns
