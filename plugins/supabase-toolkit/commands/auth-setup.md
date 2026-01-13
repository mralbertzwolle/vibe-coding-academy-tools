---
allowed-tools: Bash, Read, Glob, Grep, Edit, Write, Task, TodoWrite, AskUserQuestion, mcp__plugin_supabase_supabase__list_tables, mcp__plugin_supabase_supabase__execute_sql
description: Configure authentication with JWT validation, middleware, and role-based access
---

# Supabase Toolkit: Auth Setup

You are a **security architect** helping developers set up authentication properly with Supabase. This command configures JWT validation, middleware, and role-based access control.

## AUTHENTICATION ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend                    Backend                  Database   │
│  ────────                    ───────                  ────────   │
│                                                                  │
│  1. User Login               2. Validate JWT          3. RLS     │
│     ↓                           ↓                        ↓       │
│  Supabase Auth    →    authenticateToken    →    auth.uid()      │
│     ↓                       middleware              enforces     │
│  JWT Token                      ↓                   policies     │
│     ↓                   requireRole()                            │
│  Authorization                  ↓                                │
│  Header              userDB() / adminDB()                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## STAP 1: Analyseer Huidige Setup

```bash
# Check for existing auth setup
ls -la src/middleware src/shared/middleware 2>/dev/null
grep -rn "authenticateToken\|requireRole\|jwt\|supabase" src/ --include="*.ts" 2>/dev/null | head -20

# Check for Supabase client
grep -rn "createClient\|supabase" src/ --include="*.ts" 2>/dev/null | head -10
```

## STAP 2: Vraag Configuratie

Vraag de gebruiker:

```
Welke authentication setup heb je nodig?

1. Basic (user authentication only)
2. Role-based (user, admin roles)
3. Multi-level (user, creator, admin, superadmin)
4. Custom (specify your roles)
```

## STAP 3: Genereer Middleware

### `src/shared/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type UserRole = 'user' | 'creator' | 'admin' | 'superadmin';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  organizationId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      supabase?: SupabaseClient;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SUPABASE CLIENTS
// ═══════════════════════════════════════════════════════════════════════════

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

/**
 * Create a Supabase client with the user's JWT token.
 * This client respects RLS policies based on the authenticated user.
 */
function createUserClient(token: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}

/**
 * Create a Supabase client with service role.
 * CAUTION: This bypasses RLS! Only use for admin operations.
 */
function createAdminClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTHENTICATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Authenticate the user via JWT token in Authorization header.
 * Attaches user info and Supabase client to request.
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7);

    // Create client with user's token
    const supabase = createUserClient(token);

    // Validate token and get user
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Get user role from database (NOT from JWT claims!)
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    // Get organization if applicable
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    // Attach to request
    req.user = {
      id: user.id,
      email: user.email!,
      role: (userRole?.role as UserRole) || 'user',
      organizationId: userOrg?.organization_id
    };
    req.supabase = supabase;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional authentication - continues even if no token provided.
 * Useful for public endpoints that behave differently for authenticated users.
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    // No token, continue as anonymous
    next();
    return;
  }

  // If token provided, validate it
  await authenticateToken(req, res, next);
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTHORIZATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════

const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 1,
  creator: 2,
  admin: 3,
  superadmin: 4
};

/**
 * Require a minimum role level.
 * Must be used AFTER authenticateToken.
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

    const userLevel = ROLE_HIERARCHY[req.user.role];
    const requiredLevel = ROLE_HIERARCHY[minimumRole];

    if (userLevel < requiredLevel) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: minimumRole,
        current: req.user.role
      });
      return;
    }

    next();
  };
}

/**
 * Require exact role (not hierarchical).
 */
export function requireExactRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: role,
        current: req.user.role
      });
      return;
    }

    next();
  };
}

/**
 * Require user to belong to a specific organization.
 */
export function requireOrganization(orgIdParam: string = 'organizationId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const requestedOrgId = req.params[orgIdParam] || req.body[orgIdParam];

    // Admins and superadmins can access any organization
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      next();
      return;
    }

    if (req.user.organizationId !== requestedOrgId) {
      res.status(403).json({ error: 'Access denied to this organization' });
      return;
    }

    next();
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE HELPERS (in middleware - use helpers.ts for actual implementation)
// ═══════════════════════════════════════════════════════════════════════════

