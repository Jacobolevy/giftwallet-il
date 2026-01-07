# Setup Guide

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Git

## Installation Steps

### 1. Clone and Install

```bash
cd giftwallet-il
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database:
```bash
createdb giftwallet
```

2. Configure database connection in `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/giftwallet?schema=public"
```

### 3. Environment Variables

#### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

DATABASE_URL="postgresql://user:password@localhost:5432/giftwallet?schema=public"

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Dev-only: enable demo/sandbox login endpoint (NEVER enable in production)
ENABLE_DEV_LOGIN=true
# Optional: customize demo user identity
DEV_DEMO_EMAIL=demo@giftwallet.local

ENCRYPTION_KEY=your-32-byte-hex-encryption-key-here

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@giftwallet.il
EMAIL_FROM_NAME=GiftWallet IL

MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

TZ=Asia/Jerusalem
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Dev-only: show "Entrar como demo" + enable /sandbox auto-login
NEXT_PUBLIC_ENABLE_DEV_LOGIN=true
```

### 4. Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to `ENCRYPTION_KEY` in `backend/.env`.

### 5. Database Migration

```bash
npm run db:migrate
```

### 6. Seed Initial Data

```bash
npm run db:seed
```

This will create the initial issuers (BuyMe, Max, Dreamcard, Tav Tzahav, Other).

### 7. Start Development Servers

```bash
npm run dev
```

This will start:
- Backend API: http://localhost:3001
- Frontend App: http://localhost:3000

## Sandbox / Demo Mode (no login)

If you enabled the flags above:

- Open `http://localhost:3000/sandbox` to auto-login as a demo user and jump into the app
- Or go to the normal login screen and click **"Entrar como demo"**

## Testing

See `docs/TESTING.md` for comprehensive test scenarios.

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### Port Already in Use
- Change PORT in `backend/.env`
- Change port in `frontend/.env.local` and update NEXT_PUBLIC_API_URL

### Email Not Sending
- Verify SMTP credentials
- For Gmail, use App Password (not regular password)
- Check firewall/network settings

