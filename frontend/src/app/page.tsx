import Link from 'next/link';

export default function Home() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Task Manager</h1>
      <p className="text-gray-600">Demo app: projects and tasks with auth.</p>
      <div className="flex gap-4">
        <Link className="px-4 py-2 rounded bg-black text-white" href="/login">Login</Link>
        <Link className="px-4 py-2 rounded border" href="/register">Register</Link>
        <Link className="px-4 py-2 rounded border" href="/dashboard">Dashboard</Link>
      </div>
    </main>
  );
}