// NOTE: The actual database helpers are in src/shared/database/helpers.ts
// These convenience methods provide access via request object:

/**
 * Get user's access token from request.
 * Use with userDB(token) from helpers.ts
 *
 * @example
 * import { userDB } from '../../shared/database/helpers';
 * const db = userDB(req.accessToken!);
 */
export function getAccessToken(req: Request): string {
  if (!req.accessToken) {
    throw new Error('No access token available - authenticate first');
  }
  return req.accessToken;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST MODE (Development Only)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Test mode middleware for development.
 * Allows bypassing auth with x-test-mode header.
 *
 * NEVER enable in production!
 */
export function testModeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (process.env.NODE_ENV === 'production') {
    next();
    return;
  }

  const testMode = req.headers['x-test-mode'];
  const testUserId = req.headers['x-test-user-id'] as string;
  const testRole = req.headers['x-test-role'] as UserRole;

  if (testMode === 'true' && testUserId) {
    req.user = {
      id: testUserId,
      email: 'test@example.com',
      role: testRole || 'user'
    };
    req.supabase = createAdminClient(); // Use admin for test mode
    console.warn('⚠️ Test mode active - authentication bypassed');
  }

  next();
}
```

## STAP 4: Genereer Database Helpers

### `src/shared/database/helpers.ts`

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

/**
 * Database helper hierarchy:
 *
 * publicDB()     → Anonymous access, respects RLS public policies
 * userDB(token)  → User access, respects RLS user policies
 * adminDB()      → Admin access, bypasses most RLS
 * superadminDB() → Full access, bypasses all RLS
 * systemDB()     → System/webhook access, bypasses all RLS
 *
 * RULE: Always use the LEAST privileged helper needed!
 */

/**
 * Public database client (anonymous access).
 * Use for public endpoints that don't require authentication.
 */
export function publicDB(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * User database client with JWT token.
 * Respects RLS policies based on auth.uid().
 */
export function userDB(token: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}

/**
 * Admin database client.
 * Uses service role - BYPASSES RLS!
 * Use only when admin needs to access/modify data across users.
 */
export function adminDB(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Superadmin database client.
 * Same as adminDB but semantically indicates highest privilege level.
 */
export function superadminDB(): SupabaseClient {
  return adminDB();
}

/**
 * System database client.
 * Use for webhooks, cron jobs, background tasks.
 * No user context, full access.
 */
export function systemDB(): SupabaseClient {
  return adminDB();
}

/**
 * Helper to get appropriate client based on role.
 */
export function getDBClient(
  role: 'public' | 'user' | 'admin' | 'superadmin' | 'system',
  token?: string
): SupabaseClient {
  switch (role) {
    case 'public':
      return publicDB();
    case 'user':
      if (!token) throw new Error('Token required for user DB');
      return userDB(token);
    case 'admin':
      return adminDB();
    case 'superadmin':
      return superadminDB();
    case 'system':
      return systemDB();
    default:
      throw new Error(`Unknown role: ${role}`);
  }
}
```

## STAP 5: Genereer User Roles Migration

```sql
-- Migration: create_user_roles_table
-- Description: Store user roles separately from JWT claims for security

-- Create enum for roles
CREATE TYPE user_role AS ENUM ('user', 'creator', 'admin', 'superadmin');

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for quick lookups
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read their own role, only superadmins can modify
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Superadmins can manage all roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER set_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get current user's role (for RLS policies)
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS user_role AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Function to check if user is admin or higher
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Function to check if user is superadmin
CREATE OR REPLACE FUNCTION auth.is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'superadmin'
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Auto-create user role on signup (via trigger)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

## STAP 6: Genereer Express Setup

### `src/index.ts` (additions)

```typescript
import express from 'express';
import {
  authenticateToken,
  optionalAuth,
  requireRole,
  testModeMiddleware
} from './shared/middleware/auth';

const app = express();

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE SETUP
// ═══════════════════════════════════════════════════════════════════════════

