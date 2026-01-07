# GiftWallet IL - Gift Card Wallet App

A bilingual (Hebrew/English) mobile-friendly web application for Israeli users to manage gift cards from multiple issuers in one unified wallet.

## 🎯 Features

- 📱 Store all gift cards in one place with visual card representations
- 💰 Track balances and expiry dates with quick update options
- 🔔 Automatic reminders before cards expire
- 🏢 Support for BuyMe, Max, Dreamcard, Tav Tzahav, and other issuers
- 🌐 Bilingual support (Hebrew/English) with RTL layout
- 📊 Statistics and insights dashboard
- 🔒 Secure encryption for sensitive card data

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd giftwallet-il
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

4. Configure your database and other settings in `.env` files.

5. Run database migrations:
```bash
npm run db:migrate
```

6. Seed initial data (issuers):
```bash
npm run db:seed
```

7. Start development servers:
```bash
npm run dev
```

- Backend API: http://localhost:3001
- Frontend App: http://localhost:3000

## 📁 Project Structure

```
giftwallet-il/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── utils/
│   ├── prisma/       # Database schema & migrations
│   └── jobs/         # Scheduled tasks
├── frontend/         # Next.js React app
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── lib/          # Utilities & API client
│   ├── public/       # Static assets
│   └── styles/       # Global styles
└── docs/             # Documentation
```

## 🗄️ Database Schema

See `backend/prisma/schema.prisma` for the complete database schema.

### Main Tables:
- **Users** - User accounts and preferences
- **Issuers** - Gift card issuers (BuyMe, Max, etc.)
- **GiftCards** - User's gift cards
- **Reminders** - Expiry reminders
- **BalanceHistory** - Balance change tracking

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Encrypted card codes (AES-256)
- Input validation and sanitization
- Rate limiting
- CORS protection
- CSRF tokens

## 🌐 Bilingual Support

The app supports Hebrew and English with:
- Full UI translations
- RTL layout for Hebrew
- Language preference per user
- Translated email notifications

## 📧 Email Notifications

Automatic reminders are sent:
- 30 days before expiry
- 7 days before expiry

Configure email settings in `backend/.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

See `docs/TESTING.md` for comprehensive test scenarios.

## 📱 Progressive Web App

The app is installable as a PWA on mobile devices. Install it from your browser's menu.

## 🚢 Deployment

See `docs/DEPLOYMENT.md` for deployment instructions.

## 📄 License

MIT License

## 👥 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📞 Support

For issues and questions, please open an issue on GitHub.

