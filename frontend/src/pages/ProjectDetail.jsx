import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import toast from 'react-hot-toast'
import {
  FolderKanban, Plus, Users, Settings, Trash2, ChevronLeft,
  Loader2, X, UserPlus, Shield, User, CheckSquare
} from 'lucide-react'

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: 'border-t-surface-600' },
  { key: 'in_progress', label: 'In Progress', color: 'border-t-brand-500' },
  { key: 'review', label: 'Review', color: 'border-t-yellow-500' },
  { key: 'done', label: 'Done', color: 'border-t-green-500' },
]

function MemberModal({ project, currentUserId, onClose, onSave }) {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const isOwner = project.owner_id === currentUserId

  useEffect(() => {
    api.get('/users/').then(r => setUsers(r.data))
  }, [])

  const memberIds = new Set(project.members?.map(m => m.user.id))
  const filtered = users.filter(u =>
    !memberIds.has(u.id) && (search ? u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search) : true)
  )

  const addMember = async (userId, role = 'member') => {
    setLoading(true)
    try {
      await api.post(`/projects/${project.id}/members`, { user_id: userId, role })
      toast.success('Member added')
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return
    try {
      await api.delete(`/projects/${project.id}/members/${userId}`)
      toast.success('Member removed')
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    }
  }

  const changeRole = async (userId, role) => {
    try {
      await api.put(`/projects/${project.id}/members/${userId}/role`, { user_id: userId, role })
      toast.success('Role updated')
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card w-full max-w-md animate-slide-up max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-surface-800">
          <h2 className="font-semibold text-white flex items-center gap-2"><Users size={16} /> Team Members</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-white"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-5">
          {/* Current members */}
          <div>
            <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2">Current Members</p>
            <div className="space-y-2">
              {project.members?.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-800/50">
                  <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-brand-200">{m.user.name[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-100 truncate">{m.user.name}</p>
                    <p className="text-xs text-surface-500">{m.user.email}</p>
                  </div>
                  {isOwner && m.user.id !== currentUserId && (
                    <div className="flex items-center gap-1">
                      <select
                        className="text-xs bg-surface-700 border border-surface-600 rounded px-2 py-1 text-surface-300"
                        value={m.role}
                        onChange={e => changeRole(m.user.id, e.target.value)}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button onClick={() => removeMember(m.user.id)}
                        className="p-1 text-surface-500 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  {m.role === 'admin' && m.user.id !== project.owner_id && (
                    <Shield size={13} className="text-brand-400" />
                  )}
                  {m.user.id === project.owner_id && (
                    <span className="text-xs text-amber-400 font-medium">Owner</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isOwner && (
            <div>
              <p className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2">Add Members</p>
              <input className="input text-sm mb-3" placeholder="Search users..."
                value={search} onChange={e => setSearch(e.target.value)} />
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {filtered.slice(0, 8).map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-800 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-surface-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-surface-300">{u.name[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-surface-200 truncate">{u.name}</p>
                      <p className="text-xs text-surface-500 truncate">{u.email}</p>
                    </div>
                    <button onClick={() => addMember(u.id)} disabled={loading}
                      className="text-xs btn-primary py-1 px-2">
                      <Plus size={12} /> Add
                    </button>
                  </div>
                ))}
                {filtered.length === 0 && <p className="text-sm text-surface-500 py-2">No users found</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = async () => {
    try {
      const [p, t] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/?project_id=${id}`)
      ])
      setProject(p.data)
      setTasks(t.data)
    } catch {
      toast.error('Project not found')
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleDelete = async (task) => {
    if (!confirm(`Delete "${task.title}"?`)) return
    try {
      await api.delete(`/tasks/${task.id}`)
      toast.success('Task deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin text-brand-500" size={32} />
    </div>
  )

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter(t => t.status === col.key)
    return acc
  }, {})

  return (
    <div className="p-6 h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/projects')}
          className="text-surface-400 hover:text-white transition-colors flex items-center gap-1 text-sm">
          <ChevronLeft size={16} /> Projects
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{project?.name}</h1>
          {project?.description && <p className="text-surface-400 text-sm mt-0.5">{project.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 mr-1">
            {project?.members?.slice(0, 4).map(m => (
              <div key={m.id} className="w-7 h-7 rounded-full bg-brand-700 border-2 border-surface-950 flex items-center justify-center" title={m.user.name}>
                <span className="text-xs font-bold text-brand-200">{m.user.name[0]}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setShowMemberModal(true)} className="btn-secondary text-sm py-1.5">
            <Users size={14} /> {project?.members?.length} Members
          </button>
          <button onClick={() => { setEditing(null); setShowTaskModal(true) }} className="btn-primary text-sm py-1.5">
            <Plus size={14} /> Add Task
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {COLUMNS.map(col => (
            <div key={col.key} className={`w-72 flex flex-col card border-t-2 ${col.color}`}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800">
                <span className="text-sm font-semibold text-surface-200">{col.label}</span>
                <span className="text-xs text-surface-500 bg-surface-800 px-2 py-0.5 rounded-full">
                  {tasksByStatus[col.key]?.length || 0}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {tasksByStatus[col.key]?.map(task => (
                  <TaskCard key={task.id} task={task}
                    onEdit={t => { setEditing(t); setShowTaskModal(true) }}
                    onDelete={handleDelete}
                    currentUserId={user.id} />
                ))}
                {tasksByStatus[col.key]?.length === 0 && (
                  <p className="text-center text-surface-600 text-xs py-6">No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showTaskModal && (
        <TaskModal
          task={editing}
          projectId={parseInt(id)}
          onClose={() => { setShowTaskModal(false); setEditing(null) }}
          onSave={load}
        />
      )}
      {showMemberModal && (
        <MemberModal
          project={project}
          currentUserId={user.id}
          onClose={() => setShowMemberModal(false)}
          onSave={load}
        />
      )}
    </div>
  )
}
