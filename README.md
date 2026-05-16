# TaskFlow — Team Task Manager

A full-stack team task management app with role-based access control, built with React + FastAPI + SQLite.

## 🚀 Live Demo

- **Frontend:** [Your Railway URL here]
- **Backend API:** [Your Railway API URL here]
- **API Docs:** [Your Railway API URL]/docs

---

## ✨ Features

- **Authentication** — JWT-based signup/login
- **Projects** — Create projects, invite team members
- **Role-based Access** — Admin (full control) / Member (create & edit tasks)
- **Task Management** — Create, assign, update, delete tasks
- **Kanban Board** — Visual task tracking by status per project
- **Dashboard** — Stats, completion progress, overdue alerts
- **Filters** — Filter by status, priority, assignee

---

## 🛠 Tech Stack

| Layer    | Tech                        |
|----------|-----------------------------|
| Frontend | React 18 + Vite + Tailwind  |
| Backend  | FastAPI + SQLAlchemy         |
| Database | SQLite (Railway: PostgreSQL) |
| Auth     | JWT (python-jose + passlib)  |
| Deploy   | Railway                     |

---

## 🏃 Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
# Create .env from example:
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000
npm run dev
```

App available at: http://localhost:5173

---

## 🌐 Deploy to Railway

### Backend

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the `/backend` folder (or set root directory to `backend`)
3. Add environment variables:
   - `SECRET_KEY` = any long random string
   - `DATABASE_URL` = (Railway provides this if you add PostgreSQL plugin)
4. Railway auto-detects Python and runs `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend

1. New service → Deploy from GitHub → root directory: `frontend`
2. Add environment variable:
   - `VITE_API_URL` = your backend Railway URL (e.g. `https://taskflow-backend.railway.app`)
3. Railway runs `npm install && npm run build` then serves with nixpacks

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── main.py              # FastAPI app entry
│   ├── database.py          # SQLAlchemy setup
│   ├── models/              # DB models (User, Project, Task)
│   ├── schemas/             # Pydantic schemas
│   ├── routers/             # API route handlers
│   ├── utils/               # Auth utilities (JWT, hashing)
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── App.jsx           # Router & layout
    │   ├── pages/            # Dashboard, Projects, Tasks, Login
    │   ├── components/       # Layout, TaskCard, TaskModal
    │   ├── context/          # AuthContext
    │   └── utils/            # Axios API client
    ├── index.html
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint           | Description       |
|--------|--------------------|-------------------|
| POST   | /api/auth/signup   | Register          |
| POST   | /api/auth/login    | Login → JWT token |
| GET    | /api/auth/me       | Current user      |

### Projects
| Method | Endpoint                          | Access |
|--------|-----------------------------------|--------|
| POST   | /api/projects/                    | Any member |
| GET    | /api/projects/                    | Member's projects |
| GET    | /api/projects/{id}                | Member |
| PUT    | /api/projects/{id}                | Admin |
| DELETE | /api/projects/{id}                | Owner only |
| POST   | /api/projects/{id}/members        | Admin |
| DELETE | /api/projects/{id}/members/{uid}  | Admin |

### Tasks
| Method | Endpoint         | Access |
|--------|------------------|--------|
| POST   | /api/tasks/      | Member |
| GET    | /api/tasks/      | Member (filtered) |
| GET    | /api/tasks/dashboard | Member |
| PUT    | /api/tasks/{id}  | Member |
| DELETE | /api/tasks/{id}  | Creator/Admin/Owner |

---

## 🎥 Demo Video

[2–5 min walkthrough of the app showing auth, project creation, task management, and kanban board]

---

## 👤 Author

Built for the Full-Stack Assignment · React + FastAPI + SQLite · Deployed on Railway
