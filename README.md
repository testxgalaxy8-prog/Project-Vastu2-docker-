# VASTU RITAM — Classical Vastu Knowledge & Research Platform

[![CI/CD Pipeline](https://github.com/animeshsen404/project-vastu/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/animeshsen404/project-vastu/actions)

**Vastu Ritam** (*Towards Harmony Through Authentic Vastu Knowledge*) is a full-stack web platform dedicated to the study, research, archival, and consultation of authentic classical Vastu Vidya (referencing foundational canons such as *Mayamatam*, *Mānasāra*, and *Samarāṅgaṇa Sūtradhāra*).

The application combines a **React 19 + Tailwind CSS + Vite** frontend with a high-concurrency **Express + Drizzle ORM (PostgreSQL)** backend and automatic local JSON/in-memory fallback (`data-store.json`) for zero-configuration local development and testing.

---

## Table of Contents

1. [Architecture & Key Features](#1-architecture--key-features)
2. [Prerequisites & Local Setup](#2-prerequisites--local-setup)
3. [Environment Variables](#3-environment-variables)
4. [Docker & Containerized Deployment](#4-docker--containerized-deployment)
5. [Running Unit & Integration Tests](#5-running-unit--integration-tests)
6. [CI/CD Pipeline](#6-cicd-pipeline)
7. [API Endpoints Reference](#7-api-endpoints-reference)

---

## 1. Architecture & Key Features

- **Frontend (`src/`)**: React 19 single-page application with custom path routing, Bilingual/Sanskrit typographic support, interactive Vastu Purusha Mandala emblem, Gyan Kosh knowledge library, Shabd Kosh (glossary), Granth Kosh (classical manuscripts), Video Learning portal, and an integrated Role-Based Admin CMS (`/admin`).
- **Backend (`server.ts`)**: Express 4 server providing RESTful JSON APIs, Gzip compression, in-memory TTL caching (`src/lib/cache.ts`), HMAC & Firebase Authentication (`src/middleware/auth.ts`), and dynamic XML sitemap generation.
- **Dual-Mode Persistence (`src/db/` & `src/lib/dataStore.ts`)**:
  - **PostgreSQL Mode**: Uses Drizzle ORM (`src/db/schema.ts`) when `DATABASE_URL` or `SQL_HOST` is configured.
  - **Resilient Local Fallback**: Automatically persists to `data-store.json` and in-memory state when PostgreSQL is offline or unconfigured, ensuring 100% uptime in local dev and preview sandboxes.

---

## 2. Prerequisites & Local Setup

### Prerequisites
- **Node.js**: `v22.x` (recommended) or `v20+`
- **Package Manager**: `npm` (v10+)
- **Database** *(Optional)*: PostgreSQL 15+ (automatically provisioned if using Docker Compose; falls back to `data-store.json` if omitted)

### Step-by-Step Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/animeshsen404/project-vastu.git
   cd project-vastu
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` as needed (see [Environment Variables](#3-environment-variables)). No database credentials are required to boot in local fallback mode.

4. **Start the development server (Port 3000)**:
   ```bash
   npm run dev
   ```
   The application and API server will start on [http://localhost:3000](http://localhost:3000).

5. **Build for production**:
   ```bash
   npm run build
   NODE_ENV=production npm start
   ```

---

## 3. Environment Variables

Copy `.env.example` to `.env`. Below is the complete reference:

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `3000` | HTTP port bound by the Express + Vite server |
| `NODE_ENV` | No | `development` | Runtime mode (`development`, `production`, `test`) |
| `APP_URL` | No | `http://localhost:3000` | Canonical base URL used in `sitemap.xml` and `robots.txt` |
| `AUTH_SECRET` | No | `vastu-ritam-super-secret-key-2026` | Secret key used for signing HMAC `vr_session` tokens |
| `GEMINI_API_KEY` | No | — | Server-side API key for AI features |
| `DATABASE_URL` | No | — | Full PostgreSQL connection string (enables PostgreSQL mode) |
| `SQL_HOST` | No | — | PostgreSQL host / Unix socket path |
| `SQL_DB_NAME` | No | `vastu_ritam` | PostgreSQL database name |
| `SQL_USER` | No | `postgres` | PostgreSQL application user |
| `SQL_PASSWORD` | No | — | PostgreSQL application password |
| `DB_POOL_MAX` | No | `25` | Maximum connections in `pg.Pool` |

---

## 4. Docker & Containerized Deployment

A multi-target `Dockerfile` and `docker-compose.yml` are included to support both **development** (with live code mounting) and **production** (with PostgreSQL 16 and health checks).

### Start Production Stack (App + PostgreSQL 16)
```bash
docker compose up -d --build app db
```
- **Web App & API**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/health`
- **PostgreSQL 16**: `localhost:5432`

### Start Development Profile (Live Reload on Port 3000)
```bash
docker compose --profile dev up --build app-dev db
```

### Stop Containers
```bash
docker compose down
```

---

## 5. Running Unit & Integration Tests

The repository includes a comprehensive test suite under `tests/` covering:
- **`tests/videoUtils.test.ts`**: URL validation, XSS/protocol sanitization, YouTube & Vimeo ID extraction, privacy-enhanced embed generation, and slug generation.
- **`tests/cache.test.ts`**: In-memory TTL caching, expiration sweeps, prefix invalidation, and key eviction.
- **`tests/auth.test.ts`**: HMAC session token signing, tamper detection, expiration handling, and Express RBAC middleware (`authenticate`, `requireAuth`, `requireRole`).
- **`tests/dataStore.test.ts`**: Persistent data store CRUD operations for categories, topics, articles, videos, keywords, ads, and site settings.
- **`tests/api.test.ts`**: End-to-end HTTP integration tests against Express API endpoints (`/health`, `/api/categories`, `/api/topics`, `/api/articles`, `/api/videos`, `/api/search`, `/api/contact-details`, `/api/auth/*`, and `/api/admin/*` security guards).

### Execute Tests
```bash
# Run the complete unit and API integration test suite
npm test

# Run TypeScript type checking / linting
npm run lint
```

---

## 6. CI/CD Pipeline

Automated workflows are configured in [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) and trigger on pushes and pull requests across `main`, `master`, and `develop` branches:

1. **Quality & Type Check (`lint-and-typecheck`)**: Installs dependencies with `npm ci` and validates TypeScript types (`npm run lint`).
2. **Automated Unit & API Tests (`unit-tests`)**: Runs the full test suite (`npm test`) in `NODE_ENV=test`.
3. **Production Build Verification (`build`)**: Compiles the frontend bundle (`npm run build`) and verifies build artifacts in `dist/`.
4. **Docker Image & Compose Verification (`docker-verify`)**: Validates `docker compose config` and builds the production container image.

---

## 7. API Endpoints Reference

For full request/response schemas, query parameters, and authentication details, see **[`docs/API.md`](docs/API.md)**.

### Summary of Core Endpoints

| Category | Method | Path | Auth | Summary |
| :--- | :---: | :--- | :---: | :--- |
| **System** | `GET` | `/health` | Public | Container & load-balancer health probe |
| **System** | `GET` | `/sitemap.xml` | Public | Dynamic XML sitemap for articles, topics, categories |
| **System** | `GET` | `/robots.txt` | Public | Search crawler rules |
| **Articles** | `GET` | `/api/articles` | Public | Paginated & filtered list of published articles |
| **Articles** | `GET` | `/api/articles/:slug` | Public | Single article detail + view increment + related items |
| **Topics** | `GET` | `/api/topics` | Public | List knowledge graph topics (`?type=concept\|direction...`) |
| **Topics** | `GET` | `/api/topics/:slug` | Public | Topic detail + linked topics + associated articles |
| **Categories** | `GET` | `/api/categories` | Public | List categories with published article counts |
| **Categories** | `GET` | `/api/categories/:slug` | Public | Category detail + published articles |
| **Videos** | `GET` | `/api/videos` | Public | List published Gyan Kosh video lessons |
| **Videos** | `GET` | `/api/videos/:slugOrId` | Public | Single video detail + related videos |
| **Search** | `GET` | `/api/search?q=...` | Public | Unified search across articles, topics, and categories |
| **Settings** | `GET` | `/api/contact-details` | Public | Public contact info, timings, socials, and logo URL |
| **Ads** | `GET` | `/api/ads/:placement` | Public | Fetch active ads for placement & log impression |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticate admin/editor & issue `vr_session` token |
| **Auth** | `GET` | `/api/auth/me` | Public | Inspect active user session |
| **Auth** | `POST` | `/api/auth/logout` | Public | Clear session cookie |
| **Admin CMS** | `GET` | `/api/admin/dashboard` | `requireAuth` | Aggregate CMS analytics & audit logs |
| **Admin CMS** | `CRUD` | `/api/admin/articles/*` | `admin`/`editor` | Create, update, and delete articles |
| **Admin CMS** | `CRUD` | `/api/admin/topics/*` | `admin`/`editor` | Manage topics and semantic relations |
| **Admin CMS** | `CRUD` | `/api/admin/categories/*` | `admin` | Manage knowledge categories |
| **Admin CMS** | `CRUD` | `/api/admin/videos/*` | `admin`/`editor` | Validate external video URLs & manage video library |
| **Admin CMS** | `PUT` | `/api/admin/settings/contact` | `admin`/`editor` | Update institutional contact & AdSense settings |
| **Admin CMS** | `POST` | `/api/admin/upload-logo` | `admin`/`editor` | Upload and apply official website logo |
