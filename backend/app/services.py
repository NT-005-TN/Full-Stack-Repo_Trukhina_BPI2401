from datetime import date

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import crud, models, schemas


class VoteError(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail


def submit_answers(
    db: Session, poll_id: int, data: schemas.SubmissionCreate
) -> models.Submission:
    poll = crud.get_poll(db, poll_id)
    if poll is None:
        raise VoteError(404, "Опрос не найден")
    if poll.status != "active" or poll.end_date <= date.today():
        raise VoteError(409, "Опрос не принимает ответы")

    user = None
    if data.user_id is not None:
        user = db.get(models.User, data.user_id)
        if user is None:
            raise VoteError(404, "Пользователь не найден")
    if poll.access == "registered" and user is None:
        raise VoteError(403, "Для участия необходимо войти")

    if user is not None:
        previous = db.scalar(
            select(models.Participation).where(
                models.Participation.poll_id == poll.id,
                models.Participation.user_id == user.id,
            )
        )
        if previous is not None:
            raise VoteError(409, "Пользователь уже участвовал в опросе")

    questions = {question.id: question for question in poll.questions}
    answer_questions = [answer.question_id for answer in data.answers]
    if len(answer_questions) != len(set(answer_questions)):
        raise VoteError(422, "На каждый вопрос можно дать только один ответ")
    if set(answer_questions) != set(questions):
        raise VoteError(422, "Нужно ответить на все вопросы опроса")

    answers = []
    for answer in data.answers:
        question = questions[answer.question_id]
        valid_option_ids = {option.id for option in question.options}
        if answer.option_id not in valid_option_ids:
            raise VoteError(422, "Вариант ответа не относится к вопросу")
        answers.append(
            models.Answer(question_id=answer.question_id, option_id=answer.option_id)
        )

    participation = models.Participation(poll=poll, user=user)
    submission = models.Submission(poll=poll, answers=answers)
    db.add_all([participation, submission])
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise VoteError(409, "Ответы уже были отправлены")
    db.refresh(submission)
    return submission


def get_results(db: Session, poll_id: int) -> schemas.PollResults:
    poll = crud.get_poll(db, poll_id)
    if poll is None:
        raise VoteError(404, "Опрос не найден")
    if poll.results_access == "hidden":
        raise VoteError(403, "Результаты этого опроса не публикуются")
    if poll.results_access == "after_finish" and poll.status != "finished":
        raise VoteError(403, "Результаты будут доступны после завершения опроса")

    statement = (
        select(models.Answer.question_id, models.Answer.option_id, func.count())
        .join(models.Submission)
        .where(models.Submission.poll_id == poll.id)
        .group_by(models.Answer.question_id, models.Answer.option_id)
    )
    counts = {
        (question_id, option_id): votes
        for question_id, option_id, votes in db.execute(statement).all()
    }
    question_results = []
    for question in poll.questions:
        options = [
            schemas.OptionResult(
                option_id=option.id,
                text=option.text,
                votes=counts.get((question.id, option.id), 0),
            )
            for option in question.options
        ]
        question_results.append(
            schemas.QuestionResult(
                question_id=question.id,
                text=question.text,
                total_votes=sum(option.votes for option in options),
                options=options,
            )
        )
    return schemas.PollResults(
        poll_id=poll.id,
        title=poll.title,
        questions=question_results,
    )
