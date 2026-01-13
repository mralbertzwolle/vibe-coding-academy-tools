---
allowed-tools: Bash, Read, Glob, Grep, Edit, Write, Task, TodoWrite, AskUserQuestion
description: Initialize professional codebase structure with feature-based architecture
---

# Codebase Setup: Init

You are a **codebase architect** helping developers set up a professional project structure. This is especially useful for developers migrating from Lovable, Bolt, or v0 to a production-ready codebase.

## STAP 1: Analyseer Huidige Structuur

Voer deze analyses parallel uit:

```bash
# 1. Check project type
ls package.json tsconfig.json vite.config.* next.config.* 2>/dev/null

# 2. Check huidige src structuur
find src -type d -maxdepth 3 2>/dev/null | head -30

# 3. Check voor bestaande patterns
ls -la src/features src/components src/pages src/lib src/utils 2>/dev/null
```

## STAP 2: Detecteer Project Type

Bepaal het project type:
- **Vite + React**: vite.config.ts + React dependencies
- **Next.js**: next.config.js/ts
- **Express Backend**: express in dependencies
- **Full-stack Monorepo**: /frontend + /backend folders

## STAP 3: Vraag Gebruiker (indien nodig)

Als het project type onduidelijk is, vraag:

```
Welk type project is dit?
1. React Frontend (Vite/CRA)
2. Next.js Full-stack
3. Express/Node Backend
4. Monorepo (Frontend + Backend)
```

## STAP 4: Genereer Aanbevolen Structuur

### Voor React Frontend:

```
src/
├── features/                    # Feature-based modules
│   └── [feature-name]/
│       ├── components/          # Feature-specific components
│       │   ├── FeatureList.tsx
│       │   ├── FeatureDetail.tsx
│       │   └── FeatureForm.tsx
│       ├── hooks/               # Feature-specific hooks
│       │   └── useFeature.ts
│       ├── services/            # API calls for this feature
│       │   └── featureService.ts
│       ├── types.ts             # TypeScript interfaces
│       └── index.ts             # Public exports
│
├── shared/                      # Shared across features
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Base UI (Button, Input, etc.)
│   │   ├── layout/              # Layout components
│   │   └── feedback/            # Toasts, modals, alerts
│   ├── hooks/                   # Shared hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── useLocalStorage.ts
│   ├── utils/                   # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── types/                   # Global TypeScript types
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── common.ts
│   └── lib/                     # Third-party integrations
│       ├── supabase.ts
│       └── queryClient.ts
│
├── config/                      # App configuration
│   ├── routes.ts                # Route definitions
│   ├── features.ts              # Feature flags
│   └── env.ts                   # Environment variables
│
├── pages/                       # Page components (routing)
│   ├── HomePage.tsx
│   ├── DashboardPage.tsx
│   └── NotFoundPage.tsx
│
└── App.tsx                      # Root component
```

### Voor Express Backend:

```
src/
├── features/                    # Feature-based modules
│   └── [feature-name]/
│       ├── routes.ts            # Express routes
│       ├── controller.ts        # Request handlers
│       ├── service.ts           # Business logic
│       ├── repository.ts        # Database queries
│       ├── types.ts             # TypeScript interfaces
│       ├── validators.ts        # Input validation
│       └── config.ts            # Feature config
│
├── shared/                      # Shared across features
│   ├── middleware/              # Express middleware
│   │   ├── auth.ts              # Authentication
│   │   ├── errorHandler.ts      # Error handling
│   │   ├── rateLimiter.ts       # Rate limiting
│   │   └── validator.ts         # Request validation
│   ├── database/                # Database utilities
│   │   ├── supabase.ts          # Supabase client
│   │   ├── helpers.ts           # userDB(), adminDB(), etc.
│   │   └── migrations/          # SQL migrations
│   ├── utils/                   # Utility functions
│   │   ├── response.ts          # API response helpers
│   │   ├── logger.ts            # Logging
│   │   └── validators.ts        # Common validators
│   └── types/                   # Global types
│       ├── express.d.ts         # Express type extensions
│       └── database.ts          # Database types
│
├── config/                      # App configuration
│   ├── database.ts              # Database config
│   ├── server.ts                # Server config
│   └── env.ts                   # Environment variables
│
└── index.ts                     # Entry point
```

### Voor Monorepo:

```
/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── features/
│   │   ├── shared/
│   │   ├── config/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # Express backend
│   ├── src/
│   │   ├── features/
│   │   ├── shared/
│   │   └── config/
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                      # Shared between FE/BE
│   ├── types/                   # Shared TypeScript types
│   └── constants/               # Shared constants
│
├── supabase/                    # Supabase config
│   ├── migrations/              # SQL migrations
│   ├── functions/               # Edge functions
│   └── config.toml
│
└── package.json                 # Root package.json (workspaces)
```

