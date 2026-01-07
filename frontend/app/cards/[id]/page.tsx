'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { cardsAPI } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { differenceInDays } from 'date-fns';

export default function CardDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const cardId = params.id as string;
  const { user } = useAuthStore();
  const lang = user?.languagePreference || 'he';
  const t = (key: any) => getTranslation(lang, key);

  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFullCode, setShowFullCode] = useState(false);

  useEffect(() => {
    loadCard();
  }, [cardId]);

  const loadCard = async () => {
    try {
      const response = await cardsAPI.getById(cardId);
      setCard(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || t('common_error'));
      router.push('/wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
      await cardsAPI.delete(cardId);
      toast.success('Card deleted');
      router.push('/wallet');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || t('common_error'));
    }
  };

  const handleMarkAsUsed = async () => {
    if (!confirm('Mark this card as used?')) return;

    try {
      await cardsAPI.markAsUsed(cardId);
      toast.success('Card marked as used');
      loadCard();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || t('common_error'));
    }
  };

  const copyCode = async () => {
    try {
      const response = await cardsAPI.getFullCode(cardId);
      await navigator.clipboard.writeText(response.data.fullCode);
      toast.success('Code copied to clipboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || t('common_error'));
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

  if (!card) return null;

  const daysLeft = differenceInDays(new Date(card.expiryDate), new Date());
  const cardLabel = lang === 'he' && card.labelHe ? card.labelHe : card.label;
  const issuerName = lang === 'he' && card.issuer.nameHe ? card.issuer.nameHe : card.issuer.name;
  const progress = (Number(card.valueCurrent) / Number(card.valueInitial)) * 100;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Card Hero */}
        <div
          className="bg-gradient-to-br rounded-2xl p-8 text-white mb-6 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${card.issuer.brandColor || '#6B7280'}, ${
              card.issuer.brandColor || '#4B5563'
            })`,
          }}
        >
          <h1 className="text-3xl font-bold mb-2">{cardLabel}</h1>
          <p className="text-lg opacity-90 mb-6">{issuerName}</p>
          <div className="text-4xl font-bold mb-4">₪{Number(card.valueCurrent).toFixed(0)}</div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link
            href={`/cards/${cardId}/update-balance`}
            className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow"
          >
            <p className="font-semibold text-sm">{t('card_details_update_balance')}</p>
          </Link>
          <button
            onClick={handleMarkAsUsed}
            className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow"
          >
            <p className="font-semibold text-sm">{t('card_details_mark_used')}</p>
          </button>
          {card.issuer.websiteUrl && (
            <a
              href={card.issuer.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow"
            >
              <p className="font-semibold text-sm">{t('card_details_visit_website')}</p>
            </a>
          )}
          <button
            onClick={copyCode}
            className="bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-shadow"
          >
            <p className="font-semibold text-sm">{t('card_details_copy_code')}</p>
          </button>
        </div>

        {/* Card Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Card Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Issuer</p>
              <p className="font-semibold">{issuerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Label</p>
              <p className="font-semibold">{cardLabel}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last 4 Digits</p>
              <p className="font-semibold">•••• {card.codeLast4}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold capitalize">{card.status}</p>
            </div>
          </div>
        </div>

        {/* Balance & Value */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Balance & Value</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Initial Value</p>
              <p className="text-2xl font-bold">₪{Number(card.valueInitial).toFixed(0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Value</p>
              <p className="text-2xl font-bold">₪{Number(card.valueCurrent).toFixed(0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Value Used</p>
              <p className="font-semibold">
                ₪{(Number(card.valueInitial) - Number(card.valueCurrent)).toFixed(0)} (
                {((1 - Number(card.valueCurrent) / Number(card.valueInitial)) * 100).toFixed(0)}%)
              </p>
            </div>
          </div>
        </div>

        {/* Expiry */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Expiry</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Expiry Date</p>
              <p className="font-semibold">
                {new Date(card.expiryDate).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US')}
              </p>
            </div>
            {card.status === 'active' && (
              <div>
                <p className="text-sm text-gray-500">Time Until Expiry</p>
                <p className="text-2xl font-bold">
                  {daysLeft >= 0 ? `${daysLeft} ${t('card_days_left')}` : t('card_expired')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {card.notes && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <p className="text-gray-700">{card.notes}</p>
          </div>
        )}

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          {t('card_details_delete')}
        </button>
      </div>
    </AppLayout>
  );
}

