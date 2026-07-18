# 🌾 AI Food Rescue Network (MERN Stack)

A production-quality, AI-powered platform connecting restaurants, hotels, bakeries, and caterers with
NGOs and volunteers to rescue surplus food before it goes to waste.

Built on **MongoDB, Express, React, Node** — with Gemini AI for freshness detection & chat,
JWT auth, geospatial NGO matching, QR-code pickup/delivery verification, and live analytics.

## Tech stack

| Layer      | Choice |
|------------|--------|
| Frontend   | React 18 + TypeScript + Vite, Tailwind CSS, Framer Motion, React Router, Recharts, React-Leaflet |
| Backend    | Node.js + Express, Mongoose (MongoDB), JWT auth, Multer (image upload), QRCode |
| AI         | Gemini API (Vision for freshness scoring, text for chatbot & review summaries) — with offline mock fallback so the app runs with **zero API keys** |
| Maps       | OpenStreetMap + Leaflet (keyless) — swappable for Google Maps API |
| Auth       | Email/password + JWT, role-based access (restaurant / ngo / volunteer / admin) |

## Why it still works with no API keys

Every Gemini call in `backend/utils/gemini.js` checks for `GEMINI_API_KEY`. If it's missing, a
deterministic mock kicks in (freshness estimated from prep time, rule-based chatbot replies), so the
**entire demo works end-to-end offline** — perfect for a hackathon judging room with no wifi. Drop in a
real key and the same code path calls Gemini Vision / Gemini text generation instead.

## Project structure

```
food-rescue-network/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # User, Donation, Rating, Notification
│   ├── middleware/                # auth (JWT), role guard, multer upload, error handler
│   ├── controllers/               # business logic per domain
│   ├── routes/                    # REST endpoints
│   ├── utils/
│   │   ├── gemini.js              # AI freshness/matching/chatbot/review-summary
│   │   ├── generateToken.js
│   │   └── seed.js                # demo data seeder
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.ts           # axios instance + auth interceptor
        ├── context/AuthContext.tsx
        ├── components/            # RescueRing, DonationCard, MapView, Chatbot, Toast, ...
        └── pages/                 # Landing, Login, Register, 4 role dashboards
```

## Features implemented (fully working, not stubbed)

- **Auth & roles**: register/login, JWT, role-based dashboards & route guards (restaurant/NGO/volunteer/admin)
- **AI Food Freshness Detection**: photo upload → Gemini Vision (or offline heuristic) → freshness %, quality score, shelf life, safe pickup deadline, spoilage warning
- **AI Smart NGO Matching**: geospatial `$near` query + distance/capacity/verification/reputation scoring, ranked in the NGO dashboard
- **AI Chatbot**: floating assistant answering food-safety/donation questions via Gemini or rule-based fallback
- **Voice Posting**: browser Web Speech API → backend parses transcript into structured donation fields
- **QR-code pickup/delivery verification**: donation gets a unique code; volunteer must enter/scan it at both pickup and delivery to progress status
- **Live impact analytics**: meals rescued, kg rescued, CO₂ saved, 14-day trend chart (restaurant/NGO), platform-wide heat map + leaderboards (admin)
- **Ratings & AI review summaries**: multi-dimension ratings per role, Gemini-summarized feedback
- **Admin panel**: verify restaurants/NGOs, suspend/reinstate users, view all donations, platform heat map
- **Notifications model**: in-app notifications on accept/assign/pickup/delivery/completion
- **Volunteer gamification**: points, badges, leaderboard
- **Distinctive design system**: "harvest" palette (deep forest green, harvest gold, rescue-clay), Fraunces/Inter/JetBrains Mono type system, and a signature **Rescue Ring** — a circular freshness/urgency gauge used throughout the product

## What's intentionally simplified (documented, not hidden)

- **Maps**: uses free OpenStreetMap/Leaflet instead of the Google Maps/Places/Geocoding APIs (which need billing-enabled keys). The `MapView` component's interface is designed so swapping in `@react-google-maps/api` is a contained change.
- **Push notifications**: notifications are stored in MongoDB and polled in-app rather than wired to Firebase Cloud Messaging (Firebase isn't used at all in this MERN version — swap in `web-push` or FCM for real push).
- **Demand prediction / route optimization**: not included as standalone ML services — these are genuinely large ML projects on their own (time-series forecasting, VRP routing) rather than something to fake with a stub.
- **PWA/offline support**: not configured in this pass; Vite's PWA plugin (`vite-plugin-pwa`) can be added on top of this exact structure.

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env    # fill in MONGO_URI, JWT_SECRET, and (optionally) GEMINI_API_KEY
npm install
npm run seed             # creates demo users + one sample donation
npm run dev               # http://localhost:5000
```

Demo logins (password `password123`): `restaurant@rescue.ai`, `ngo@rescue.ai`, `volunteer@rescue.ai`, `admin@rescue.ai`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `localhost:5000` (see `vite.config.ts`), so no CORS config is needed locally.

### 3. Try the full loop

1. Log in as the restaurant → **Post surplus food** → upload a photo → see the AI freshness score.
2. Log in as the NGO → see it on the **AI-ranked matches** map/list → **Accept donation**.
3. Log in as the volunteer → **Claim pickup** → enter the QR code shown in the restaurant's donation detail (`GET /api/donations/:id/qrcode`) → **Verify pickup**, then **Verify delivery**.
4. Back in the restaurant/NGO dashboards, watch meals/kg/CO₂ stats update; check the admin heat map and leaderboards.

## Deployment notes

- **Backend**: any Node host (Render, Railway, Fly.io) + MongoDB Atlas. Set `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL`.
- **Frontend**: Vercel/Netlify. Set the API base URL (replace the Vite proxy with an `VITE_API_URL` env var pointed at your deployed backend) before building for production.
- **Images**: currently stored on local disk (`backend/uploads`) — for production, swap `multer.diskStorage` for an S3/Cloudinary adapter (interface is isolated in `middleware/upload.js`).
