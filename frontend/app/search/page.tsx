'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { establishmentsAPI } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { useAuthStore } from '@/lib/store';
import { useDebounce } from '@/lib/hooks';
import toast from 'react-hot-toast';
import { 
  Search, 
  MapPin, 
  ChevronRight, 
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Card {
  id: string;
  nickname?: string;
  balance: number;
  cardProduct: {
    id: string;
    name: string;
    issuer: { id: string; name: string; logoUrl?: string };
  };
}

interface StoreResult {
  id: string;
  name: string;
  logoUrl?: string;
  totalAmount: number;
  cards: Card[];
}

export default function SearchPage() {
  const { user } = useAuthStore();
  const lang = user?.languagePreference || 'he';
  const t = (key: any) => getTranslation(lang, key);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StoreResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = useCallback(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, []);

  const saveRecentSearch = useCallback((searchTerm: string) => {
    if (searchTerm.length < 2) return;
    const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  }, [recentSearches]);

  const searchEstablishments = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await establishmentsAPI.search(searchQuery || undefined);
      setResults(response.data.stores || []);
      setHasSearched(true);
      if (searchQuery && searchQuery.length >= 2) {
        saveRecentSearch(searchQuery);
      }
    } catch (error) {
      toast.error(t('common_error'));
    } finally {
      setLoading(false);
    }
  }, [saveRecentSearch, t]);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchEstablishments(debouncedQuery);
    } else if (debouncedQuery.length === 0 && hasSearched) {
      setResults([]);
      setHasSearched(false);
    }
  }, [debouncedQuery, hasSearched, searchEstablishments]);

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('search_stores_title')}
          </h1>
          
          {/* Search Input */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search_stores_placeholder')}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              autoFocus
            />
          </div>
        </div>

        {/* Recent Searches */}
        {!hasSearched && !loading && recentSearches.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">{t('search_recent')}</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        )}

        {/* Results */}
        {!loading && hasSearched && (
          <>
            {results.length > 0 && (
              <div className="space-y-3">
                {results.map((establishment) => (
                  <EstablishmentCard key={establishment.id} establishment={establishment} />
                ))}
              </div>
            )}

            {/* No Results */}
            {results.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t('search_no_results')}</p>
              </div>
            )}
          </>
        )}

        {/* Initial State */}
        {!hasSearched && !loading && (
          <div className="text-center py-12 text-gray-500">
            <Search size={48} className="mx-auto mb-4 opacity-30" />
            <p>{t('search_hint')}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// Establishment Card Component
function EstablishmentCard({
  establishment,
}: {
  establishment: StoreResult;
}) {
  const name = establishment.name;
  const total = establishment.totalAmount || 0;
  const cardsCount = establishment.cards?.length || 0;

  return (
    <Link
      href={`/search/${establishment.id}`}
      className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {establishment.logoUrl ? (
            <Image
              src={establishment.logoUrl}
              alt={name}
              width={48}
              height={48}
              unoptimized
              className="w-12 h-12 rounded-lg object-contain bg-gray-50"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <MapPin size={24} className="text-gray-400" />
            </div>
          )}
          
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{cardsCount} cards usable here</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xl font-bold text-primary-600">₪{Number(total).toFixed(0)}</p>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </div>
      </div>
    </Link>
  );
}

