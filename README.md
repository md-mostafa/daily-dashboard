# Daily Dashboard

A production-grade full-stack monorepo featuring a React dashboard with task management, weather, and quote widgets, backed by a NestJS API ready for future backend integration.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Daily Dashboard                           │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │     API      │    │   Shared     │  │
│  │  (React 19)  │◄──►│  (NestJS)    │◄──►│   Package    │  │
│  │  :5173       │    │  :3001       │    │  Types/Utils │  │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘  │
│         │                   │                               │
│         │            ┌──────┴───────┐                       │
│         │            │  PostgreSQL  │                       │
│         │            │  (Database)  │                       │
│         │            └──────────────┘                       │
│         │            ┌──────────────┐                       │
│         │            │    Redis     │                       │
│         │            │   (Cache)    │                       │
│         │            └──────────────┘                       │
└─────────┴───────────────────────────────────────────────────┘
```

## Folder Structure

```
daily-dashboard/
│
├── apps/
│   ├── web/                    # React + Vite frontend
│   │   ├── src/
│   │   │   ├── api/            # API client functions
│   │   │   ├── components/     # Shared UI components (shadcn/ui)
│   │   │   ├── features/       # Feature-specific modules
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utility functions
│   │   │   ├── mock/           # Mock data for development
│   │   │   ├── pages/          # Route page components
│   │   │   ├── router/         # TanStack Router configuration
│   │   │   ├── store/          # Zustand stores
│   │   │   └── types/          # TypeScript type re-exports
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api/                    # NestJS backend
│       ├── src/
│       │   ├── auth/           # Authentication module
│       │   ├── tasks/          # Tasks module
│       │   ├── users/          # Users module
│       │   ├── weather/        # Weather module
│       │   ├── quotes/         # Quotes module
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── nest-cli.json
│       └── package.json
│
├── packages/
│   ├── shared/                 # Shared code between apps
│   │   ├── src/
│   │   │   ├── types/          # DTO interfaces & enums
│   │   │   ├── constants/      # Shared constants
│   │   │   ├── utils/          # Utility functions
│   │   │   └── validation/     # Zod validation schemas
│   │   └── package.json
│   │
│   ├── eslint-config/          # Shared ESLint configurations
│   │   ├── web.js              # Frontend ESLint config
│   │   ├── api.js              # Backend ESLint config
│   │   └── package.json
│   │
│   └── tsconfig/               # Shared TypeScript configs
│       ├── base.json           # Base configuration
│       ├── web.json            # Frontend configuration
│       ├── api.json            # Backend configuration
│       └── package.json
│
├── docker/
│   ├── Dockerfile.web          # Frontend Dockerfile
│   └── Dockerfile.api          # Backend Dockerfile
│
├── docker-compose.yml          # Docker Compose configuration
├── pnpm-workspace.yaml         # pnpm workspace definition
├── package.json                # Root package.json
└── README.md
```

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **TanStack Router** for type-safe routing
- **TanStack Query** for server state management
- **Tailwind CSS v4** for styling
- **shadcn/ui** for UI components
- **Zustand** for client state management
- **React Hook Form** + **Zod** for form validation
- **Framer Motion** for animations

### Backend
- **NestJS 11** with TypeScript
- **PostgreSQL 16** (via Docker)
- **Redis 7** (via Docker)
- **Drizzle ORM** (ready for integration)
- **Class Validator** + **Class Transformer**

### Infrastructure
- **pnpm** workspaces for monorepo management
- **Docker Compose** for local development
- **TypeScript project references** for type safety
- **ESLint** + **Prettier** for code quality

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20.0.0
- [pnpm](https://pnpm.io/) >= 9.0.0
- [Docker](https://www.docker.com/) (for containerized development)
- [Docker Compose](https://docs.docker.com/compose/) (included with Docker Desktop)

## Local Setup

### 1. Install pnpm

```bash
npm install -g pnpm
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
# Frontend
cp apps/web/.env.example apps/web/.env

