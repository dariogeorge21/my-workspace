'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { verifyPassword } from '@/lib/actions/auth';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await verifyPassword(password);
      if (result.success) {
        router.push('/workspace');
      } else {
        setError(result.error || 'Invalid password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-zinc-50 dark:bg-slate-950">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-200/50 dark:bg-indigo-900/30 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-200/50 dark:bg-slate-800/40 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-200/40 dark:bg-violet-900/20 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '5s' }} />
      </div>

      <Card className="w-full max-w-md p-8 border border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl rounded-2xl mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 tracking-tight">Workspace</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Hello, Welcome Back Dario George</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="rounded-xl border-zinc-200 dark:border-zinc-800 h-12 bg-white/50 dark:bg-zinc-950/50 focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300"
            />
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <Button
            type="submit"
            disabled={isLoading || !password}
            className="w-full h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all duration-200"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Verifying...' : 'Travel to your workspace'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
