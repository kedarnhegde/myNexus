from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ProfessorBase(BaseModel):
    name: str
    department: str
    email: Optional[str] = None

class Professor(ProfessorBase):
    id: int
    avg_rating: float
    total_reviews: int
    would_take_again_percent: float
    avg_difficulty: float
    created_at: datetime

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    code: str
    title: str
    department: str
    description: Optional[str] = None
    credits: int = 3

class Course(CourseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CourseSectionBase(BaseModel):
    course_id: int
    professor_id: int
    section_number: str
    semester: str
    schedule: Optional[str] = None
    location: Optional[str] = None
    syllabus_url: Optional[str] = None
    exam_format: Optional[str] = None
    grading_style: Optional[str] = None

class CourseSection(CourseSectionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    section_id: int
    rating: float
    difficulty: float
    workload: float
    would_take_again: bool
    grade_received: Optional[str] = None
    attendance_mandatory: Optional[bool] = None
    textbook_required: Optional[bool] = None
    content: str
    tags: Optional[str] = None

class Review(ReviewCreate):
    id: int
    user_id: int
    helpful_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionCreate(BaseModel):
    section_id: int
    title: str
    content: str

class Question(QuestionCreate):
    id: int
    user_id: int
    upvotes: int
    answer_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class AnswerCreate(BaseModel):
    question_id: int
    content: str

class Answer(AnswerCreate):
    id: int
    user_id: int
    upvotes: int
    is_accepted: bool
    created_at: datetime

    class Config:
        from_attributes = True
