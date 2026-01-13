---
allowed-tools: Bash, Read, Glob, Grep, Edit, Write, Task, TodoWrite, AskUserQuestion
argument-hint: <feature-name>
description: Scaffold a new feature with all required files (routes, controller, service, types, components)
---

# Codebase Setup: Feature Scaffold

You are a **feature architect** helping developers create new features with a consistent, professional structure. This command scaffolds all necessary files for a new feature module.

## ARGUMENT PARSING

Het argument is de feature naam, bijvoorbeeld:
- `/codebase-setup:feature orders` → feature "orders"
- `/codebase-setup:feature user-profile` → feature "user-profile"
- `/codebase-setup:feature` (geen argument) → vraag de gebruiker

## STAP 1: Valideer Feature Naam

```
Regels:
- Gebruik kebab-case: user-profile, order-items, payment-methods
- Geen underscores: user_profile ❌ → user-profile ✅
- Geen PascalCase: UserProfile ❌ → user-profile ✅
- Enkelvoud of meervoud consistent met domein
```

Als de naam niet voldoet, corrigeer automatisch en bevestig:
> "Feature naam 'UserProfile' geconverteerd naar 'user-profile'. Doorgaan?"

## STAP 2: Detecteer Project Type

Analyseer het project om te bepalen welke bestanden nodig zijn:

```bash
# Check project type
ls -la package.json src/features 2>/dev/null
cat package.json | grep -E '"react"|"express"|"next"' 2>/dev/null
```

**Project Types:**
1. **Frontend Only** → Components, hooks, services, types
2. **Backend Only** → Routes, controller, service, repository, types
3. **Full-stack** → Beide sets
4. **Monorepo** → Vraag: frontend, backend, of beide?

## STAP 3: Vraag Configuratie (AskUserQuestion)

Vraag de gebruiker welke onderdelen nodig zijn:

```
Welke onderdelen heeft deze feature nodig?

□ API Routes (CRUD endpoints)
□ Database Repository (Supabase queries)
□ React Components (List, Detail, Form)
□ Custom Hooks (data fetching, state)
□ Config-driven filters (sorting, filtering, pagination)
```

## STAP 4: Genereer Bestanden

### Backend Feature Structure

#### `src/features/[name]/routes.ts`
```typescript
import { Router } from 'express';
import { authenticateToken, requireRole } from '../../shared/middleware/auth';
import * as controller from './controller';

const router = Router();

// Public routes (if any)
// router.get('/public', controller.getPublic);

// Authenticated routes
router.get('/', authenticateToken, controller.getAll);
router.get('/:id', authenticateToken, controller.getById);
router.post('/', authenticateToken, controller.create);
router.put('/:id', authenticateToken, controller.update);
router.delete('/:id', authenticateToken, controller.remove);

// Admin routes
router.get('/admin/all', authenticateToken, requireRole('admin'), controller.adminGetAll);

export default router;
```

#### `src/features/[name]/controller.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { ApiResponse } from '../../shared/utils/response';
import { validateRequest } from '../../shared/middleware/validator';
import { createSchema, updateSchema } from './validators';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const token = req.accessToken!;
    const { page = 1, limit = 20, sortBy, sortOrder, ...filters } = req.query;

    const result = await service.getAll(userId, token, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
      filters
    });

    return ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const token = req.accessToken!;
    const { id } = req.params;

    const result = await service.getById(userId, token, id);

    if (!result) {
      return ApiResponse.notFound(res, '[FeatureName] not found');
    }

    return ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const token = req.accessToken!;
    const data = validateRequest(req.body, createSchema);

    const result = await service.create(userId, token, data);

    return ApiResponse.created(res, result);
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const token = req.accessToken!;
    const { id } = req.params;
    const data = validateRequest(req.body, updateSchema);

    const result = await service.update(userId, token, id, data);

    return ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const token = req.accessToken!;
    const { id } = req.params;

    await service.remove(userId, token, id);

    return ApiResponse.noContent(res);
  } catch (error) {
    next(error);
  }
}

