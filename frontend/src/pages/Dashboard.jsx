import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, CheckSquare, Clock, AlertCircle,
  TrendingUp, FolderKanban, Users, Loader2, ArrowRight
} from 'lucide-react'

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-sm text-surface-400 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-surface-500 mt-1">{sub}</p>}
  </div>
)

const STATUS_CONFIG = {
  todo: { label: 'To Do', color: 'bg-surface-700', text: 'text-surface-300' },
  in_progress: { label: 'In Progress', color: 'bg-brand-600/30', text: 'text-brand-300' },
  review: { label: 'Review', color: 'bg-yellow-600/20', text: 'text-yellow-400' },
  done: { label: 'Done', color: 'bg-green-600/20', text: 'text-green-400' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/tasks/dashboard'),
      api.get('/tasks/?assignee_id=' + user.id),
      api.get('/projects/'),
    ]).then(([s, t, p]) => {
      setStats(s.data)
      setRecentTasks(t.data.slice(0, 5))
      setProjects(p.data.slice(0, 4))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin text-brand-500" size={32} />
    </div>
  )

  const completion = stats?.total ? Math.round((stats.done / stats.total) * 100) : 0

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-surface-400 text-sm mt-0.5">Here's what's happening with your projects</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Tasks" value={stats?.total || 0} icon={CheckSquare}
          color="bg-brand-600/15 text-brand-400" />
        <StatCard label="In Progress" value={stats?.in_progress || 0} icon={TrendingUp}
          color="bg-blue-600/15 text-blue-400" />
        <StatCard label="Overdue" value={stats?.overdue || 0} icon={AlertCircle}
          color="bg-red-600/15 text-red-400" sub={stats?.overdue > 0 ? 'Needs attention' : 'All on track'} />
        <StatCard label="Projects" value={stats?.projects || 0} icon={FolderKanban}
          color="bg-purple-600/15 text-purple-400" />
      </div>

      {/* Progress bar */}
      {stats?.total > 0 && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-surface-300">Overall Completion</span>
            <span className="text-sm font-bold text-white">{completion}%</span>
          </div>
          <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-700"
              style={{ width: `${completion}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3 text-xs text-surface-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-surface-600 inline-block"></span>{stats?.todo} todo</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-500 inline-block"></span>{stats?.in_progress} in progress</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>{stats?.review} review</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>{stats?.done} done</span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-surface-800">
            <h2 className="font-semibold text-white text-sm">My Recent Tasks</h2>
            <Link to="/tasks" className="text-brand-400 text-xs hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-surface-800">
            {recentTasks.length === 0 ? (
              <p className="text-surface-500 text-sm p-4">No tasks assigned to you</p>
            ) : recentTasks.map(task => {
              const s = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo
              return (
                <div key={task.id} className="px-4 py-3 flex items-center gap-3 hover:bg-surface-800/30 transition-colors">
                  <span className={`badge ${s.color} ${s.text}`}>{s.label}</span>
                  <span className="text-sm text-surface-200 flex-1 truncate">{task.title}</span>
                  {task.due_date && (
                    <span className="text-xs text-surface-500 flex-shrink-0">
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Projects */}
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-surface-800">
            <h2 className="font-semibold text-white text-sm">Active Projects</h2>
            <Link to="/projects" className="text-brand-400 text-xs hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-surface-800">
            {projects.length === 0 ? (
              <p className="text-surface-500 text-sm p-4">No projects yet</p>
            ) : projects.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`}
                className="px-4 py-3 flex items-center gap-3 hover:bg-surface-800/30 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-brand-700/40 flex items-center justify-center flex-shrink-0">
                  <FolderKanban size={14} className="text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-100 truncate group-hover:text-white">{p.name}</p>
                  <p className="text-xs text-surface-500">{p.task_count} tasks · {p.members?.length} members</p>
                </div>
                <ArrowRight size={14} className="text-surface-600 group-hover:text-brand-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
