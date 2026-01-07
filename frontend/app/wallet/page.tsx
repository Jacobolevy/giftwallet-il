'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { cardsAPI } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface Card {
  id: string;
  label: string;
  labelHe?: string;
  codeLast4: string;
  valueCurrent: number;
  valueInitial: number;
  expiryDate: string;
  status: string;
  issuer: {
    name: string;
    nameHe?: string;
    brandColor?: string;
    logoUrl?: string;
  };
}

export default function WalletPage() {
  const { user } = useAuthStore();
  const lang = user?.languagePreference || 'he';
  const t = (key: any) => getTranslation(lang, key);

  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState({
    totalActiveValue: 0,
    activeCards: 0,
    expiringSoon: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cardsRes, statsRes] = await Promise.all([
        cardsAPI.getAll(),
        cardsAPI.getStats(),
      ]);

      setCards(cardsRes.data);
      setStats(statsRes.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || t('common_error'));
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (card: Card) => {
    if (card.status === 'expired' || card.status === 'used') {
      return 'bg-gray-500';
    }

    const daysLeft = getDaysUntilExpiry(card.expiryDate);
    if (daysLeft <= 7) return 'bg-red-500';
    if (daysLeft <= 30) return 'bg-yellow-500';
    return 'bg-green-500';
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
        {/* Header Summary */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-4">{t('wallet_title')}</h1>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm opacity-90">{t('wallet_total_value')}</p>
              <p className="text-3xl font-bold">₪{stats.totalActiveValue.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">{t('wallet_active_cards')}</p>
              <p className="text-3xl font-bold">{stats.activeCards}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">{t('wallet_expiring_soon')}</p>
              <p className="text-3xl font-bold">{stats.expiringSoon}</p>
            </div>
          </div>
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
              const daysLeft = getDaysUntilExpiry(card.expiryDate);
              const cardLabel = lang === 'he' && card.labelHe ? card.labelHe : card.label;
              const issuerName = lang === 'he' && card.issuer.nameHe ? card.issuer.nameHe : card.issuer.name;
              const progress = (Number(card.valueCurrent) / Number(card.valueInitial)) * 100;

              return (
                <Link
                  key={card.id}
                  href={`/cards/${card.id}`}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  style={{
                    borderTop: `4px solid ${card.issuer.brandColor || '#6B7280'}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{cardLabel}</h3>
                      <p className="text-sm text-gray-500">{issuerName}</p>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(card)} ${
                        card.status === 'active' ? 'animate-pulse' : ''
                      }`}
                    />
                  </div>

                  <div className="mb-4">
                    <p className="text-2xl font-bold text-gray-900">
                      ₪{Number(card.valueCurrent).toFixed(0)}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>
                      {t('card_expires')}: {new Date(card.expiryDate).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US')}
                    </p>
                    {card.status === 'active' && daysLeft >= 0 && (
                      <p className="font-semibold">
                        {daysLeft} {t('card_days_left')}
                      </p>
                    )}
                    {card.status === 'expired' && (
                      <p className="text-red-600 font-semibold">{t('card_expired')}</p>
                    )}
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

