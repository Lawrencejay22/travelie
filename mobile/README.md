# 📱 Travelie Mobile

> **Cross-platform mobile application built with React Native and Expo SDK 58.**
> Includes curated discovery, nearby places, reviews, trip planning, expenses, and camera-compass guidance.

For full-stack setup and prerequisites, refer to the [workspace README](../README.md).

---

## 📑 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Network & API Configuration](#network--api-configuration)
- [Application Screens & Routes](#application-screens--routes)
- [Directory Structure](#directory-structure)
- [Available Scripts](#available-scripts)
- [Native Builds & AR Roadmap](#native-builds--ar-roadmap)

---

## Overview

The Travelie mobile app allows travelers to browse and save Philippine destinations, find nearby places, read and submit moderated reviews, plan itineraries and expenses, calculate routes, and manage traveler profiles.

- **Framework:** React Native 0.88 & React 19
- **Tooling:** Expo SDK 58
- **Navigation:** `expo-router` v58 (file-based routing)
- **Design System:** Custom theme tokens with local `Fraunces` and `DM Sans` font bundling
- **State & Storage:** `expo-secure-store` for authenticated tokens

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

### 3. Start Metro Bundler
```bash
npm start
```
From the interactive terminal prompt:
- Press <kbd>a</kbd> to launch on connected **Android device / emulator**
- Press <kbd>i</kbd> to launch on **iOS simulator** (macOS only)
- Press <kbd>w</kbd> to open in a **web browser**

---

## Network & API Configuration

Configure `EXPO_PUBLIC_API_URL` in `.env` based on your testing environment:

| Target | `EXPO_PUBLIC_API_URL` Value | Notes |
| :--- | :--- | :--- |
| **Web Browser / iOS Simulator** | `http://localhost:4000/api` | Uses localhost loopback |
| **Android Emulator** | `http://10.0.2.2:4000/api` | Points to host machine loopback interface |
| **Physical Phone (Expo Go)** | `http://<YOUR-LAN-IP>:4000/api` | Your machine's Wi-Fi / LAN IP address |

> [!TIP]
> Expo embeds environment variables during bundle compilation. After changing `.env`, restart the bundler with `npx expo start -c` to clear the Metro cache.

Google sign-in requires the platform OAuth client ID variables in `.env`; configure the matching client IDs in `GOOGLE_OAUTH_CLIENT_IDS` in the API environment as well. In-app route calculation requires the Google Routes API to be enabled and a server-side key in `GOOGLE_MAPS_API_KEY`. Keep provider keys out of source control. Password reset is unavailable until a trusted email delivery provider is configured; reset tokens are never returned by the API.

### Deploying Expo Web to Vercel

Create a Vercel project linked to this repository with the **Root Directory** set to `mobile`. The included `vercel.json` exports the Expo web app as a static SPA. Set `EXPO_PUBLIC_API_URL` to the public API URL ending in `/api` after the API has been deployed. Do not deploy with the local `.env` API URL.

---

## Application Screens & Routes

| Path | Screen Description |
| :--- | :--- |
| `/` | Welcome landing screen with entry to login / registration |
| `/(auth)/login` | Traveler authentication screen |
| `/(auth)/register` | Account registration |
| `/(auth)/forgot-password` | Password recovery request |
| `/(auth)/reset-password` | Password reset with token |
| `/(tabs)` | Explore tab: debounced search, categories, featured carousel, popular list |
| `/(tabs)/nearby` | Nearby destinations using foreground location permission |
| `/(tabs)/trips` | Create and manage itineraries |
| `/(tabs)/saved` | Saved destinations with optimistic remove/restore |
| `/(tabs)/profile` | Traveler profile, avatar display, and session logout |
| `/destination/[slug]` | Rich destination detail screen with an interactive map and destination pin |
| `/destination/navigate` | Route overview, live position, and route steps |
| `/destination/ar` | Camera and compass guidance preview |
| `/trips/[id]` | Trip stops and expense budget |

---

## Directory Structure

```
apps/mobile/
├── assets/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (tabs)/
│   │   ├── destination/
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── components/
│   ├── constants/
│   └── lib/
├── app.json
└── package.json
```

---

## Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm start` | `expo start` | Starts Metro development server |
| `npm run android` | `expo start --android` | Opens app directly in Android emulator |
| `npm run ios` | `expo start --ios` | Opens app directly in iOS simulator |
| `npm run web` | `expo start --web` | Runs app in browser via React Native Web |
| `npm run lint` | `expo lint` | Lints project files |

---

## Native Builds & AR Roadmap

- **Current State:** Destination maps, location, and camera guidance use Expo-compatible native modules.
- The camera compass preview is not ARCore Geospatial/VPS and does not create 3D world-anchored waypoints. Production AR requires a compatible native ARCore/ARKit integration, provider configuration, an EAS development build, and on-device testing.
- The project is pre-configured with custom scheme `travelie` and bundle identifiers (`app.travelie.mobile`) in `app.json` for **Expo Prebuild** / EAS development clients.
