"""Pydantic-схемы для проверки входных данных и формирования ответов API."""

from datetime import date, datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class UserCreate(BaseModel):
    """Данные регистрации нового пользователя."""
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=100)

    @field_validator("email")
    @classmethod
    def email_must_be_valid(cls, value: str) -> str:
        if "@" not in value or "." not in value.rsplit("@", 1)[-1]:
            raise ValueError("Введите корректную электронную почту")
        return value.lower()


class UserUpdate(BaseModel):
    """Необязательные поля для частичного изменения пользователя."""
    email: Optional[str] = Field(default=None, min_length=5, max_length=255)
    password: Optional[str] = Field(default=None, min_length=8, max_length=100)

    @field_validator("email")
    @classmethod
    def email_must_be_valid(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and (
            "@" not in value or "." not in value.rsplit("@", 1)[-1]
        ):
            raise ValueError("Введите корректную электронную почту")
        return value.lower() if value is not None else None


class UserRead(BaseModel):
    """Безопасное представление пользователя без хеша пароля."""
    id: int
    email: str
    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    """Почта и пароль для входа."""
    email: str
    password: str


class RefreshRequest(BaseModel):
    """Refresh token для обновления сессии или выхода."""
    refresh_token: str


class TokenPair(BaseModel):
    """Пара access и refresh токенов, возвращаемая клиенту."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class OptionCreate(BaseModel):
    """Текст нового варианта ответа."""
    text: str = Field(min_length=1, max_length=300)


class OptionRead(OptionCreate):
    """Вариант ответа с присвоенным базой идентификатором."""
    id: int
    model_config = ConfigDict(from_attributes=True)


class QuestionCreate(BaseModel):
    """Новый вопрос минимум с двумя вариантами."""
    text: str = Field(min_length=1, max_length=500)
    options: List[OptionCreate] = Field(min_length=2)


class QuestionRead(BaseModel):
    """Вопрос с идентификатором и готовыми вариантами."""
    id: int
    text: str
    options: List[OptionRead]
    model_config = ConfigDict(from_attributes=True)


class PollCreate(BaseModel):
    """Полные данные для создания опроса."""
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=1000)
    status: Literal["draft", "active"] = "draft"
    access: Literal["public", "registered"] = "public"
    results_access: Literal["after_vote", "after_finish", "hidden"] = "after_finish"
    end_date: date
    owner_id: int
    questions: List[QuestionCreate] = Field(min_length=1)

    @field_validator("end_date")
    @classmethod
    def end_date_must_be_in_future(cls, value: date) -> date:
        if value <= date.today():
            raise ValueError("Дата окончания должна быть позже сегодняшней")
        return value


class PollUpdate(BaseModel):
    """Разрешённые поля частичного обновления опроса."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: Optional[Literal["draft", "active", "finished"]] = None
    access: Optional[Literal["public", "registered"]] = None
    results_access: Optional[
        Literal["after_vote", "after_finish", "hidden"]
    ] = None
    end_date: Optional[date] = None

    @field_validator("end_date")
    @classmethod
    def end_date_must_be_in_future(cls, value: Optional[date]) -> Optional[date]:
        if value is not None and value <= date.today():
            raise ValueError("Дата окончания должна быть позже сегодняшней")
        return value


class PollRead(BaseModel):
    """Полное представление опроса для клиента."""
    id: int
    title: str
    description: str
    status: str
    access: str
    results_access: str
    end_date: date
    owner_id: int
    questions: List[QuestionRead]
    model_config = ConfigDict(from_attributes=True)


class AnswerCreate(BaseModel):
    """Выбор одного варианта в конкретном вопросе."""
    question_id: int
    option_id: int


class SubmissionCreate(BaseModel):
    """Набор ответов гостя или зарегистрированного пользователя."""
    user_id: Optional[int] = None
    answers: List[AnswerCreate] = Field(min_length=1)


class SubmissionRead(BaseModel):
    """Подтверждение зарегистрированной отправки ответов."""
    id: int
    poll_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class OptionResult(BaseModel):
    """Количество голосов за один вариант."""
    option_id: int
    text: str
    votes: int


class QuestionResult(BaseModel):
    """Агрегированная статистика одного вопроса."""
    question_id: int
    text: str
    total_votes: int
    options: List[OptionResult]


class PollResults(BaseModel):
    """Анонимные результаты всех вопросов опроса."""
    poll_id: int
    title: str
    questions: List[QuestionResult]
