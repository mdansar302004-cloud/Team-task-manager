import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Plus, FolderKanban, Trash2, Users, CheckSquare, Loader2, X, ArrowRight } from 'lucide-react'

function ProjectModal({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/projects/', { name, description })
      toast.success('Project created!')
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-surface-800">
          <h2 className="font-semibold text-white">New Project</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Project Name *</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)}
              placeholder="My Awesome Project" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={description}
              onChange={e => setDescription(e.target.value)} placeholder="What's this project about?" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const COLORS = ['bg-brand-700', 'bg-purple-700', 'bg-cyan-700', 'bg-emerald-700', 'bg-orange-700', 'bg-rose-700']

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await api.get('/projects/')
      setProjects(r.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (p) => {
    if (!confirm(`Delete project "${p.name}" and all its tasks?`)) return
    try {
      await api.delete(`/projects/${p.id}`)
      toast.success('Project deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Cannot delete project')
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderKanban size={20} className="text-brand-400" /> Projects
          </h1>
          <p className="text-surface-400 text-sm mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-brand-500" size={28} /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban size={40} className="text-surface-700 mx-auto mb-3" />
          <p className="text-surface-400 mb-4">No projects yet. Create your first one!</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto">
            <Plus size={15} /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <div key={p.id} className="card-hover p-5 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${COLORS[i % COLORS.length]} flex items-center justify-center shadow-lg`}>
                  <FolderKanban size={18} className="text-white" />
                </div>
                <button onClick={() => handleDelete(p)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-surface-500 hover:text-red-400 hover:bg-red-600/10 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="font-semibold text-white mb-1 truncate">{p.name}</h3>
              <p className="text-sm text-surface-500 line-clamp-2 mb-4">
                {p.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 text-xs text-surface-500 mb-4">
                <span className="flex items-center gap-1.5">
                  <CheckSquare size={12} className="text-surface-600" /> {p.task_count} tasks
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={12} className="text-surface-600" /> {p.members?.length} members
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {p.members?.slice(0, 4).map(m => (
                    <div key={m.id} className="w-7 h-7 rounded-full bg-brand-700 border-2 border-surface-900 flex items-center justify-center"
                      title={m.user.name}>
                      <span className="text-xs font-bold text-brand-200">{m.user.name[0].toUpperCase()}</span>
                    </div>
                  ))}
                  {p.members?.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-surface-700 border-2 border-surface-900 flex items-center justify-center">
                      <span className="text-xs text-surface-400">+{p.members.length - 4}</span>
                    </div>
                  )}
                </div>
                <Link to={`/projects/${p.id}`}
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium">
                  Open <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <ProjectModal onClose={() => setShowModal(false)} onSave={load} />}
    </div>
  )
}
