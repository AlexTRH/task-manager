'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export type Project = { id: string; name: string; description?: string; createdAt: string; };

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => (await api.get<Project>(`/projects/${id}`)).data,
    enabled: !!id,
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; name: string; description?: string }) =>
      (await api.patch(`/projects/${payload.id}`, payload)).data,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project', data.id] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string }) => (await api.delete(`/projects/${payload.id}`)).data,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.removeQueries({ queryKey: ['project', id] });
    },
  });
}
