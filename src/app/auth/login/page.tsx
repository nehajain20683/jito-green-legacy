'use client';
// src/app/auth/login/page.tsx
import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TreePine } from 'lucide-react';

function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const callbackUrl = params.get('callbackUrl') || '/dashboard';
  const registered = params.get('registered');

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password.');
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-sage-600 rounded-xl flex items-center justify-center">
              <TreePine className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-xl text-forest-900">JITO Green Legacy</span>
          </Link>
          <h1 className="font-display text-3xl text-forest-950">Welcome back</h1>
          <p className="text-sage-600 mt-2">Sign in to your donor account</p>
        </div>

        <div className="bg-white border border-forest-100 rounded-2xl p-8 shadow-sm">
          {registered && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 mb-4">
              Account created! Please sign in.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1">Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-sage-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-400"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1">Password</label>
              <input type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-sage-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-400"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-sage-600 hover:bg-sage-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-forest-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-sage-600 font-semibold hover:underline">Register</Link>
          </p>
          <div className="mt-4 pt-4 border-t border-forest-100 text-center">
            <p className="text-xs text-forest-400">Admin: admin@jitomumbai.org / admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
