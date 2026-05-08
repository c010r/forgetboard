import { useState, useRef, useEffect } from 'react'
import { useNotificaciones, useMarcarLeida, useMarcarTodasLeidas } from '../../hooks/useNotificaciones'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  const { data: notis } = useNotificaciones()
  const marcarLeida = useMarcarLeida()
  const marcarTodas = useMarcarTodasLeidas()

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const noLeidas = (notis || []).filter((n) => !n.leida).length

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notificaciones</h3>
            {noLeidas > 0 && (
              <button onClick={() => marcarTodas.mutate()} className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">
                Marcar todas leídas
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {(notis || []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Sin notificaciones</p>
            ) : (
              (notis || []).map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.leida && marcarLeida.mutate(n.id)}
                  className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${n.leida ? 'opacity-60' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs mt-0.5">{n.tipo === 'tarea' ? '✅' : n.tipo === 'proyecto' ? '📁' : n.tipo === 'comentario' ? '💬' : '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{n.titulo}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.mensaje}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(n.fecha_creacion).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