# Backend
cp apps/api/.env.example apps/api/.env
```

### 4. Start Development Servers

#### Option A: Docker (Recommended)

```bash
docker compose up
```

This starts all services:
- Frontend at http://localhost:5173
- API at http://localhost:3001
- PostgreSQL on port 5432
- Redis on port 6379

#### Option B: Local Development

```bash
# Terminal 1: Start the frontend
pnpm --filter @repo/web dev

# Terminal 2: Start the API
pnpm --filter @repo/api dev
```

## Development Workflow

### Available Commands

```bash
# Start all apps in development mode
pnpm dev

# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Format code
pnpm format

# Type check all apps
pnpm typecheck

# Clean build artifacts
pnpm clean
```

### Working with the Shared Package

The `@repo/shared` package contains types, constants, utilities, and validation schemas shared between frontend and backend.

```typescript
// Import types
import type { Task, Weather, Quote } from "@repo/shared";

// Import constants
import { API_ENDPOINTS, QUERY_KEYS } from "@repo/shared";

// Import utilities
import { formatDate, delay } from "@repo/shared";

// Import validation schemas
import { createTaskSchema } from "@repo/shared";
```

### Adding a New Feature

1. Define types in `packages/shared/src/types/`
2. Add validation schemas in `packages/shared/src/validation/`
3. Create the backend module in `apps/api/src/`
4. Create the frontend feature in `apps/web/src/features/`
5. Add the route in `apps/web/src/router/`

## Docker Services

| Service   | Container Name            | Port  | Description                |
|-----------|---------------------------|-------|----------------------------|
| Web       | `daily-dashboard-web`     | 5173  | React + Vite frontend      |
| API       | `daily-dashboard-api`     | 3001  | NestJS backend             |
| PostgreSQL| `daily-dashboard-postgres`| 5432  | Primary database           |
| Redis     | `daily-dashboard-redis`   | 6379  | Cache & session store      |

### Docker Volumes

- `daily-dashboard-postgres-data`: Persistent PostgreSQL data
- `daily-dashboard-redis-data`: Persistent Redis data

## Environment Variables

### Frontend (`apps/web/.env`)

| Variable                  | Description              | Default                    |
|---------------------------|--------------------------|----------------------------|
| `VITE_API_BASE_URL`       | Backend API URL          | `http://localhost:3001`    |
| `VITE_WEATHER_API_KEY`    | OpenWeatherMap API key   | -                          |
| `VITE_WEATHER_API_BASE_URL` | Weather API base URL   | -                          |
| `VITE_SUPABASE_URL`       | Supabase project URL     | -                          |
| `VITE_SUPABASE_ANON_KEY`  | Supabase anonymous key   | -                          |

### Backend (`apps/api/.env`)

| Variable          | Description              | Default                                      |
|-------------------|--------------------------|----------------------------------------------|
| `PORT`            | API server port          | `3001`                                       |
| `NODE_ENV`        | Environment              | `development`                                |
| `CORS_ORIGIN`     | Allowed CORS origin      | `http://localhost:5173`                      |
| `DATABASE_URL`    | PostgreSQL connection    | `postgresql://postgres:postgres@localhost:5432/daily_dashboard` |
| `REDIS_URL`       | Redis connection         | `redis://localhost:6379`                     |
| `JWT_SECRET`      | JWT signing secret       | -                                            |
| `JWT_EXPIRES_IN`  | JWT expiration           | `7d`                                         |

## Code Quality

- **Strict TypeScript**: Full strict mode enabled across all packages
- **Shared ESLint**: Consistent linting rules for frontend and backend
- **Prettier**: Automatic code formatting
- **TypeScript Project References**: Fast incremental builds
- **Path Aliases**: `@/` maps to `src/` in both apps

## Future Roadmap

- [ ] Real authentication with JWT
- [ ] Drizzle ORM integration with PostgreSQL
- [ ] Redis caching layer
- [ ] Real weather API integration
- [ ] User management
- [ ] Unit and integration tests
- [ ] CI/CD pipeline
- [ ] Production deployment configuration

## License

MIT