'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import axios from 'axios';

const schema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) });
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, values);
      alert('Registered, you can now login');
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Failed to register');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Register</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Name</label>
          <input className="w-full border rounded px-3 py-2" type="text" {...register('name')}/>
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input className="w-full border rounded px-3 py-2" type="email" {...register('email')}/>
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input className="w-full border rounded px-3 py-2" type="password" {...register('password')}/>
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </div>
        <button className="px-4 py-2 bg-black text-white rounded disabled:opacity-50" disabled={isSubmitting}>Register</button>
      </form>
      <p className="text-sm text-gray-600">Already have an account? <Link className="underline" href="/login">Login</Link></p>
    </div>
  );
}
