import { Calendar, User, Pencil, Trash2, AlertTriangle } from 'lucide-react'

const STATUS_CONFIG = {
  todo: { label: 'To Do', cls: 'bg-surface-700 text-surface-300' },
  in_progress: { label: 'In Progress', cls: 'bg-brand-600/20 text-brand-300 border border-brand-600/30' },
  review: { label: 'Review', cls: 'bg-yellow-600/15 text-yellow-400 border border-yellow-600/20' },
  done: { label: 'Done', cls: 'bg-green-600/15 text-green-400 border border-green-600/20' },
}
const PRIORITY_CONFIG = {
  low: { label: 'Low', cls: 'text-surface-500' },
  medium: { label: 'Med', cls: 'text-blue-400' },
  high: { label: 'High', cls: 'text-orange-400' },
  urgent: { label: 'Urgent', cls: 'text-red-400' },
}

export default function TaskCard({ task, onEdit, onDelete, currentUserId }) {
  const s = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo
  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

  return (
    <div className="card-hover p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge ${s.cls}`}>{s.label}</span>
          <span className={`text-xs font-medium ${p.cls}`}>● {p.label}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onEdit(task)} className="p-1.5 rounded text-surface-500 hover:text-brand-400 hover:bg-brand-600/10 transition-all">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(task)} className="p-1.5 rounded text-surface-500 hover:text-red-400 hover:bg-red-600/10 transition-all">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <h3 className="text-sm font-medium text-surface-100 mb-1 leading-snug">{task.title}</h3>
      {task.description && (
        <p className="text-xs text-surface-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-surface-500 mt-2">
        {task.assignee && (
          <span className="flex items-center gap-1">
            <User size={11} />
            {task.assignee.name}
          </span>
        )}
        {task.due_date && (
          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : ''}`}>
            {isOverdue && <AlertTriangle size={11} />}
            <Calendar size={11} />
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  )
}
