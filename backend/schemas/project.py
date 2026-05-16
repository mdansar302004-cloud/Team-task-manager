from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from schemas.user import UserOut

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class MemberOut(BaseModel):
    id: int
    user: UserOut
    role: str
    joined_at: datetime

    class Config:
        from_attributes = True

class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    owner_id: int
    owner: UserOut
    created_at: datetime
    members: List[MemberOut] = []
    task_count: Optional[int] = 0

    class Config:
        from_attributes = True

class AddMember(BaseModel):
    user_id: int
    role: str = "member"
