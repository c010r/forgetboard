const statusStyles = {
  planificado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  en_curso: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  en_pausa: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  en_riesgo: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  finalizado: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  nueva: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  pendiente: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  en_progreso: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  bloqueada: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  en_revision: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  en_pruebas: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  cancelada: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const priorityStyles = {
  baja: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  media: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  alta: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  critica: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  urgente: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
}

export default function Badge({ type = 'status', value }) {
  if (!value) return null
  const styles = type === 'priority' ? priorityStyles : statusStyles
  const label = value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[value] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
      {label}
    </span>
  )
}
