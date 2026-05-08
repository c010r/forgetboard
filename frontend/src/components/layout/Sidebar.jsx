import { NavLink } from 'react-router-dom'

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/proyectos', label: 'Proyectos', icon: '📁' },
  { path: '/tareas', label: 'Tareas', icon: '✅' },
  { path: '/sprints', label: 'Sprints', icon: '🏃' },
  { path: '/reportes', label: 'Reportes', icon: '📈' },
  { path: '/mapa', label: 'Mapa', icon: '🗺️' },
  { path: '/configuracion', label: 'Configuración', icon: '⚙️' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-800 dark:bg-slate-950 text-white min-h-screen flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-slate-700 dark:border-slate-800">
        <h1 className="text-xl font-bold tracking-tight">ForgeBoard</h1>
        <p className="text-xs text-slate-400 mt-1">Project Management</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700 dark:border-slate-800 text-xs text-slate-500">
        ForgeBoard v1.1
      </div>
    </aside>
  )
}
