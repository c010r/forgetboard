import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProject } from '../hooks/useProjects'
import { useBoards, useCreateBoard } from '../hooks/useBoards'
import { useTasks, useCreateTask } from '../hooks/useTasks'
import KanbanBoard from '../components/tasks/KanbanBoard'
import TaskModal from '../components/tasks/TaskModal'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'
import Loading from '../components/common/Loading'
import ProjectMap from '../components/map/ProjectMap'
import AsseImporter from '../components/map/AsseImporter'
import MembersPanel from '../components/projects/MembersPanel'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject(id)
  const { data: boards } = useBoards({ proyecto: id })
  const createBoard = useCreateBoard()
  const createTask = useCreateTask()
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [newTaskModal, setNewTaskModal] = useState(false)
  const [newBoardModal, setNewBoardModal] = useState(false)
  const [asseModal, setAsseModal] = useState(false)
  const [view, setView] = useState('kanban')
  const [projectUnits, setProjectUnits] = useState([])

  const board = boards?.[0]
  const [taskForm, setTaskForm] = useState({ titulo: '', descripcion: '', tipo: 'tarea', prioridad: 'media', latitud: '', longitud: '', unidad_id: '' })

  const loadUnits = () => {
    if (id) {
      api.get('/unidades/', { params: { proyecto: id } })
        .then((res) => setProjectUnits(res.data.results || res.data || []))
        .catch(() => {})
    }
  }

  useEffect(loadUnits, [id])

  const resetTaskForm = () => {
    setTaskForm({ titulo: '', descripcion: '', tipo: 'tarea', prioridad: 'media', latitud: '', longitud: '', unidad_id: '' })
  }

  const handleCreateBoard = async (e) => {
    e.preventDefault()
    const data = new FormData(e.target)
    await createBoard.mutateAsync({ nombre: data.get('nombre'), proyecto: parseInt(id), tipo: 'kanban' })
    setNewBoardModal(false)
  }

  const handleUnitChange = (unidadId) => {
    const unit = projectUnits.find((u) => u.id === parseInt(unidadId))
    setTaskForm({
      ...taskForm,
      unidad_id: unidadId,
      latitud: unit ? String(unit.latitud) : '',
      longitud: unit ? String(unit.longitud) : '',
    })
  }

  const handleCreateTask = async () => {
    if (!board) { toast.error('Crea un tablero primero'); return }
    const cols = board.columnas || []
    const payload = {
      titulo: taskForm.titulo,
      descripcion: taskForm.descripcion || undefined,
      tipo: taskForm.tipo,
      prioridad: taskForm.prioridad,
      proyecto: parseInt(id),
      tablero: board.id,
      columna: cols.length > 0 ? cols[0].id : null,
    }
    if (taskForm.latitud) payload.latitud = parseFloat(taskForm.latitud)
    if (taskForm.longitud) payload.longitud = parseFloat(taskForm.longitud)
    if (taskForm.unidad_id) payload.unidad_id = parseInt(taskForm.unidad_id)
    await createTask.mutateAsync(payload)
    setNewTaskModal(false)
    resetTaskForm()
  }

  if (isLoading) return <Loading fullPage />
  if (!project) return <div className="text-center py-12 text-red-500">Proyecto no encontrado</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <button onClick={() => navigate('/proyectos')} className="text-sm text-blue-600 hover:text-blue-800 mb-1 block">&larr; Volver</button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{project.nombre}</h1>
            <Badge value={project.estado} />
            <Badge type="priority" value={project.prioridad} />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{project.codigo}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { resetTaskForm(); setNewTaskModal(true) }} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">+ Nueva Tarea</button>
          {!board && (
            <button onClick={() => setNewBoardModal(true)} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">+ Crear Tablero</button>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 flex-wrap">
        {['kanban', 'lista', ...(project.mostrar_mapa ? ['mapa'] : []), 'miembros'].map((t) => (
          <button key={t} onClick={() => setView(t)}
            className={`px-4 py-1.5 text-sm rounded-t capitalize ${view === t ? 'bg-white dark:bg-slate-800 border border-b-white dark:border-b-slate-800 border-slate-200 dark:border-slate-700 font-medium text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
            {t === 'miembros' ? 'Miembros' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {view === 'kanban' ? (
        board ? (
          <KanbanBoard boardId={board.id} projectId={id} onTaskClick={(task) => { setSelectedTask(task); setTaskModalOpen(true) }} />
        ) : (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <p className="mb-4">Este proyecto no tiene tableros</p>
            <button onClick={() => setNewBoardModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">+ Crear Tablero</button>
          </div>
        )
      ) : view === 'mapa' ? (
        <ProjectMap projectId={id} />
      ) : view === 'miembros' ? (
        <MembersPanel projectId={id} />
      ) : (
        <TaskListView projectId={id} onTaskClick={(task) => { setSelectedTask(task); setTaskModalOpen(true) }} />
      )}

      <TaskModal taskId={selectedTask?.id} isOpen={taskModalOpen} onClose={() => { setTaskModalOpen(false); setSelectedTask(null) }} />

      <Modal isOpen={newBoardModal} onClose={() => setNewBoardModal(false)} title="Nuevo Tablero">
        <form onSubmit={handleCreateBoard} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del tablero</label>
            <input name="nombre" required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Crear</button>
        </form>
      </Modal>

      <Modal isOpen={asseModal} onClose={() => { setAsseModal(false); setNewTaskModal(true) }} title="Importar Unidades ASSE" size="lg">
        <AsseImporter projectId={id} onImported={() => { loadUnits(); setAsseModal(false); setNewTaskModal(true) }} />
      </Modal>

      <Modal isOpen={newTaskModal} onClose={() => { setNewTaskModal(false); resetTaskForm() }} title="Nueva Tarea">
        <form onSubmit={(e) => { e.preventDefault(); handleCreateTask() }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título</label>
            <input value={taskForm.titulo} onChange={(e) => setTaskForm({ ...taskForm, titulo: e.target.value })} required
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
            <textarea value={taskForm.descripcion} onChange={(e) => setTaskForm({ ...taskForm, descripcion: e.target.value })} rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
              <select value={taskForm.tipo} onChange={(e) => setTaskForm({ ...taskForm, tipo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm">
                <option value="tarea">Tarea</option>
                <option value="bug">Bug</option>
                <option value="historia_usuario">Historia de Usuario</option>
                <option value="mejora">Mejora</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prioridad</label>
              <select value={taskForm.prioridad} onChange={(e) => setTaskForm({ ...taskForm, prioridad: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Latitud</label>
              <input value={taskForm.latitud} onChange={(e) => setTaskForm({ ...taskForm, latitud: e.target.value })} step="any" placeholder="ej: -34.9011"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Longitud</label>
              <input value={taskForm.longitud} onChange={(e) => setTaskForm({ ...taskForm, longitud: e.target.value })} step="any" placeholder="ej: -56.1645"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unidad Asistencial</label>
            <div className="flex gap-2">
              <select value={taskForm.unidad_id} onChange={(e) => handleUnitChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm">
                <option value="">Sin unidad</option>
                {projectUnits.filter((u) => !u.tarea).map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
              <button type="button" onClick={() => { setNewTaskModal(false); setAsseModal(true) }}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 whitespace-nowrap">
                + ASSE
              </button>
            </div>
            {projectUnits.length === 0 && (
              <p className="text-xs text-slate-400 mt-1">No hay unidades cargadas. Usá el botón ASSE para importar del catálogo.</p>
            )}
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Crear Tarea</button>
        </form>
      </Modal>
    </div>
  )
}

function TaskListView({ projectId, onTaskClick }) {
  const { data: tasks, isLoading } = useTasks({ proyecto: projectId })
  if (isLoading) return <Loading />
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Código</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Título</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Estado</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Prioridad</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Responsable</th>
          </tr>
        </thead>
        <tbody>
          {(tasks || []).map((task) => (
            <tr key={task.id} onClick={() => onTaskClick(task)}
              className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer">
              <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">{task.codigo}</td>
              <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{task.titulo}</td>
              <td className="px-4 py-3"><Badge value={task.estado} /></td>
              <td className="px-4 py-3"><Badge type="priority" value={task.prioridad} /></td>
              <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{task.responsable_nombre || '-'}</td>
            </tr>
          ))}
          {(tasks || []).length === 0 && <tr><td colSpan={5} className="text-center py-8 text-slate-400">Sin tareas</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
