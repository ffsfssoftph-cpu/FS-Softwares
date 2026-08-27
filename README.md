FS Softwares — Local Setup and Build Guide

Overview
--------
FS Softwares is a Turborepo monorepo for a Fleet & Transport Rental Management System (FS Softwares) by TophComm Engineering & System Solutions Inc. This repository contains: apps/backend, apps/web, apps/driver-app (Expo), apps/customer-app (Expo), and packages/shared.

Branding
--------
Primary colors: Green #00E676, Dark BG #0A0F1A, Card BG #1A2332, Text #FFFFFF / #94A3B8
Asset paths: /apps/web/public/assets/brand/{fs-logo-light.png,fs-logo-dark.png,fs-icon.svg,tophcomm-logo.png}

Prerequisites (local)
---------------------
- Node.js 22.x
- npm (comes with Node)
- Docker (for Postgres, Redis, MinIO) and docker-compose
- Prisma CLI (optional locally: npm i -g prisma)
- Expo CLI / EAS for mobile builds (optional)
- electron-builder (for packaging desktop) and native build toolchains (Windows SDK / macOS Xcode)

Important notes
- TypeScript strictness, Zod validation, bcrypt cost = 12 used in backend.
- Use Windows cmd.exe when PowerShell execution policy blocks npm scripts: & $env:ComSpec /c "npm ..."
- If npm dependency resolution errors occur, use --legacy-peer-deps for installs as CI does.

Quickstart — Local development
------------------------------
1. Copy example env and edit: .env.example -> .env
   - Set DATABASE_URL, REDIS_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, STRIPE_SECRET, PAYMONGO_SECRET

2. Start infra
   docker-compose up -d

3. Install dependencies (recommended per-workspace)
   npm install --legacy-peer-deps
   cd apps\backend && npm install --legacy-peer-deps
   cd ..\web && npm install --legacy-peer-deps
   cd ..\driver-app && npm install --legacy-peer-deps
   cd ..\customer-app && npm install --legacy-peer-deps

4. Generate Prisma client
   cd apps\backend
   npx prisma generate --schema=prisma\schema.prisma

5. Run DB migrations (development)
   npx prisma migrate dev --schema=prisma\schema.prisma --name init
   (In CI we run prisma migrate deploy)

6. Start backend (dev)
   cd apps\backend
   npm run dev

7. Start web (dev)
   cd apps\web
   npm run dev

Mobile apps (Expo)
------------------
- Start dev: cd apps\driver-app && npm start
- Use EAS for production builds (requires Expo account): eas build --platform android/ios

Desktop (Electron)
------------------
1. Build web: cd apps\web && npm run build
2. Package: npx electron-builder --config electron-builder.yml --win
   - Requires electron-builder and native toolchains

CI
--
A GitHub Actions workflow is included at .github/workflows/ci.yml. It performs install (with --legacy-peer-deps), Prisma generate/migrate, builds web and backend, and uploads artifacts.

Troubleshooting
---------------
- npm ERESOLVE / peer errors: re-run installs with --legacy-peer-deps
- docker-compose not found: install Docker Desktop and ensure docker-compose is on PATH
- Prisma CLI errors: install prisma globally or use npx. Ensure correct @prisma/client version available in registry.

Security & Production
---------------------
- Rotate JWT secrets and store them in a secrets manager (Vault, AWS Secrets Manager).
- Use HTTPS / TLS for public endpoints and verify webhook secrets (Stripe, PayMongo)
- Configure Redis with AUTH and Postgres with user/password and network policies for production

Next steps
----------
- Push repo to GitHub and run CI (main branch) to produce build artifacts
- Implement E2E tests and CI signing for installers
- Review accounts and chart-of-accounts seeding before processing live payments

© 2026 TophComm Engineering & System Solutions Inc. — All Rights Reserved.