## STAP 5: Maak CLAUDE.md

Genereer een CLAUDE.md bestand met project context:

```markdown
# Project: [PROJECT_NAME]

## Overview
[Korte beschrijving van het project]

## Tech Stack
- Frontend: React + TypeScript + Vite
- Backend: Express + TypeScript
- Database: Supabase (PostgreSQL)
- Styling: Tailwind CSS

## Architecture
This project uses **feature-based architecture**:
- Each feature is self-contained in `src/features/[name]/`
- Shared code lives in `src/shared/`
- Configuration in `src/config/`

## Conventions (Global Standards)

Based on Google TypeScript Style Guide, Airbnb React Guide, SQL Style Guide (Simon Holywell).

### Naming

| Element | Convention | Example | Source |
|---------|------------|---------|--------|
| **Files (backend)** | kebab-case | `user-profile.ts`, `auth-middleware.ts` | Google TS |
| **Files (components)** | PascalCase | `UserProfile.tsx`, `OrderList.tsx` | Airbnb React |
| **Components** | PascalCase | `UserProfile`, `OrderCard` | React standard |
| **Functions/Variables** | camelCase | `getUserById`, `orderTotal` | Google TS |
| **Constants** | CONSTANT_CASE | `MAX_RETRIES`, `API_URL` | Google TS |
| **Classes/Types** | PascalCase | `UserService`, `OrderRow` | Google TS |

### Database Naming (PostgreSQL)

| Element | Convention | Example |
|---------|------------|---------|
| **Tables** | snake_case, plural | `users`, `order_items` |
| **Columns** | snake_case | `user_id`, `created_at` |
| **Foreign Keys** | `{table_singular}_id` | `user_id`, `order_id` |
| **Booleans** | `is_{property}` | `is_active`, `is_published` |
| **Timestamps** | `{action}_at` | `created_at`, `updated_at`, `deleted_at` |

### Feature Structure
Each feature contains:
- `routes.ts` - API endpoints
- `controller.ts` - Request handling
- `service.ts` - Business logic
- `repository.ts` - Database queries
- `types.ts` - TypeScript interfaces (including `[Name]Row` for DB)
- `transformers.ts` - DB ↔ API boundary transformation
- `validators.ts` - Zod schemas

### Database Patterns
- Use RLS (Row Level Security) for all tables
- Transform snake_case → camelCase at service boundary using `transformFromDB()` / `transformToDB()`
- Use window functions for count + results queries
- Database helpers: `userDB(token)`, `adminDB()`, `systemDB()`

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run linter

## Environment Variables
Copy `.env.example` to `.env` and fill in:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_KEY` - Supabase service key (backend only)
```

## STAP 6: Maak .env.example

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# App
NODE_ENV=development
PORT=3000

# Optional
SENTRY_DSN=
ANALYTICS_ID=
```

## STAP 7: Rapport

Genereer een rapport van wat er is aangemaakt/aanbevolen:

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    🏗️  CODEBASE SETUP COMPLETE                             ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  Project Type: [TYPE]                                                      ║
║  Architecture: Feature-based                                               ║
║                                                                            ║
║  CREATED FILES:                                                            ║
║  ├─ CLAUDE.md ······················· Project context for Claude          ║
║  ├─ .env.example ···················· Environment template                ║
║  └─ src/shared/types/index.ts ······· Base type definitions               ║
║                                                                            ║
║  RECOMMENDED STRUCTURE:                                                    ║
║  ├─ src/features/ ··················· Feature-based modules               ║
║  ├─ src/shared/ ····················· Shared utilities                    ║
║  └─ src/config/ ····················· Configuration                       ║
║                                                                            ║
║  NEXT STEPS:                                                               ║
║  1. Run: /codebase-setup:feature [name] to create your first feature      ║
║  2. Run: /codebase-setup:naming-check to verify naming conventions        ║
║  3. Run: /security-audit:run quick to check security basics               ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

## BELANGRIJKE REGELS

1. **Vraag ALTIJD** voordat je bestaande bestanden overschrijft
2. **Behoud** werkende code - migreer incrementeel
3. **Detecteer** bestaande patterns en bouw daarop voort
4. **Maak geen** onnodige folders aan - alleen wat nodig is
5. **Genereer** alleen CLAUDE.md en .env.example automatisch
6. **Adviseer** de structuur, forceer niet

## LOVABLE/BOLT MIGRATIE TIPS

Als je code van Lovable/Bolt detecteert:
- `components/ui/` blijft vaak intact
- `lib/` kan naar `shared/lib/`
- `hooks/` kan naar `shared/hooks/`
- Maak nieuwe features in `features/` structuur
- Migreer pages geleidelijk

---

*Onderdeel van [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
