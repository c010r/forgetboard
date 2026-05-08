import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'

export default function KanbanColumn({ column, tasks, onTaskClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: 'column', column },
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
      className="flex-shrink-0 w-72 bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col"
    >
      <div
        {...attributes}
        {...listeners}
        className="p-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color || '#6b7280' }} />
          <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">{column.nombre}</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <span className="text-xs text-slate-300 dark:text-slate-600">⠿</span>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-8">Sin tareas</div>
        )}
      </div>
    </div>
  )
}
