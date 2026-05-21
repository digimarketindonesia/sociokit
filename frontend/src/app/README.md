# SocioTools - Social Media Management Platform

A comprehensive SaaS platform for social media management with powerful automation tools, built with Next.js 14 and NestJS.

## 🚀 Features

### MVP Features (Phase 1)
- ✅ **Authentication & User Management**
  - JWT-based authentication
  - User registration with referral system
  - Role-based access control (User/Admin)

- ✅ **Facebook Account Management**
  - Cookie-based authentication
  - Multiple account support
  - Fanpage auto-fetch
  - Proxy support per account

- ✅ **Auto Post to Groups & Fanpages**
  - Multi-account posting
  - Post to multiple groups and fanpages simultaneously
  - Auto-share to Story option
  - Post scheduling with delays
  - Thread configuration
  - Background job processing

- ✅ **Shortlink System**
  - Multiple domain support (admin-managed)
  - Country/device-based routing
  - Fake URL/Content cloaking
  - Click tracking and analytics

- ✅ **Subscription & Payment**
  - Multiple plans (1, 3, 6, 12 months)
  - Tripay payment gateway integration
  - Xendit payment gateway integration
  - Manual bank transfer with proof upload
  - Admin payment verification

- ✅ **Affiliate System**
  - Configurable commission rates (admin)
  - Referral tracking
  - Earnings dashboard
  - Withdrawal requests
  - Admin withdrawal processing

- ✅ **Admin Dashboard**
  - User management
  - Domain management
  - Bank account management
  - Payment verification
  - Subscription plan management
  - Affiliate settings
  - System statistics

### Phase 2 Features (Coming Soon)
- 🔄 AI Copywriting (OpenAI, Claude, Gemini)
- 🔄 AI Image Generation (DALL-E, Stable Diffusion)
- 🔄 Threads.com integration
- 🔄 Instagram tools
- 🔄 Twitter automation
- 🔄 FP Card Content
- 🔄 Carousel to Link

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis + Bull
- **Authentication**: JWT with refresh tokens
- **Payment**: Tripay, Xendit
- **Encryption**: AES-256 for sensitive data

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: Axios with interceptors

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database Migrations**: Prisma Migrate
- **Process Manager**: PM2 (production)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd sociotools
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Update DATABASE_URL, JWT secrets, payment gateway keys, etc.

# Start PostgreSQL and Redis with Docker
docker-compose up -d

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed database (creates admin user, plans, etc.)
npm run prisma:seed

# Start development server
npm run start:dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local if needed
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🔑 Default Credentials

After seeding the database:

**Admin Account:**
- Email: `admin@sociotools.com`
- Password: `Admin@123456`

**Test Bank Accounts:**
- BCA: 1234567890
- Mandiri: 0987654321
- BNI: 1122334455

## 📁 Project Structure

```
sociotools/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/          # Authentication
│   │   │   ├── users/         # User management
│   │   │   ├── admin/         # Admin operations
│   │   │   ├── social/        # Social media integrations
│   │   │   ├── tools/         # Tools (auto-post, shortlink)
│   │   │   ├── payment/       # Payment processing
│   │   │   ├── subscription/  # Subscription management
│   │   │   └── affiliate/     # Affiliate system
│   │   ├── common/            # Shared utilities
│   │   └── database/          # Database & Prisma
│   └── prisma/
│       ├── schema.prisma      # Database schema
│       └── seed.ts            # Database seeder
│
├── frontend/                   # Next.js App
│   ├── src/
│   │   ├── app/               # App router pages
│   │   │   ├── (auth)/        # Auth pages
│   │   │   ├── (dashboard)/   # User dashboard
│   │   │   ├── admin/         # Admin dashboard
│   │   │   └── (landing)/     # Landing page
│   │   ├── components/        # React components
│   │   ├── lib/               # Utilities
│   │   ├── hooks/             # Custom hooks
│   │   └── services/          # API services
│   └── public/
│
└── docker-compose.yml         # PostgreSQL + Redis
```

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sociotools
REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

