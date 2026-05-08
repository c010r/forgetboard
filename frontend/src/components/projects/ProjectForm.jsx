import { useState, useEffect } from 'react'

const initialData = {
  nombre: '',
  descripcion: '',
  codigo: '',
  estado: 'planificado',
  prioridad: 'media',
  fecha_inicio: '',
  fecha_fin_estimada: '',
  presupuesto_estimado: '',
}

export default function ProjectForm({ onSubmit, initial, onCancel }) {
  const [form, setForm] = useState(initialData)

  useEffect(() => {
    if (initial) setForm({ ...initialData, ...initial })
  }, [initial])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = { ...form }
    if (data.presupuesto_estimado) data.presupuesto_estimado = parseFloat(data.presupuesto_estimado)
    else delete data.presupuesto_estimado
    delete data.presupuesto_ejecutado
    delete data.porcentaje_avance
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
          <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código</label>
          <input type="text" name="codigo" value={form.codigo} onChange={handleChange} required
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="planificado">Planificado</option>
            <option value="en_curso">En Curso</option>
            <option value="en_pausa">En Pausa</option>
            <option value="en_riesgo">En Riesgo</option>
            <option value="finalizado">Finalizado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prioridad</label>
          <select name="prioridad" value={form.prioridad} onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha inicio</label>
          <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha fin estimada</label>
          <input type="date" name="fecha_fin_estimada" value={form.fecha_fin_estimada} onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Presupuesto estimado</label>
          <input type="number" name="presupuesto_estimado" value={form.presupuesto_estimado} onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">Cancelar</button>
        <button type="submit"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          {initial ? 'Actualizar' : 'Crear Proyecto'}
        </button>
      </div>
    </form>
  )
}
