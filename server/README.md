# Victohs Server (backend)

Express + MongoDB backend with Ercaspay integration for payments.

Prereqs
- Node >= 18
- MongoDB (local or remote). You can use Docker to run a dev MongoDB: `docker run -p 27017:27017 -d --name logs-mongo mongo:6`

Setup

1. cd server
2. npm install
3. copy `.env.example` to `.env` and edit (set `MONGODB_URL`, `JWT_SECRET`, `ECRS_SECRET_KEY`)
4. npm run dev

Seeding

- Run `npx ts-node src/seed.ts` to create an admin (`admin@victohs.com` / `victohs2025!`) and a sample user.

Ercaspay

- Set `ECRS_SECRET_KEY` in your `.env`. The server provides `/api/payments/ercas/initiate` and `/api/payments/ercas/verify/:reference` endpoints.

Notes
- The server listens on PORT (default 5002). Admin login seeded as `admin@victohs.com` / `victohs2025!` by the seed script.
