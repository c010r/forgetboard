import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { extractResults } from './useQueryUtils'

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data } = await api.get('/usuarios/')
      return extractResults(data)
    },
  })
}
