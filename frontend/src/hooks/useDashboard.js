import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/reportes/dashboard/')
      return data
    },
    refetchOnWindowFocus: false,
  })
}

export function useAllReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const [dash, proj] = await Promise.all([
        api.get('/reportes/dashboard/'),
        api.get('/proyectos/'),
      ])
      const projects = Array.isArray(proj.data) ? proj.data : proj.data.results || []
      return { dashboard: dash.data, projects }
    },
    refetchOnWindowFocus: false,
  })
}
