# Travelie API

NestJS + Prisma + PostgreSQL/PostGIS service for the Travelie mobile app and admin console.

See the [root README](../../README.md) for setup, environment variables and the endpoint list.

```bash
npm install
cp .env.example .env     # then set JWT_ACCESS_SECRET
npm run db:migrate       # requires the PostGIS database to be running
npm run db:seed
npm run start:dev        # http://localhost:4000 · docs at /docs
```

Useful scripts: `build`, `typecheck`, `test`, `db:studio`, `db:migrate:dev` (create a new migration during development).

Layout: `src/auth` (JWT + refresh rotation), `src/users`, `src/destinations`, `src/favorites`, `src/admin`, `src/prisma`, `prisma/schema.prisma` and `prisma/seed.ts`.