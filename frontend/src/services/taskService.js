import api from './api'

export const getTasks = async (params) => {
  const { data } = await api.get('/tareas/', { params })
  return data
}

export const getTask = async (id) => {
  const { data } = await api.get(`/tareas/${id}/`)
  return data
}

export const createTask = async (taskData) => {
  const { data } = await api.post('/tareas/', taskData)
  return data
}

export const updateTask = async (id, taskData) => {
  const { data } = await api.patch(`/tareas/${id}/`, taskData)
  return data
}

export const deleteTask = async (id) => {
  await api.delete(`/tareas/${id}/`)
}

export const moveTask = async (id, columnaId, orden = 0) => {
  const { data } = await api.post(`/tareas/${id}/mover/`, { columna_id: columnaId, orden })
  return data
}

export const getTaskComments = async (id) => {
  const { data } = await api.get(`/tareas/${id}/comentarios/`)
  return data
}

export const addComment = async (id, commentData) => {
  const { data } = await api.post(`/tareas/${id}/comentarios/`, commentData)
  return data
}

export const getTaskChecklists = async (id) => {
  const { data } = await api.get(`/tareas/${id}/checklists/`)
  return data
}

export const createChecklist = async (id, checklistData) => {
  const { data } = await api.post(`/tareas/${id}/checklists/`, checklistData)
  return data
}

export const createSubtask = async (id, subtaskData) => {
  const { data } = await api.post(`/tareas/${id}/subtareas/`, subtaskData)
  return data
}


