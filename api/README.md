# 🛠️ Travelie API

> **NestJS REST backend powered by Prisma ORM and PostgreSQL + PostGIS.**
> Serves the Travelie mobile application and web administration console.

For full-stack setup, prerequisites, and system architecture, refer to the [Root README](../../README.md).

---

## 📑 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database Management](#database-management)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [API Documentation & Health](#api-documentation--health)

---

## Overview

The Travelie API provides identity management, Google OpenID Connect sign-in, geospatial discovery, destination reviews and moderation, trip itineraries, expenses, route calculations, bookmarking, and administrative statistics.

- **Framework:** NestJS 12 (TypeScript)
- **Database:** PostgreSQL 16 with PostGIS 3.4
- **ORM:** Prisma 6
- **Authentication:** Passport JWT with refresh token rotation & reuse detection
- **Documentation:** Interactive Swagger UI (`/docs`)

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment

macOS / Linux:
```bash
cp .env.example .env
```

Windows PowerShell:
```powershell
Copy-Item .env.example .env
```
Generate and update `JWT_ACCESS_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### 3. Migrate and Seed Database
Ensure the PostGIS container is active (`npm run db:up` from repo root):
```bash
npm run db:migrate
npm run db:seed
```

### 4. Start Development Server
```bash
npm run start:dev
```
The server will boot on `http://localhost:4000`.

---

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment (`development` / `production`) | `development` |
| `PORT` | Listening HTTP port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://travelie:travelie@localhost:5432/travelie?schema=public` |
| `JWT_ACCESS_SECRET` | Secret key for signing access tokens | *(Generate secure string)* |
| `JWT_ACCESS_TTL` | Access token lifespan | `15m` |
| `CORS_ORIGIN` | Comma-separated allowed CORS origins | `http://localhost:5173,http://localhost:8081` |
| `PUBLIC_API_URL` | Base public URL for uploaded media resolution | `http://localhost:4000` |
| `GOOGLE_MAPS_API_KEY` | Server-side key for the Google Routes API | *(Optional; required for in-app routes)* |
| `GOOGLE_OAUTH_CLIENT_IDS` | Comma-separated Google OAuth client IDs accepted by the API | *(Optional; required for Google sign-in)* |
| `SEED_ADMIN_EMAIL` | Required administrator email used by the database seed | *(Set privately before seeding)* |
| `SEED_ADMIN_PASSWORD` | Required seed administrator password (at least 16 characters) | *(Set privately before seeding; never commit it)* |

---

## Database Management

Prisma is configured to handle schema definitions, migrations, and seeding:

```bash
npm run db:migrate
npm run db:migrate:dev
npm run db:seed
npm run db:studio
npm run prisma:generate
```

The additive `20261109120000_reviews_trips` migration creates review moderation, trip itinerary, and expense tables and adds Google account linking. It is not applied automatically during server startup; apply it to the intended database with `npm run db:migrate`.

Google Routes API access and Google OAuth client IDs are independent settings. Keep the Routes API key in the API environment only. Set the OAuth client IDs in `GOOGLE_OAUTH_CLIENT_IDS` and the matching public client IDs in the mobile environment.

Password reset is disabled until a trusted email delivery provider is configured. The API does not expose reset tokens in responses.

The API exposes `GET /api/destinations/nearby`, `POST /api/navigation/route`, `/api/reviews`, and `/api/trips`; the authenticated moderation endpoints are `/api/reviews/moderation/pending` and `PATCH /api/reviews/:id/moderation`.

---

## Project Structure

```
apps/api/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── seed/
│   └── uploads/
├── src/
│   ├── admin/
│   ├── auth/
│   ├── destinations/
│   ├── favorites/
│   ├── prisma/
│   ├── users/
│   ├── app.module.ts
│   └── main.ts
└── test/
```

---

## Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run start:dev` | `nest start --watch` | Start API in watch mode |
| `npm run build` | `nest build` | Compile TypeScript for production |
| `npm run start:prod` | `node dist/main` | Run production compiled server |
| `npm run typecheck` | `tsc --noEmit` | Check TypeScript type safety |
| `npm run lint` | `oxlint --type-aware` | Lint codebase with oxlint |
| `npm run format` | `prettier --write` | Format code with Prettier |
| `npm test` | `vitest run` | Run unit tests |
| `npm run test:e2e` | `vitest run --config ...` | Run end-to-end integration tests |

---

## API Documentation & Health

- **Interactive Swagger Docs:** `http://localhost:4000/docs`
- **Health Check Endpoint:** `http://localhost:4000/api/health`
- **Static Assets:** `http://localhost:4000/static/seed/...`