import { useState, useEffect } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const DEPARTMENTS = [
  'ARTIGAS', 'CANELONES', 'CERRO LARGO', 'COLONIA', 'DURAZNO',
  'FLORES', 'FLORIDA', 'LAVALLEJA', 'MALDONADO', 'MONTEVIDEO',
  'PAYSANDÚ', 'RÍO NEGRO', 'RIVERA', 'ROCHA', 'SALTO',
  'SAN JOSÉ', 'SORIANO', 'TACUAREMBÓ', 'TREINTA Y TRES',
]

export default function AsseImporter({ projectId, onImported }) {
  const [data, setData] = useState([])
  const [filtered, setFiltered] = useState([])
  const [selected, setSelected] = useState({})
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    fetch('/unidades.geojson')
      .then((r) => r.json())
      .then((geo) => {
        const units = geo.features
          .filter((f) => f.properties && f.properties.latlong)
          .map((f) => {
            const p = f.properties
            const [lat, lng] = (p.latlong || '').split(',').map(parseFloat)
            return {
              nombre: p.nombre || '',
              alias: p.alias || '',
              departamento: p.departamento || '',
              localidad: p.localida || '',
              categoria: p.categoria || '',
              nivel: p.nivelatencion || '',
              direccion: [p.calle, p.numpuerta].filter(Boolean).join(' '),
              telefono: p.telefono || '',
              latitud: lat,
              longitud: lng,
              cerrada: p.cerrada === 'SI',
            }
          })
          .filter((u) => !u.cerrada && u.nombre && u.latitud && u.longitud)
        setData(units)
        setFiltered(units)
      })
      .catch((err) => toast.error('Error al cargar unidades ASSE'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = data
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((u) => u.nombre.toLowerCase().includes(q) || (u.alias && u.alias.toLowerCase().includes(q)))
    }
    if (deptFilter) result = result.filter((u) => u.departamento === deptFilter)
    if (catFilter) result = result.filter((u) => u.categoria === catFilter)
    setFiltered(result)
  }, [search, deptFilter, catFilter, data])

  const categories = [...new Set(data.map((u) => u.categoria).filter(Boolean))].sort()

  const toggleSelect = (idx) => {
    setSelected((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  const selectAllFiltered = () => {
    const next = { ...selected }
    filtered.forEach((_, i) => {
      const realIdx = data.indexOf(filtered[i])
      next[realIdx] = true
    })
    setSelected(next)
  }

  const deselectAll = () => setSelected({})

  const handleImport = async () => {
    const toImport = Object.entries(selected).filter(([, v]) => v).map(([k]) => data[parseInt(k)])
    if (toImport.length === 0) { toast.error('Seleccioná al menos una unidad'); return }
    setImporting(true)
    let count = 0
    for (const u of toImport) {
      try {
        await api.post('/unidades/', {
          proyecto: projectId,
          nombre: u.nombre,
          direccion: u.direccion,
          latitud: u.latitud,
          longitud: u.longitud,
          estado_implementacion: 'a_implementar',
        })
        count++
      } catch { /* skip duplicates */ }
    }
    toast.success(`${count} unidades importadas`)
    setSelected({})
    setImporting(false)
    onImported?.()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-700 text-sm">Unidades ASSE — {data.length} disponibles</h3>
        <div className="flex gap-2">
          <button onClick={selectAllFiltered} className="text-xs text-blue-600 hover:text-blue-800">Seleccionar filtrados</button>
          <button onClick={deselectAll} className="text-xs text-slate-500 hover:text-slate-700">Deseleccionar</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre..."
          className="flex-1 min-w-[200px] px-3 py-1.5 border border-slate-300 rounded-lg text-sm" />
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm">
          <option value="">Todos los departamentos</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm">
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="max-h-[400px] overflow-y-auto border border-slate-200 rounded-xl bg-white divide-y divide-slate-100">
        {loading ? (
          <div className="text-center py-8 text-sm text-slate-400">Cargando unidades...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">Sin resultados</div>
        ) : (
          filtered.map((u, i) => {
            const realIdx = data.indexOf(u)
            return (
              <label key={realIdx} className={`flex items-center gap-3 px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 ${selected[realIdx] ? 'bg-blue-50' : ''}`}>
                <input type="checkbox" checked={!!selected[realIdx]} onChange={() => toggleSelect(realIdx)} className="rounded border-slate-300" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{u.nombre}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {[u.departamento, u.localidad, u.categoria].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{u.latitud.toFixed(4)}, {u.longitud.toFixed(4)}</span>
              </label>
            )
          })
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500">{Object.values(selected).filter(Boolean).length} seleccionadas</span>
        <button onClick={handleImport} disabled={importing}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50">
          {importing ? 'Importando...' : `Importar ${Object.values(selected).filter(Boolean).length} unidades`}
        </button>
      </div>
    </div>
  )
}
