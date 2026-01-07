'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const lang: 'he' | 'en' = 'he';

  const t = (key: any) => getTranslation(lang, key);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password, remember_me: remember });
      const { user, token } = response.data;

      setAuth(user, token);

      if (remember) {
        localStorage.setItem('remember', 'true');
      }

      toast.success(t('common_success'));
      router.push('/wallet');
    } catch (error: any) {
      if (!error?.response) {
        // Most common on Render free tier when backend is waking up / temporarily unavailable
        toast.error('Server is unavailable. Please wait ~30 seconds and try again.');
        return;
      }

      const details = error.response?.data?.error?.details;
      const detailMessage =
        details && typeof details === 'object'
          ? (Object.values(details)[0] as string | undefined)
          : undefined;

      const errorMessage =
        detailMessage ||
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        t('common_error');

      toast.error(typeof errorMessage === 'string' ? errorMessage : t('common_error'));
    } finally {
      setLoading(false);
    }
  };

  const canUseDevLogin =
    process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === 'true';

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const response = await authAPI.devLogin();
      const { user, token } = response.data;
      setAuth(user, token);
      toast.success(t('common_success'));
      router.push('/wallet');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.error || t('common_error');
      toast.error(typeof errorMessage === 'string' ? errorMessage : t('common_error'));
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              GiftWallet IL
            </h1>
            <p className="text-gray-600">
              {t('auth_login')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth_email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth_password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">{t('auth_remember')}</span>
              </label>
              {/* Password reset is not part of MVP */}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common_loading') : t('auth_login')}
            </button>

            {canUseDevLogin && (
              <button
                type="button"
                disabled={demoLoading}
                onClick={handleDemoLogin}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {demoLoading ? t('common_loading') : 'Entrar como demo'}
              </button>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth_no_account')}{' '}
              <Link href="/auth/signup" className="text-primary-600 font-semibold hover:underline">
                {t('auth_signup')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

