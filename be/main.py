from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import bcrypt
import os
from dotenv import load_dotenv

from database import SessionLocal, engine, get_db
from models import Base, User, Post, PostLike, Comment, Message, Connection, UserProfile, Tag, UserTag, UserCourse
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
