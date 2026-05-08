import { useDashboard } from '../hooks/useDashboard'
import Loading from '../components/common/Loading'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280']

export default function Dashboard() {
  const { data, isLoading } = useDashboard()

  if (isLoading) return <Loading fullPage />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Proyectos" value={data?.total_proyectos || 0} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard label="Proyectos Activos" value={data?.proyectos_activos || 0} color="text-green-600" bg="bg-green-50 dark:bg-green-900/20" />
        <StatCard label="Mis Tareas" value={data?.mis_tareas || 0} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-900/20" />
        <StatCard label="Vencidas" value={data?.tareas_vencidas || 0} color="text-red-600" bg="bg-red-50 dark:bg-red-900/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Tareas por Estado</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data?.tareas_por_estado || []} dataKey="count" nameKey="estado" cx="50%" cy="50%" outerRadius={80}>
                {(data?.tareas_por_estado || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {(data?.tareas_por_estado || []).map((item, i) => (
              <span key={item.estado} className="text-xs flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {item.estado.replace(/_/g, ' ')}: {item.count}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Tareas por Prioridad</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.tareas_por_prioridad || []}>
              <XAxis dataKey="prioridad" tick={{ fill: '#94a3b8' }} />
              <YAxis tick={{ fill: '#94a3b8' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          {data?.actividades_recientes?.length > 0 ? data.actividades_recientes.map((act) => (
            <div key={act.id} className="flex items-start gap-3 text-sm pb-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold uppercase">
                {act.usuario_nombre?.[0] || '?'}
              </div>
              <div className="flex-1">
                <p className="text-slate-700 dark:text-slate-300"><span className="font-medium">{act.usuario_nombre}</span> {act.descripcion}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{new Date(act.fecha).toLocaleString()}</p>
              </div>
            </div>
          )) : (
            <p className="text-sm text-slate-400">Sin actividad reciente</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-slate-200 dark:border-slate-700`}>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
