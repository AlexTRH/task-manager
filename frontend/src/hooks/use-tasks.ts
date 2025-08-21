'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export type Task = { id: string; title: string; description?: string; status: 'TODO'|'IN_PROGRESS'|'DONE' };

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => (await api.get(`/tasks/project/${projectId}`)).data,
    enabled: !!projectId
  });
}

export function useCreateTask(projectId: string) {
  return useMutation({
    mutationFn: async (payload: { title: string; description?: string }) => (await api.post(`/tasks/project/${projectId}`, payload)).data
  });
}

export function useUpdateTask() {
  return useMutation({
    mutationFn: async (payload: { id: string; title?: string; description?: string; status?: 'TODO'|'IN_PROGRESS'|'DONE' }) =>
      (await api.patch(`/tasks/${payload.id}`, payload)).data
  });
}

export function useDeleteTask() {
  return useMutation({
    mutationFn: async (payload: { id: string }) => (await api.delete(`/tasks/${payload.id}`)).data
  });
}
