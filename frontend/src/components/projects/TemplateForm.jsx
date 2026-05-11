import { useState, useEffect } from 'react'

const COLORS = ['#6b7280', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

const emptyColumn = () => ({ nombre: '', orden: 0, color: '#6b7280' })

export default function TemplateForm({ onSubmit, initial, onCancel }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', mostrar_mapa: true, columnas: [] })

  useEffect(() => {
    if (initial) {
      setForm({
        nombre: initial.nombre || '',
        descripcion: initial.descripcion || '',
        mostrar_mapa: initial.mostrar_mapa ?? true,
        columnas: (initial.columnas || []).map((c, i) => ({ ...c, orden: i })),
      })
    }
  }, [initial])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const addColumn = () => {
    setForm({ ...form, columnas: [...form.columnas, emptyColumn()] })
  }

  const removeColumn = (idx) => {
    const cols = form.columnas.filter((_, i) => i !== idx).map((c, i) => ({ ...c, orden: i }))
    setForm({ ...form, columnas: cols })
  }

  const updateColumn = (idx, field, value) => {
    const cols = form.columnas.map((c, i) => i === idx ? { ...c, [field]: value } : c)
    setForm({ ...form, columnas: cols })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      ...form,
      columnas: form.columnas.map((c, i) => ({ nombre: c.nombre, orden: i, color: c.color })),
    }
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} required
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
        </div>
        <div className="col-span-2 flex items-center gap-3">
          <input type="checkbox" name="mostrar_mapa" checked={form.mostrar_mapa} onChange={handleChange}
            className="rounded border-slate-300 w-4 h-4" />
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mostrar pestaña Mapa</label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Columnas del tablero</label>
          <button type="button" onClick={addColumn} className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ Agregar Columna</button>
        </div>
        <div className="space-y-2">
          {form.columnas.map((col, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-5">{i + 1}.</span>
              <input value={col.nombre} onChange={(e) => updateColumn(i, 'nombre', e.target.value)}
                placeholder="Nombre de columna" required
                className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
              <div className="flex gap-1">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => updateColumn(i, 'color', c)}
                    className={`w-5 h-5 rounded-full border-2 ${col.color === c ? 'border-blue-500' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
              <button type="button" onClick={() => removeColumn(i)}
                className="text-red-500 hover:text-red-700 text-sm px-1">✕</button>
            </div>
          ))}
          {form.columnas.length === 0 && (
            <p className="text-xs text-slate-400 italic">Sin columnas — no se creará tablero automáticamente</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">Cancelar</button>
        <button type="submit"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          {initial ? 'Actualizar' : 'Crear Plantilla'}
        </button>
      </div>
    </form>
  )
}
