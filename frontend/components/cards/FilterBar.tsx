import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { issuersAPI } from '@/lib/api';
import { useDebounce } from '@/lib/hooks';

interface Issuer {
  id: string;
  name: string;
}

const COMMON_CATEGORIES = [
  'Fashion',
  'Food',
  'Electronics',
  'Home',
  'Beauty',
  'Travel',
  'Entertainment'
];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  
  // State for filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [issuerId, setIssuerId] = useState(searchParams.get('issuerId') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [hideExpired, setHideExpired] = useState(searchParams.get('isExpired') === 'false');
  
  // Debounced search term
  const debouncedSearch = useDebounce(search, 500);

  // Fetch issuers on mount
  useEffect(() => {
    const fetchIssuers = async () => {
      try {
        const res = await issuersAPI.getAll();
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setIssuers(data);
      } catch (err) {
        // console.error('Failed to fetch issuers', err); // Removed console.error for clean build logs
      }
    };
    fetchIssuers();
  }, []);

  // Sync state with URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset pagination when filtering
    params.delete('page');

    if (debouncedSearch) params.set('search', debouncedSearch);
    else params.delete('search');

    if (issuerId) params.set('issuerId', issuerId);
    else params.delete('issuerId');

    if (category) params.set('category', category);
    else params.delete('category');
    
    // isExpired logic: 
    // If hideExpired is true, we want only valid cards -> isExpired=false
    // If hideExpired is false (default), we show all (undefined)
    if (hideExpired) {
      params.set('isExpired', 'false');
    } else {
      params.delete('isExpired');
    }

    // Only push if params changed to avoid loop
    const currentString = searchParams.toString();
    const newString = params.toString();
    
    if (currentString !== newString) {
      router.replace(`?${newString}`);
    }
  }, [debouncedSearch, issuerId, category, hideExpired, router, searchParams]);

  const clearFilters = () => {
    setSearch('');
    setIssuerId('');
    setCategory('');
    setHideExpired(false);
    router.replace('?');
  };

  const hasActiveFilters = issuerId || category || hideExpired;

  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            isOpen || hasActiveFilters
              ? 'bg-primary-50 border-primary-200 text-primary-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter size={20} />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {isOpen && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <X size={16} /> Clear all
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Issuer Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
              <select
                value={issuerId}
                onChange={(e) => setIssuerId(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">All Issuers</option>
                {issuers.map((issuer) => (
                  <option key={issuer.id} value={issuer.id}>
                    {issuer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Hide Expired Toggle */}
            <div className="flex items-end pb-2">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideExpired}
                  onChange={(e) => setHideExpired(e.target.checked)}
                  className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5 border-gray-300"
                />
                <span className="text-gray-700 font-medium">Hide Expired Cards</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

