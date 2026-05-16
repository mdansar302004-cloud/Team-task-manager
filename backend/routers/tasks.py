from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from database import get_db
from models.task import Task, TaskStatus, TaskPriority
from models.project import Project, ProjectMember, ProjectRole
from schemas.task import TaskCreate, TaskUpdate, TaskOut
from utils.auth import get_current_user

router = APIRouter()

def require_project_member(project_id: int, user, db: Session):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    if p.owner_id == user.id:
        return p
    m = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user.id
    ).first()
    if not m:
        raise HTTPException(status_code=403, detail="Not a project member")
    return p

def require_project_admin(project_id: int, user, db: Session):
    p = require_project_member(project_id, user, db)
    if p.owner_id == user.id:
        return p
    m = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user.id
    ).first()
    if not m or m.role != ProjectRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return p

@router.post("/", response_model=TaskOut, status_code=201)
def create_task(data: TaskCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    require_project_member(data.project_id, current_user, db)
    task = Task(
        title=data.title,
        description=data.description,
        status=data.status,
        priority=data.priority,
        project_id=data.project_id,
        assignee_id=data.assignee_id,
        creator_id=current_user.id,
        due_date=data.due_date,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/", response_model=List[TaskOut])
def list_tasks(
    project_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    assignee_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Get all projects user is member of
    memberships = db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
    owned = db.query(Project).filter(Project.owner_id == current_user.id).all()
    allowed_ids = set([m.project_id for m in memberships] + [p.id for p in owned])

    query = db.query(Task).filter(Task.project_id.in_(allowed_ids))
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)
    return query.order_by(Task.created_at.desc()).all()

@router.get("/dashboard", response_model=dict)
def dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    memberships = db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
    owned = db.query(Project).filter(Project.owner_id == current_user.id).all()
    allowed_ids = set([m.project_id for m in memberships] + [p.id for p in owned])

    all_tasks = db.query(Task).filter(Task.project_id.in_(allowed_ids)).all()
    now = datetime.now(timezone.utc)

    stats = {
        "total": len(all_tasks),
        "todo": sum(1 for t in all_tasks if t.status == "todo"),
        "in_progress": sum(1 for t in all_tasks if t.status == "in_progress"),
        "review": sum(1 for t in all_tasks if t.status == "review"),
        "done": sum(1 for t in all_tasks if t.status == "done"),
        "overdue": sum(1 for t in all_tasks if t.due_date and t.due_date.replace(tzinfo=timezone.utc) < now and t.status != "done"),
        "my_tasks": sum(1 for t in all_tasks if t.assignee_id == current_user.id),
        "projects": len(allowed_ids),
    }
    return stats

@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    require_project_member(task.project_id, current_user, db)
    return task

@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    require_project_member(task.project_id, current_user, db)
    for field, value in data.dict(exclude_unset=True).items():
        setattr(task, field, value)
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    p = require_project_member(task.project_id, current_user, db)
    # Only creator, project owner, or admin can delete
    m = db.query(ProjectMember).filter(
        ProjectMember.project_id == task.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    if task.creator_id != current_user.id and p.owner_id != current_user.id and (not m or m.role != ProjectRole.admin):
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")
    db.delete(task)
    db.commit()
