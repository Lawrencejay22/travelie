# Travelie mobile

Expo SDK 58 app with expo-router. Routes live in `src/app`.

See the [root README](../../README.md) for setup, the API address per device and demo credentials.

```bash
npm install
cp .env.example .env     # set EXPO_PUBLIC_API_URL for your device
npm start                # press "a" for Android, "i" for iOS, "w" for web
```

Screens: welcome (`/`), login, register, forgot/reset password, Explore tabs (`/`, `/saved`, `/profile`) and destination detail (`/destination/[slug]`). Shared UI lives in `src/components`, theme tokens in `src/constants/theme.ts`, and the API/auth layer in `src/lib`.

AR (Week 10–11) will need a development build rather than Expo Go, because it adds native Kotlin modules. The project is already configured with a custom scheme and bundle identifiers (`app.travelie.mobile`) for that step.