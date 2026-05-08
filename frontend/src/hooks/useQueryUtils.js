export function extractResults(data) {
  if (Array.isArray(data)) return data
  if (data?.results) return data.results
  return data || []
}

export function getErrorMessage(err) {
  if (err.response?.data) {
    if (typeof err.response.data === 'string') return err.response.data
    const messages = Object.values(err.response.data).flat()
    return messages.join(', ')
  }
  return err.message || 'Error de conexión'
}