export async function adminGetAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, limit = 20, ...filters } = req.query;

    const result = await service.adminGetAll({
      page: Number(page),
      limit: Number(limit),
      filters
    });

    return ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
}
```

#### `src/features/[name]/service.ts`
```typescript
import * as repository from './repository';
import { Create[Name]Input, Update[Name]Input, [Name], [Name]Filters } from './types';

/**
 * Get all [name]s for a user with filtering and pagination
 */
export async function getAll(
  userId: string,
  token: string,
  options: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: [Name]Filters;
  }
) {
  const { page, limit, sortBy = 'created_at', sortOrder = 'desc', filters } = options;
  const offset = (page - 1) * limit;

  const { data, totalCount } = await repository.findAll(userId, token, {
    limit,
    offset,
    sortBy,
    sortOrder,
    filters
  });

  return {
    data,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
}

/**
 * Get a single [name] by ID (with ownership check)
 */
export async function getById(userId: string, token: string, id: string): Promise<[Name] | null> {
  return repository.findById(userId, token, id);
}

/**
 * Create a new [name]
 */
export async function create(userId: string, token: string, input: Create[Name]Input): Promise<[Name]> {
  return repository.create(userId, token, input);
}

/**
 * Update a [name] (with ownership check)
 */
export async function update(userId: string, token: string, id: string, input: Update[Name]Input): Promise<[Name]> {
  // Verify ownership first
  const existing = await repository.findById(userId, token, id);
  if (!existing) {
    throw new Error('[Name] not found or access denied');
  }

  return repository.update(id, input);
}

/**
 * Delete a [name] (with ownership check)
 */
export async function remove(userId: string, token: string, id: string): Promise<void> {
  // Verify ownership first
  const existing = await repository.findById(userId, token, id);
  if (!existing) {
    throw new Error('[Name] not found or access denied');
  }

  return repository.remove(id);
}

/**
 * Admin: Get all [name]s (no ownership filter)
 */
export async function adminGetAll(options: {
  page: number;
  limit: number;
  filters?: [Name]Filters;
}) {
  const { page, limit, filters } = options;
  const offset = (page - 1) * limit;

  const { data, totalCount } = await repository.adminFindAll({
    limit,
    offset,
    filters
  });

  return {
    data,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
}
```

#### `src/features/[name]/repository.ts`
```typescript
import { userDB, adminDB } from '../../shared/database/helpers';
import { [Name], Create[Name]Input, Update[Name]Input, [Name]Filters } from './types';
import { transformFromDB, transformToDB } from './transformers';

const TABLE_NAME = '[table_name]';

/**
 * Find all [name]s for a user
 */
export async function findAll(
  userId: string,
  token: string,
  options: {
    limit: number;
    offset: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    filters?: [Name]Filters;
  }
) {
  const { limit, offset, sortBy, sortOrder, filters } = options;
  const db = userDB(token); // Pass JWT token for RLS context

  let query = db
    .from(TABLE_NAME)
    .select('*, count(*) OVER() as total_count')
    .eq('user_id', userId);

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  // Apply sorting and pagination
  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) throw error;

  const totalCount = data?.[0]?.total_count ?? 0;

  return {
    data: data?.map(transformFromDB) ?? [],
    totalCount: Number(totalCount)
  };
}

/**
 * Find a single [name] by ID (with ownership check via RLS)
 */
export async function findById(userId: string, token: string, id: string): Promise<[Name] | null> {
  const db = userDB(token); // Pass JWT token for RLS context

  const { data, error } = await db
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return transformFromDB(data);
}

/**
 * Create a new [name]
 */
export async function create(userId: string, token: string, input: Create[Name]Input): Promise<[Name]> {
  const db = userDB(token); // Pass JWT token for RLS context

  const { data, error } = await db
    .from(TABLE_NAME)
    .insert(transformToDB({ ...input, userId }))
    .select()
    .single();

  if (error) throw error;

  return transformFromDB(data);
}

/**
 * Update a [name]
 * Uses adminDB() to bypass RLS since ownership was already verified in service layer
 */
export async function update(id: string, input: Update[Name]Input): Promise<[Name]> {
  const db = adminDB(); // CAUTION: Bypasses RLS - verify ownership in service first!

  const { data, error } = await db
    .from(TABLE_NAME)
    .update(transformToDB(input))
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return transformFromDB(data);
}

/**
 * Delete a [name]
 * Uses adminDB() to bypass RLS since ownership was already verified in service layer
 */
export async function remove(id: string): Promise<void> {
  const db = adminDB(); // CAUTION: Bypasses RLS - verify ownership in service first!

  const { error } = await db
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Admin: Find all [name]s (no user filter)
 */
export async function adminFindAll(options: {
  limit: number;
  offset: number;
  filters?: [Name]Filters;
}) {
  const { limit, offset, filters } = options;
  const db = adminDB();

  let query = db
    .from(TABLE_NAME)
    .select('*, count(*) OVER() as total_count');

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) throw error;

  return {
    data: data?.map(transformFromDB) ?? [],
    totalCount: Number(data?.[0]?.total_count ?? 0)
  };
}
```

#### `src/features/[name]/types.ts`
```typescript
/**
 * [Name] entity as returned from the API
 */
export interface [Name] {
  id: string;
  userId: string;
  name: string;
  status: [Name]Status;
  createdAt: string;
  updatedAt: string;
}

/**
 * [Name] status enum
 */
export type [Name]Status = 'active' | 'inactive' | 'archived';

/**
 * Input for creating a new [name]
 */
export interface Create[Name]Input {
  name: string;
  status?: [Name]Status;
}

/**
 * Input for updating a [name]
 */
export interface Update[Name]Input {
  name?: string;
  status?: [Name]Status;
}

/**
 * Filters for querying [name]s
 */
export interface [Name]Filters {
  status?: [Name]Status;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Database row type (snake_case)
 */
export interface [Name]Row {
  id: string;
  user_id: string;
  name: string;
  status: [Name]Status;
  created_at: string;
  updated_at: string;
}
```

#### `src/features/[name]/transformers.ts`
```typescript
import { [Name], [Name]Row, Create[Name]Input, Update[Name]Input } from './types';

/**
 * Transform database row (snake_case) to API response (camelCase)
 */
export function transformFromDB(row: [Name]Row): [Name] {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Transform API input (camelCase) to database format (snake_case)
 */
export function transformToDB(
  input: Partial<Create[Name]Input & Update[Name]Input & { userId: string }>
): Partial<[Name]Row> {
  const result: Partial<[Name]Row> = {};

  if (input.userId !== undefined) result.user_id = input.userId;
  if (input.name !== undefined) result.name = input.name;
  if (input.status !== undefined) result.status = input.status;

  return result;
}
```

#### `src/features/[name]/validators.ts`
```typescript
import { z } from 'zod';

export const createSchema = z.object({
  name: z.string().min(1).max(255),
  status: z.enum(['active', 'inactive', 'archived']).optional().default('active')
});

export const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional()
});

export type CreateInput = z.infer<typeof createSchema>;
export type UpdateInput = z.infer<typeof updateSchema>;
```

#### `src/features/[name]/config.ts`
```typescript
/**
 * Feature configuration for [name]
 * Used by config-driven components for filters, sorting, pagination
 */
export const [name]Config = {
  // Feature metadata
  name: '[name]',
  displayName: '[Name]',
  tableName: '[table_name]',

  // Sorting options
  sortFields: [
    { field: 'created_at', label: 'Date Created' },
    { field: 'name', label: 'Name' },
    { field: 'status', label: 'Status' }
  ],
  defaultSort: { field: 'created_at', order: 'desc' as const },

  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
    options: [10, 20, 50, 100]
  },

  // Filter configuration
  filters: {
    status: {
      type: 'select' as const,
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'archived', label: 'Archived' }
      ]
    },
    search: {
      type: 'search' as const,
      label: 'Search',
      placeholder: 'Search by name...',
      searchFields: ['name']
    },
    dateRange: {
      type: 'dateRange' as const,
      label: 'Date Range',
      presets: ['today', 'yesterday', '7days', '30days', '90days', 'all']
    }
  }
};
```

#### `src/features/[name]/index.ts`
```typescript
// Public exports for this feature
export * from './types';
export { [name]Config } from './config';
export { default as [name]Routes } from './routes';
```

### Frontend Feature Structure

#### `src/features/[name]/components/[Name]List.tsx`
```typescript
import { useState } from 'react';
import { use[Name]s } from '../hooks/use[Name]s';
import { [name]Config } from '../config';
import { [Name]Card } from './[Name]Card';
import { Pagination, Filters, SortSelect, EmptyState, LoadingState } from '@/shared/components';

