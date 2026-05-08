import api from './api'

export const login = async (username, password) => {
  const { data } = await api.post('/auth/login/', { username, password })
  localStorage.setItem('access_token', data.access)
  localStorage.setItem('refresh_token', data.refresh)
  return data
}

export const refreshToken = async (refresh) => {
  const { data } = await api.post('/auth/refresh/', { refresh })
  localStorage.setItem('access_token', data.access)
  return data
}

export const getProfile = async () => {
  const { data } = await api.get('/usuarios/me/')
  return data
}

export const logout = () => {
  localStorage.clear()
  window.location.href = '/login'
}
