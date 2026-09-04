from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Participation, Submission, User


@pytest.fixture()
def voting_client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    test_session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(engine)
    with test_session() as db:
        db.add(User(email="student@example.com", password_hash="hash"))
        db.commit()

    def get_test_db():
        with test_session() as db:
            yield db

    app.dependency_overrides[get_db] = get_test_db
    with TestClient(app) as client:
        yield client, test_session
    app.dependency_overrides.clear()


def create_poll(client: TestClient, access: str = "public") -> dict:
    response = client.post(
        "/polls",
        json={
            "title": "Голосование",
            "status": "active",
            "access": access,
            "results_access": "after_vote",
            "end_date": str(date.today() + timedelta(days=7)),
            "owner_id": 1,
            "questions": [
                {
                    "text": "Выберите вариант",
                    "options": [{"text": "Первый"}, {"text": "Второй"}],
                }
            ],
        },
    )
    assert response.status_code == 201
    return response.json()


def test_anonymous_submission_and_results(voting_client) -> None:
    client, test_session = voting_client
    poll = create_poll(client)
    question = poll["questions"][0]
    answer = {
        "answers": [
            {"question_id": question["id"], "option_id": question["options"][0]["id"]}
        ]
    }

    response = client.post(f"/polls/{poll['id']}/submissions", json=answer)
    assert response.status_code == 201
    assert "user_id" not in response.json()

    with test_session() as db:
        assert db.scalar(select(Submission)) is not None
        assert db.scalar(select(Participation)).user_id is None

    results = client.get(f"/polls/{poll['id']}/results")
    assert results.status_code == 200
    assert results.json()["questions"][0]["total_votes"] == 1
    assert "user_id" not in results.text


def test_registered_user_cannot_vote_twice(voting_client) -> None:
    client, _ = voting_client
    poll = create_poll(client, access="registered")
    question = poll["questions"][0]
    answer = {
        "user_id": 1,
        "answers": [
            {"question_id": question["id"], "option_id": question["options"][1]["id"]}
        ],
    }
    assert client.post(f"/polls/{poll['id']}/submissions", json=answer).status_code == 201
    assert client.post(f"/polls/{poll['id']}/submissions", json=answer).status_code == 409


def test_submission_validation(voting_client) -> None:
    client, _ = voting_client
    poll = create_poll(client, access="registered")
    question = poll["questions"][0]

    missing_login = client.post(
        f"/polls/{poll['id']}/submissions",
        json={
            "answers": [
                {
                    "question_id": question["id"],
                    "option_id": question["options"][0]["id"],
                }
            ]
        },
    )
    assert missing_login.status_code == 403

    wrong_option = client.post(
        f"/polls/{poll['id']}/submissions",
        json={
            "user_id": 1,
            "answers": [{"question_id": question["id"], "option_id": 999}],
        },
    )
    assert wrong_option.status_code == 422
