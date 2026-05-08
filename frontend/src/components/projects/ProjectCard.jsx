import { useNavigate } from 'react-router-dom'
import Badge from '../common/Badge'

export default function ProjectCard({ project }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/proyectos/${project.id}`)}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
            {project.codigo}
          </span>
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mt-2">{project.nombre}</h3>
        </div>
        <Badge value={project.estado} />
      </div>

      {project.descripcion && (
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{project.descripcion}</p>
      )}

      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-2">
          <Badge type="priority" value={project.prioridad} />
          <span>{project.porcentaje_avance}%</span>
        </div>
        <span>{project.responsable_nombre || 'Sin responsable'}</span>
      </div>

      <div className="mt-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all"
          style={{ width: `${project.porcentaje_avance}%` }}
        />
      </div>
    </div>
  )
}
