import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as templateService from '../services/templateService'
import { extractResults, getErrorMessage } from './useQueryUtils'
import toast from 'react-hot-toast'

export function useTemplates(params) {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: async () => {
      const data = await templateService.getTemplates(params)
      return extractResults(data)
    },
  })
}

export function useTemplate(id) {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => templateService.getTemplate(id),
    enabled: !!id,
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: templateService.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast.success('Plantilla creada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => templateService.updateTemplate(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['template', vars.id] })
      toast.success('Plantilla actualizada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: templateService.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      toast.success('Plantilla eliminada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}
