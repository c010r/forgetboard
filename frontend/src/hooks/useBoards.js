import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as boardService from '../services/boardService'
import { extractResults, getErrorMessage } from './useQueryUtils'
import toast from 'react-hot-toast'

export function useBoards(params) {
  return useQuery({
    queryKey: ['boards', params],
    queryFn: async () => {
      const data = await boardService.getBoards(params)
      return extractResults(data)
    },
  })
}

export function useBoard(id) {
  return useQuery({
    queryKey: ['board', id],
    queryFn: () => boardService.getBoard(id),
    enabled: !!id,
  })
}

export function useCreateBoard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: boardService.createBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      toast.success('Tablero creado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}

export function useColumns(params) {
  return useQuery({
    queryKey: ['columns', params],
    queryFn: async () => {
      const data = await boardService.getColumns(params)
      return extractResults(data)
    },
  })
}

export function useUpdateColumn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => boardService.updateColumn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
}
