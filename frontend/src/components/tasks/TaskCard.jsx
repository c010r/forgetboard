import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Badge from '../common/Badge'

const typeIcons = {
  bug: '🐛',
  tarea: '📋',
  historia_usuario: '📖',
  mejora: '✨',
  incidencia: '⚠️',
  requerimiento: '📝',
  documentacion: '📄',
  reunion: '🤝',
  soporte: '🛠️',
  implementacion: '🚀',
}

export default function TaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 p-3 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{task.codigo}</span>
        <span className="text-xs">{typeIcons[task.tipo] || '📋'}</span>
      </div>
      <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2 line-clamp-2">
        {task.titulo}
      </h4>
      <div className="flex items-center justify-between">
        <Badge type="priority" value={task.prioridad} />
        {task.responsable_nombre && (
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate ml-2">
            {task.responsable_nombre}
          </span>
        )}
      </div>
    </div>
  )
}
