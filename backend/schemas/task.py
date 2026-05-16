from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from schemas.user import UserOut

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    project_id: int
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None

class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: str
    project_id: int
    assignee_id: Optional[int]
    creator_id: int
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    assignee: Optional[UserOut] = None
    creator: Optional[UserOut] = None

    class Config:
        from_attributes = True
