import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import NotificationBell from './NotificationBell'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div />
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              title={dark ? 'Modo claro' : 'Modo oscuro'}
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <NotificationBell />
            <div className="flex items-center gap-3 ml-2">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {user?.username || 'Usuario'}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Salir
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
