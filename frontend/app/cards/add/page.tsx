'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { cardsAPI, issuersAPI } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface Issuer {
  id: string;
  name: string;
  websiteUrl?: string;
  logoUrl?: string;
  products: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

export default function AddCardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const lang = user?.languagePreference || 'he';
  const t = (key: any) => getTranslation(lang, key);

  const [step, setStep] = useState(1);
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    issuerId: '',
    cardProductId: '',
    nickname: '',
    codeLast4: '',
    fullCode: '',
    balance: '',
    expiresAt: '',
  });

  useEffect(() => {
    loadIssuers();
  }, []);

  const loadIssuers = async () => {
    try {
      const response = await issuersAPI.getAll();
      // Defensive: ensure we always get an array
      const issuersArray = Array.isArray(response.data) ? response.data : [];
      setIssuers(issuersArray);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || t('common_error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        cardProductId: formData.cardProductId,
        nickname: formData.nickname || undefined,
        codeLast4: formData.codeLast4,
        fullCode: formData.fullCode || undefined,
        balance: formData.balance ? parseFloat(formData.balance) : undefined,
        expiresAt: formData.expiresAt || undefined,
      };

      await cardsAPI.create(data);
      toast.success(t('common_success'));
      router.push('/wallet');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || t('common_error'));
    } finally {
      setLoading(false);
    }
  };

  const selectedIssuer = issuers.find((i) => i.id === formData.issuerId);
  const selectedProduct = selectedIssuer?.products.find((p) => p.id === formData.cardProductId);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">{t('add_card_title')}</h1>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {t('add_card_step1')} / {t('add_card_step2')}
            </span>
            <span className="text-sm text-gray-500">
              Step {step} of 2
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('add_card_issuer')} *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {issuers.map((issuer) => (
                    <button
                      key={issuer.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, issuerId: issuer.id, cardProductId: '' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.issuerId === issuer.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold">
                        {issuer.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Product *
                </label>
                <select
                  value={formData.cardProductId}
                  onChange={(e) => setFormData({ ...formData, cardProductId: e.target.value })}
                  required
                  disabled={!selectedIssuer}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="" disabled>
                    {selectedIssuer ? 'Select a Card Product' : 'Select an Issuer first'}
                  </option>
                  {(selectedIssuer?.products || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {selectedProduct?.description && (
                  <p className="text-sm text-gray-500 mt-2">{selectedProduct.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nickname (optional)
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. Work gift, Mom's card"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('add_card_code')} *
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="codeType"
                        checked={!formData.fullCode}
                        onChange={() => setFormData({ ...formData, fullCode: '' })}
                        className="mr-2"
                      />
                      <span>{t('add_card_code_last4')}</span>
                    </label>
                    <input
                      type="text"
                      value={formData.codeLast4}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          codeLast4: e.target.value.replace(/\D/g, '').slice(0, 4),
                        })
                      }
                      required
                      maxLength={4}
                      pattern="\d{4}"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="1234"
                    />
                  </div>
                  <div>
                    <label className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="codeType"
                        checked={!!formData.fullCode}
                        onChange={() => setFormData({ ...formData, codeLast4: '' })}
                        className="mr-2"
                      />
                      <span>{t('add_card_code_full')}</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fullCode: e.target.value.replace(/\D/g, ''),
                          codeLast4: e.target.value.slice(-4),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="1234567890123456"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.issuerId || !formData.cardProductId || !formData.codeLast4}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('add_card_next')}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Balance (₪) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expires At (optional)
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  {t('add_card_back')}
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.balance}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('common_loading') : t('add_card_save')}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </AppLayout>
  );
}
