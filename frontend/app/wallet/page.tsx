'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { authAPI, cardsAPI } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus, LogOut } from 'lucide-react';

interface Card {
  id: string;
  codeLast4: string;
  balance: number;
  expiresAt?: string | null;
  status: string;
  nickname?: string | null;
  cardProduct: {
    id: string;
    name: string;
    issuer: {
      id: string;
      name: string;
      logoUrl?: string | null;
    };
  };
}

export default function WalletPage() {
  const { user } = useAuthStore();
  const lang = user?.languagePreference || 'he';
  const t = (key: any) => getTranslation(lang, key);

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cardsRes = await cardsAPI.getAll();
      const cardsData = cardsRes.data;
      const cardsArray = Array.isArray(cardsData) ? cardsData : (cardsData?.cards ?? []);
      setCards(cardsArray);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || t('common_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore - stateless JWT logout
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('wallet_title')}</h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <LogOut size={18} />
            <span>{t('profile_logout')}</span>
          </button>
        </div>

        {/* Cards Grid */}
        {cards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl font-semibold text-gray-700 mb-2">
              {t('wallet_empty_title')}
            </p>
            <p className="text-gray-500 mb-4">{t('wallet_empty_subtitle')}</p>
            <Link
              href="/cards/add"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <Plus size={20} />
              {t('nav_add')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => {
              const cardLabel = card.nickname || card.cardProduct.name;
              const issuerName = card.cardProduct.issuer.name;
              const progress = 100;

              return (
                <Link
                  key={card.id}
                  href={`/cards/${card.id}`}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  style={{ borderTop: `4px solid #6B7280` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{cardLabel}</h3>
                      <p className="text-sm text-gray-500">{issuerName}</p>
                    </div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">
                      {card.status}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-2xl font-bold text-gray-900">
                      ₪{Number(card.balance).toFixed(0)}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    {card.status === 'used' && (
                      <p className="text-gray-500 font-semibold">{t('card_used')}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* FAB */}
        <Link
          href="/cards/add"
          className="fixed bottom-20 right-6 bg-primary-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors z-40"
        >
          <Plus size={24} />
        </Link>
      </div>
    </AppLayout>
  );
}
