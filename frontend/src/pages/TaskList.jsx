import { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useProjects } from '../hooks/useProjects'
import TaskModal from '../components/tasks/TaskModal'
import Badge from '../components/common/Badge'
import Loading from '../components/common/Loading'

export default function TaskList() {
  const navigate = useNavigate()
  const [selectedTask, setSelectedTask] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [filters, setFilters] = useState({ estado: '', prioridad: '', proyecto: '', busqueda: '' })

  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const { data: projects } = useProjects()

  const filtered = (tasks || []).filter((t) => {
    if (filters.estado && t.estado !== filters.estado) return false
    if (filters.prioridad && t.prioridad !== filters.prioridad) return false
    if (filters.proyecto && t.proyecto !== parseInt(filters.proyecto)) return false
    if (filters.busqueda && !t.titulo.toLowerCase().includes(filters.busqueda.toLowerCase()) && !t.codigo.toLowerCase().includes(filters.busqueda.toLowerCase())) return false
    return true
  })

  if (tasksLoading) return <Loading fullPage />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Tareas</h1>

      <div className="flex flex-wrap gap-3">
        <input
          type="text" placeholder="Buscar tareas..."
          value={filters.busqueda} onChange={(e) => setFilters({ ...filters, busqueda: e.target.value })}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm">
          <option value="">Todos los estados</option>
          <option value="nueva">Nueva</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En Progreso</option>
          <option value="bloqueada">Bloqueada</option>
          <option value="en_revision">En Revisión</option>
          <option value="finalizada">Finalizada</option>
        </select>
        <select value={filters.prioridad} onChange={(e) => setFilters({ ...filters, prioridad: e.target.value })}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm">
          <option value="">Todas las prioridades</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="critica">Crítica</option>
          <option value="urgente">Urgente</option>
        </select>
        <select value={filters.proyecto} onChange={(e) => setFilters({ ...filters, proyecto: e.target.value })}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm">
          <option value="">Todos los proyectos</option>
          {(projects || []).map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Código</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Título</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Prioridad</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Responsable</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Proyecto</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((task) => (
              <tr key={task.id} onClick={() => { setSelectedTask(task); setModalOpen(true) }}
                className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
                <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">{task.codigo}</td>
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{task.titulo}</td>
                <td className="px-4 py-3"><Badge value={task.estado} /></td>
                <td className="px-4 py-3"><Badge type="priority" value={task.prioridad} /></td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{task.responsable_nombre || '-'}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{task.columna_nombre || '-'}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-400">Sin tareas</td></tr>}
          </tbody>
        </table>
      </div>

      <TaskModal taskId={selectedTask?.id} isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelectedTask(null) }} />
    </div>
  )
}
