'use client';
import { useQuery } from '@tanstack/react-query';
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