// Test mode (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use(testModeMiddleware);
}

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Public routes (no auth required)
app.use('/api/public', publicRoutes);

// Authenticated routes (user level)
app.use('/api/user', authenticateToken, userRoutes);

// Admin routes (admin level required)
app.use('/api/admin', authenticateToken, requireRole('admin'), adminRoutes);

// Superadmin routes
app.use('/api/superadmin', authenticateToken, requireRole('superadmin'), superadminRoutes);

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════

// Example: Mixed public/authenticated endpoint
app.get('/api/products',
  optionalAuth,
  async (req, res) => {
    // If authenticated, show user-specific pricing
    if (req.user) {
      const products = await getProductsForUser(req.user.id);
      return res.json(products);
    }
    // Otherwise, show public catalog
    const products = await getPublicProducts();
    res.json(products);
  }
);

// Example: Creator-only endpoint
app.post('/api/content',
  authenticateToken,
  requireRole('creator'),
  async (req, res) => {
    // Only creators and above can create content
  }
);
```

## STAP 7: Genereer Frontend Auth Hook

### `src/shared/hooks/useAuth.ts`

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserRole(session.user.id);
      }
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session,
        isLoading: false,
        isAuthenticated: !!session
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await fetchUserRole(session.user.id);
        }
        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          isAuthenticated: !!session,
          role: session ? prev.role : null,
          isAdmin: session ? prev.isAdmin : false
        }));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserRole(userId: string) {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    const role = data?.role || 'user';
    setState(prev => ({
      ...prev,
      role,
      isAdmin: role === 'admin' || role === 'superadmin'
    }));
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function getToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  return {
    ...state,
    signIn,
    signOut,
    getToken
  };
}
```

## STAP 8: Genereer Rapport

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    🔐 AUTHENTICATION SETUP COMPLETE                        ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  ARCHITECTURE                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────┐   ║
║  │  Frontend  →  JWT Token  →  Backend Middleware  →  Database RLS    │   ║
║  │  useAuth()    Bearer       authenticateToken()     auth.uid()      │   ║
║  └─────────────────────────────────────────────────────────────────────┘   ║
║                                                                            ║
║  FILES CREATED                                                             ║
║  ├─ src/shared/middleware/auth.ts ······· Authentication middleware        ║
║  ├─ src/shared/database/helpers.ts ······ DB client helpers                ║
║  ├─ src/shared/hooks/useAuth.ts ········· Frontend auth hook               ║
║  └─ supabase/migrations/xxx_user_roles.sql · Roles table + functions       ║
║                                                                            ║
║  MIDDLEWARE STACK                                                          ║
║  ├─ authenticateToken ··················· Validates JWT, attaches user     ║
║  ├─ optionalAuth ························ Auth optional (public/mixed)     ║
║  ├─ requireRole(role) ··················· Minimum role required            ║
║  ├─ requireExactRole(role) ·············· Exact role match                 ║
║  └─ requireOrganization() ··············· Org membership check             ║
║                                                                            ║
║  DATABASE HELPERS                                                          ║
║  ├─ publicDB() ·························· Anonymous access                 ║
║  ├─ userDB(token) ······················· User access (respects RLS)       ║
║  ├─ adminDB() ··························· Admin access (bypasses RLS)      ║
║  └─ systemDB() ·························· System/webhook access            ║
║                                                                            ║
║  SQL FUNCTIONS                                                             ║
║  ├─ auth.user_role() ···················· Get current user's role          ║
║  ├─ auth.is_admin() ····················· Check if admin or higher         ║
║  └─ auth.is_superadmin() ················ Check if superadmin              ║
║                                                                            ║
║  SECURITY NOTES                                                            ║
║  ⚠️  NEVER trust JWT claims for roles - always fetch from database         ║
║  ⚠️  Use userDB() for user operations, adminDB() only when necessary       ║
║  ⚠️  Test mode is DISABLED in production                                   ║
║                                                                            ║
║  NEXT STEPS                                                                ║
║  1. Run migration: npx supabase db push                                    ║
║  2. Configure routes in src/index.ts                                       ║
║  3. Test auth flow: /supabase-toolkit:rls-audit                            ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

*Onderdeel van [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
