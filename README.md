# Fintech Frontend

Modern financial management web application built with Next.js 16. Provides secure authentication, wallet management, transaction features, and financial analysis tools.

## Overview

This is the client-side application for the fintech platform. It communicates with the backend API to provide users with a complete digital wallet and financial management experience.

## Features

### Authentication
- User registration with email verification
- Secure login with JWT tokens
- Password reset flow
- Google OAuth integration
- Demo account mode for testing

### Dashboard
- Financial overview and account summary
- Real-time wallet balance
- Recent transaction history
- Cash flow visualization
- Customizable widget layout
- Transfer limit tracking

### Wallet Management
- View wallet balance and account number
- Transaction history with filtering
- Multiple transaction types support

### Financial Operations
- **Top Up**: Add funds to wallet
- **Transfer**: Send money to other accounts
- **Withdrawal**: Withdraw funds from wallet

### Financial Analysis
- Cash flow trends and charts
- Income vs expense breakdown
- Monthly financial summaries
- Interactive data visualization

### User Settings
- Profile management
- Notification preferences
- Security settings

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2
- **Language**: TypeScript 5
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library
- **E2E Testing**: Playwright

## Architecture

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (authenticated)/   # Protected routes
│   │   ├── dashboard/
│   │   ├── analysis/
│   │   ├── settings/
│   │   ├── topup/
│   │   ├── transfer/
│   │   └── withdrawal/
│   ├── auth/              # OAuth callback
│   ├── check-email/
│   ├── verify-email/
│   └── forgot-password/
├── features/              # Feature modules
│   ├── auth/
│   └── dashboard/
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI primitives
│   ├── layout/           # Layout components
│   ├── auth/
│   └── dashboard/
├── api/                   # API client
├── store/                 # Zustand stores
├── lib/                   # Utilities
└── test/                  # Test setup and E2E
```

### API Communication

- Base URL configured via `NEXT_PUBLIC_API_URL`
- JWT access tokens stored in localStorage
- Automatic token refresh via refresh tokens
- React Query for caching and state management

### Authentication Flow

1. User registers → email verification required
2. Login → JWT access + refresh tokens
3. Tokens stored in localStorage via Zustand
4. Protected routes check auth state
5. OAuth: Google → backend callback → token exchange

### Demo Mode

Demo accounts provide:
- Isolated testing environment
- Simulated financial operations
- No real money involved
- Pre-populated transaction data

## Environment Variables

Create `.env.local` for local development:

```bash
# Backend API endpoint
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# Google OAuth (if using OAuth)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
```

**Never commit real credentials or secrets.**

## Local Development

### Prerequisites

- Node.js 20.19+ or 22+
- npm or equivalent package manager

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Runs on `http://0.0.0.0:3002` by default.

### Build

```bash
npm run build
```

### Production Server

```bash
npm start
```

### Linting

```bash
npm run lint
```

### Testing

```bash
# Unit/integration tests
npm test

# Watch mode
npm run test:watch

# E2E tests
npm run e2e
```

### Type Generation

Generate TypeScript types from backend OpenAPI spec:

```bash
npm run openapi:types
```

Requires backend running at `http://localhost:3000`.

## Deployment

Frontend is optimized for Vercel deployment with static generation where possible.

**Environment variables must be configured in deployment platform:**
- `NEXT_PUBLIC_API_URL`: production backend URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID (if using OAuth)

## Security

- JWT tokens stored client-side (localStorage)
- HTTPS enforced in production
- Input validation via Zod schemas
- XSS protection via React's built-in escaping
- OAuth state parameter for CSRF protection
- No sensitive data in client-side code

## Demo Mode

Demo accounts are completely isolated from real accounts. All financial operations in demo mode are simulated and do not involve real money.

To use demo mode, click "Try Demo Account" on the login page.

## Related Repositories

- Backend API: [rizzsv/fintech](https://github.com/rizzsv/fintech)

## License

Private repository. All rights reserved.
