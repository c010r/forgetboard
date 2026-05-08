import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()
  const [tab, setTab] = useState('perfil')
  const [profile, setProfile] = useState({ first_name: '', last_name: '', email: '', telefono: '' })

  useEffect(() => {
    if (user) {
      setProfile({ first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '', telefono: user.telefono || '' })
    }
  }, [user])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      await api.patch(`/usuarios/${user.id}/`, profile)
      toast.success('Perfil actualizado')
    } catch { toast.error('Error al actualizar') }
  }

  const handleCreateTestData = async () => {
    try {
      const esp = await api.post('/espacios/', { nombre: 'Espacio Principal' })
      const proj = await api.post('/proyectos/', {
        nombre: 'Proyecto Demo', codigo: 'DEMO',
        descripcion: 'Proyecto de demostración',
        espacio: esp.data.id, estado: 'en_curso', prioridad: 'alta',
      })
      const tablero = await api.post('/tableros/', { nombre: 'Kanban', proyecto: proj.data.id, tipo: 'kanban' })
      const cols = await api.get('/columnas/', { params: { tablero: tablero.data.id } })
      const columnas = cols.data.results || cols.data

      const t1 = columnas[0] ? await api.post('/tareas/', { titulo: 'Implementar Historia Clínica', proyecto: proj.data.id, tablero: tablero.data.id, columna: columnas[0].id, tipo: 'tarea', prioridad: 'alta', descripcion: 'Sistema de historia clínica electrónica' }) : null
      const t2 = columnas[1] ? await api.post('/tareas/', { titulo: 'Implementar Agenda Digital', proyecto: proj.data.id, tablero: tablero.data.id, columna: columnas[1].id, tipo: 'tarea', prioridad: 'media', descripcion: 'Sistema de agenda para turnos' }) : null
      const t3 = columnas[2] ? await api.post('/tareas/', { titulo: 'Implementar Facturación', proyecto: proj.data.id, tablero: tablero.data.id, columna: columnas[2].id, tipo: 'tarea', prioridad: 'critica', descripcion: 'Módulo de facturación electrónica', fecha_cierre: '2026-04-01' }) : null

      await api.post('/unidades/', { proyecto: proj.data.id, nombre: 'Hospital Central', latitud: -34.9011, longitud: -56.1645, estado_implementacion: 'a_implementar', tarea: t1?.data?.id })
      await api.post('/unidades/', { proyecto: proj.data.id, nombre: 'Policlínica Centro', latitud: -34.905, longitud: -56.18, estado_implementacion: 'en_implementacion', tarea: t2?.data?.id })
      await api.post('/unidades/', { proyecto: proj.data.id, nombre: 'Policlínica Cerro', latitud: -34.88, longitud: -56.25, estado_implementacion: 'implementada', tarea: t3?.data?.id, fecha_implementacion: '2026-04-01' })

      toast.success('Datos de demostración creados')
    } catch (err) {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Error al crear datos'
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Configuración</h1>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        {['perfil', 'apariencia', 'datos'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm rounded-t capitalize ${tab === t ? 'bg-white dark:bg-slate-800 border border-b-white dark:border-b-slate-800 border-slate-200 dark:border-slate-700 font-medium text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
            {t === 'perfil' ? 'Mi Perfil' : t === 'apariencia' ? 'Apariencia' : 'Datos de Prueba'}
          </button>
        ))}
      </div>

      {tab === 'perfil' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-lg">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xl font-bold uppercase">
                {user?.username?.[0] || '?'}
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-white">{user?.username}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.rol?.replace(/_/g, ' ')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                <input value={profile.first_name} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Apellido</label>
                <input value={profile.last_name} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
              <input value={profile.telefono} onChange={(e) => setProfile({ ...profile, telefono: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Guardar Cambios</button>
          </form>
        </div>
      )}

      {tab === 'apariencia' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-lg">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Modo Oscuro</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Alterna entre modo claro y oscuro para la interfaz.</p>
          <button
            onClick={toggle}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dark
                ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {dark ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
          </button>
        </div>
      )}

      {tab === 'datos' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 max-w-lg">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Datos de Demostración</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Crea un proyecto de prueba con tareas, tablero y columnas para explorar el sistema.</p>
          <button onClick={handleCreateTestData} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
            Crear Datos de Prueba
          </button>
        </div>
      )}
    </div>
  )
}