export function [Name]List() {
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState([name]Config.defaultSort);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = use[Name]s({
    filters,
    sort,
    page,
    limit: [name]Config.pagination.defaultLimit
  });

  if (isLoading) return <LoadingState />;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.data.length) return <EmptyState title="No [name]s found" />;

  return (
    <div className="space-y-4">
      {/* Filters & Sort */}
      <div className="flex justify-between items-center">
        <Filters config={[name]Config.filters} value={filters} onChange={setFilters} />
        <SortSelect options={[name]Config.sortFields} value={sort} onChange={setSort} />
      </div>

      {/* List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.data.map(item => (
          <[Name]Card key={item.id} [name]={item} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={data.pagination.totalPages}
        onChange={setPage}
      />
    </div>
  );
}
```

#### `src/features/[name]/components/[Name]Card.tsx`
```typescript
import { Link } from 'react-router-dom';
import { [Name] } from '../types';
import { formatDate } from '@/shared/utils/formatters';
import { Badge } from '@/shared/components/ui';

interface [Name]CardProps {
  [name]: [Name];
}

export function [Name]Card({ [name] }: [Name]CardProps) {
  return (
    <Link
      to={`/[name]s/${[name].id}`}
      className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-900">{[name].name}</h3>
        <Badge variant={[name].status === 'active' ? 'success' : 'secondary'}>
          {[name].status}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Created {formatDate([name].createdAt)}
      </p>
    </Link>
  );
}
```

#### `src/features/[name]/components/[Name]Form.tsx`
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { [Name], Create[Name]Input } from '../types';
import { Button, Input, Select } from '@/shared/components/ui';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  status: z.enum(['active', 'inactive', 'archived']).default('active')
});

interface [Name]FormProps {
  [name]?: [Name];
  onSubmit: (data: Create[Name]Input) => void;
  isLoading?: boolean;
}

export function [Name]Form({ [name], onSubmit, isLoading }: [Name]FormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: [name] ?? { status: 'active' }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          label="Name"
          {...register('name')}
          error={errors.name?.message}
        />
      </div>

      <div>
        <Select
          label="Status"
          {...register('status')}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'archived', label: 'Archived' }
          ]}
        />
      </div>

      <Button type="submit" loading={isLoading}>
        {[name] ? 'Update' : 'Create'} [Name]
      </Button>
    </form>
  );
}
```

#### `src/features/[name]/hooks/use[Name]s.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { [name]Service } from '../services/[name]Service';
import { [Name]Filters } from '../types';

interface Use[Name]sOptions {
  filters?: [Name]Filters;
  sort?: { field: string; order: 'asc' | 'desc' };
  page?: number;
  limit?: number;
}

export function use[Name]s(options: Use[Name]sOptions = {}) {
  const { filters, sort, page = 1, limit = 20 } = options;

  return useQuery({
    queryKey: ['[name]s', { filters, sort, page, limit }],
    queryFn: () => [name]Service.getAll({ filters, sort, page, limit })
  });
}

export function use[Name](id: string) {
  return useQuery({
    queryKey: ['[name]', id],
    queryFn: () => [name]Service.getById(id),
    enabled: !!id
  });
}
```

#### `src/features/[name]/services/[name]Service.ts`
```typescript
import { supabase } from '@/shared/lib/supabase';
import { [Name], Create[Name]Input, Update[Name]Input, [Name]Filters } from '../types';

export const [name]Service = {
  async getAll(options: {
    filters?: [Name]Filters;
    sort?: { field: string; order: 'asc' | 'desc' };
    page: number;
    limit: number;
  }) {
    const { filters, sort, page, limit } = options;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('[table_name]')
      .select('*, count(*) OVER() as total_count');

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    // Apply sort
    const sortField = sort?.field ?? 'created_at';
    const sortOrder = sort?.order ?? 'desc';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    const totalCount = Number(data?.[0]?.total_count ?? 0);

    return {
      data: data ?? [],
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  },

  async getById(id: string): Promise<[Name]> {
    const { data, error } = await supabase
      .from('[table_name]')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(input: Create[Name]Input): Promise<[Name]> {
    const { data, error } = await supabase
      .from('[table_name]')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, input: Update[Name]Input): Promise<[Name]> {
    const { data, error } = await supabase
      .from('[table_name]')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('[table_name]')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
```

## STAP 5: Database Migration Template

Genereer ook een migration template:

```sql
-- Migration: create_[table_name]_table
-- Created: [TIMESTAMP]

-- Create table
CREATE TABLE IF NOT EXISTS [table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_[table_name]_user_id ON [table_name](user_id);
CREATE INDEX idx_[table_name]_status ON [table_name](status);
CREATE INDEX idx_[table_name]_created_at ON [table_name](created_at DESC);

-- Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- RLS Policies (hybrid pattern: user owns, admin all)
CREATE POLICY "[table_name]_select_own" ON [table_name]
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "[table_name]_insert_own" ON [table_name]
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "[table_name]_update_own" ON [table_name]
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "[table_name]_delete_own" ON [table_name]
  FOR DELETE USING (auth.uid() = user_id);

-- Updated at trigger
CREATE TRIGGER set_[table_name]_updated_at
  BEFORE UPDATE ON [table_name]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## STAP 6: Rapport

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    📦 FEATURE SCAFFOLD COMPLETE                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  Feature: [name]                                                           ║
║  Table: [table_name]                                                       ║
║                                                                            ║
║  BACKEND FILES CREATED:                                                    ║
║  ├─ src/features/[name]/routes.ts ········· API routes                     ║
║  ├─ src/features/[name]/controller.ts ····· Request handlers               ║
║  ├─ src/features/[name]/service.ts ········ Business logic                 ║
║  ├─ src/features/[name]/repository.ts ····· Database queries               ║
║  ├─ src/features/[name]/types.ts ·········· TypeScript interfaces          ║
║  ├─ src/features/[name]/transformers.ts ··· DB ↔ API transformers          ║
║  ├─ src/features/[name]/validators.ts ····· Zod schemas                    ║
║  ├─ src/features/[name]/config.ts ········· Feature config                 ║
║  └─ src/features/[name]/index.ts ·········· Public exports                 ║
║                                                                            ║
║  FRONTEND FILES CREATED:                                                   ║
║  ├─ src/features/[name]/components/[Name]List.tsx                          ║
║  ├─ src/features/[name]/components/[Name]Card.tsx                          ║
║  ├─ src/features/[name]/components/[Name]Form.tsx                          ║
║  ├─ src/features/[name]/hooks/use[Name]s.ts                                ║
║  └─ src/features/[name]/services/[name]Service.ts                          ║
║                                                                            ║
║  DATABASE:                                                                 ║
║  └─ supabase/migrations/[timestamp]_create_[table_name].sql                ║
║                                                                            ║
║  NEXT STEPS:                                                               ║
║  1. Review and customize the generated files                               ║
║  2. Run the migration: npx supabase db push                                ║
║  3. Register routes in src/index.ts                                        ║
║  4. Add to your router (frontend)                                          ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

## PLACEHOLDER VERVANGINGEN

Vervang bij generatie:
- `[name]` → feature naam in kebab-case (user-profile)
- `[Name]` → feature naam in PascalCase (UserProfile)
- `[table_name]` → database tabel naam in snake_case (user_profiles)
- `[TIMESTAMP]` → huidige timestamp (20250113120000)

---

*Onderdeel van [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
