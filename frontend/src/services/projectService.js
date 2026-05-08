import api from './api'

export const getProjects = async (params) => {
  const { data } = await api.get('/proyectos/', { params })
  return data
}

export const getProject = async (id) => {
  const { data } = await api.get(`/proyectos/${id}/`)
  return data
}

export const createProject = async (projectData) => {
  const { data } = await api.post('/proyectos/', projectData)
  return data
}

export const updateProject = async (id, projectData) => {
  const { data } = await api.patch(`/proyectos/${id}/`, projectData)
  return data
}

export const deleteProject = async (id) => {
  await api.delete(`/proyectos/${id}/`)
}

export const getProjectMembers = async (id) => {
  const { data } = await api.get(`/proyectos/${id}/miembros/`)
  return data
}

export const addProjectMember = async (id, memberData) => {
  const { data } = await api.post(`/proyectos/${id}/miembros/`, memberData)
  return data
}
