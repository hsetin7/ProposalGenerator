# Proposal Generator

A full-stack proposal management portal built with Next.js, Prisma, and PostgreSQL. Supports user authentication, tiered proposal creation, booking scheduling, and payment tracking.

## Features

- **Authentication** — JWT-based signup/login with bcrypt password hashing
- **Proposals** — Create and manage proposals with BASIC/PREMIUM tier support
- **Bookings** — Schedule start/end time slots tied to proposals
- **Payments** — Track payment status per proposal
- **Doc Generation** — Generate `.docx` proposal documents via `generate-doc.mjs`

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| ORM | Prisma 7 |
| Database | PostgreSQL (Supabase) |
| Auth | JWT + bcryptjs |

## Project Structure

```
ProposalGenerator/
├── generate-doc.mjs          # Script to generate Word proposal documents
├── prompt.txt                # Prompt used to scaffold the project
├── proposal-portal/          # Main Next.js application
│   ├── app/
│   │   ├── api/              # API routes (auth, proposal, booking, payment)
│   │   ├── auth/             # Login & signup pages
│   │   ├── booking/          # Booking page
│   │   ├── dashboard/        # User dashboard
│   │   └── payment/          # Payment page
│   ├── lib/                  # Auth helpers, Prisma client
│   └── prisma/               # Schema and migrations
```

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (Supabase recommended)

### Installation

```bash
cd proposal-portal
npm install
```

### Environment Variables

Create a `.env` file in `proposal-portal/`:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
```

### Database Setup

```bash
cd proposal-portal
npx prisma migrate deploy
```

### Run Locally

```bash
cd proposal-portal
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Generate a Proposal Document

From the root directory:

```bash
node generate-doc.mjs
```

## Deployment

This app is ready to deploy on [Vercel](https://vercel.com). Set `DATABASE_URL` and `JWT_SECRET` as environment variables in your Vercel project settings before deploying.

The build command (`prisma generate && next build`) is already configured in `package.json`.
