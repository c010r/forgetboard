import { useState } from 'react'
import Modal from '../common/Modal'
import Badge from '../common/Badge'
import { useTask, useUpdateTask, useDeleteTask, useAddComment, useAddSubtask } from '../../hooks/useTasks'
import { useTaskComments } from '../../hooks/useTasks'

export default function TaskModal({ taskId, isOpen, onClose }) {
  const { data: task, isLoading } = useTask(taskId)
  const { data: comments } = useTaskComments(taskId)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const addComment = useAddComment()
  const addSubtask = useAddSubtask()


  const [newComment, setNewComment] = useState('')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [subtaskTitle, setSubtaskTitle] = useState('')
  if (!isOpen) return null

  const handleStartEdit = () => {
    if (!task) return
    setEditForm({
      titulo: task.titulo,
      descripcion: task.descripcion || '',
      estado: task.estado,
      prioridad: task.prioridad,
      porcentaje_avance: task.porcentaje_avance,
      horas_estimadas: task.horas_estimadas || '',
      latitud: task.latitud || '',
      longitud: task.longitud || '',
    })
    setEditing(true)
  }

  const handleSaveEdit = async () => {
    try {
      await updateTask.mutateAsync({ id: taskId, data: editForm })
      setEditing(false)
    } catch { /* error handled in hook */ }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      await addComment.mutateAsync({ id: taskId, data: { contenido: newComment } })
      setNewComment('')
    } catch { /* error handled in hook */ }
  }

  const handleAddSubtask = async (e) => {
    e.preventDefault()
    if (!subtaskTitle.trim()) return
    try {
      await addSubtask.mutateAsync({ id: taskId, titulo: subtaskTitle })
      setSubtaskTitle('')
    } catch { /* error handled in hook */ }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta tarea definitivamente?')) return
    try {
      await deleteTask.mutateAsync(taskId)
      onClose()
    } catch { /* error handled in hook */ }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? `${task.codigo} - ${task.titulo}` : 'Cargando...'} size="lg">
      {isLoading ? (
        <div className="text-center py-8 text-slate-500">Cargando...</div>
      ) : task ? (
        <div className="space-y-6">
          {editing ? (
            <div className="space-y-4 border-b border-slate-200 dark:border-slate-700 pb-6">
              <input value={editForm.titulo} onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm font-medium" />
              <textarea value={editForm.descripcion} onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })} rows={3}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
              <div className="grid grid-cols-3 gap-3">
                <select value={editForm.estado} onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm">
                  <option value="nueva">Nueva</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En Progreso</option>
                  <option value="bloqueada">Bloqueada</option>
                  <option value="en_revision">En Revisión</option>
                  <option value="en_pruebas">En Pruebas</option>
                  <option value="finalizada">Finalizada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
                <select value={editForm.prioridad} onChange={(e) => setEditForm({ ...editForm, prioridad: e.target.value })}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm">
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                  <option value="urgente">Urgente</option>
                </select>
                <input type="number" value={editForm.porcentaje_avance} onChange={(e) => setEditForm({ ...editForm, porcentaje_avance: e.target.value })}
                  placeholder="% avance" min="0" max="100"
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="any" value={editForm.latitud} onChange={(e) => setEditForm({ ...editForm, latitud: e.target.value })}
                  placeholder="Latitud" className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
                <input type="number" step="any" value={editForm.longitud} onChange={(e) => setEditForm({ ...editForm, longitud: e.target.value })}
                  placeholder="Longitud" className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Guardar</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800">Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge value={task.estado} />
                <Badge type="priority" value={task.prioridad} />
                <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">{task.tipo?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleStartEdit} className="text-xs text-blue-600 hover:text-blue-800">✏️ Editar</button>
                <button onClick={handleDelete} className="text-xs text-red-500 hover:text-red-700">🗑️ Eliminar</button>
              </div>
            </div>
          )}

          {!editing && task.descripcion && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{task.descripcion}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500 dark:text-slate-400">Responsable:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{task.responsable_nombre || 'Sin asignar'}</span></div>
            <div><span className="text-slate-500 dark:text-slate-400">Creador:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{task.creador_nombre}</span></div>
            {task.fecha_limite && <div><span className="text-slate-500 dark:text-slate-400">Fecha límite:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{new Date(task.fecha_limite).toLocaleDateString()}</span></div>}
            <div><span className="text-slate-500 dark:text-slate-400">Avance:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{task.porcentaje_avance}%</span></div>
            <div><span className="text-slate-500 dark:text-slate-400">Horas estimadas:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{task.horas_estimadas || '-'}</span></div>
            <div><span className="text-slate-500 dark:text-slate-400">Horas trabajadas:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{task.horas_trabajadas || '0'}</span></div>
            {task.latitud && task.longitud && <div><span className="text-slate-500 dark:text-slate-400">Coordenadas:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{task.latitud}, {task.longitud}</span></div>}
          </div>

          {task.etiquetas?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Etiquetas</h4>
              <div className="flex flex-wrap gap-1">
                {task.etiquetas.map((tag) => (
                  <span key={tag.id} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                    {tag.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {task.checklists?.length > 0 && task.checklists.map((cl) => (
            <div key={cl.id}>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{cl.nombre}</h4>
              <ul className="space-y-1">
                {cl.items?.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span>{item.completado ? '✅' : '⬜'}</span>
                    <span className={item.completado ? 'line-through text-slate-400' : ''}>{item.texto}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subtareas</h4>
            <ul className="space-y-1 mb-3">
              {task.subtareas?.map((st) => (
                <li key={st.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span>{st.completada ? '✅' : '⬜'}</span>
                  <span className={st.completada ? 'line-through text-slate-400' : ''}>{st.titulo}</span>
                </li>
              ))}
              {(!task.subtareas || task.subtareas.length === 0) && <p className="text-xs text-slate-400">Sin subtareas</p>}
            </ul>
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input type="text" value={subtaskTitle} onChange={(e) => setSubtaskTitle(e.target.value)} placeholder="Nueva subtarea..."
                className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <button type="submit" className="px-3 py-1.5 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-800">Añadir</button>
            </form>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Comentarios</h4>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {(comments || []).length > 0 ? comments.map((c) => (
                <div key={c.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{c.autor_nombre}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{new Date(c.fecha_creacion).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{c.contenido}</p>
                </div>
              )) : <p className="text-sm text-slate-400">Sin comentarios</p>}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Escribe un comentario..."
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Enviar</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-red-500">Error al cargar la tarea</div>
      )}
    </Modal>
  )
}
