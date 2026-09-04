from datetime import date
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class OptionCreate(BaseModel):
    text: str = Field(min_length=1, max_length=300)


class OptionRead(OptionCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class QuestionCreate(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    options: List[OptionCreate] = Field(min_length=2)


class QuestionRead(BaseModel):
    id: int
    text: str
    options: List[OptionRead]
    model_config = ConfigDict(from_attributes=True)


class PollCreate(BaseModel):
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
