# Proposal Review & Booking Portal — CLAUDE.md

## Project Overview
A full-stack web app where clients log in, review a proposal, select a tier, book training sessions (Enhanced only), and pay.

## Stack
- **Framework**: Next.js 16 (App Router, TypeScript, Turbopack)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Prisma 7 + SQLite via LibSQL (`@prisma/adapter-libsql`)
- **Auth**: JWT (jsonwebtoken) + bcryptjs for password hashing
- **Payment**: Mock / simulated checkout (no real Stripe keys needed)

## Prisma v7 Notes
- Generator: `prisma-client` (not `prisma-client-js`) — client output at `app/generated/prisma/`
- Import from: `@/app/generated/prisma/client`
- Connection: `PrismaLibSql` adapter from `@prisma/adapter-libsql` (no `url` in schema)
- Config: `prisma.config.ts` holds `datasource.url` (uses dotenv)

## Key Rules
1. Always use the App Router (`app/` directory) — no `pages/` dir
2. All DB access goes through Prisma client (`lib/prisma.ts`)
3. Passwords must be hashed with bcryptjs before storing
4. JWT secret lives in `.env` as `JWT_SECRET`
5. Booking is only available when `tier === "ENHANCED"`
6. Users must book exactly **5 slots × 2 hours** in the future before paying

## Database Models
- `User` — id, email, passwordHash, createdAt
- `Proposal` — id, userId, tier (BASIC|ENHANCED), status
- `Booking` — id, proposalId, startTime, endTime
- `Payment` — id, proposalId, amount, status, createdAt

## Routes
| Path | Purpose |
|------|---------|
| `/` | Redirect → `/auth/login` |
| `/auth/login` | Login page |
| `/auth/signup` | Signup page |
| `/dashboard` | Proposal details + tier selection |
| `/booking` | Calendar — Enhanced only |
| `/payment` | Checkout page |

## API Routes
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET/POST /api/proposal`
- `GET/POST /api/booking`
- `POST /api/payment`

## Progress Tracker
- [x] Next.js project initialized
- [x] Dependencies installed (prisma, lucide-react, bcryptjs, jwt, libsql)
- [x] Prisma schema + migration (SQLite `prisma/dev.db`)
- [x] Auth pages + API routes (`/auth/login`, `/auth/signup`)
- [x] Proposal dashboard + tier selection (`/dashboard`)
- [x] Booking calendar — Enhanced only (`/booking`)
- [x] Payment page — mock checkout (`/payment`)
- [x] TypeScript check passing
- [x] Dev server running at http://localhost:3000
