import { useState, useEffect } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import toast from 'react-hot-toast'
import { Plus, Search, Filter, Loader2, CheckSquare } from 'lucide-react'

const STATUSES = ['', 'todo', 'in_progress', 'review', 'done']
const PRIORITIES = ['', 'low', 'medium', 'high', 'urgent']

export default function Tasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [myTasksOnly, setMyTasksOnly] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      let url = '/tasks/?'
      if (statusFilter) url += `status=${statusFilter}&`
      if (priorityFilter) url += `priority=${priorityFilter}&`
      if (myTasksOnly) url += `assignee_id=${user.id}&`
      const r = await api.get(url)
      setTasks(r.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter, priorityFilter, myTasksOnly])

  const filtered = tasks.filter(t =>
    search ? t.title.toLowerCase().includes(search.toLowerCase()) : true
  )

  const handleDelete = async (task) => {
    if (!confirm(`Delete "${task.title}"?`)) return
    try {
      await api.delete(`/tasks/${task.id}`)
      toast.success('Task deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete')
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare size={20} className="text-brand-400" /> My Tasks
          </h1>
          <p className="text-surface-400 text-sm mt-0.5">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-primary">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input className="input pl-9 text-sm" placeholder="Search tasks..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.slice(1).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select className="input w-auto text-sm" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">All Priority</option>
          {PRIORITIES.slice(1).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button
          onClick={() => setMyTasksOnly(v => !v)}
          className={`btn-secondary text-sm ${myTasksOnly ? 'border-brand-500 text-brand-400' : ''}`}
        >
          <Filter size={14} /> My Tasks
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-brand-500" size={28} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <CheckSquare size={40} className="text-surface-700 mx-auto mb-3" />
          <p className="text-surface-400">No tasks found</p>
          <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-primary mx-auto mt-4">
            <Plus size={15} /> Create Task
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(task => (
            <TaskCard key={task.id} task={task}
              onEdit={t => { setEditing(t); setShowModal(true) }}
              onDelete={handleDelete}
              currentUserId={user.id} />
          ))}
        </div>
      )}

      {showModal && (
        <TaskModal
          task={editing}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSave={load}
        />
      )}
    </div>
  )
}
