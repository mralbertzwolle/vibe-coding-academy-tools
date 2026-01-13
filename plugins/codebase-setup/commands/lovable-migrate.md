---
allowed-tools: Bash, Read, Glob, Grep, Task, TodoWrite, Write, Edit, AskUserQuestion
description: Migrate a Lovable/Bolt/v0 frontend-only project to a production-ready frontend/backend architecture
---

# Codebase Setup: Lovable Migration

You are a **migration specialist** helping developers transition from Lovable/Bolt/v0 frontend-only projects to a production-ready frontend/backend architecture following **industry-standard conventions**.

---

## GLOBAL STANDARDS REFERENCE

This migration follows these authoritative sources:
- **Google TypeScript Style Guide** - Naming conventions
- **Airbnb React/JavaScript Style Guide** - React patterns
- **SQL Style Guide (Simon Holywell)** - Database naming
- **Turborepo/Nx** - Monorepo structure
- **Microsoft/Google REST API Guidelines** - API design

---

## NAMING CONVENTIONS (MANDATORY)

### TypeScript/JavaScript (Google Style Guide)

| Element | Convention | Example |
|---------|------------|---------|
| Variables, Functions | `camelCase` | `userId`, `getUserById()` |
| Classes, Interfaces, Types | `PascalCase` | `UserService`, `User` |
| Constants | `CONSTANT_CASE` | `MAX_RETRIES`, `API_URL` |
| Files (backend) | `kebab-case` | `user-service.ts`, `auth-middleware.ts` |
| Files (React components) | `PascalCase` | `UserProfile.tsx` |
| No leading underscores | - | `private` keyword instead of `_private` |

### PostgreSQL (SQL Style Guide)

| Element | Convention | Example |
|---------|------------|---------|
| Tables | `snake_case`, plural | `users`, `order_items` |
| Columns | `snake_case` | `user_id`, `created_at` |
| Foreign Keys | `{table_singular}_id` | `user_id`, `order_id` |
| Booleans | `is_{property}` | `is_active`, `is_published` |
| Timestamps | `{action}_at` | `created_at`, `updated_at` |

### REST API (Google/Microsoft Guidelines)

| Element | Convention | Example |
|---------|------------|---------|
| URL paths | lowercase, plural nouns | `/api/users`, `/api/orders` |
| URL words | kebab-case | `/api/user-preferences` |
| JSON fields | `camelCase` (for JS clients) | `userId`, `createdAt` |
| Versioning | path prefix | `/api/v1/users` |

### CRITICAL: Boundary Transformation

Database `snake_case` MUST be transformed to API `camelCase` at the service layer:

```typescript
// Database row (snake_case)
interface UserRow {
  user_id: string;
  created_at: string;
  organization_id: string;
}

// API response (camelCase)
interface User {
  userId: string;
  createdAt: string;
  organizationId: string;
}
```

---

## LOVABLE STANDARD TECHSTACK

### Frontend (What Lovable Uses)
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| Vite | 5.x | Build tool & dev server |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | latest | Component library (Radix + Tailwind) |
| React Router | 6.x | Client-side routing |
| TanStack Query | 5.x | Server state management |
| Zustand | 4.x | Client state (when needed) |
| Supabase JS | 2.x | Backend client |

### Backend (What We Add)
| Technology | Purpose |
|------------|---------|
| Express.js | API server |
| Zod | Runtime validation |
| Supabase Admin | Server-side database access |
| Node.js 20+ | Runtime |

---

## PHASE 1: ANALYZE CURRENT PROJECT

### Step 1.1: Detect Project Structure

```bash
# Check if this is a Lovable/Vite project
ls -la package.json vite.config.ts tailwind.config.ts tsconfig.json 2>/dev/null

# Show current structure
find . -type d -name "node_modules" -prune -o -type f \( -name "*.ts" -o -name "*.tsx" \) -print | head -50
```

### Step 1.2: Analyze package.json

