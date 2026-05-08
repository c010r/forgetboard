import { useAllReports } from '../hooks/useDashboard'
import Loading from '../components/common/Loading'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280']

export default function Reports() {
  const { data, isLoading } = useAllReports()
  const dashData = data?.dashboard

  if (isLoading) return <Loading fullPage />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reportes</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox label="Total Proyectos" value={dashData?.total_proyectos || 0} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" />
        <StatBox label="Proyectos Activos" value={dashData?.proyectos_activos || 0} color="text-green-600" bg="bg-green-50 dark:bg-green-900/20" />
        <StatBox label="Tareas Totales" value={(dashData?.tareas_por_estado || []).reduce((s, e) => s + e.count, 0)} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-900/20" />
        <StatBox label="Tareas Vencidas" value={dashData?.tareas_vencidas || 0} color="text-red-600" bg="bg-red-50 dark:bg-red-900/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Tareas por Estado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={dashData?.tareas_por_estado || []} dataKey="count" nameKey="estado" cx="50%" cy="50%" outerRadius={100} label={({ estado }) => estado?.replace(/_/g, ' ')}>
                {(dashData?.tareas_por_estado || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Tareas por Prioridad</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashData?.tareas_por_prioridad || []}>
              <XAxis dataKey="prioridad" tickFormatter={(v) => v?.charAt(0).toUpperCase() + v?.slice(1)} tick={{ fill: '#94a3b8' }} />
              <YAxis tick={{ fill: '#94a3b8' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Proyectos por Estado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashData?.proyectos_por_estado || []}>
              <XAxis dataKey="estado" tickFormatter={(v) => v?.replace(/_/g, ' ')} tick={{ fill: '#94a3b8' }} />
              <YAxis tick={{ fill: '#94a3b8' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Resumen de Proyectos</h3>
          <div className="space-y-3">
            {(data?.projects || []).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300 truncate mr-2">{p.nombre}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-400 dark:text-slate-500">{p.porcentaje_avance}%</span>
                  <div className="w-20 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${p.porcentaje_avance}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {(data?.projects || []).length === 0 && <p className="text-sm text-slate-400">Sin proyectos</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-slate-200 dark:border-slate-700`}>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
