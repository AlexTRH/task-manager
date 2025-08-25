'use client';
import Link from 'next/link';
import { useAuthStore} from "../../store/auth.store";
import { useProjects} from "../../hooks/use-projects";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isAuthed } = useAuthStore();
  const router = useRouter();
  useEffect(() => { if (!isAuthed()) router.push('/login'); }, [isAuthed, router]);
  const { data, isLoading } = useProjects();

  if (!isAuthed()) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome, {user?.name}</h1>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Projects</h2>
        <Link className="px-3 py-2 border rounded" href="/dashboard/projects/new">+ New</Link>
      </div>
      {isLoading && <p>Loading...</p>}
      <ul className="grid gap-3 md:grid-cols-2">
        {data?.map(p => (
          <li key={p.id} className="border rounded p-4 hover:shadow-sm">
            <h3 className="font-medium">{p.name}</h3>
            <p className="text-sm text-gray-600">{p.description || '—'}</p>
            <Link className="inline-block mt-3 underline" href={`/dashboard/projects/${p.id}`}>Open</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
