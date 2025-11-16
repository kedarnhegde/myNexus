from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import bcrypt
import os
from dotenv import load_dotenv

from database import SessionLocal, engine, get_db
from models import Base, User, Post, PostLike, Comment, Message, Connection, UserProfile, Tag, UserTag, UserCourse, Professor, Course, CourseSection, Review, Question
from schemas import UserCreate, UserUpdate, User as UserSchema, PostCreate
from schemas import UserCreate, UserUpdate, User as UserSchema, PostCreate
from auth_schemas import LoginRequest, LoginResponse
from typing import Optional
from sqlalchemy import func

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title=os.getenv("APP_NAME", "Nexus Backend"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == request.email) | (User.username == request.email)
    ).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return LoginResponse(id=user.id, email=user.email, username=user.username)

@app.post("/users/", response_model=UserSchema)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already taken")
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    hashed_password = hash_password(user.password)
    db_user = User(email=user.email, username=user.username, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/{user_id}", response_model=UserSchema)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/users/", response_model=list[UserSchema])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@app.put("/users/{user_id}", response_model=UserSchema)
def update_user(user_id: int, user: UserUpdate, old_password: str = None, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_dict = user.dict(exclude_unset=True)
    
    # If password is being updated, verify old password
    if "password" in update_dict:
        if not old_password:
            raise HTTPException(status_code=400, detail="Old password required to change password")
        if not verify_password(old_password, db_user.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect old password")
    
    for field, value in update_dict.items():
        if field == "password":
            setattr(db_user, "password_hash", hash_password(value))
        else:
            setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

@app.get("/posts/")
def get_posts(category: Optional[str] = None, user_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Post)
    if category and category != 'all':
        query = query.filter(Post.category == category)
    posts = query.order_by(Post.created_at.desc()).all()
    result = []
    for post in posts:
        user = db.query(User).filter(User.id == post.user_id).first()
        votes_sum = db.query(func.sum(PostLike.value)).filter(PostLike.post_id == post.id).scalar() or 0
        comments_count = db.query(Comment).filter(Comment.post_id == post.id).count()
        user_vote = None
        if user_id:
            user_like = db.query(PostLike).filter(PostLike.post_id == post.id, PostLike.user_id == user_id).first()
            user_vote = user_like.value if user_like else None
        result.append({
            "id": post.id,
            "content": post.content,
            "category": post.category,
            "likes_count": votes_sum,
            "comments_count": comments_count,
            "created_at": post.created_at,
            "username": user.username if user else "Unknown",
            "user_id": post.user_id,
            "user_vote": user_vote
        })
    return result

@app.post("/posts/")
def create_post(post: PostCreate, db: Session = Depends(get_db)):
    db_post = Post(content=post.content, user_id=post.user_id, category=post.category)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return {"id": db_post.id, "content": db_post.content, "category": db_post.category}

@app.post("/posts/{post_id}/vote")
def vote_post(post_id: int, user_id: int, value: int, db: Session = Depends(get_db)):
    existing = db.query(PostLike).filter(PostLike.post_id == post_id, PostLike.user_id == user_id).first()
    if existing:
        if existing.value == value:
            db.delete(existing)
            db.commit()
            return {"voted": False}
        else:
            existing.value = value
            db.commit()
            return {"voted": True, "value": value}
    else:
        like = PostLike(post_id=post_id, user_id=user_id, value=value)
        db.add(like)
        db.commit()
        return {"voted": True, "value": value}

@app.get("/posts/{post_id}/comments")
def get_comments(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()
    result = []
    for comment in comments:
        user = db.query(User).filter(User.id == comment.user_id).first()
        result.append({
            "id": comment.id,
            "content": comment.content,
            "username": user.username if user else "Unknown",
            "created_at": comment.created_at
        })
    return result

@app.post("/posts/{post_id}/comments")
def add_comment(post_id: int, user_id: int, content: str, db: Session = Depends(get_db)):
    comment = Comment(post_id=post_id, user_id=user_id, content=content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    user = db.query(User).filter(User.id == user_id).first()
    return {"id": comment.id, "content": comment.content, "username": user.username if user else "Unknown", "created_at": comment.created_at}

@app.get("/messages/{user_id}")
def get_messages(user_id: int, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        (Message.sender_id == user_id) | (Message.receiver_id == user_id)
    ).order_by(Message.created_at.desc()).all()
    
    # Group by other user and get latest message
    user_messages = {}
    for msg in messages:
        other_user_id = msg.sender_id if msg.receiver_id == user_id else msg.receiver_id
        if other_user_id not in user_messages:
            sender = db.query(User).filter(User.id == msg.sender_id).first()
            receiver = db.query(User).filter(User.id == msg.receiver_id).first()
            user_messages[other_user_id] = {
                "id": msg.id,
                "content": msg.content,
                "is_read": msg.is_read,
                "created_at": msg.created_at,
                "sender_username": sender.username if sender else "Unknown",
                "receiver_username": receiver.username if receiver else "Unknown",
                "is_sender": msg.sender_id == user_id,
                "other_user_id": other_user_id
            }
    
    return list(user_messages.values())

@app.get("/users/recommended/{user_id}")
def get_recommended_users(user_id: int, db: Session = Depends(get_db)):
    # Get current user's tags
    user_tags = db.query(Tag.id).join(UserTag).filter(UserTag.user_id == user_id).all()
    user_tag_ids = [t[0] for t in user_tags]
    
    # Get all users except current user and already connected
    connected_ids = db.query(Connection.friend_id).filter(
        Connection.user_id == user_id
    ).union(
        db.query(Connection.user_id).filter(Connection.friend_id == user_id)
    ).all()
    connected_ids = [c[0] for c in connected_ids]
    
    users = db.query(User).filter(
        User.id != user_id,
        ~User.id.in_(connected_ids) if connected_ids else True
    ).all()
    
    result = []
    for u in users:
        profile = db.query(UserProfile).filter(UserProfile.user_id == u.id).first()
        tags = db.query(Tag).join(UserTag).filter(UserTag.user_id == u.id).all()
        courses = db.query(UserCourse).filter(UserCourse.user_id == u.id).all()
        
        # Count matching tags
        matching_tags = sum(1 for t in tags if t.id in user_tag_ids)
        
        result.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "gender": profile.gender if profile else None,
            "year": profile.year if profile else None,
            "major": profile.major if profile else None,
            "bio": profile.bio if profile else None,
            "clubs": profile.clubs if profile else None,
            "tags": [t.name for t in tags],
            "courses": [c.course_code for c in courses],
            "matching_tags": matching_tags
        })
    
    # Sort by matching tags (descending)
    result.sort(key=lambda x: x['matching_tags'], reverse=True)
    return result[:20]

@app.get("/users/search")
def search_users(
    current_user_id: int,
    query: Optional[str] = None,
    gender: Optional[str] = None,
    year: Optional[str] = None,
    course: Optional[str] = None,
    tag: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Start with base query
    users_query = db.query(User).filter(User.id != current_user_id)
    
    # Apply text search
    if query:
        users_query = users_query.filter(
            (User.username.like(f"%{query}%")) | (User.email.like(f"%{query}%"))
        )
    
    # Join with profile for filters
    if gender or year:
        users_query = users_query.join(UserProfile, User.id == UserProfile.user_id)
        if gender:
            users_query = users_query.filter(UserProfile.gender == gender)
        if year:
            users_query = users_query.filter(UserProfile.year == year)
    
    # Filter by course
    if course:
        users_query = users_query.join(UserCourse, User.id == UserCourse.user_id).filter(
            UserCourse.course_code.like(f"%{course}%")
        )
    
    # Filter by tag
    if tag:
        users_query = users_query.join(UserTag, User.id == UserTag.user_id).join(
            Tag, UserTag.tag_id == Tag.id
        ).filter(Tag.name == tag)
    
    users = users_query.limit(20).all()
    
    result = []
    for u in users:
        profile = db.query(UserProfile).filter(UserProfile.user_id == u.id).first()
        tags = db.query(Tag).join(UserTag).filter(UserTag.user_id == u.id).all()
        courses = db.query(UserCourse).filter(UserCourse.user_id == u.id).all()
        
        result.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "gender": profile.gender if profile else None,
            "year": profile.year if profile else None,
            "major": profile.major if profile else None,
            "bio": profile.bio if profile else None,
            "tags": [t.name for t in tags],
            "courses": [c.course_code for c in courses]
        })
    
    return result

@app.post("/connections/")
def send_friend_request(user_id: int, friend_id: int, db: Session = Depends(get_db)):
    existing = db.query(Connection).filter(
        ((Connection.user_id == user_id) & (Connection.friend_id == friend_id)) |
        ((Connection.user_id == friend_id) & (Connection.friend_id == user_id))
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Connection already exists")
    
    connection = Connection(user_id=user_id, friend_id=friend_id, status="pending")
    db.add(connection)
    db.commit()
    return {"message": "Friend request sent"}

@app.get("/connections/{user_id}")
def get_connections(user_id: int, db: Session = Depends(get_db)):
    connections = db.query(Connection).filter(
        ((Connection.user_id == user_id) | (Connection.friend_id == user_id))
    ).all()
    
    result = []
    for conn in connections:
        other_user_id = conn.friend_id if conn.user_id == user_id else conn.user_id
        other_user = db.query(User).filter(User.id == other_user_id).first()
        if other_user:
            profile = db.query(UserProfile).filter(UserProfile.user_id == other_user.id).first()
            tags = db.query(Tag).join(UserTag).filter(UserTag.user_id == other_user.id).all()
            result.append({
                "id": conn.id,
                "user_id": other_user_id,
                "username": other_user.username,
                "email": other_user.email,
                "bio": profile.bio if profile else None,
                "tags": [t.name for t in tags],
                "status": conn.status,
                "is_sender": conn.user_id == user_id
            })
    return result

@app.put("/connections/{connection_id}")
def update_connection(connection_id: int, status: str, db: Session = Depends(get_db)):
    connection = db.query(Connection).filter(Connection.id == connection_id).first()
    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    connection.status = status
    db.commit()
    return {"message": "Connection updated"}

@app.get("/tags/")
def get_all_tags(db: Session = Depends(get_db)):
    tags = db.query(Tag).all()
    return [{"id": t.id, "name": t.name} for t in tags]

@app.get("/users/{user_id}/tags")
def get_user_tags(user_id: int, db: Session = Depends(get_db)):
    tags = db.query(Tag).join(UserTag).filter(UserTag.user_id == user_id).all()
    return [{"id": t.id, "name": t.name} for t in tags]

@app.post("/users/{user_id}/tags/{tag_id}")
def add_user_tag(user_id: int, tag_id: int, db: Session = Depends(get_db)):
    existing = db.query(UserTag).filter(UserTag.user_id == user_id, UserTag.tag_id == tag_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tag already added")
    user_tag = UserTag(user_id=user_id, tag_id=tag_id)
    db.add(user_tag)
    db.commit()
    return {"message": "Tag added"}

@app.delete("/users/{user_id}/tags/{tag_id}")
def remove_user_tag(user_id: int, tag_id: int, db: Session = Depends(get_db)):
    user_tag = db.query(UserTag).filter(UserTag.user_id == user_id, UserTag.tag_id == tag_id).first()
    if not user_tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    db.delete(user_tag)
    db.commit()
    return {"message": "Tag removed"}

@app.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    depts = db.query(Course.department).distinct().all()
    return sorted([d[0] for d in depts])

@app.get("/courses/search")
def search_courses(query: str = "", department: str = "", db: Session = Depends(get_db)):
    courses_query = db.query(Course)
    if query:
        courses_query = courses_query.filter(
            (Course.code.like(f"%{query}%")) | (Course.title.like(f"%{query}%"))
        )
    if department:
        courses_query = courses_query.filter(Course.department == department)
    courses = courses_query.all()
    return [{"id": c.id, "code": c.code, "title": c.title, "description": c.description, "department": c.department, "tags": c.tags} for c in courses]

@app.get("/user-courses/{user_id}")
def get_user_courses(user_id: int, db: Session = Depends(get_db)):
    courses = db.query(UserCourse).filter(UserCourse.user_id == user_id).all()
    return [{"id": c.id, "course_code": c.course_code, "course_name": c.course_name, "semester": c.semester} for c in courses]

@app.post("/user-courses/")
def add_user_course(user_id: int, course_code: str, course_name: str, semester: str, db: Session = Depends(get_db)):
    course = UserCourse(user_id=user_id, course_code=course_code, course_name=course_name, semester=semester)
    db.add(course)
    db.commit()
    db.refresh(course)
    return {"id": course.id, "course_code": course.course_code, "course_name": course.course_name, "semester": course.semester}

@app.delete("/user-courses/{course_id}")
def delete_user_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(UserCourse).filter(UserCourse.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return {"message": "Course removed"}

@app.get("/professors/popular")
def get_popular_professors(db: Session = Depends(get_db)):
    profs = db.query(Professor).filter(Professor.total_reviews > 0).order_by(Professor.avg_rating.desc()).limit(5).all()
    return [{"id": p.id, "name": p.name, "department": p.department, "avg_rating": p.avg_rating, "total_reviews": p.total_reviews} for p in profs]

@app.get("/professors/search")
def search_professors(query: str = "", department: str = "", db: Session = Depends(get_db)):
    profs_query = db.query(Professor)
    if query:
        profs_query = profs_query.filter(Professor.name.like(f"%{query}%"))
    if department:
        profs_query = profs_query.filter(Professor.department == department)
    profs = profs_query.all()
    return [{"id": p.id, "name": p.name, "department": p.department, "avg_rating": p.avg_rating, "avg_difficulty": p.avg_difficulty, "would_take_again_percent": p.would_take_again_percent, "total_reviews": p.total_reviews} for p in profs]

@app.get("/professors/{professor_id}")
def get_professor_detail(professor_id: int, db: Session = Depends(get_db)):
    prof = db.query(Professor).filter(Professor.id == professor_id).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Professor not found")
    sections = db.query(CourseSection).filter(CourseSection.professor_id == professor_id).all()
    courses_data = []
    for s in sections:
        course = db.query(Course).filter(Course.id == s.course_id).first()
        if course:
            courses_data.append({
                "course_id": course.id, "course_code": course.code, "course_title": course.title,
                "section_id": s.id, "section_number": s.section_number, "semester": s.semester,
                "schedule": s.schedule, "location": s.location, "exam_format": s.exam_format,
                "grading_style": s.grading_style
            })
    return {"professor": {"id": prof.id, "name": prof.name, "department": prof.department, "email": prof.email, "avg_rating": prof.avg_rating, "avg_difficulty": prof.avg_difficulty, "would_take_again_percent": prof.would_take_again_percent, "total_reviews": prof.total_reviews}, "courses": courses_data}

@app.get("/courses/{course_id}")
def get_course_detail(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    sections = db.query(CourseSection).filter(CourseSection.course_id == course_id).all()
    sections_data = []
    for s in sections:
        prof = db.query(Professor).filter(Professor.id == s.professor_id).first()
        sections_data.append({
            "section_id": s.id, "section_number": s.section_number, "professor_name": prof.name if prof else "Unknown",
            "professor_rating": prof.avg_rating if prof else 0, "semester": s.semester, "schedule": s.schedule,
            "location": s.location, "syllabus_url": s.syllabus_url, "exam_format": s.exam_format, "grading_style": s.grading_style,
            "tags": s.tags
        })
    return {"course": {"id": course.id, "code": course.code, "title": course.title, "description": course.description, "department": course.department, "credits": course.credits}, "sections": sections_data}

@app.get("/sections/{section_id}/reviews")
def get_section_reviews(section_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.section_id == section_id).all()
    result = []
    for r in reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        result.append({
            "id": r.id, "username": user.username if user else "Anonymous", "rating": r.rating,
            "difficulty": r.difficulty, "workload": r.workload, "would_take_again": r.would_take_again,
            "grade_received": r.grade_received, "attendance_mandatory": r.attendance_mandatory,
            "content": r.content, "tags": r.tags, "created_at": r.created_at
        })
    return result

@app.get("/sections/{section_id}/questions")
def get_section_questions(section_id: int, db: Session = Depends(get_db)):
    questions = db.query(Question).filter(Question.section_id == section_id).all()
    result = []
    for q in questions:
        user = db.query(User).filter(User.id == q.user_id).first()
        result.append({
            "id": q.id, "username": user.username if user else "Anonymous", "title": q.title,
            "content": q.content, "upvotes": q.upvotes, "answer_count": q.answer_count, "created_at": q.created_at
        })
    return result

@app.get("/syllabus/{section_id}")
def get_syllabus(section_id: int, db: Session = Depends(get_db)):
    section = db.query(CourseSection).filter(CourseSection.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    course = db.query(Course).filter(Course.id == section.course_id).first()
    prof = db.query(Professor).filter(Professor.id == section.professor_id).first()
    
    syllabus = f"""COURSE SYLLABUS
{course.code}: {course.title}
{section.semester} - Section {section.section_number}

INSTRUCTOR: {prof.name if prof else 'TBA'}
EMAIL: {prof.email if prof else 'TBA'}
SCHEDULE: {section.schedule}
LOCATION: {section.location}

COURSE DESCRIPTION:
{course.description}

GRADING:
{section.grading_style}
Exam Format: {section.exam_format}

WEEKLY SCHEDULE:

Week 1: Introduction and Course Overview
- Course objectives and expectations
- Introduction to key concepts
- Syllabus review

Week 2: Fundamentals Part 1
- Core principles and theories
- Reading assignments
- Quiz 1

Week 3: Fundamentals Part 2
- Advanced concepts
- Group discussion
- Assignment 1 due

Week 4: Practical Applications
- Case studies
- Lab work
- Project proposal due

Week 5: Mid-term Review
- Review sessions
- Practice problems
- Study guide provided

Week 6: MIDTERM EXAM

Week 7: Advanced Topics Part 1
- Specialized concepts
- Guest lecture
- Assignment 2 due

Week 8: Advanced Topics Part 2
- Research methods
- Group presentations begin

Week 9: Advanced Topics Part 3
- Current trends
- Industry applications
- Quiz 2

Week 10: Project Work
- Project development
- Peer reviews
- Draft submissions

Week 11: Integration and Synthesis
- Connecting concepts
- Real-world examples
- Assignment 3 due

Week 12: Special Topics
- Emerging issues
- Student presentations

Week 13: Review and Q&A
- Comprehensive review
- Final project presentations

Week 14: Final Exam Preparation
- Study sessions
- Office hours

Week 15: FINAL EXAM

GRADING BREAKDOWN:
- Midterm Exam: 25%
- Final Exam: 30%
- Assignments: 25%
- Project: 15%
- Participation: 5%

REQUIRED MATERIALS:
- Textbook (see course website)
- Access to online learning platform
- Calculator (for applicable courses)

ATTENDANCE POLICY:
Attendance is {'mandatory' if section.exam_format == 'Midterm + Final' else 'recommended but not mandatory'}.

ACADEMIC INTEGRITY:
All work must be original. Plagiarism will result in course failure.

OFFICE HOURS:
By appointment - email to schedule
"""
    return {"content": syllabus, "course_code": course.code, "professor": prof.name if prof else "TBA"}
