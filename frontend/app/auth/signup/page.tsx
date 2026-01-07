'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

// Password validation helpers
const passwordChecks = {
  minLength: (pwd: string) => pwd.length >= 8,
  hasUppercase: (pwd: string) => /[A-Z]/.test(pwd),
  hasLowercase: (pwd: string) => /[a-z]/.test(pwd),
  hasNumber: (pwd: string) => /[0-9]/.test(pwd),
};

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    languagePreference: 'he' as 'he' | 'en',
  });
  const [loading, setLoading] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const lang: 'he' | 'en' = 'he';

  const t = (key: any) => getTranslation(lang, key);

  // Password validation state
  const passwordValidation = useMemo(() => ({
    minLength: passwordChecks.minLength(formData.password),
    hasUppercase: passwordChecks.hasUppercase(formData.password),
    hasLowercase: passwordChecks.hasLowercase(formData.password),
    hasNumber: passwordChecks.hasNumber(formData.password),
  }), [formData.password]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('Password does not meet requirements');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.signup({
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined,
        phone: formData.phone || undefined,
        language_preference: formData.languagePreference,
      });

      const { user, token } = response.data;
      setAuth(user, token);

      toast.success(t('common_success'));
      router.push('/wallet');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.error || t('common_error');
      toast.error(typeof errorMessage === 'string' ? errorMessage : t('common_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              GiftWallet IL
            </h1>
            <p className="text-gray-600">
              {t('auth_signup')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth_email')} *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth_password')} *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setShowPasswordRequirements(true)}
                  required
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    formData.password && !isPasswordValid ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {/* Password requirements checklist */}
              {showPasswordRequirements && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                  <p className="font-medium text-gray-700 mb-2">Password must have:</p>
                  <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordValidation.minLength ? '✓' : '○'} At least 8 characters
                  </div>
                  <div className={`flex items-center gap-2 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordValidation.hasUppercase ? '✓' : '○'} One uppercase letter (A-Z)
                  </div>
                  <div className={`flex items-center gap-2 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordValidation.hasLowercase ? '✓' : '○'} One lowercase letter (a-z)
                  </div>
                  <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordValidation.hasNumber ? '✓' : '○'} One number (0-9)
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth_confirm_password')} *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    formData.confirmPassword && !passwordsMatch ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth_name')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth_phone')}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch || !formData.confirmPassword}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common_loading') : t('auth_signup')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth_has_account')}{' '}
              <Link href="/auth/login" className="text-primary-600 font-semibold hover:underline">
                {t('auth_login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

