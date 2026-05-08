import { useState } from 'react'
import { useProjectMembers, useAddProjectMember } from '../../hooks/useProjects'
import { useUsuarios } from '../../hooks/useUsuarios'
import Loading from '../common/Loading'

const ROLES = [
  { value: 'gerente_proyecto', label: 'Gerente de Proyecto' },
  { value: 'coordinador', label: 'Coordinador' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'colaborador', label: 'Colaborador' },
  { value: 'cliente', label: 'Cliente' },
]

export default function MembersPanel({ projectId }) {
  const { data: members, isLoading } = useProjectMembers(projectId)
  const { data: usuarios } = useUsuarios()
  const addMember = useAddProjectMember()
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedRol, setSelectedRol] = useState('colaborador')
  const [showForm, setShowForm] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!selectedUser) return
    await addMember.mutateAsync({ id: projectId, data: { usuario: parseInt(selectedUser), rol: selectedRol } })
    setSelectedUser('')
    setSelectedRol('colaborador')
    setShowForm(false)
  }

  if (isLoading) return <Loading />

  const memberUserIds = new Set((members || []).map((m) => m.usuario))
  const availableUsers = (usuarios || []).filter((u) => !memberUserIds.has(u.id))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Miembros del Proyecto</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          {showForm ? 'Cancelar' : '+ Agregar Miembro'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-wrap gap-3">
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} required
            className="flex-1 min-w-[200px] px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm">
            <option value="">Seleccionar usuario...</option>
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.username} ({u.email || 'sin email'})</option>
            ))}
            {availableUsers.length === 0 && <option disabled>No hay usuarios disponibles</option>}
          </select>
          <select value={selectedRol} onChange={(e) => setSelectedRol(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm">
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">Agregar</button>
        </form>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        {(members || []).length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500">Sin miembros</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {(members || []).map((m) => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold uppercase">
                    {m.usuario_nombre?.[0] || m.usuario?.toString()[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{m.usuario_nombre || `Usuario #${m.usuario}`}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{m.rol?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{new Date(m.fecha_ingreso).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
