'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../../store/auth.store';
import { useCreateProject } from '../../../../hooks/use-projects';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewProjectPage() {
  const { isAuthed } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthed()) router.push('/login');
  }, [isAuthed, router]);

  const createProject = useCreateProject();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (!isAuthed()) return null;

  const onSubmit = async (values: FormValues) => {
    try {
      await createProject.mutateAsync(values);
      router.push('/dashboard');
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Failed to create project');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">New Project</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Name</label>
          <input className="w-full border rounded px-3 py-2" {...register('name')} />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <textarea className="w-full border rounded px-3 py-2" {...register('description')} />
          {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
        </div>
        <button className="px-4 py-2 bg-black text-white rounded disabled:opacity-50" disabled={isSubmitting}>Create</button>
      </form>
    </div>
  );
}
