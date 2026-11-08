# Travelie web

Public landing page and administrator console, built with Vite, React 19 and React Router.

See the [root README](../../README.md) for setup and demo credentials.

```bash
npm install
cp .env.example .env     # VITE_API_URL, default http://localhost:4000/api
npm run dev              # http://localhost:5173
npm run build            # typecheck + production bundle
```

Routes: `/` landing, `/login` admin sign-in, `/dashboard` overview, `/dashboard/destinations`, `/dashboard/users`. Everything under `/dashboard` requires an `ADMIN` session. The design system lives in `src/styles/global.css`.