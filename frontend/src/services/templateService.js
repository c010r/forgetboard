import api from './api'

export const getTemplates = async (params) => {
  const { data } = await api.get('/plantillas/', { params })
  return data
}

export const getTemplate = async (id) => {
  const { data } = await api.get(`/plantillas/${id}/`)
  return data
}

export const createTemplate = async (templateData) => {
  const { data } = await api.post('/plantillas/', templateData)
  return data
}

export const updateTemplate = async (id, templateData) => {
  const { data } = await api.patch(`/plantillas/${id}/`, templateData)
  return data
}

export const deleteTemplate = async (id) => {
  await api.delete(`/plantillas/${id}/`)
}
