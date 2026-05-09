export function extractResults(data) {
  if (Array.isArray(data)) return data
  if (data?.results) return data.results
  return data || []
}

export function getErrorMessage(err) {
  if (err.response?.status === 400) return 'Verifica los datos ingresados'
  if (err.response?.status === 403) return 'No tienes permisos para esta acción'
  if (err.response?.status === 404) return 'El recurso no fue encontrado'
  if (err.response?.status === 500) return 'Error interno del servidor'
  return 'Error de conexión. Intenta nuevamente.'
}
