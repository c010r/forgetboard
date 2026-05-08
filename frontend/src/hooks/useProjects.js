import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as projectService from '../services/projectService'
import { extractResults, getErrorMessage } from './useQueryUtils'
import toast from 'react-hot-toast'

export function useProjects(params) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const data = await projectService.getProjects(params)
      return extractResults(data)
    },
  })
}

export function useProject(id) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Proyecto creado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => projectService.updateProject(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', vars.id] })
      toast.success('Proyecto actualizado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Proyecto eliminado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useProjectMembers(projectId) {
  return useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectService.getProjectMembers(projectId),
    enabled: !!projectId,
  })
}

export function useAddProjectMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => projectService.addProjectMember(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', vars.id] })
      toast.success('Miembro agregado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}
