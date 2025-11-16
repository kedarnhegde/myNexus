from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    content: str
    user_id: int
    category: str = "general"

class Post(BaseModel):
    id: int
    content: str
    category: str
    likes_count: int
    created_at: datetime
    username: str

    class Config:
        from_attributes = True