Read `package.json` and identify:
- Current dependencies
- Scripts configuration
- Missing production dependencies

### Step 1.3: Find Edge Functions

```bash
# Supabase Edge Functions location
ls -la supabase/functions/ 2>/dev/null

# Or inline edge function calls
grep -rn "supabase.functions.invoke" --include="*.ts" --include="*.tsx" . 2>/dev/null | head -20
```

### Step 1.4: Find API Calls That Should Move to Backend

```bash
# Direct API calls with secrets (should be backend)
grep -rn "OPENAI\|STRIPE\|RESEND\|API_KEY\|SECRET" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -30

# fetch calls that might need backend
grep -rn "fetch\(" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -30
```

---

## PHASE 2: CREATE BACKEND STRUCTURE

### Step 2.1: Backend Directory Structure

Following **feature-based architecture** with **kebab-case file naming** (Google TS Style Guide):

```
backend/
├── src/
│   ├── features/                    # Feature modules
│   │   ├── auth/
│   │   │   ├── controller.ts        # Request handlers
│   │   │   ├── service.ts           # Business logic
│   │   │   ├── repository.ts        # Database queries
│   │   │   ├── routes.ts            # Express routes
│   │   │   ├── types.ts             # TypeScript types
│   │   │   ├── transformers.ts      # DB ↔ API transformation
│   │   │   ├── validators.ts        # Zod schemas
│   │   │   └── index.ts             # Public exports
│   │   ├── users/
│   │   ├── orders/
│   │   └── [feature]/
│   │
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── authenticate.ts      # JWT validation
│   │   │   ├── authorize.ts         # Role checking
│   │   │   ├── error-handler.ts     # Error middleware
│   │   │   └── validate.ts          # Request validation
│   │   ├── database/
│   │   │   ├── client.ts            # Supabase clients
│   │   │   └── helpers.ts           # userDB(), adminDB()
│   │   ├── utils/
│   │   │   ├── response.ts          # ApiResponse class
│   │   │   └── logger.ts            # Logging utility
│   │   └── types/
│   │       ├── express.d.ts         # Express extensions
│   │       └── index.ts             # Shared types
│   │
│   ├── config/
│   │   └── index.ts                 # Environment config
│   │
│   ├── app.ts                       # Express app setup
│   └── server.ts                    # Entry point
│
├── package.json
├── tsconfig.json
└── .env.example
```

### Step 2.2: Backend package.json

```json
{
  "name": "@project/backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "helmet": "^7.1.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.14.0",
    "tsx": "^4.16.0",
    "typescript": "^5.5.0"
  }
}
```

### Step 2.3: Backend tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 2.4: Core Backend Files

#### `src/config/index.ts`
```typescript
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),

  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_KEY: z.string(),

  // Frontend URL for CORS
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

export const config = envSchema.parse(process.env);
export type Config = z.infer<typeof envSchema>;
```

#### `src/shared/database/client.ts`
```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../../config';

/**
 * Admin client - BYPASSES RLS
 * Use only for admin operations and webhooks
 */
export const supabaseAdmin = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Create client with user's JWT token
 * Respects RLS policies based on auth.uid()
 */
export function createUserClient(accessToken: string): SupabaseClient {
  return createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
```

#### `src/shared/database/helpers.ts`
```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin, createUserClient } from './client';

/**
 * Database helper hierarchy (use LEAST privileged):
 *
 * userDB(token)  → User access, respects RLS
 * adminDB()      → Admin access, bypasses RLS
 * systemDB()     → System/webhook access, bypasses RLS
 */

/**
 * Get Supabase client with user's JWT token.
 * Respects RLS - use for all user-facing operations.
 */
export function userDB(token: string): SupabaseClient {
  return createUserClient(token);
}

/**
 * Get Supabase client with admin privileges.
 * CAUTION: Bypasses RLS! Only use when necessary.
 */
export function adminDB(): SupabaseClient {
  return supabaseAdmin;
}

/**
 * Get Supabase client for system operations.
 * Use for webhooks, cron jobs, background tasks.
 */
export function systemDB(): SupabaseClient {
  return supabaseAdmin;
}
```

