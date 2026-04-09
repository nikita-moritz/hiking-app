# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HikingApp is a full-stack hiking event platform with a Next.js 14 frontend and Spring Boot 3.2 backend. Auth is handled by Supabase (Google OAuth + email/password), which issues tokens that the backend exchanges for its own JWTs.

## Deploy

Production: **https://nikita-moritz.de** (Hetzner CX23, Ubuntu 24.04)
SSH key: `~/.ssh/hetzner_hikingapp` → `root@65.109.237.30`

```bash
./deploy.sh          # deploy всё
./deploy.sh front    # только фронт
./deploy.sh back     # только бэкенд
```

Git hook `pre-push` автоматически запускает deploy при `git push origin main`.
Умно определяет что изменилось (frontend/ или backend/) и деплоит только нужное.

На сервере:
- Фронт: PM2 (`pm2 list`, `pm2 logs hikingapp-frontend`)
- Бэкенд: systemd (`systemctl status hikingapp-backend`, `journalctl -u hikingapp-backend -f`)
- Nginx: `/etc/nginx/sites-available/hikingapp`
- БД: PostgreSQL (`sudo -u postgres psql -d hiking_app`)

## Commands

### Frontend (`/frontend`)
```bash
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

### Backend (`/backend`)
```bash
./gradlew bootRun          # Start Spring Boot (port 8080)
./gradlew build            # Compile + test
./gradlew test             # Run tests only
./gradlew test --tests "com.hikingapp.SomeTest"  # Single test class
```

Dev profile uses H2 in-memory DB. Activate it via `SPRING_PROFILES_ACTIVE=dev` or in run config.

## Architecture

### Auth Flow
1. Guest sees public events for the next 30 days (Supabase RLS, no login required)
2. Clicking an event triggers login — Google OAuth or email/password via Supabase
3. After Supabase auth, frontend POSTs the Supabase token to `POST /api/auth/supabase`
4. Spring validates the token and returns its own JWT
5. JWT stored in `localStorage`; all subsequent requests include `Authorization: Bearer <token>`

The dual-token architecture means Supabase handles identity, Spring handles authorization and business logic.

### Frontend (`/frontend/src`)
- **App Router pages**: `app/` — landing (`/`), auth (`/auth`, `/auth/callback`), map (`/map`), profile (`/profile`), admin (`/admin`)
- **`lib/api.ts`** — fetch wrapper that injects the JWT header; all backend calls go through this
- **`lib/auth.ts`** — login/register/token helpers (localStorage-based)
- **`lib/supabase.ts`** — Supabase browser client
- **`lib/i18n/`** — Russian, English, German translations; все страницы (включая `/auth`, `/auth/callback`) используют `useT()` — хардкодных строк нет
- **`components/`** — shared UI (Providers for theme/i18n, MapView with Leaflet, Navbar)

Backend base URL is `http://localhost:8080/api` (hardcoded in `lib/auth.ts`).

### Backend (`/backend/src/main/java/com/hikingapp`)
- **`controller/`** — REST endpoints: `AuthController`, `ProfileController`, `UserController`, `AuditController`
- **`security/`** — `JwtAuthFilter` (per-request JWT validation), `JwtUtil` (HMAC-SHA signing, 24h expiry)
- **`config/SecurityConfig.java`** — CORS for `localhost:3000`; `/api/auth/**` is public; `/api/profile/**` requires auth; `/api/users/**` and `/api/audit/**` require `SUPERUSER` role
- **`aspect/AuditAspect.java`** — Spring AOP that logs sensitive operations
- **`entity/`** — `User`, `Role` (enum), `AuditLog`, `ParticipantStatus`

### Database
- **Prod**: PostgreSQL via Supabase — configured in `application.properties`
- **Dev/Test**: H2 in-memory — `application-dev.properties`
- **Migrations**: Flyway scripts in `src/main/resources/db/migration/` — текущая версия V9 (V8 добавляет колонки `title_ru/en/de`, V9 заполняет переводы событий)
- **Schema reference**: `/supabase-schema.sql`; seed data in `/seed_events_april.sql`

Key tables: `profiles`, `trails`, `events`, `event_participants`. Supabase Realtime is enabled for `events` and `event_participants`.
