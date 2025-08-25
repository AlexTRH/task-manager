'use client';
import { useParams } from 'next/navigation';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../../../hooks/use-tasks';
import { useAuthStore } from '../../../../store/auth.store';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProject, useUpdateProject, useDeleteProject } from '../../../../hooks/use-projects';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = String(params?.id || '');
  const { isAuthed } = useAuthStore();
  const router = useRouter();
  useEffect(() => { if (!isAuthed()) router.push('/login'); }, [isAuthed, router]);

  const { data: project } = useProject(projectId);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { data: tasks, isLoading, refetch } = useTasks(projectId);
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
    }
  }, [project]);

  if (!isAuthed()) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{name || 'Project'}</h1>

      <form className="space-y-3" onSubmit={async e => {
        e.preventDefault();
        await updateProject.mutateAsync({ id: projectId, name, description });
      }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="border rounded px-3 py-2 w-full" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="border rounded px-3 py-2 w-full" />
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-black text-white rounded disabled:opacity-50" disabled={updateProject.isPending}>Save</button>
          <button type="button" className="px-4 py-2 border rounded text-red-600 disabled:opacity-50" onClick={async () => {
            if (confirm('Delete project?')) {
              await deleteProject.mutateAsync({ id: projectId });
              router.push('/dashboard');
            }
          }} disabled={deleteProject.isPending}>Delete Project</button>
        </div>
      </form>

      <form className="flex gap-2" onSubmit={async e => {
        e.preventDefault();
        if (!title.trim()) return;
        await createTask.mutateAsync({ title });
        setTitle('');
        refetch();
      }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New task title..." className="border rounded px-3 py-2 w-full" />
        <button className="px-4 py-2 bg-black text-white rounded disabled:opacity-50" disabled={createTask.isPending}>Add</button>
      </form>

      {isLoading ? <p>Loading...</p> : (
        <ul className="space-y-2">
          {tasks?.map((t: any) => (
            <li key={t.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-sm text-gray-600">{t.description || '—'}</div>
                <div className="text-xs text-gray-500">{t.status}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border rounded" onClick={async () => {
                  const next = t.status === 'TODO' ? 'IN_PROGRESS' : (t.status === 'IN_PROGRESS' ? 'DONE' : 'TODO');
                  await updateTask.mutateAsync({ id: t.id, status: next });
                  refetch();
                }}>Advance</button>
                <button className="px-3 py-1 border rounded" onClick={async () => {
                  await deleteTask.mutateAsync({ id: t.id });
                  refetch();
                }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
