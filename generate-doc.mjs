import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, NumberFormat, LevelFormat
} from "docx";
import { writeFileSync } from "fs";

const BLUE = "1E40AF";
const LIGHT_BLUE = "DBEAFE";
const DARK = "111827";
const GRAY = "6B7280";
const LIGHT_GRAY = "F3F4F6";
const GREEN = "065F46";
const LIGHT_GREEN = "D1FAE5";

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE } },
    run: { bold: true, color: BLUE, size: 36 },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 80 },
    run: { bold: true, color: BLUE, size: 28 },
  });
}

function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 60 },
    run: { bold: true, color: DARK, size: 24 },
  });
}

function body(text, options = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, color: DARK, ...options })],
    spacing: { before: 60, after: 60 },
  });
}

function bullet(text, bold = false) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, color: DARK, bold })],
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
  });
}

function subbullet(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, color: GRAY })],
    bullet: { level: 1 },
    spacing: { before: 20, after: 20 },
  });
}

function code(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "DC2626", shading: { type: ShadingType.CLEAR, fill: LIGHT_GRAY } })],
    spacing: { before: 40, after: 40 },
    indent: { left: 360 },
  });
}

function gap(size = 120) {
  return new Paragraph({ text: "", spacing: { before: size } });
}

function tableRow(cells, header = false) {
  return new TableRow({
    tableHeader: header,
    children: cells.map((text, i) =>
      new TableCell({
        shading: header ? { type: ShadingType.CLEAR, fill: BLUE } : (i === 0 ? { type: ShadingType.CLEAR, fill: LIGHT_GRAY } : undefined),
        children: [new Paragraph({
          children: [new TextRun({ text, bold: header || i === 0, color: header ? "FFFFFF" : DARK, size: 20 })],
          spacing: { before: 60, after: 60 },
        })],
        margins: { top: 80, bottom: 80, left: 140, right: 140 },
      })
    ),
  });
}

function makeTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableRow(headers, true),
      ...rows.map(r => tableRow(r)),
    ],
  });
}

