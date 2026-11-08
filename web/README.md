# 🌐 Travelie Web

> **Public landing page and administrator console built with Vite, React 19, and React Router.**
> Provides administrative management for destinations, travelers, review moderation, and platform analytics.

This is the separate Vite website and admin console. It is not the Expo Web export of the mobile app. For the mobile app and its optional web export, see [mobile](../mobile/README.md). For full-stack setup and prerequisites, refer to the [workspace README](../README.md).

---

## 📑 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Application Routes](#application-routes)
- [Directory Structure](#directory-structure)
- [Available Scripts](#available-scripts)

---

## Overview

The Travelie Web app serves as both a public landing experience and a protected administrative console for viewing metrics, managing catalog entries, and reviewing traveler accounts.

- **Framework:** React 19
- **Build Tool:** Vite 8
- **Routing:** React Router v7
- **Styling:** CSS Custom Properties (Theme tokens) defined in `src/styles/global.css`

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

Default value in `.env`:
```env
VITE_API_URL="http://localhost:4000/api"
```

### 3. Run Development Server
```bash
npm run dev
```
The application opens at `http://localhost:5173`.

---

## Application Routes

| Path | Access | Purpose |
| :--- | :---: | :--- |
| `/` | Public | Public landing page and product overview |
| `/login` | Public | Administrator sign-in portal |
| `/dashboard` | `ADMIN` | Overview metrics and platform KPIs |
| `/dashboard/destinations` | `ADMIN` | Destination catalog table and management |
| `/dashboard/users` | `ADMIN` | Registered traveler list and user directory |
| `/dashboard/reviews` | `ADMIN` / `CONTENT_MANAGER` | Approve or reject pending destination reviews |

---

## Directory Structure

```
apps/web/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
└── package.json
```

---

## Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Start local Vite development server |
| `npm run build` | `tsc -b && vite build` | Type-check and create production bundle |
| `npm run preview` | `vite preview` | Locally preview production build |
| `npm run lint` | `oxlint` | Run linter checks |

### Deploying to Vercel

Create a Vercel project linked to this repository with the **Root Directory** set to `web`. The included `vercel.json` builds the Vite app and rewrites client-side routes to `index.html`. Set `VITE_API_URL` to the public API URL ending in `/api` after the API has been deployed. Do not deploy with the local `.env` API URL.