#### `src/shared/middleware/authenticate.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../database/client';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      accessToken?: string;
    }
  }
}

/**
 * Validate JWT token and attach user to request.
 * Use: router.get('/', authenticateToken, handler)
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Get role from database (NOT from JWT claims for security)
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: roleData?.role || 'user',
    };
    req.accessToken = token;

    next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional authentication - continues even without token.
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  await authenticateToken(req, res, next);
}
```

#### `src/shared/middleware/authorize.ts`
```typescript
import { Request, Response, NextFunction } from 'express';

type UserRole = 'user' | 'creator' | 'admin' | 'superadmin';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 1,
  creator: 2,
  admin: 3,
  superadmin: 4,
};

/**
 * Require minimum role level.
 * Use AFTER authenticateToken.
 *
 * @example
 * router.get('/admin', authenticateToken, requireRole('admin'), handler);
 */
export function requireRole(minimumRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userLevel = ROLE_HIERARCHY[req.user.role as UserRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole];

    if (userLevel < requiredLevel) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: minimumRole,
        current: req.user.role,
      });
      return;
    }

    next();
  };
}
```

#### `src/shared/middleware/error-handler.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../../config';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Unknown errors
  console.error('Unhandled error:', err);

  res.status(500).json({
    error: config.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
}
```

#### `src/shared/utils/response.ts`
```typescript
import { Response } from 'express';

/**
 * Standardized API response helpers.
 * All responses use camelCase field names (Google/Microsoft REST guidelines).
 */
export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200): Response {
    return res.status(statusCode).json({ data });
  }

  static created<T>(res: Response, data: T): Response {
    return ApiResponse.success(res, data, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static notFound(res: Response, message = 'Resource not found'): Response {
    return res.status(404).json({ error: message });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
    }
  ): Response {
    return res.status(200).json({
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalCount: pagination.totalCount,
        totalPages: Math.ceil(pagination.totalCount / pagination.limit),
      },
    });
  }
}
```

#### `src/app.ts`
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './shared/middleware/error-handler';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes (add your feature routes here)
// app.use('/api/v1/users', usersRoutes);
// app.use('/api/v1/orders', ordersRoutes);

// Error handling (must be last)
app.use(errorHandler);

export { app };
```

#### `src/server.ts`
```typescript
import { app } from './app';
import { config } from './config';

const port = parseInt(config.PORT, 10);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Environment: ${config.NODE_ENV}`);
});
```

#### `.env.example`
```env
NODE_ENV=development
PORT=3001

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Add your API keys here
# OPENAI_API_KEY=
# STRIPE_SECRET_KEY=
# RESEND_API_KEY=
```

---

## PHASE 3: FEATURE MODULE TEMPLATE

### Complete Feature Example: Email

#### `src/features/email/types.ts`
```typescript
/**
 * Database row type (snake_case - matches PostgreSQL)
 */
export interface EmailLogRow {
  id: string;
  user_id: string;
  to_address: string;
  subject: string;
  status: string;
  created_at: string;
}

/**
 * API response type (camelCase - for frontend consumption)
 */
export interface EmailLog {
  id: string;
  userId: string;
  toAddress: string;
  subject: string;
  status: string;
  createdAt: string;
}

/**
 * Input type for sending email
 */
export interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
}
```

#### `src/features/email/transformers.ts`
```typescript
import { EmailLogRow, EmailLog } from './types';

/**
 * Transform database row (snake_case) to API response (camelCase).
 * This is the BOUNDARY between database and API.
 */
export function transformFromDB(row: EmailLogRow): EmailLog {
  return {
    id: row.id,
    userId: row.user_id,
    toAddress: row.to_address,
    subject: row.subject,
    status: row.status,
    createdAt: row.created_at,
  };
}

