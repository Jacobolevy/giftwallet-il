'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { usersAPI } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const lang = user?.languagePreference || 'he';
  const t = (key: any) => getTranslation(lang, key);

  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await usersAPI.getProfile();
      setProfile(response.data);
      updateUser(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || t('common_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/auth/login');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">{t('profile_title')}</h1>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile_name')}
              </label>
              <p className="text-gray-900">{profile?.name || '—'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile_email')}
              </label>
              <p className="text-gray-900">{profile?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile_phone')}
              </label>
              <p className="text-gray-900">{profile?.phone || '—'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile_language')}
              </label>
              <p className="text-gray-900">
                {profile?.languagePreference === 'he' ? 'עברית' : 'English'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('profile_notifications')}</h2>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={profile?.emailNotificationsEnabled}
                readOnly
                className="mr-2"
              />
              <span>{t('profile_email_notifications')}</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={profile?.pushNotificationsEnabled}
                readOnly
                className="mr-2"
              />
              <span>{t('profile_push_notifications')}</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            {t('profile_logout')}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

