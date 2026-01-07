/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  i18n: {
    locales: ['he', 'en'],
    defaultLocale: 'he',
    localeDetection: false,
  },
};

module.exports = nextConfig;

