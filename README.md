# Travelie Applications

This repository contains three separately runnable packages and two distinct frontend apps:

- [API](api/README.md): NestJS, Prisma, PostgreSQL, and PostGIS.
- [Mobile](mobile/README.md): React Native and Expo. Expo Web is an optional browser export of the mobile app.
- [Web](web/README.md): the separate Vite public site and administration console.

Run the API from `api`, the Vite website from `web`, and the mobile/Expo app from `mobile`. They use separate ports: API `4000`, Vite `5173`, and Expo's selected Metro port. The API dev command checks for an existing listener and reports a clear message instead of launching a duplicate Nest instance.

## Deployment status

Vercel build configuration is included for the separate Vite website (`web`) and the optional Expo Web export (`mobile`). Deploy either or both as separate projects using the matching root directory, and set each public API URL after the API is deployed.

The [Render Blueprint](render.yaml) prepares the API service but does not deploy or run database migrations by itself. Before creating the Render service, rotate any exposed database credentials, configure the required production environment values in Render, take a database backup, and explicitly apply the additive Prisma migration. Never commit `.env` files or provider secrets.

Google Routes API access is optional and requires a server-side key. Without it, use the external maps navigation fallback.