function callout(text, fill = LIGHT_BLUE, color = BLUE) {
  return new Paragraph({
    children: [new TextRun({ text, size: 20, color, bold: true })],
    shading: { type: ShadingType.CLEAR, fill },
    spacing: { before: 100, after: 100 },
    indent: { left: 360, right: 360 },
    border: {
      left: { style: BorderStyle.THICK, size: 12, color },
    },
  });
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22, color: DARK } },
    },
  },
  sections: [{
    properties: {
      page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } },
    },
    children: [

      /* ─── COVER ─── */
      gap(600),
      new Paragraph({
        children: [new TextRun({ text: "Proposal Review & Booking Portal", bold: true, size: 56, color: BLUE })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Project Documentation", size: 32, color: GRAY })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "April 19, 2026  •  Built with Next.js 16, Prisma 7, SQLite", size: 22, color: GRAY })],
        alignment: AlignmentType.CENTER,
      }),
      gap(400),
      new Paragraph({ text: "", border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_BLUE } } }),
      gap(200),

      /* ─── 1. PROJECT OVERVIEW ─── */
      h1("1. Project Overview"),
      body("The Proposal Review & Booking Portal is a full-stack web application built for a data analytics consulting engagement. It allows a client to securely log in, review a structured project proposal, choose between two service tiers, book 1-on-1 training sessions (Enhanced tier only), and complete a simulated payment — all in a single, clean interface."),
      gap(),
      callout("Live URL (local dev): http://localhost:3000   |   Project folder: ProposalGenerator/proposal-portal"),
      gap(),

      h2("1.1 Business Purpose"),
      bullet("Replace manual PDF proposals with an interactive, self-serve portal"),
      bullet("Let clients compare tiers, select their package, and book sessions without back-and-forth emails"),
      bullet("Capture tier selection and booking data in a database for the consultant to review"),
      bullet("Simulate the full payment flow to demonstrate a production-ready checkout experience"),

      h2("1.2 Target Users"),
      bullet("Client — logs in, reviews proposal, selects tier, books sessions, pays"),
      bullet("Consultant (future) — can view client selections and confirmed bookings from the database"),

      /* ─── 2. HOW THE WEBSITE WORKS ─── */
      h1("2. How the Website Works"),

      h2("2.1 User Flow"),
      body("The application guides the user through a linear, gated flow:"),
      gap(80),
      makeTable(
        ["Step", "Route", "What Happens"],
        [
          ["1", "/", "Auto-redirect: signed-in users go to /dashboard, guests go to /auth/login"],
          ["2", "/auth/signup", "New users create an account (email + password). Password is hashed with bcrypt before storage."],
          ["3", "/auth/login", "Existing users sign in. A JWT token is issued and stored in an httpOnly cookie (7-day expiry)."],
          ["4", "/dashboard", "Client sees the full project proposal: scope, 8-week timeline, and tier selection cards."],
          ["5", "/dashboard", "Client selects Basic ($1,000) or Enhanced ($2,500). The choice is saved to the database immediately."],
          ["6", "/booking", "Enhanced-tier clients must book exactly 5 × 2-hour training slots in the future. A progress bar tracks completion. (Basic tier skips this step.)"],
          ["7", "/payment", "Client sees an order summary with the correct price and a simulated card form. Clicking 'Pay' records a PAID payment in the database."],
          ["8", "/dashboard", "After payment, the dashboard shows a green 'Paid' confirmation badge."],
        ]
      ),
      gap(),

      h2("2.2 Authentication"),
      bullet("Passwords are hashed using bcryptjs (10 rounds) before being stored in the database"),
      bullet("On login/signup, a JWT token is signed with a secret from the .env file"),
      bullet("The token is placed in an httpOnly cookie — invisible to JavaScript, preventing XSS token theft"),
      bullet("Every API route calls getSession() which reads and verifies the cookie server-side"),
      bullet("Sign-out clears the cookie by setting maxAge to 0"),

      h2("2.3 Proposal Dashboard"),
      bullet("Project Scope — 5 deliverables displayed with green checkmarks"),
      bullet("Timeline — 8-week breakdown with colour-coded week labels"),
      bullet("Tier Selection — two cards (Basic / Enhanced) with live 'Selected' badge on active tier"),
      bullet("Booking prompt — orange warning banner appears if Enhanced is selected but fewer than 5 slots are booked"),
      bullet("Payment button — disabled until prerequisites are met (tier selected + all bookings done if Enhanced)"),

      h2("2.4 Booking Calendar"),
      bullet("Only accessible after selecting Enhanced tier"),
      bullet("User picks a date (min = today) and start time from a dropdown (08:00–16:00)"),
      bullet("Each slot is automatically 2 hours long — the system calculates the end time"),
      bullet("A blue progress bar shows 0/5 → 5/5 completion"),
      bullet("Booked slots appear as numbered cards with start and end times"),
      bullet("Individual slots can be removed with the trash icon"),
      bullet("Once all 5 are booked, the form is replaced with a green confirmation banner"),

      h2("2.5 Payment Page"),
      bullet("Shows an order summary: package name, description, and price"),
      bullet("Displays a read-only mock card form (Stripe test card number pre-filled)"),
      bullet("'Pay' button calls POST /api/payment — validates booking completion server-side before recording the payment"),
      bullet("On success, shows a full-screen confirmation with a checkmark and the paid amount"),
      bullet("The database records payment status as PAID and proposal status as CONFIRMED"),

      /* ─── 3. TOOLS & TECH STACK ─── */
      h1("3. Tools & Technology Stack"),

      h2("3.1 Full Stack Overview"),
      gap(80),
      makeTable(
        ["Layer", "Technology", "Version", "Purpose"],
        [
          ["Framework", "Next.js", "16.2.4", "Full-stack React framework — App Router, API routes, server components"],
          ["Language", "TypeScript", "5.x", "Type-safe development across frontend and backend"],
          ["Styling", "Tailwind CSS", "4.x", "Utility-first CSS — all styling is done inline with class names"],
          ["Icons", "Lucide React", "latest", "Clean, consistent icon set used throughout the UI"],
          ["ORM", "Prisma", "7.7.0", "Type-safe database access; handles schema, migrations, and query building"],
          ["Database", "SQLite (via LibSQL)", "—", "Embedded file-based database — zero setup for local development"],
          ["DB Driver", "@prisma/adapter-libsql", "latest", "Prisma v7 requires a driver adapter; LibSQL is the SQLite implementation"],
          ["Auth - Tokens", "jsonwebtoken", "latest", "Signs and verifies JWT tokens for session management"],
          ["Auth - Hashing", "bcryptjs", "latest", "Securely hashes user passwords before storing in the database"],
          ["Config Loader", "dotenv", "latest", "Loads .env variables for Prisma config at migrate/generate time"],
          ["Runtime", "Node.js", "24.14.1", "JavaScript runtime powering the Next.js server and build tools"],
          ["Package Manager", "npm", "—", "Dependency management"],
          ["Build Tool", "Turbopack", "—", "Next.js 16's fast bundler — replaces Webpack for dev server"],
        ]
      ),
      gap(),

      h2("3.2 Project File Structure"),
      code("proposal-portal/"),
      code("├── app/"),
      code("│   ├── api/"),
      code("│   │   ├── auth/login/route.ts     POST — validate credentials, issue JWT cookie"),
      code("│   │   ├── auth/signup/route.ts    POST — hash password, create user, issue JWT"),
      code("│   │   ├── auth/logout/route.ts    POST — clear JWT cookie"),
      code("│   │   ├── proposal/route.ts       GET (fetch/create) | POST (update tier)"),
      code("│   │   ├── booking/route.ts        GET (list) | POST (add slot) | DELETE (remove)"),
      code("│   │   └── payment/route.ts        POST — validate, record payment, confirm proposal"),
      code("│   ├── auth/login/page.tsx         Login UI"),
      code("│   ├── auth/signup/page.tsx        Signup UI"),
      code("│   ├── dashboard/page.tsx          Proposal + tier selection UI"),
      code("│   ├── booking/page.tsx            Calendar booking UI"),
      code("│   ├── payment/page.tsx            Checkout + confirmation UI"),
      code("│   ├── generated/prisma/           Auto-generated Prisma v7 client (do not edit)"),
      code("│   ├── globals.css                 Global Tailwind styles"),
      code("│   ├── layout.tsx                  Root layout (font, metadata)"),
      code("│   └── page.tsx                    Root redirect logic"),
      code("├── lib/"),
      code("│   ├── prisma.ts                   PrismaClient singleton (LibSQL adapter)"),
      code("│   └── auth.ts                     signToken / verifyToken / getSession helpers"),
      code("├── prisma/"),
      code("│   ├── schema.prisma               Data models (User, Proposal, Booking, Payment)"),
      code("│   ├── migrations/                 SQL migration history"),
      code("│   └── dev.db                      SQLite database file"),
      code("├── prisma.config.ts                Prisma v7 config — datasource URL, migration path"),
      code("├── .env                            DATABASE_URL + JWT_SECRET"),
      code("└── CLAUDE.md                       Project rules and progress tracker"),
      gap(),

      h2("3.3 Database Schema"),
      gap(80),
      makeTable(
        ["Model", "Fields", "Relationships"],
        [
          ["User", "id (cuid), email (unique), passwordHash, createdAt", "has many Proposals"],
          ["Proposal", "id, userId, tier (BASIC|ENHANCED), status (PENDING|CONFIRMED), createdAt", "belongs to User; has many Bookings; has one Payment"],
          ["Booking", "id, proposalId, startTime, endTime, createdAt", "belongs to Proposal"],
          ["Payment", "id, proposalId (unique), amount (int), status (PAID), createdAt", "belongs to Proposal (one-to-one)"],
        ]
      ),
      gap(),

      /* ─── 4. THINGS TO REVIEW ─── */
      h1("4. Things to Review Before Production"),

      h2("4.1 Security"),
      bullet("JWT_SECRET — change from the placeholder to a long random string (32+ chars)", true),
      subbullet("Current value in .env is only for local dev"),
      subbullet("Use: openssl rand -base64 32 to generate a strong secret"),
      bullet("HTTPS — JWT cookies should add the Secure flag in production", true),
      subbullet("In lib/auth.ts, update cookies.set() to include: secure: process.env.NODE_ENV === 'production'"),
      bullet("Input validation — the API routes do minimal validation; consider adding Zod schema validation", true),
      bullet("Rate limiting — login endpoint has no rate limiting; brute-force attacks are possible", true),
      bullet("Password policy — currently only enforces minimum 6 characters in the UI", true),

      h2("4.2 Database"),
      bullet("✅ DONE — Database switched to Supabase PostgreSQL (deployed and running)"),
      subbullet("Prisma datasource updated to postgresql; using @prisma/adapter-pg in production"),
      subbullet("dev.db (SQLite) is in .gitignore and not deployed"),
      bullet("No database seeding — each new signup creates a fresh proposal with no pre-filled content", true),

      h2("4.3 Functional Gaps"),
      bullet("No middleware guards — routes like /dashboard and /booking are not server-side protected; a user could navigate directly if they know the URL. Add a Next.js middleware.ts to redirect unauthenticated users."),
      bullet("No email verification — users can sign up with any email without confirming ownership"),
      bullet("No password reset flow"),
      bullet("Proposal content is hardcoded in the dashboard component — move to database or CMS for real use"),
      bullet("No admin view — the consultant cannot currently see client selections without querying the database directly"),

      h2("4.4 UX / Polish"),
      bullet("No loading skeletons — pages show 'Loading…' text; consider Suspense-based skeleton components"),
      bullet("No form validation feedback beyond inline error messages (consider react-hook-form + Zod)"),
      bullet("Mobile responsiveness is basic — works but not optimised for small screens"),
      bullet("No email confirmation sent after payment"),

      /* ─── 5. DETAILED SESSION SUMMARY ─── */
      h1("5. Detailed Session Summary"),
      body("This section documents every step taken during the build session, including issues encountered and how they were resolved."),
      gap(),

      h2("5.1 Planning Phase"),
      bullet("Read prompt.txt in the ProposalGenerator folder to understand project requirements"),
      bullet("Confirmed the folder was empty (only prompt.txt existed — no existing project)"),
      bullet("Created a structured plan: Initialize → Install → Schema → Auth → Dashboard → Booking → Payment"),
      bullet("Plan was reviewed and approved before any code was written"),

      h2("5.2 Project Initialization"),
      bullet("Ran npx create-next-app@latest with TypeScript, Tailwind, App Router flags"),
      subbullet("Issue: Folder name 'ProposalGenerator' contained capital letters — rejected by npm naming rules"),
      subbullet("Fix: Initialized into a subfolder named 'proposal-portal'"),
      bullet("Next.js 16.2.4 was installed with Turbopack enabled by default"),
      bullet("The scaffolded project included a pre-existing CLAUDE.md (pointing to AGENTS.md) — overwritten with project-specific rules"),

      h2("5.3 Dependency Installation"),
      bullet("Installed: prisma, @prisma/client, lucide-react, bcryptjs, jsonwebtoken, dotenv"),
      bullet("Installed dev types: @types/bcryptjs, @types/jsonwebtoken"),
      subbullet("Issue: JWT_SECRET was appended to .env without a newline, corrupting DATABASE_URL"),
      subbullet("Symptom: Prisma error P1013 'scheme not recognized' — DATABASE_URL read as 'file:./dev.dbJWT_SECRET=...'"),
      subbullet("Fix: Rewrote .env with proper line breaks"),

      h2("5.4 Prisma v7 Breaking Changes"),
      callout("Prisma 7 is a major breaking version. Three separate issues were encountered and resolved:", LIGHT_BLUE, BLUE),
      gap(80),
      bullet("Issue 1 — url in schema.prisma no longer supported"),
      subbullet("Prisma v7 moved datasource URL to prisma.config.ts"),
      subbullet("Fix: Removed url = env(\"DATABASE_URL\") from schema.prisma; prisma.config.ts already had the correct config"),
      bullet("Issue 2 — generator provider changed from prisma-client-js to prisma-client"),
      subbullet("The new provider outputs the client to app/generated/prisma/ instead of node_modules"),
      subbullet("Fix: Reverted generator block to use provider = \"prisma-client\" with output = \"../app/generated/prisma\""),
      bullet("Issue 3 — PrismaClient requires an adapter, not just options"),
      subbullet("new PrismaClient({ log: ['error'] }) fails in v7 — accelerateUrl or adapter is required"),
      subbullet("Fix: Installed @prisma/adapter-libsql and @libsql/client; created PrismaLibSql adapter"),
      subbullet("Note: the export is PrismaLibSql (camelCase), not PrismaLibSQL (uppercase)"),

      h2("5.5 Database Migration"),
      bullet("Ran npx prisma migrate dev --name init"),
      bullet("Migration created: prisma/migrations/20260419141654_init/migration.sql"),
      bullet("SQLite database created at prisma/dev.db"),
      bullet("Ran npx prisma generate to produce the TypeScript client in app/generated/prisma/"),

      h2("5.6 Application Code"),
      bullet("lib/prisma.ts — PrismaClient singleton using LibSQL adapter; uses globalThis to prevent hot-reload re-instantiation"),
      bullet("lib/auth.ts — signToken, verifyToken, getSession helpers using Next.js cookies() API"),
      bullet("API routes — all 7 routes built with full session validation, error responses, and DB operations"),
      bullet("app/page.tsx — simple server component that redirects based on session state"),
      bullet("Auth pages — clean login/signup forms with Lucide icons, inline error display"),
      bullet("Dashboard — proposal content hardcoded, tier cards with live selection state, conditional prompts"),
      bullet("Booking page — date/time picker, slot list with delete, animated progress bar"),
      bullet("Payment page — mock card form, order summary, success state with animated confirmation"),

      h2("5.7 TypeScript & Quality Check"),
      bullet("Ran npx tsc --noEmit — all errors resolved"),
      bullet("Zero TypeScript errors in final check"),
      bullet("Dev server started successfully on http://localhost:3000 in 2.4 seconds"),

      h2("5.8 Deployment — Vercel + Supabase"),
      callout("The app was deployed to Vercel with a Supabase PostgreSQL database. Several adapter and pooler issues were resolved along the way.", LIGHT_BLUE, BLUE),
      gap(80),

      bullet("Step 1 — Switched database from SQLite → PostgreSQL"),
      subbullet("Updated prisma/schema.prisma: provider = 'sqlite' → 'postgresql'"),
      subbullet("Installed @prisma/adapter-pg and pg to replace the LibSQL adapter"),
      subbullet("Updated lib/prisma.ts to use PrismaPg with a pg Pool"),

      bullet("Step 2 — Installed Vercel CLI and authenticated"),
      subbullet("npm install -g vercel, then vercel login via browser with hsetin@gmail.com"),
      subbullet("Added postinstall: prisma generate to package.json so Vercel regenerates the client on every deploy"),
      subbullet("Updated build script to: prisma generate && next build"),

      bullet("Step 3 — First deploy attempt failed (Neon adapter type mismatch)"),
      subbullet("Initially used @prisma/adapter-neon which expected a NeonQueryFunction"),
      subbullet("Prisma v7 PrismaNeon actually takes a PoolConfig, not neon() result"),
      subbullet("Fixed then switched entirely to @prisma/adapter-pg for Supabase compatibility"),

      bullet("Step 4 — Supabase database setup"),
      subbullet("User provided Supabase connection string (Transaction pooler, port 6543)"),
      subbullet("Special character & in password required URL encoding → %26"),
      subbullet("Transaction pooler (6543) rejects DDL statements — P1017 Server closed connection"),
      subbullet("Fix: used Session pooler (5432) for prisma migrate dev, Transaction pooler (6543) for app runtime"),
      subbullet("Old SQLite migration history caused P3019 provider mismatch error"),
      subbullet("Fix: deleted prisma/migrations/, ran prisma migrate dev --name init fresh against Supabase"),
      subbullet("All 4 tables created: User, Proposal, Booking, Payment"),

      bullet("Step 5 — Environment variables set on Vercel"),
      subbullet("DATABASE_URL set to Transaction pooler URL (port 6543) for serverless runtime"),
      subbullet("JWT_SECRET set for production auth"),
      subbullet("Both variables scoped to Production environment"),

      bullet("Step 6 — Final production deploy succeeded"),
      subbullet("All 11 routes compiled: 5 API (dynamic) + 6 pages (static)"),
      subbullet("Build completed in 18 seconds on Vercel's Washington D.C. (iad1) servers"),
      subbullet("App live and fully functional with real database"),

      /* ─── 6. LIVE DEPLOYMENT ─── */
      h1("6. Live Deployment"),
      gap(80),
      callout("The app is deployed and shareable. Anyone with the link can sign up, use the portal, and have their data stored in Supabase.", LIGHT_GREEN, GREEN),
      gap(120),

      makeTable(
        ["Item", "Value"],
        [
          ["Production URL", "https://proposal-portal-2wq9itsav-hsetin-4078s-projects.vercel.app"],
          ["Platform", "Vercel (Washington D.C. — iad1 region)"],
          ["Database", "Supabase PostgreSQL (aws-1-us-east-1)"],
          ["DB Adapter", "@prisma/adapter-pg with pg Pool"],
          ["Runtime URL (app)", "Transaction pooler — port 6543"],
          ["Migration URL (DDL)", "Session pooler — port 5432"],
          ["Auth", "JWT cookie (httpOnly, 7-day expiry)"],
          ["Vercel Project", "hsetin-4078s-projects / proposal-portal"],
          ["Vercel Env Vars Set", "DATABASE_URL, JWT_SECRET"],
        ]
      ),
      gap(160),

      h2("6.1 Database Tables (Supabase)"),
      body("The following tables were created in the Supabase 'postgres' database, 'public' schema:"),
      gap(80),
      makeTable(
        ["Table", "Purpose", "Key Fields"],
        [
          ["User", "Stores registered accounts", "id, email, passwordHash, createdAt"],
          ["Proposal", "Tracks each client's tier choice", "id, userId, tier (BASIC|ENHANCED), status"],
          ["Booking", "Stores training session slots", "id, proposalId, startTime, endTime"],
          ["Payment", "Records payment confirmation", "id, proposalId, amount, status (PAID)"],
        ]
      ),
      gap(160),

      h2("6.2 How to Monitor Usage"),
      bullet("Supabase Dashboard → Table Editor → select any table to view rows in real time"),
      bullet("Vercel Dashboard → Deployments → view build logs and function invocation logs"),
      bullet("Vercel Dashboard → Functions → monitor API route performance and errors"),
      bullet("Vercel Dashboard → Storage → not used (database is Supabase, not Vercel Storage)"),

      /* ─── 7. NEXT STEPS ─── */
      h1("7. Recommended Next Steps"),
      gap(80),
      makeTable(
        ["Priority", "Task", "Effort"],
        [
          ["High", "Add Next.js middleware to protect /dashboard, /booking, /payment routes server-side", "1 hour"],
          ["High", "Change JWT_SECRET to a cryptographically strong random value (openssl rand -base64 32)", "10 min"],
          ["Medium", "Add Zod validation to all API route inputs", "2 hours"],
          ["Medium", "Build an admin dashboard to view client selections and bookings", "4 hours"],
          ["Medium", "Add real Stripe integration (replace mock checkout)", "3 hours"],
          ["Medium", "Send confirmation email after payment (Resend or SendGrid)", "2 hours"],
          ["Low", "Add password reset flow", "3 hours"],
          ["Low", "Add loading skeleton components for better UX", "2 hours"],
          ["Low", "Add email verification on signup", "2 hours"],
        ]
      ),
      gap(200),

      /* ─── FOOTER ─── */
      new Paragraph({ text: "", border: { top: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_BLUE } } }),
      new Paragraph({
        children: [new TextRun({ text: "Generated April 19, 2026  •  Proposal Review & Booking Portal  •  Built with Claude Code", size: 18, color: GRAY })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 120 },
      }),
    ],
  }],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("Proposal-Portal-Documentation.docx", buffer);
console.log("Document created: Proposal-Portal-Documentation.docx");
