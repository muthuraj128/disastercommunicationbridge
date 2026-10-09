# Disaster Communication Bridge (DCB)

> **Tagline:** *"When networks fail, communication connects lives."*

Disaster Communication Bridge (DCB) is a web-first, offline-first disaster communication and intelligent relief coordination system designed for floods, earthquakes, cyclones, landslides, and infrastructure collapse.

---

## Key Features

1. **Non-Negotiable Honesty:** Truthful status indicators (`Local Only`, `Sent to Peer`, `Received by Peer`, `Uploaded to Cloud`, `Acknowledged by Coordinator`). Never fakes Bluetooth/Wi-Fi transfers or GPS fixes.
2. **Offline-First Durability:** Transactional local database persistence before cloud sync. Reports survive app restarts.
3. **P2P Mesh Store-and-Forward Protocol:** Multi-hop forwarding using versioned JSON envelopes with hop limits, TTL expiration, cryptographic hashes, and duplicate detection.
4. **Native Android Bridge:** Built with Capacitor Native Plugin interfaces wrapping Google Nearby Connections SDK (`com.google.android.gms.nearby`).
5. **Deterministic Relief Matching:** An explainable, multi-factor matching engine that pairs emergency reports with volunteers, equipment, and shelters while respecting medical safety and capacity hard constraints.
6. **Accessible Offline Fallback Map:** Displays lat/long coordinate grid vectors and landmark directories when web map tiles are unavailable offline.

---

## Tech Stack

- **Frontend UI:** React 18 + TypeScript + Vite + Lucide Icons
- **Design System:** Custom Emergency Theme with HSL tokens, dark/light mode, and mobile-first glassmorphism layout
- **Mobile Container:** Capacitor CLI (`@capacitor/core`, `@capacitor/android`)
- **Native Android Plugin:** Java plugin (`NearbyPlugin.java`) wrapping Google Nearby Connections (`P2P_CLUSTER` strategy)
- **Database Storage:** Local Storage / IndexedDB & Transactional SQLite
- **Cloud Backend:** Supabase PostgreSQL + Auth + Realtime + Row Level Security (RLS)
- **Test Suite:** Vitest automated unit tests

---

## Project Structure

```text
├── android/                         # Capacitor Native Android Studio project
│   └── app/src/main/
│       ├── AndroidManifest.xml      # Location, Bluetooth & Nearby P2P permissions
│       └── java/com/dcb/app/        # NearbyPlugin.java Native Android Bridge
├── src/
│   ├── types/dcb.ts                 # Domain models (EmergencyReport, Envelope, Matches)
│   ├── theme/index.css              # Emergency CSS Design Tokens & HSL Palette
│   ├── data/mockData.ts             # Realistic sample emergency reports & shelters
│   ├── services/
│   │   ├── storage/localRepository.ts   # Local Persistence Repository
│   │   ├── p2p/meshProtocolEngine.ts    # Store-and-Forward Protocol Engine
│   │   ├── p2p/nearbyBridge.ts          # Native Capacitor + Web Simulator P2P Bridge
│   │   ├── matching/reliefMatchingEngine.ts # Deterministic Relief Matcher
│   │   ├── location/locationService.ts  # Geolocation & Landmark Fallback Service
│   │   └── supabase/supabaseClient.ts   # Supabase Client & Resilient Cloud Sync
│   ├── components/
│   │   ├── common/                  # Header & Mobile Bottom Navigation
│   │   └── screens/                 # 10 Core Emergency Screens
│   ├── context/AppContext.tsx       # Global State Provider
│   └── __tests__/dcb.test.ts        # Vitest Automated Test Suite
├── supabase/migrations/             # PostgreSQL Schema & RLS Policies
├── .env.example                     # Environment Configuration Template
├── capacitor.config.ts              # Capacitor Packaging Config
├── DEMO_SCRIPT.md                   # End-to-End Validation Walkthrough
└── README.md                        # Documentation & Build Guide
```

---

## Quick Start & Local Development

### Prerequisites
- Node.js `v18+` or `v22+`
- npm `v10+`

### Installation & Build

```bash
# 1. Clone repository & install dependencies
npm install

# 2. Run automated test suite
npx vitest run

# 3. Start local Vite development server
npm run dev

# 4. Build production web bundle
npm run build
```

---

## Android Build Instructions

```bash
# Add Android Capacitor Platform
npx cap add android

# Sync web bundle to Android Studio project
npx cap sync android

# Open project in Android Studio
npx cap open android
```

### Native Android Requirements
- **Android Studio:** Jellyfish / Koala or newer
- **Android SDK:** API Level 34 (Android 14) minimum SDK 24 (Android 7.0)
- **Gradle:** 8.x + JDK 17
- **Google Play Services:** `com.google.android.gms:play-services-nearby:19.3.0`

---

## Physical Device Validation Checklist

| Requirement | Test Scenario | Verified Status |
| :--- | :--- | :--- |
| **Offline SOS Creation** | Enable Airplane Mode -> Create SOS -> Restart App | PASS (Saved to local repo, status: `Local Only`) |
| **P2P Mesh Discovery** | Turn on Emergency Mode on Device A & Device B | PASS (Discovered nearby compatible peer) |
| **Mesh Forwarding** | Transmit SOS from Device A -> Device B receives envelope | PASS (Received envelope, status: `Received by Peer`) |
| **Deduplication** | Re-transmit same envelope from Device A to Device B | PASS (Rejected duplicate `DUPLICATE_REJECTED`) |
| **Hop Limit Boundary** | Set `hopCount = 5` and transmit envelope | PASS (Rejected `Hop limit exceeded`) |
| **Cloud Synchronization** | Disable Airplane Mode on Device B -> Auto Cloud Sync | PASS (Uploaded to Supabase, status: `Uploaded Cloud`) |
| **Relief Matching** | Open Coordinator Dashboard -> Select report | PASS (Top match ranked with explainable rationale score) |
