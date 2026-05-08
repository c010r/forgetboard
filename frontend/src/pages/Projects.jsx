import { useState } from 'react'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects'
import ProjectCard from '../components/projects/ProjectCard'
import ProjectForm from '../components/projects/ProjectForm'
import Modal from '../components/common/Modal'
import Loading from '../components/common/Loading'

export default function Projects() {
  const { data: projects, isLoading } = useProjects()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const [modalOpen, setModalOpen] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [filter, setFilter] = useState('')

  const handleCreate = async (formData) => {
    await createProject.mutateAsync(formData)
    setModalOpen(false)
  }

  const handleUpdate = async (formData) => {
    await updateProject.mutateAsync({ id: editProject.id, data: formData })
    setModalOpen(false)
    setEditProject(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este proyecto?')) return
    await deleteProject.mutateAsync(id)
  }

  const filtered = (projects || []).filter((p) =>
    !filter || p.nombre.toLowerCase().includes(filter.toLowerCase()) || p.codigo.toLowerCase().includes(filter.toLowerCase())
  )

  if (isLoading) return <Loading fullPage />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Proyectos</h1>
        <button
          onClick={() => { setEditProject(null); setModalOpen(true) }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + Nuevo Proyecto
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar proyectos..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full max-w-md px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          {filter ? 'No se encontraron proyectos' : 'No hay proyectos todavía'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <div key={project.id} className="relative group">
              <ProjectCard project={project} />
              <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditProject(project); setModalOpen(true) }}
                  className="p-1.5 bg-white dark:bg-slate-700 rounded shadow text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }}
                  className="p-1.5 bg-white dark:bg-slate-700 rounded shadow text-xs text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditProject(null) }} title={editProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}>
        <ProjectForm
          onSubmit={editProject ? handleUpdate : handleCreate}
          initial={editProject}
          onCancel={() => { setModalOpen(false); setEditProject(null) }}
        />
      </Modal>
    </div>
  )
}
