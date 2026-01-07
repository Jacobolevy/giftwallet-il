'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, User } from 'lucide-react';
import { getTranslation } from '@/lib/translations';
import { useAuthStore } from '@/lib/store';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const lang = user?.languagePreference || 'he';

  const t = (key: any) => getTranslation(lang, key);

  const navItems = [
    { href: '/wallet', icon: Home, label: t('nav_home') },
    { href: '/cards/add', icon: Plus, label: t('nav_add') },
    { href: '/profile', icon: User, label: t('nav_profile') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