ENCRYPTION_KEY=32-character-key-here

TRIPAY_API_KEY=your-tripay-api-key
TRIPAY_PRIVATE_KEY=your-tripay-private-key
TRIPAY_MERCHANT_CODE=your-merchant-code

XENDIT_SECRET_KEY=your-xendit-secret-key
XENDIT_WEBHOOK_TOKEN=your-webhook-token
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=SocioTools
```

## 🚀 Deployment

### Backend Deployment
1. Build the application:
```bash
npm run build
```

2. Start with PM2:
```bash
pm2 start dist/main.js --name sociotools-api
```

### Frontend Deployment
1. Build for production:
```bash
npm run build
```

2. Deploy to Vercel (recommended):
```bash
vercel --prod
```

Or use PM2:
```bash
pm2 start npm --name sociotools-web -- start
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/me` - Get user profile
- `GET /api/users/me/subscription` - Get active subscription
- `GET /api/users/me/stats` - Get user statistics
- `PUT /api/users/me` - Update profile
- `PUT /api/users/me/password` - Change password

### Social Accounts
- `GET /api/social/facebook/accounts` - List accounts
- `POST /api/social/facebook/accounts` - Add account
- `DELETE /api/social/facebook/accounts/:id` - Delete account
- `GET /api/social/facebook/accounts/:id/fanpages` - Get fanpages

### Auto Post
- `GET /api/tools/auto-post` - List posts
- `POST /api/tools/auto-post` - Create post
- `GET /api/tools/auto-post/:id` - Get post details
- `DELETE /api/tools/auto-post/:id` - Delete post

### Shortlinks
- `GET /api/tools/shortlinks` - List shortlinks
- `POST /api/tools/shortlinks` - Create shortlink
- `DELETE /api/tools/shortlinks/:id` - Delete shortlink
- `GET /api/tools/shortlinks/domains` - List domains (admin)

### Payments
- `GET /api/subscriptions/plans` - List subscription plans
- `POST /api/payments/tripay` - Create Tripay payment
- `POST /api/payments/xendit` - Create Xendit payment
- `POST /api/payments/manual` - Upload manual payment proof

### Affiliate
- `GET /api/affiliate/me` - Get affiliate info
- `GET /api/affiliate/earnings` - List earnings
- `POST /api/affiliate/withdrawals` - Request withdrawal
- `GET /api/affiliate/withdrawals` - List withdrawals

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test
npm run test:e2e
npm run test:cov
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 📊 Database Schema

Key models:
- **User** - User accounts with roles and affiliate codes
- **Plan** - Subscription plans (1, 3, 6, 12 months)
- **Subscription** - User subscriptions
- **Payment** - Payment records (Tripay, Xendit, Manual)
- **SocialAccount** - Connected social media accounts
- **Fanpage** - Facebook fanpages
- **Post** - Auto-post records
- **Domain** - Shortlink domains (admin-managed)
- **Shortlink** - Generated shortlinks
- **AffiliateEarning** - Affiliate commissions
- **Withdrawal** - Withdrawal requests

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support, email support@sociotools.com or join our Telegram group.

## 🗺️ Roadmap

- [x] MVP Phase 1 (Weeks 1-12)
  - [x] Authentication & user management
  - [x] Facebook tools
  - [x] Shortlink system
  - [x] Payment integration
  - [x] Affiliate system
  - [x] Admin dashboard

- [ ] Phase 2 (Weeks 13-16)
  - [ ] AI copywriting integration
  - [ ] AI image generation
  - [ ] Threads.com support
  - [ ] Instagram tools
  - [ ] Twitter automation

- [ ] Phase 3 (Future)
  - [ ] Mobile app (React Native)
  - [ ] Advanced analytics
  - [ ] Team collaboration features
  - [ ] API for third-party integrations

---

Built with ❤️ by SocioTools Team
