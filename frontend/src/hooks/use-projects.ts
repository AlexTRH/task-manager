'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export type Project = { id: string; name: string; description?: string; createdAt: string; };

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get<Project[]>('/projects');
      return data;
    }
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string }) =>
      (await api.post('/projects', payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
