# GiftWallet IL — MVP (Issuer → CardProduct → Store → UserCard)

GiftWallet IL is a web MVP (Next.js + Express + Prisma/PostgreSQL) for Israeli gift cards.

Core value:
- Users store their **UserCards**
- Each UserCard points to a **CardProduct** (a specific “sub-card” under an Issuer)
- CardProducts define exactly **which Stores** accept them
- Users can search a store and see **only stores where they can spend** (sum of balances > 0)

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

6. Seed initial data (issuers, card products, stores, mappings):
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
- **users** - User accounts
- **issuers** - Issuers (e.g. BuyMe, Max, Dreamcard)
- **card_products** - Issuer sub-products that define store compatibility
- **stores** - Stores
- **card_product_stores** - Many-to-many mapping (CardProduct ↔ Store)
- **user_cards** - User-owned cards with balance, optional expiry, encrypted full code

## 🔐 Security

- Password hashing with bcrypt
- JWT-based authentication
- Encrypted card codes (AES-256)
- Input validation and sanitization
- Rate limiting
- CORS protection

## 🧪 Testing

Run the test suite:
```bash
cd backend && npm test
```

Tests are **unit tests** with mocked Prisma (no Postgres required).

## 🔌 API (MVP)

Auth:
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`

Cards (UserCard):
- `GET /api/v1/cards`
- `POST /api/v1/cards`
- `GET /api/v1/cards/:id`
- `DELETE /api/v1/cards/:id`
- `POST /api/v1/cards/:id/mark-used`
- `GET /api/v1/cards/:id/full-code`
- `GET /api/v1/cards/:id/establishments` (stores for the card’s CardProduct)

Stores (“establishments”):
- `GET /api/v1/establishments/search?q=...`  
  Returns **only stores where the user has total balance > 0**.
- `GET /api/v1/establishments/:id/my-cards`  
  Returns `{ store, totalAmount, cards[] }`.

## 🔎 How search works (backend)

1. Load user’s **active UserCards** with `balance > 0`
2. Expand each UserCard’s `cardProduct.stores`
3. Group by store, compute `totalAmount`
4. Filter by `q` match and return only stores where `totalAmount > 0`

## 🧨 Breaking changes (important)

- Schema changed completely: old `Card/Establishment` relations were replaced by `Issuer/CardProduct/Store/UserCard`.
- Removed non-MVP features: password reset/refresh, reminders, stats, profile/edit/export.
- Requires a new migration (likely a reset if you had data).

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

