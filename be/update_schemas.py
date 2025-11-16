from pydantic import BaseModel
from typing import Optional

class UserUpdateWithPassword(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    old_password: Optional[str] = None
    password: Optional[str] = None
