'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { establishmentsAPI } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  ExternalLink
} from 'lucide-react';

interface Card {
  id: string;
  label: string;
  labelHe?: string;
  valueCurrent: number;
  issuer: {
    id: string;
    name: string;
    nameHe?: string;
    brandColor?: string;
    logoUrl?: string;
  };
}

interface EstablishmentDetail {
  id: string;
  name: string;
  nameHe?: string;
  logoUrl?: string;
}

interface MyCardsResponse {
  establishment: EstablishmentDetail;
  cards: Card[];
  totalAmount: number;
}

export default function EstablishmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const establishmentId = params.id as string;
  const { user } = useAuthStore();
  const lang = user?.languagePreference || 'he';
  const t = (key: any) => getTranslation(lang, key);

  const [data, setData] = useState<MyCardsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [establishmentId]);

  const loadData = async () => {
    try {
      const response = await establishmentsAPI.getMyCards(establishmentId);
      setData(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || t('common_error'));
      router.push('/search');
    } finally {
      setLoading(false);
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

  if (!data) return null;

  const { establishment, cards, totalAmount } = data;
  const name = lang === 'he' && establishment.nameHe ? establishment.nameHe : establishment.name;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          <span>{t('common_back')}</span>
        </button>

        {/* Establishment Header */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            {establishment.logoUrl ? (
              <img
                src={establishment.logoUrl}
                alt={name}
                className="w-16 h-16 rounded-xl bg-white p-2 object-contain"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                <MapPin size={32} className="text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{t('search_total_to_spend')}</p>
                <p className="text-4xl font-bold">₪{Number(totalAmount).toFixed(0)}</p>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm">{t('search_from_cards')}</p>
                <p className="text-2xl font-bold">{cards.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards List */}
        {cards.length > 0 ? (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-primary-600" />
              {t('search_your_cards')}
            </h2>

            <div className="space-y-3">
              {cards.map((card) => {
                const cardLabel = lang === 'he' && card.labelHe ? card.labelHe : card.label;
                const issuerName = lang === 'he' && card.issuer.nameHe ? card.issuer.nameHe : card.issuer.name;

                return (
                  <Link
                    key={card.id}
                    href={`/cards/${card.id}`}
                    className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    style={{ borderLeft: `4px solid ${card.issuer.brandColor || '#6B7280'}` }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{cardLabel}</h3>
                        <p className="text-sm text-gray-500">{issuerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary-600">
                          ₪{card.valueCurrent.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">{t('search_no_cards_here')}</p>
            <Link
              href="/cards/add"
              className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              {t('nav_add')}
            </Link>
          </div>
        )}

      </div>
    </AppLayout>
  );
}

