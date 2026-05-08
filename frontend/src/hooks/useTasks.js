import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as taskService from '../services/taskService'
import { extractResults, getErrorMessage } from './useQueryUtils'
import toast from 'react-hot-toast'

export function useTasks(params) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: async () => {
      const data = await taskService.getTasks(params)
      return extractResults(data)
    },
  })
}

export function useTask(id) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => taskService.getTask(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Tarea creada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => taskService.updateTask(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', vars.id] })
      toast.success('Tarea actualizada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Tarea eliminada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useMoveTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, columnaId, orden = 0 }) => taskService.moveTask(id, columnaId, orden),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useTaskComments(taskId) {
  return useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: () => taskService.getTaskComments(taskId),
    enabled: !!taskId,
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => taskService.addComment(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', vars.id] })
      toast.success('Comentario agregado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useAddSubtask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => taskService.createSubtask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Subtarea añadida')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}


