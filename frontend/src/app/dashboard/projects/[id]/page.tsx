'use client';
import { useParams } from 'next/navigation';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../../../hooks/use-tasks';
import { useAuthStore } from '../../../../store/auth.store';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = String(params?.id || '');
  const { isAuthed } = useAuthStore();
  const router = useRouter();
  useEffect(() => { if (!isAuthed()) router.push('/login'); }, [isAuthed, router]);

  const { data: tasks, isLoading, refetch } = useTasks(projectId);
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [title, setTitle] = useState('');

  if (!isAuthed()) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Project</h1>

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
