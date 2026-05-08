import { useState } from 'react'
import { useSprints, useHitos } from '../hooks/useSprints'
import { useProjects } from '../hooks/useProjects'
import api from '../services/api'
import Loading from '../components/common/Loading'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

export default function SprintsPage() {
  const queryClient = useQueryClient()
  const { data: projects } = useProjects()
  const [selectedProject, setSelectedProject] = useState('')
  const params = selectedProject ? { proyecto: selectedProject } : {}
  const { data: sprints, isLoading } = useSprints(params)
  const { data: hitos } = useHitos(params)
  const [showSprintForm, setShowSprintForm] = useState(false)
  const [showHitoForm, setShowHitoForm] = useState(false)
  const [sprintForm, setSprintForm] = useState({ nombre: '', proyecto: '', objetivo: '', fecha_inicio: '', fecha_fin: '', capacidad_horas: '' })
  const [hitoForm, setHitoForm] = useState({ nombre: '', proyecto: '', descripcion: '', fecha_estimada: '' })

  const handleCreateSprint = async (e) => {
    e.preventDefault()
    try {
      await api.post('/sprints/', { ...sprintForm, proyecto: parseInt(sprintForm.proyecto) })
      toast.success('Sprint creado')
      setShowSprintForm(false)
      setSprintForm({ nombre: '', proyecto: '', objetivo: '', fecha_inicio: '', fecha_fin: '', capacidad_horas: '' })
      queryClient.invalidateQueries({ queryKey: ['sprints'] })
    } catch { toast.error('Error al crear sprint') }
  }

  const handleCreateHito = async (e) => {
    e.preventDefault()
    try {
      await api.post('/sprints/hitos/', { ...hitoForm, proyecto: parseInt(hitoForm.proyecto) })
      toast.success('Hito creado')
      setShowHitoForm(false)
      setHitoForm({ nombre: '', proyecto: '', descripcion: '', fecha_estimada: '' })
      queryClient.invalidateQueries({ queryKey: ['hitos'] })
    } catch { toast.error('Error al crear hito') }
  }

  if (isLoading) return <Loading fullPage />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Sprints & Hitos</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowSprintForm(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">+ Nuevo Sprint</button>
          <button onClick={() => setShowHitoForm(true)} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">+ Nuevo Hito</button>
        </div>
      </div>

      <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
        className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm">
        <option value="">Todos los proyectos</option>
        {(projects || []).map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
      </select>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Sprints</h3>
          <div className="space-y-3">
            {(sprints || []).length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">Sin sprints</p>
            ) : (sprints || []).map((s) => (
              <div key={s.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">{s.nombre}</h4>
                  <Badge value={s.estado} />
                </div>
                {s.objetivo && <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{s.objetivo}</p>}
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span>Inicio: {s.fecha_inicio ? new Date(s.fecha_inicio).toLocaleDateString() : '-'}</span>
                  <span>Fin: {s.fecha_fin ? new Date(s.fecha_fin).toLocaleDateString() : '-'}</span>
                  <span>Capacidad: {s.capacidad_horas || '-'}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Hitos / Milestones</h3>
          <div className="space-y-3">
            {(hitos || []).length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">Sin hitos</p>
            ) : (hitos || []).map((h) => (
              <div key={h.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">{h.nombre}</h4>
                  <Badge value={h.estado} />
                </div>
                {h.descripcion && <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{h.descripcion}</p>}
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span>Estimada: {h.fecha_estimada ? new Date(h.fecha_estimada).toLocaleDateString() : '-'}</span>
                  {h.fecha_real && <span>Real: {new Date(h.fecha_real).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={showSprintForm} onClose={() => setShowSprintForm(false)} title="Nuevo Sprint">
        <form onSubmit={handleCreateSprint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proyecto</label>
            <select required value={sprintForm.proyecto} onChange={(e) => setSprintForm({ ...sprintForm, proyecto: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm">
              <option value="">Seleccionar proyecto</option>
              {(projects || []).map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
            <input required value={sprintForm.nombre} onChange={(e) => setSprintForm({ ...sprintForm, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Objetivo</label>
            <textarea value={sprintForm.objetivo} onChange={(e) => setSprintForm({ ...sprintForm, objetivo: e.target.value })} rows={2}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha inicio</label>
              <input type="date" value={sprintForm.fecha_inicio} onChange={(e) => setSprintForm({ ...sprintForm, fecha_inicio: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha fin</label>
              <input type="date" value={sprintForm.fecha_fin} onChange={(e) => setSprintForm({ ...sprintForm, fecha_fin: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Capacidad (horas)</label>
            <input type="number" value={sprintForm.capacidad_horas} onChange={(e) => setSprintForm({ ...sprintForm, capacidad_horas: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Crear Sprint</button>
        </form>
      </Modal>

      <Modal isOpen={showHitoForm} onClose={() => setShowHitoForm(false)} title="Nuevo Hito">
        <form onSubmit={handleCreateHito} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proyecto</label>
            <select required value={hitoForm.proyecto} onChange={(e) => setHitoForm({ ...hitoForm, proyecto: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm">
              <option value="">Seleccionar proyecto</option>
              {(projects || []).map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
            <input required value={hitoForm.nombre} onChange={(e) => setHitoForm({ ...hitoForm, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
            <textarea value={hitoForm.descripcion} onChange={(e) => setHitoForm({ ...hitoForm, descripcion: e.target.value })} rows={2}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha estimada</label>
            <input type="date" value={hitoForm.fecha_estimada} onChange={(e) => setHitoForm({ ...hitoForm, fecha_estimada: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
          </div>
          <button type="submit" className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">Crear Hito</button>
        </form>
      </Modal>
    </div>
  )
}
