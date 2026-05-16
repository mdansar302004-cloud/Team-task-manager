from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.project import Project, ProjectMember, ProjectRole
from models.user import User
from schemas.project import ProjectCreate, ProjectUpdate, ProjectOut, AddMember
from utils.auth import get_current_user

router = APIRouter()

def get_project_or_404(project_id: int, db: Session):
    p = db.query(Project).filter(Project.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return p

def get_user_role(project_id: int, user_id: int, db: Session):
    m = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    return m

def require_admin(project: Project, user, db: Session):
    if project.owner_id == user.id:
        return
    m = get_user_role(project.id, user.id, db)
    if not m or m.role != ProjectRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")

def require_member(project: Project, user, db: Session):
    if project.owner_id == user.id:
        return
    m = get_user_role(project.id, user.id, db)
    if not m:
        raise HTTPException(status_code=403, detail="Not a project member")

@router.post("/", response_model=ProjectOut, status_code=201)
def create_project(data: ProjectCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    project = Project(name=data.name, description=data.description, owner_id=current_user.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    # Add owner as admin member
    member = ProjectMember(project_id=project.id, user_id=current_user.id, role=ProjectRole.admin)
    db.add(member)
    db.commit()
    db.refresh(project)
    project.task_count = len(project.tasks)
    return project

@router.get("/", response_model=List[ProjectOut])
def list_projects(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    memberships = db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
    project_ids = [m.project_id for m in memberships]
    projects = db.query(Project).filter(Project.id.in_(project_ids)).all()
    for p in projects:
        p.task_count = len(p.tasks)
    return projects

@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    p = get_project_or_404(project_id, db)
    require_member(p, current_user, db)
    p.task_count = len(p.tasks)
    return p

@router.put("/{project_id}", response_model=ProjectOut)
def update_project(project_id: int, data: ProjectUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    p = get_project_or_404(project_id, db)
    require_admin(p, current_user, db)
    if data.name is not None:
        p.name = data.name
    if data.description is not None:
        p.description = data.description
    db.commit()
    db.refresh(p)
    p.task_count = len(p.tasks)
    return p

@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    p = get_project_or_404(project_id, db)
    if p.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can delete project")
    db.delete(p)
    db.commit()

@router.post("/{project_id}/members", status_code=201)
def add_member(project_id: int, data: AddMember, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    p = get_project_or_404(project_id, db)
    require_admin(p, current_user, db)
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    existing = get_user_role(project_id, data.user_id, db)
    if existing:
        raise HTTPException(status_code=400, detail="User already a member")
    role = ProjectRole.admin if data.role == "admin" else ProjectRole.member
    member = ProjectMember(project_id=project_id, user_id=data.user_id, role=role)
    db.add(member)
    db.commit()
    return {"message": "Member added"}

@router.delete("/{project_id}/members/{user_id}", status_code=204)
def remove_member(project_id: int, user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    p = get_project_or_404(project_id, db)
    require_admin(p, current_user, db)
    if user_id == p.owner_id:
        raise HTTPException(status_code=400, detail="Cannot remove project owner")
    m = get_user_role(project_id, user_id, db)
    if not m:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(m)
    db.commit()

@router.put("/{project_id}/members/{user_id}/role")
def update_member_role(project_id: int, user_id: int, data: AddMember, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    p = get_project_or_404(project_id, db)
    require_admin(p, current_user, db)
    m = get_user_role(project_id, user_id, db)
    if not m:
        raise HTTPException(status_code=404, detail="Member not found")
    m.role = ProjectRole.admin if data.role == "admin" else ProjectRole.member
    db.commit()
    return {"message": "Role updated"}
