import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import Loading from '../components/common/Loading'

const uruguayCenter = [-32.5228, -55.7658]

const PROJECT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
]

function createIcon(color) {
  const safeColor = PROJECT_COLORS.includes(color) ? color : '#3b82f6'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
    <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${safeColor}" stroke="#fff" stroke-width="2"/>
    <circle cx="12.5" cy="12.5" r="5" fill="#fff"/>
  </svg>`
  return L.divIcon({ html: svg, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [0, -41], className: '' })
}

function FitBounds({ markers }) {
  const map = useMap()
  if (markers.length > 0) {
    const bounds = L.latLngBounds(markers.map((m) => ({ lat: m.lat, lng: m.lng })))
    map.fitBounds(bounds, { padding: [50, 50] })
  } else {
    map.setView(uruguayCenter, 7)
  }
  return null
}

export default function GlobalMap() {
  const [visible, setVisible] = useState({})

  const { data: queryResult, isLoading } = useQuery({
    queryKey: ['global-map-projects'],
    queryFn: async () => {
      const { data: pData } = await api.get('/proyectos/')
      const projList = Array.isArray(pData) ? pData : pData.results || []

      const allVis = {}
      const allData = {}

      await Promise.all(projList.map(async (p, i) => {
        allVis[p.id] = true
        const [tRes, uRes] = await Promise.all([
          api.get('/tareas/', { params: { proyecto: p.id, latitud__isnull: false } }),
          api.get('/unidades/', { params: { proyecto: p.id } }),
        ])
        const tasks = (tRes.data.results || tRes.data || []).filter((t) => t.latitud && t.longitud)
        const units = (uRes.data.results || uRes.data || []).filter((u) => u.latitud && u.longitud)
        const color = PROJECT_COLORS[i % PROJECT_COLORS.length]
        allData[p.id] = {
          tasks: tasks.map((t) => ({
            ...t, _label: `${t.codigo} - ${t.titulo}`, _type: 'tarea', _color: color, _proyecto: p.nombre,
          })),
          units: units.map((u) => ({
            ...u, _label: u.nombre, _type: 'unidad', _color: color, _proyecto: p.nombre,
          })),
        }
      }))

      setVisible(allVis)
      return { projects: projList, projectData: allData }
    },
  })

  const projects = queryResult?.projects || []
  const projectData = queryResult?.projectData || {}

  const allMarkers = []
  Object.entries(projectData).forEach(([projId, data]) => {
    if (visible[projId]) {
      data.tasks.forEach((t) => allMarkers.push({ ...t, _projId: parseInt(projId) }))
      data.units.forEach((u) => allMarkers.push({ ...u, _projId: parseInt(projId) }))
    }
  })

  if (isLoading) return <Loading fullPage />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Mapa General</h1>
        <span className="text-sm text-slate-500 dark:text-slate-400">{allMarkers.length} marcadores</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        <button onClick={() => {
          const allOn = Object.keys(visible).every((k) => visible[k])
          const next = {}
          Object.keys(visible).forEach((k) => { next[k] = !allOn })
          setVisible(next)
        }} className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-300">
          {Object.values(visible).every(Boolean) ? 'Ocultar todo' : 'Mostrar todo'}
        </button>
        {projects.map((p, i) => (
          <label key={p.id} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 select-none dark:text-slate-300"
            style={{ borderColor: visible[p.id] ? PROJECT_COLORS[i % PROJECT_COLORS.length] : '#e2e8f0' }}>
            <input type="checkbox" checked={!!visible[p.id]} onChange={() => setVisible({ ...visible, [p.id]: !visible[p.id] })}
              className="sr-only" />
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: PROJECT_COLORS[i % PROJECT_COLORS.length], opacity: visible[p.id] ? 1 : 0.3 }} />
            <span className={visible[p.id] ? '' : 'text-slate-400 dark:text-slate-500'}>{p.nombre}</span>
          </label>
        ))}
      </div>

      <div className="h-[600px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <MapContainer center={uruguayCenter} zoom={7} className="h-full w-full dark:brightness-90" scrollWheelZoom={true}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitBounds markers={allMarkers.map((m) => ({ lat: m.latitud, lng: m.longitud }))} />
          {allMarkers.map((m) => (
            <Marker key={`${m._projId}-${m._type}-${m.id}`} position={[m.latitud, m.longitud]} icon={createIcon(m._color)}>
              <Popup>
                <div className="text-sm max-w-[200px]">
                  <p className="font-semibold text-slate-800 truncate">{m._label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{m._proyecto}</p>
                  <p className="text-xs text-slate-400">{m._type === 'tarea' ? '📋 Tarea' : '🏥 Unidad'}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {projects.map((p, i) => {
          const pd = projectData[p.id]
          const total = (pd?.tasks?.length || 0) + (pd?.units?.length || 0)
          return (
            <div key={p.id} className={`bg-white dark:bg-slate-800 rounded-xl border p-3 text-sm ${visible[p.id] ? '' : 'opacity-50'}`}
              style={{ borderLeftColor: PROJECT_COLORS[i % PROJECT_COLORS.length], borderLeftWidth: 4 }}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{p.nombre}</h3>
                <span className="text-xs text-slate-400 dark:text-slate-500">{total}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{p.codigo}</p>
              {pd && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{pd.tasks.length} tareas · {pd.units.length} unidades</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