/**
 * Transform API input (camelCase) to database format (snake_case).
 */
export function transformToDB(input: Partial<EmailLog>): Partial<EmailLogRow> {
  const result: Partial<EmailLogRow> = {};

  if (input.userId !== undefined) result.user_id = input.userId;
  if (input.toAddress !== undefined) result.to_address = input.toAddress;
  if (input.subject !== undefined) result.subject = input.subject;
  if (input.status !== undefined) result.status = input.status;

  return result;
}
```

#### `src/features/email/validators.ts`
```typescript
import { z } from 'zod';

export const sendEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(255),
  body: z.string().min(1, 'Body is required'),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
```

#### `src/features/email/repository.ts`
```typescript
import { userDB, adminDB } from '../../shared/database/helpers';
import { EmailLogRow, EmailLog } from './types';
import { transformFromDB, transformToDB } from './transformers';

const TABLE_NAME = 'email_logs';

export async function create(
  userId: string,
  token: string,
  input: { toAddress: string; subject: string; status: string }
): Promise<EmailLog> {
  const db = userDB(token);

  const { data, error } = await db
    .from(TABLE_NAME)
    .insert({
      user_id: userId,
      to_address: input.toAddress,
      subject: input.subject,
      status: input.status,
    })
    .select()
    .single();

  if (error) throw error;

  return transformFromDB(data as EmailLogRow);
}

export async function findByUserId(
  userId: string,
  token: string
): Promise<EmailLog[]> {
  const db = userDB(token);

  const { data, error } = await db
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data as EmailLogRow[]).map(transformFromDB);
}
```

#### `src/features/email/service.ts`
```typescript
import { config } from '../../config';
import * as repository from './repository';
import { SendEmailInput, EmailLog } from './types';

export async function sendEmail(
  userId: string,
  token: string,
  input: SendEmailInput
): Promise<EmailLog> {
  // Send via external service (Resend, SendGrid, etc.)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@example.com',
      to: input.to,
      subject: input.subject,
      html: input.body,
    }),
  });

  const status = response.ok ? 'sent' : 'failed';

  // Log to database
  return repository.create(userId, token, {
    toAddress: input.to,
    subject: input.subject,
    status,
  });
}

export async function getEmailHistory(
  userId: string,
  token: string
): Promise<EmailLog[]> {
  return repository.findByUserId(userId, token);
}
```

#### `src/features/email/controller.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { sendEmailSchema } from './validators';
import { ApiResponse } from '../../shared/utils/response';

export async function send(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const token = req.accessToken!;
    const input = sendEmailSchema.parse(req.body);

    const result = await service.sendEmail(userId, token, input);

    ApiResponse.created(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const token = req.accessToken!;

    const emails = await service.getEmailHistory(userId, token);

    ApiResponse.success(res, emails);
  } catch (error) {
    next(error);
  }
}
```

#### `src/features/email/routes.ts`
```typescript
import { Router } from 'express';
import { authenticateToken } from '../../shared/middleware/authenticate';
import * as controller from './controller';

const router = Router();

router.post('/send', authenticateToken, controller.send);
router.get('/history', authenticateToken, controller.getHistory);

export { router as emailRoutes };
```

#### `src/features/email/index.ts`
```typescript
export * from './types';
export { emailRoutes } from './routes';
```

---

## PHASE 4: UPDATE FRONTEND

### Step 4.1: Create API Client

**`src/lib/api.ts`** (add to frontend)
```typescript
import { supabase } from '@/integrations/supabase/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  // Get current session token
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token && {
        Authorization: `Bearer ${session.access_token}`,
      }),
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json();
  return json.data ?? json;
}

