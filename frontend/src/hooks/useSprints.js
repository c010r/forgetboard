import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { extractResults } from './useQueryUtils'

export function useSprints(params) {
  return useQuery({
    queryKey: ['sprints', params],
    queryFn: async () => {
      const { data } = await api.get('/sprints/', { params })
      return extractResults(data)
    },
  })
}

export function useHitos(params) {
  return useQuery({
    queryKey: ['hitos', params],
    queryFn: async () => {
      const { data } = await api.get('/sprints/hitos/', { params })
      return extractResults(data)
    },
  })
}
