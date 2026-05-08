import api from './api'

export const getBoards = async (params) => {
  const { data } = await api.get('/tableros/', { params })
  return data
}

export const getBoard = async (id) => {
  const { data } = await api.get(`/tableros/${id}/`)
  return data
}

export const createBoard = async (boardData) => {
  const { data } = await api.post('/tableros/', boardData)
  return data
}

export const getColumns = async (params) => {
  const { data } = await api.get('/columnas/', { params })
  return data
}

export const createColumn = async (columnData) => {
  const { data } = await api.post('/columnas/', columnData)
  return data
}

export const updateColumn = async (id, columnData) => {
  const { data } = await api.patch(`/columnas/${id}/`, columnData)
  return data
}

export const deleteColumn = async (id) => {
  await api.delete(`/columnas/${id}/`)
}