// Convenience methods with camelCase naming
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) => apiRequest<T>(endpoint, { method: 'POST', body }),
  put: <T>(endpoint: string, body: unknown) => apiRequest<T>(endpoint, { method: 'PUT', body }),
  patch: <T>(endpoint: string, body: unknown) => apiRequest<T>(endpoint, { method: 'PATCH', body }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
};
```

### Step 4.2: Update Frontend Calls

**Before (Edge Function call):**
```typescript
const { data, error } = await supabase.functions.invoke('send-email', {
  body: { to, subject, body },
});
```

**After (Backend API call):**
```typescript
import { api } from '@/lib/api';

const result = await api.post('/api/v1/email/send', { to, subject, body });
```

### Step 4.3: Add Environment Variable

Add to frontend `.env`:
```env
VITE_API_URL=http://localhost:3001
```

---

## PHASE 5: MONOREPO SETUP (Optional)

Following **Turborepo conventions**:

```
project/
├── apps/
│   ├── web/                    # React frontend (Lovable export)
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── api/                    # Express backend
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                 # Shared types
│   │   ├── src/
│   │   │   └── types/
│   │   └── package.json
│   └── config/                 # Shared config
│       ├── eslint/
│       ├── typescript/
│       └── package.json
│
├── package.json                # Root with workspaces
├── turbo.json                  # Turborepo config
└── pnpm-workspace.yaml         # If using pnpm
```

**Root package.json:**
```json
{
  "name": "@project/monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {}
  }
}
```

---

## MIGRATION REPORT

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    🚀 LOVABLE MIGRATION REPORT                             ║
║                    [PROJECT_NAME]                                          ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  STANDARDS COMPLIANCE                                                      ║
║  ├─ Google TypeScript Style Guide ✅                                       ║
║  ├─ Airbnb React Style Guide ✅                                            ║
║  ├─ SQL Style Guide (Simon Holywell) ✅                                    ║
║  ├─ Turborepo Monorepo Pattern ✅                                          ║
║  └─ REST API Guidelines (Google/Microsoft) ✅                              ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  MIGRATION SUMMARY                                                         ║
║  ├─ Edge Functions Migrated: X                                             ║
║  ├─ Backend Features Created: X                                            ║
║  ├─ Frontend API Calls Updated: X                                          ║
║  └─ Secrets Moved to Backend: X                                            ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  NAMING CONVENTIONS APPLIED                                                ║
║  ├─ TypeScript: camelCase vars, PascalCase types                           ║
║  ├─ Files (backend): kebab-case                                            ║
║  ├─ Files (React): PascalCase for components                               ║
║  ├─ Database: snake_case                                                   ║
║  ├─ REST URLs: lowercase with kebab-case                                   ║
║  └─ JSON responses: camelCase                                              ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  KEY PATTERNS IMPLEMENTED                                                  ║
║  ├─ Boundary transformation (snake_case ↔ camelCase)                       ║
║  ├─ Database helpers: userDB(), adminDB()                                  ║
║  ├─ ApiResponse class for consistent responses                             ║
║  ├─ Feature-based architecture                                             ║
║  └─ Separate Row types for database                                        ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  NEXT STEPS                                                                ║
║  1. Copy .env.example to .env and fill values                              ║
║  2. Run: cd backend && npm install && npm run dev                          ║
║  3. Update frontend VITE_API_URL                                           ║
║  4. Test all migrated endpoints                                            ║
║  5. Deploy: Railway.app, Render.com, or Fly.io                             ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## WHAT NOT TO MIGRATE

Keep these in Supabase (don't move to backend):

1. **Authentication** - Keep Supabase Auth on frontend
2. **Real-time subscriptions** - Keep Supabase Realtime
3. **File uploads** - Keep Supabase Storage
4. **Simple CRUD with RLS** - If RLS handles it, keep it client-side

Only move to backend:
- External API integrations (OpenAI, Stripe, Resend)
- Complex business logic
- Operations requiring service_role key
- Scheduled tasks / cron jobs
- Webhook handlers

---

## REFERENCES

- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [SQL Style Guide](https://www.sqlstyle.guide/)
- [Turborepo Documentation](https://turborepo.dev/)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)

---

*Onderdeel van [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
