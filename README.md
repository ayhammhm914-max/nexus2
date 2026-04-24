# NEXUS

NEXUS is a single-seller digital game code storefront built as a full-stack TypeScript monorepo.

## Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand, TanStack Query
- Backend: Node.js, Express, TypeScript, Prisma, MySQL/MariaDB (XAMPP), Redis
- Infra: Docker Compose, Nginx, GitHub Actions

## Product Direction

This repository is intentionally shaped as a safer single-seller store:

- No multi-seller marketplace logic in v1
- No account-selling flows
- Inventory is tracked through batches and encrypted product keys
- Order emails send receipts only; keys are meant to be revealed from the authenticated order page

## Structure

- [backend](./backend)
- [frontend](./frontend)
- [docker-compose.yml](./docker-compose.yml)

## Run Locally

1. Start Apache and MySQL from XAMPP.
2. Copy `backend/.env.example` to `backend/.env`.
3. Copy `frontend/.env.example` to `frontend/.env.local`.
4. Install dependencies in `backend` and `frontend`.
5. Run Prisma migrations and seed data from `backend`.
6. Start the backend and frontend servers.

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

You can also run both apps from the project root after installing dependencies:

```bash
npm run dev
```

On Windows, the root `npm run dev` command opens separate terminal windows for the backend and frontend.

## Current Foundation

- Prisma schema for users, catalog, batches, product keys, cart, orders, refunds, disputes, support, announcements and settings
- Seed data for admin, categories, platforms, coupons and 30 sample products
- Auth flow scaffolding with email verification, password reset, refresh-token sessions and 2FA setup
- Product listing, detail, admin product management and encrypted key import
- Cart, search and checkout scaffolding
- Styled React storefront with the NEXUS brand system
- Docker, Nginx and CI starter files

## Product Notes

- The store is modeled as a single-seller operation.
- Account selling is intentionally excluded from the catalog model.
- Keys are stored encrypted and meant to be revealed from authenticated order history, not emailed in plain text.
- Inventory batches are first-class so stock provenance can be tracked cleanly.

## Advice

- Finish the payment webhook and delivery path before adding more storefront surface area.
- Keep v1 focused on retailer-style stock, not seller onboarding or third-party payouts.
- When you start real inventory imports, make stock match actual key count so delivery never depends on placeholders.
