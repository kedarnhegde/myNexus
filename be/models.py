from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Float
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PostLike(Base):
    __tablename__ = "post_likes"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Connection(Base):
    __tablename__ = "connections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    friend_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="pending")  # pending, accepted, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Professor(Base):
    __tablename__ = "professors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    department = Column(String(100), nullable=False, index=True)
    email = Column(String(255))
    avg_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    would_take_again_percent = Column(Float, default=0.0)
    avg_difficulty = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), nullable=False, index=True)  # e.g., CS-101
    title = Column(String(255), nullable=False, index=True)
    department = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    credits = Column(Integer, default=3)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CourseSection(Base):
    __tablename__ = "course_sections"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    professor_id = Column(Integer, ForeignKey("professors.id"), nullable=False)
    section_number = Column(String(10), nullable=False)
    semester = Column(String(20), nullable=False)  # e.g., Fall 2024
    schedule = Column(String(100))  # e.g., MWF 10:00-11:00
    location = Column(String(100))
    syllabus_url = Column(String(500))
    exam_format = Column(String(50))  # midterm+final, project-based, etc.
    grading_style = Column(String(50))  # curve, absolute, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    section_id = Column(Integer, ForeignKey("course_sections.id"), nullable=False)
    rating = Column(Float, nullable=False)  # 1-5
    difficulty = Column(Float, nullable=False)  # 1-5
    workload = Column(Float, nullable=False)  # 1-5 (hours per week)
    would_take_again = Column(Boolean, nullable=False)
    grade_received = Column(String(5))  # A, B+, etc.
    attendance_mandatory = Column(Boolean)
    textbook_required = Column(Boolean)
    content = Column(Text, nullable=False)
    tags = Column(String(500))  # comma-separated: exam-heavy,project-based,etc.
    helpful_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    section_id = Column(Integer, ForeignKey("course_sections.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    upvotes = Column(Integer, default=0)
    answer_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    content = Column(Text, nullable=False)
    upvotes = Column(Integer, default=0)
    is_accepted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())