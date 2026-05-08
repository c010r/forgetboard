import { useState } from 'react'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'
import { useColumns, useUpdateColumn } from '../../hooks/useBoards'
import { useTasks, useMoveTask } from '../../hooks/useTasks'
import toast from 'react-hot-toast'

export default function KanbanBoard({ boardId, projectId, onTaskClick }) {
  const { data: columns } = useColumns(boardId ? { tablero: boardId } : { tablero__proyecto: projectId })
  const { data: tasks } = useTasks({ proyecto: projectId })
  const moveTask = useMoveTask()
  const updateColumn = useUpdateColumn()
  const [activeItem, setActiveItem] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const getColumnTasks = (columnId) =>
    (tasks || []).filter((t) => t.columna === columnId).sort((a, b) => a.orden - b.orden)

  const isColumn = (id) => columns?.some((c) => c.id === id)

  const handleDragStart = (event) => {
    const { active } = event
    if (isColumn(active.id)) {
      const col = columns?.find((c) => c.id === active.id)
      setActiveItem({ type: 'column', data: col })
    } else {
      const task = tasks?.find((t) => t.id === active.id)
      setActiveItem({ type: 'task', data: task })
    }
  }

  const handleDragEnd = async (event) => {
    setActiveItem(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    if (isColumn(active.id)) {
      if (!isColumn(over.id)) return
      const oldIdx = columns.findIndex((c) => c.id === active.id)
      const newIdx = columns.findIndex((c) => c.id === over.id)
      if (oldIdx === newIdx || oldIdx === -1 || newIdx === -1) return

      const reordered = [...columns]
      const [moved] = reordered.splice(oldIdx, 1)
      reordered.splice(newIdx, 0, moved)

      try {
        await Promise.all(reordered.map((c, i) =>
          c.orden !== i ? updateColumn.mutateAsync({ id: c.id, data: { orden: i } }) : Promise.resolve()
        ))
        toast.success('Columnas reordenadas')
      } catch {
        toast.error('Error al reordenar columnas')
      }
    } else {
      const taskId = active.id
      const task = tasks?.find((t) => t.id === taskId)
      if (!task) return

      const overId = over.id
      const overColumn = columns?.find((c) => c.id === overId)
      const overTask = tasks?.find((t) => t.id === overId)
      let targetColumnId

      if (overColumn) {
        targetColumnId = overColumn.id
      } else if (overTask) {
        targetColumnId = overTask.columna
      } else {
        return
      }

      if (task.columna === targetColumnId) return

      try {
        await moveTask.mutateAsync({ id: taskId, columnaId: targetColumnId })
      } catch {
        toast.error('Error al mover tarea')
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={(columns || []).map((c) => c.id)} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-4 overflow-x-auto pb-4 kanban-scroll">
          {(columns || []).map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={getColumnTasks(col.id)}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeItem?.type === 'task' ? (
          <TaskCard task={activeItem.data} />
        ) : activeItem?.type === 'column' ? (
          <div className="w-72 bg-slate-200/80 dark:bg-slate-600/80 rounded-xl p-3 opacity-80">
            <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">{activeItem.data?.nombre}</h3>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
