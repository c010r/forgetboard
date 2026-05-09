import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Loading from '../common/Loading'
import Modal from '../common/Modal'
import AsseImporter from './AsseImporter'
import toast from 'react-hot-toast'

const uruguayCenter = [-32.5228, -55.7658]

const COLORES_PERMITIDOS = ['#9ca3af', '#ef4444', '#3b82f6']

function createColoredIcon(color) {
  const safeColor = COLORES_PERMITIDOS.includes(color) ? color : '#9ca3af'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
    <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${safeColor}" stroke="#fff" stroke-width="2"/>
    <circle cx="12.5" cy="12.5" r="5" fill="#fff"/>
  </svg>`
  return L.divIcon({ html: svg, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [0, -41], className: '' })
}

const grayIcon = createColoredIcon('#9ca3af')
const redIcon = createColoredIcon('#ef4444')
const blueIcon = createColoredIcon('#3b82f6')

function FitBounds({ markers }) {
  const map = useMap()
  if (markers.length > 0) {
    const bounds = L.latLngBounds(markers.map((m) => [m.latitud, m.longitud]))
    map.fitBounds(bounds, { padding: [50, 50] })
  } else {
    map.setView(uruguayCenter, 7)
  }
  return null
}

function markerColor(item) {
  const col = item.columna_nombre || ''
  if (col === 'IMPLEMENTADA' || item.estado_implementacion === 'implementada') return '#3b82f6'
  if (col === 'EN IMPLEMENTACIÓN' || item.estado_implementacion === 'en_implementacion') return '#ef4444'
  return '#9ca3af'
}

function markerLabel(item) {
  const col = item.columna_nombre || ''
  if (col === 'IMPLEMENTADA' || item.estado_implementacion === 'implementada') return 'IMPLEMENTADA'
  if (col === 'EN IMPLEMENTACIÓN' || item.estado_implementacion === 'en_implementacion') return 'EN IMPLEMENTACIÓN'
  return 'A IMPLEMENTAR'
}

export default function ProjectMap({ projectId }) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [showImporter, setShowImporter] = useState(false)
  const [form, setForm] = useState({ nombre: '', direccion: '', latitud: '', longitud: '', estado_implementacion: 'a_implementar', fecha_implementacion: '' })

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/proyectos/${projectId}/`).then((r) => r.data),
    enabled: !!projectId,
  })

  const { data: units = [], isLoading } = useQuery({
    queryKey: ['units', projectId],
    queryFn: async () => {
      const { data } = await api.get('/unidades/', { params: projectId ? { proyecto: projectId } : {} })
      return Array.isArray(data) ? data : data.results || []
    },
  })

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-located', projectId],
    queryFn: async () => {
      if (!projectId) return []
      const { data } = await api.get('/tareas/', { params: { proyecto: projectId, latitud__isnull: false } })
      const list = Array.isArray(data) ? data : data.results || []
      return list.filter((t) => t.latitud && t.longitud)
    },
    enabled: !!projectId,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.latitud || !form.longitud) {
      toast.error('Completa nombre, latitud y longitud')
      return
    }
    try {
      await api.post('/unidades/', {
        ...form,
        proyecto: projectId,
        latitud: parseFloat(form.latitud),
        longitud: parseFloat(form.longitud),
      })
      toast.success('Unidad agregada')
      setShowForm(false)
      setForm({ nombre: '', direccion: '', latitud: '', longitud: '', estado_implementacion: 'a_implementar', fecha_implementacion: '' })
      queryClient.invalidateQueries({ queryKey: ['units', projectId] })
    } catch { toast.error('Error al crear unidad') }
  }

  const allMarkers = [
    ...tasks.map((t) => ({ ...t, _type: 'tarea', _label: `${t.codigo} - ${t.titulo}` })),
    ...units.map((u) => ({ ...u, _type: 'unidad', _label: u.nombre, columna_nombre: markerLabel(u) })),
  ].filter((m) => m.latitud && m.longitud)

  const aImpl = allMarkers.filter((m) => markerColor(m) === '#9ca3af')
  const enImpl = allMarkers.filter((m) => markerColor(m) === '#ef4444')
  const impl = allMarkers.filter((m) => markerColor(m) === '#3b82f6')

  if (isLoading) return <Loading />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-400 inline-block" /> A IMPLEMENTAR ({aImpl.length})</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> EN IMPLEMENTACIÓN ({enImpl.length})</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> IMPLEMENTADA ({impl.length})</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImporter(true)}
            className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700">📥 ASSE</button>
          <button onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
            {showForm ? 'Cancelar' : '+ Agregar Unidad'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre de la unidad" required
            className="col-span-2 px-3 py-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
          <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Dirección"
            className="col-span-2 px-3 py-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
          <input value={form.latitud} onChange={(e) => setForm({ ...form, latitud: e.target.value })} placeholder="Latitud (ej: -34.9011)" required
            className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
          <input value={form.longitud} onChange={(e) => setForm({ ...form, longitud: e.target.value })} placeholder="Longitud (ej: -56.1645)" required
            className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
          <select value={form.estado_implementacion} onChange={(e) => setForm({ ...form, estado_implementacion: e.target.value })}
            className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm">
            <option value="a_implementar">A IMPLEMENTAR</option>
            <option value="en_implementacion">EN IMPLEMENTACIÓN</option>
            <option value="implementada">IMPLEMENTADA</option>
          </select>
          <input type="date" value={form.fecha_implementacion} onChange={(e) => setForm({ ...form, fecha_implementacion: e.target.value })}
            className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
          <button type="submit" className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 col-span-full md:col-span-1">Guardar</button>
        </form>
      )}

      <div className="h-[500px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <MapContainer center={uruguayCenter} zoom={7} className="h-full w-full dark:brightness-90" scrollWheelZoom={true}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitBounds markers={allMarkers} />
          {allMarkers.map((m) => (
            <Marker key={`${m._type}-${m.id}`} position={[m.latitud, m.longitud]} icon={
              markerColor(m) === '#3b82f6' ? blueIcon : markerColor(m) === '#ef4444' ? redIcon : grayIcon
            }>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold text-slate-800">{m._label}</p>
                  {m._type === 'unidad' && m.direccion && <p className="text-slate-500 text-xs">{m.direccion}</p>}
                  <p className="text-xs mt-1">
                    <span className={`px-1.5 py-0.5 rounded-full text-white text-xs ${
                      markerColor(m) === '#3b82f6' ? 'bg-blue-500' : markerColor(m) === '#ef4444' ? 'bg-red-500' : 'bg-gray-400'
                    }`}>{markerLabel(m)}</span>
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">A IMPLEMENTAR ({aImpl.length})</h4>
          {aImpl.map((m) => <MarkerRow key={`${m._type}-${m.id}`} item={m} />)}
          {aImpl.length === 0 && <p className="text-xs text-gray-400 dark:text-slate-500">Ninguna</p>}
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 p-3">
          <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">EN IMPLEMENTACIÓN ({enImpl.length})</h4>
          {enImpl.map((m) => <MarkerRow key={`${m._type}-${m.id}`} item={m} />)}
          {enImpl.length === 0 && <p className="text-xs text-red-400">Ninguna</p>}
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800 p-3">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">IMPLEMENTADA ({impl.length})</h4>
          {impl.map((m) => <MarkerRow key={`${m._type}-${m.id}`} item={m} />)}
          {impl.length === 0 && <p className="text-xs text-blue-400">Ninguna</p>}
        </div>
      </div>

      <Modal isOpen={showImporter} onClose={() => setShowImporter(false)} title="Importar Unidades ASSE" size="lg">
        <AsseImporter projectId={projectId} onImported={() => { setShowImporter(false); queryClient.invalidateQueries({ queryKey: ['units', projectId] }) }} />
      </Modal>
    </div>
  )
}

function MarkerRow({ item }) {
  return (
    <div className="text-xs text-slate-700 dark:text-slate-300 py-1 border-b border-slate-200 dark:border-slate-700 last:border-0 flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
        markerColor(item) === '#3b82f6' ? 'bg-blue-500' : markerColor(item) === '#ef4444' ? 'bg-red-500' : 'bg-gray-400'
      }`} />
      <span className="truncate">{item._label}</span>
      <span className="text-slate-400 ml-auto flex-shrink-0">{item._type === 'tarea' ? '📋' : '🏥'}</span>
    </div>
  )
}
