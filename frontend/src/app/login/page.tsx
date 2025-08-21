'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAuthStore } from '../../store/auth.store';
import { loginApi } from '../../lib/api';
import { useRouter } from 'next/navigation';

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const setAuth = useAuthStore(s => s.setAuth);
  const router = useRouter();

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await loginApi(values.email, values.password);
      setAuth(res.accessToken, res.refreshToken, res.user);
      router.push('/dashboard');
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <button className="px-4 py-2 bg-black text-white rounded disabled:opacity-50" disabled={isSubmitting}>Login</button>
      </form>
      <p className="text-sm text-gray-600">No account? <Link className="underline" href="/register">Register</Link></p>
    </div>
  );
}
