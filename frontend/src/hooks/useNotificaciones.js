import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { extractResults } from './useQueryUtils'

export function useNotificaciones(params) {
  return useQuery({
    queryKey: ['notificaciones', params],
    queryFn: async () => {
      const { data } = await api.get('/notificaciones/', { params })
      return extractResults(data)
    },
    refetchInterval: 30000,
  })
}

export function useMarcarLeida() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.post(`/notificaciones/${id}/marcar_leida/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
    },
  })
}

export function useMarcarTodasLeidas() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/notificaciones/marcar_todas_leidas/'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
    },
  })
}
