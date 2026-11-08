# 🧭 Travelie

> **Discover. Navigate. Experience.**  
> A modern travel companion for exploring the Philippines — featuring curated destination discovery, geospatial intelligence, and AR navigation.

This monorepo houses the complete full-stack foundation described in the 16-week build plan: the mobile application, web admin console, and the NestJS + PostGIS backend powering both platforms.

---

## Table of Contents

- [Overview](#overview)
- [Monorepo Architecture](#monorepo-architecture)
- [Feature Status & Roadmap](#feature-status--roadmap)
- [Prerequisites](#prerequisites)
- [Quick Start & Setup](#quick-start--setup)
  - [1. Install Dependencies](#1-install-dependencies)
  - [2. Configure Environment Files](#2-configure-environment-files)
  - [3. Database Provisioning & Seeding](#3-database-provisioning--seeding)
  - [4. Launch Development Servers](#4-launch-development-servers)
- [Mobile Device & Network Setup](#mobile-device--network-setup)
- [Demo Credentials](#demo-credentials)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Design Language & Brand Identity](#design-language--brand-identity)
- [Verification Status](#verification-status)
- [Troubleshooting](#troubleshooting)

---

## Overview

Travelie is built to guide travelers through the Philippines with curated destinations, rich photography, accurate geospatial data, and interactive search.

| Application | Tech Stack | Platform / Target |
| :--- | :--- | :--- |
| **`apps/mobile`** | Expo SDK 58 · React Native 0.88 · `expo-router` | iOS & Android (Expo Go / Dev Client) |
| **`apps/web`** | Vite · React 19 · React Router | Modern Desktop & Mobile Browsers |
| **`apps/api`** | NestJS 12 · Prisma 6 · PostgreSQL 16 + PostGIS | Node.js 20+ Runtime |

---

## Monorepo Architecture

```
travelie/
├── apps/
│   ├── api/                  # NestJS REST API with Prisma ORM & PostGIS
│   │   ├── prisma/
│   │   │   ├── schema.prisma # Data model & PostGIS mappings
│   │   │   ├── migrations/   # SQL migrations + spatial trigger
│   │   │   └── seed.ts       # Seeds admin, demo traveler & 9 destinations
│   │   ├── public/seed/      # Curated seed photography
│   │   └── src/
│   │       ├── auth/         # JWT auth, refresh rotation & password reset
│   │       ├── users/        # Profiles & avatar upload pipeline
│   │       ├── destinations/ # Catalog, categories, cities & geo queries
│   │       ├── favorites/    # Bookmark & optimistic save management
│   │       ├── admin/        # Platform stats & traveler administration
│   │       └── prisma/       # Global PrismaService provider
│   │
│   ├── mobile/               # Cross-platform Expo mobile app
│   │   └── src/
│   │       ├── app/          # File-based routing (expo-router)
│   │       │   ├── (auth)/   # Login, registration, password recovery
│   │       │   ├── (tabs)/   # Explore, Saved destinations, Profile
│   │       │   └── destination/ # Detail view with hero imagery & tags
│   │       ├── components/   # Atomic design system components
│   │       ├── constants/    # Theme tokens (colors, typography, spacing)
│   │       └── lib/          # API client, Auth Context, formatting helpers
│   │
│   └── web/                  # Vite + React 19 Admin & Landing application
│       └── src/
│           ├── pages/        # Landing, Login, Dashboard, Destinations, Users
│           ├── components/   # Shared UI components & layouts
│           ├── lib/          # Auth state & HTTP clients
│           └── styles/       # Design tokens & global CSS variables
│
├── docker-compose.yml        # PostgreSQL 16 container with PostGIS 3.4
└── package.json              # Monorepo orchestration scripts (concurrently)
```

---

## Feature Status & Roadmap

The project follows a 16-week production build plan.

### Completed Milestones

- **Week 1 — Foundation & Data Layer:** Monorepo architecture, shared design system tokens, PostGIS schema with automatic coordinate-to-geography trigger, migrations, and seed dataset.
- **Week 2 — Authentication & Identity:** Registration, login, logout, refresh-token rotation with reuse detection, password recovery flow, profile management, avatar uploads (JPEG/PNG/WebP), JWT guards, and role-based access control (`ADMIN` vs `TRAVELER`).
- **Week 3 — Catalog & Spatial Model:** Countries, cities, destination taxonomies, coordinates, and `geography(Point, 4326)` indexing. Initial database seeded with 9 premier Philippine destinations.
- **Week 4 — Discovery & Exploration:**
  - **Mobile:** Explore screen with debounced search, category filters, featured carousel, popular destinations list, optimistic favorites toggling, destination details, and profile screen.
  - **Web Admin Shell:** Secure administrator sign-in, analytics overview dashboard, destination management table, and traveler directory.

### Upcoming Milestones

- **Week 5:** Destination detail polish & gallery interactions.
- **Week 6:** User reviews, ratings, and moderation.
- **Week 7:** PostGIS-powered nearby geospatial search (`ST_DWithin` radius filtering).
- **Subsequent Milestones:** Offline caching, trip itinerary planner, and AR camera waypoint guidance.

---

## Prerequisites

Ensure you have the following installed before running Travelie locally:

| Requirement | Minimum Version | Notes |
| :--- | :--- | :--- |
| **Node.js** | `v20.x` or higher | Recommended: LTS version |
| **npm** | `v10.x` or higher | Comes packaged with Node.js |
| **Docker Desktop** | Latest | Required for running the PostGIS container |
| **WSL 2** *(Windows only)* | WSL 2 Engine | Required backend for Docker Desktop on Windows |
| **Android Studio** or **Expo Go** | Latest | For testing the mobile app on emulator or physical phone |

> [!IMPORTANT]
> **Windows Users**: Docker Desktop requires the WSL 2 backend. If Docker fails with an HTTP 500 error (`dockerDesktopLinuxEngine`), run `wsl --install` in an elevated terminal, reboot your PC, and relaunch Docker Desktop.

---

## Quick Start & Setup

Follow these steps in order to get the entire full-stack environment running.

### 1. Install Dependencies

Install all root and workspace dependencies across `api`, `web`, and `mobile` with one command:

```bash
npm run install:all
```

### 2. Configure Environment Files

Create the local `.env` files for each workspace from their examples:

**macOS / Linux / Git Bash:**
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
```

**Windows PowerShell:**
```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
Copy-Item apps/mobile/.env.example apps/mobile/.env
```

#### Generate a Strong JWT Secret
Edit `apps/api/.env` and replace `JWT_ACCESS_SECRET` with a secure random key. Generate one via Node:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### 3. Database Provisioning & Seeding

Start the PostgreSQL + PostGIS container and initialize the database schema:

```bash
# 1. Start PostGIS container in detached mode
npm run db:up

# 2. Run Prisma migrations (creates tables and PostGIS spatial triggers)
npm run db:migrate

# 3. Seed demo accounts, cities, categories, and initial destinations
npm run db:seed
```

> [!TIP]
> Want to visually inspect the database records? Run Prisma Studio anytime:
> ```bash
> npm --prefix apps/api run db:studio
> ```

### 4. Launch Development Servers

You can start the backend and web console simultaneously:

```bash
# Starts API (:4000) and Web Admin (:5173) concurrently
npm run dev
```

In a separate terminal tab, start the mobile development server:

```bash
# Starts the Expo Metro bundler (:8081)
npm run dev:mobile
```

---

## Mobile Device & Network Setup

When developing on mobile, the client needs to reach your local API server. Configure `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` according to your run target:

| Target Environment | `EXPO_PUBLIC_API_URL` Value | Details |
| :--- | :--- | :--- |
| **Web Browser / iOS Simulator** | `http://localhost:4000/api` | Direct localhost loopback |
| **Android Emulator** | `http://10.0.2.2:4000/api` | Special emulator alias mapping to host `127.0.0.1` |
| **Physical Phone (Expo Go)** | `http://<YOUR-LOCAL-IP>:4000/api` | Your machine's Wi-Fi / LAN IP (e.g. `192.168.1.50`) |

> [!NOTE]
> Environment variables in Expo are embedded during bundle time. Whenever you modify `apps/mobile/.env`, restart Metro (`npm run dev:mobile`) with cache clear (`npx expo start -c`).

---

## Demo Credentials

The database seed provides two pre-configured accounts for testing:

| Portal | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **Web Admin Console** (`:5173`) | Administrator (`ADMIN`) | `admin@travelie.app` | `Travelie123!` |
| **Mobile App** (`:8081`) | Traveler (`TRAVELER`) | `traveler@travelie.app` | `Traveler123!` |

> [!CAUTION]
> These credentials originate from `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `apps/api/.env`. Always update them before hosting or deploying to staging/production.

---

## Available Scripts

Run these root commands from the repository root:

| Command | Description |
| :--- | :--- |
| `npm run install:all` | Installs root and all package dependencies (`api`, `web`, `mobile`) |
| `npm run dev` | Runs backend API (`:4000`) and web admin (`:5173`) in parallel |
| `npm run dev:api` | Runs NestJS API in watch mode (`:4000`) |
| `npm run dev:web` | Runs Vite dev server for admin & landing (`:5173`) |
| `npm run dev:mobile` | Starts the Expo dev server for the mobile application |
| `npm run db:up` | Boots the PostgreSQL + PostGIS Docker container (`travelie-db`) |
| `npm run db:down` | Stops and removes the database container |
| `npm run db:migrate` | Applies pending Prisma migrations to the database |
| `npm run db:seed` | Populates database with initial admin, travelers, and destinations |
| `npm run build:api` | Compiles the NestJS API application for production |
| `npm run build:web` | Creates an optimized production build of the web app |

---

## API Reference

- **Base URL:** `http://localhost:4000/api`
- **Swagger Documentation:** `http://localhost:4000/docs`
- **Health Check:** `http://localhost:4000/api/health`

### Core Endpoints

| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :---: | :--- |
| `POST` | `/auth/register` | Public | Create a new traveler account |
| `POST` | `/auth/login` | Public | Authenticate and obtain access + refresh tokens |
| `POST` | `/auth/refresh` | Public | Exchange refresh token with automatic rotation |
| `POST` | `/auth/logout` | Public | Invalidate active refresh token |
| `POST` | `/auth/forgot-password` | Public | Generate a 30-minute password reset token |
| `POST` | `/auth/reset-password` | Public | Set new password with valid reset token |
| `GET` | `/users/me` | Bearer | Retrieve profile information for authenticated user |
| `PATCH` | `/users/me` | Bearer | Update profile details (name, preferences) |
| `POST` | `/users/me/avatar` | Bearer | Upload user avatar (max 5 MB, JPEG/PNG/WebP) |
| `GET` | `/destinations` | Public | List destinations with search, filter, and pagination |
| `GET` | `/destinations/:slug` | Public | Fetch complete destination details and media |
| `GET` | `/categories` | Public | Retrieve destination categories taxonomy |
| `GET` | `/cities` | Public | Retrieve active Philippine cities |
| `GET` | `/favorites` | Bearer | Retrieve all saved destinations for current user |
| `POST` | `/favorites/:destinationId` | Bearer | Bookmark a destination |
| `DELETE` | `/favorites/:destinationId` | Bearer | Remove bookmark for a destination |
| `GET` | `/admin/stats` | `ADMIN` | Retrieve aggregated metrics and analytics |
| `GET` | `/admin/users` | `ADMIN` | Query and manage traveler accounts |

> [!NOTE]
> Static media assets are served directly by the API:
> - User uploaded avatars: `http://localhost:4000/static/uploads/...`
> - Seeded destination photography: `http://localhost:4000/static/seed/...`

---

## Design Language & Brand Identity

The visual identity is inspired by the Philippine natural landscape — dense emerald forests, tranquil waters, pristine sandbars, and vibrant tropical accents.

### Color Tokens

Tokens are defined in `apps/mobile/src/constants/theme.ts` and as CSS variables in `apps/web/src/styles/global.css`:

| Token | Hex | Role / Application | Preview |
| :--- | :---: | :--- | :---: |
| **Ink** | `#0B1F1C` | Primary typography & high-contrast surfaces | ![#0B1F1C](https://via.placeholder.com/16/0B1F1C/0B1F1C.png) |
| **Pine** | `#0F4C43` | Primary brand green, header accents, navigation bar | ![#0F4C43](https://via.placeholder.com/16/0F4C43/0F4C43.png) |
| **Teal** | `#12796A` | Secondary brand color, active icons, inline links | ![#12796A](https://via.placeholder.com/16/12796A/12796A.png) |
| **Sand** | `#F7F2E9` | Application canvas, background fill | ![#F7F2E9](https://via.placeholder.com/16/F7F2E9/F7F2E9.png) |
| **Cream** | `#FCFAF5` | Elevated surfaces, cards, and modal containers | ![#FCFAF5](https://via.placeholder.com/16/FCFAF5/FCFAF5.png) |
| **Coral** | `#F26B4E` | Primary call-to-action (CTA) buttons, badges, alerts | ![#F26B4E](https://via.placeholder.com/16/F26B4E/F26B4E.png) |
| **Gold** | `#D7A24A` | Rating stars, highlights, featured destination badges | ![#D7A24A](https://via.placeholder.com/16/D7A24A/D7A24A.png) |

### Typography

- **Display & Headings:** `Fraunces` (warm, character-rich editorial serif)
- **Interface & Body:** `DM Sans` (clean, highly legible geometric sans)
- Both typefaces are bundled locally within `apps/mobile` and `apps/web` to eliminate external font loading latency.

---

## Verification Status

The codebase maintains strict type safety and build verification across all packages:

- **`apps/api`**: `npm run build` compiles clean without TypeScript errors; Prisma schema validates against PostgreSQL/PostGIS.
- **`apps/web`**: `tsc -b && vite build` succeeds; tested with responsive desktop and mobile viewport (390 px) layouts.
- **`apps/mobile`**: `tsc --noEmit` passes cleanly; `expo export --platform web` bundles all routes and nested navigators without bundling errors.

---

## Troubleshooting

<details>
<summary><strong>1. Docker Compose returns HTTP 500 (dockerDesktopLinuxEngine)</strong></summary>

**Cause:** Docker Desktop is running, but the underlying WSL 2 Linux engine is not installed or enabled.  
**Resolution:**
1. Open PowerShell as Administrator and run:
   ```powershell
   wsl --install
   ```
2. Reboot your computer.
3. Open Docker Desktop settings, verify **Use the WSL 2 based engine** is checked, and re-run:
   ```bash
   npm run db:up
   ```
</details>

<details>
<summary><strong>2. Prisma cannot reach PostgreSQL database</strong></summary>

**Cause:** The database container is stopped, unhealthy, or the port mapping conflicts with another Postgres instance.  
**Resolution:**
1. Check container health:
   ```bash
   docker compose ps
   ```
2. Verify `DATABASE_URL` in `apps/api/.env` matches:
   ```env
   DATABASE_URL="postgresql://travelie:travelie@localhost:5432/travelie?schema=public"
   ```
3. If port 5432 is already occupied by a local PostgreSQL installation, update the external port mapping in `docker-compose.yml` and match it in `apps/api/.env`.
</details>

<details>
<summary><strong>3. Database migration fails on `CREATE EXTENSION postgis`</strong></summary>

**Cause:** The active Postgres container is using a vanilla PostgreSQL image rather than the PostGIS-enabled image.  
**Resolution:**
Ensure `docker-compose.yml` specifies `image: postgis/postgis:16-3.4`. If you previously created a container with a standard image, reset the volume:
```bash
npm run db:down
docker volume rm travelie_travelie-db-data
npm run db:up
npm run db:migrate
```
</details>

<details>
<summary><strong>4. Android emulator or phone cannot connect to the API</strong></summary>

**Cause:** `localhost` from within an Android emulator or physical phone refers to the phone itself, not your host computer.  
**Resolution:**
- For **Android Emulator**: Set `EXPO_PUBLIC_API_URL="http://10.0.2.2:4000/api"` in `apps/mobile/.env`.
- For **Physical Devices**: Set `EXPO_PUBLIC_API_URL="http://<YOUR_LAN_IP>:4000/api"` (e.g. `http://192.168.1.50:4000/api`).
- Restart Metro bundler after editing:
  ```bash
  npm run dev:mobile
  ```
</details>

<details>
<summary><strong>5. Cross-Origin (CORS) errors on Expo Web</strong></summary>

**Cause:** The origin of the web client is not whitelisted in the NestJS API CORS configuration.  
**Resolution:**
Add the client URL (e.g., `http://localhost:8081` for Expo web) to `CORS_ORIGIN` in `apps/api/.env`:
```env
CORS_ORIGIN="http://localhost:5173,http://localhost:8081"
```
</details>

---

<div align="center">
  <sub>Travelie — Built with ❤️ for travelers exploring the Philippines.</sub>
</div>
