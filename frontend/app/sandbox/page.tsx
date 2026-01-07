'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function SandboxPage() {
  const router = useRouter();
  const { user, token, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const canUseDevLogin =
    process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === 'true';

  useEffect(() => {
    const run = async () => {
      if (token && user) {
        router.replace('/wallet');
        return;
      }

      if (!canUseDevLogin) {
        setLoading(false);
        return;
      }

      try {
        const res = await authAPI.devLogin();
        const { user: u, token: t } = res.data;
        setAuth(u, t);
        router.replace('/wallet');
      } catch (err: any) {
        if (!err?.response) {
          toast.error('Server is unavailable. Please wait ~30 seconds and try again.');
        } else {
          toast.error(
            err.response?.data?.error?.message || err.response?.data?.message || 'Sandbox login failed'
          );
        }
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!canUseDevLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sandbox</h1>
          <p className="text-gray-600 mb-6">
            Dev sandbox login is disabled. Enable it with{' '}
            <code className="px-1 py-0.5 bg-gray-100 rounded">NEXT_PUBLIC_ENABLE_DEV_LOGIN=true</code>.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sandbox</h1>
        <p className="text-gray-600 mb-6">Demo login failed. You can retry or use the regular login.</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
          <Link
            href="/auth/login"
            className="flex-1 inline-flex items-center justify-center bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}


