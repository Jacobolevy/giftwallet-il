import type { Metadata } from 'next';
import { Inter, Rubik } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const rubik = Rubik({ subsets: ['hebrew', 'latin'], variable: '--font-rubik' });

export const metadata: Metadata = {
  title: 'GiftWallet IL - Manage Your Gift Cards',
  description: 'Manage all your Israeli gift cards in one place',
  manifest: '/manifest.json',
  icons: [{ rel: 'icon', url: '/icon.svg', type: 'image/svg+xml' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${inter.variable} ${rubik.variable} font-sans`}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

