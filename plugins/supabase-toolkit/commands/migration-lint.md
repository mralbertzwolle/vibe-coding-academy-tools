---
allowed-tools: Bash, Read, Glob, Grep, Task, TodoWrite
argument-hint: [migration-file]
description: Validate SQL migrations for best practices and security
---

# Supabase Toolkit: Migration Lint

You are a **database migration reviewer** validating SQL migrations for best practices, security, and potential issues. This command checks migrations before they're applied to production.

## CHECKS OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                     MIGRATION LINT CHECKS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  NAMING                                                          │
│  ├─ Tables: snake_case, plural (users, order_items)              │
│  ├─ Columns: snake_case (user_id, created_at)                    │
│  ├─ Indexes: idx_table_column                                    │
│  ├─ Foreign Keys: fk_table_reference                             │
│  └─ Functions: snake_case (get_user_orders)                      │
│                                                                  │
│  SECURITY                                                        │
│  ├─ RLS enabled on new tables                                    │
│  ├─ RLS policies defined                                         │
│  ├─ No overly permissive policies                                │
│  ├─ Functions have search_path set                               │
│  └─ SECURITY DEFINER used appropriately                          │
│                                                                  │
│  BEST PRACTICES                                                  │
│  ├─ Primary keys defined                                         │
│  ├─ Foreign keys with ON DELETE                                  │
│  ├─ Indexes on foreign keys                                      │
│  ├─ NOT NULL on required columns                                 │
│  ├─ DEFAULT values where appropriate                             │
│  └─ Timestamps (created_at, updated_at)                          │
│                                                                  │
│  ROLLBACK SAFETY                                                 │
│  ├─ No irreversible operations                                   │
│  ├─ DROP statements flagged                                      │
│  └─ Data loss potential identified                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## ARGUMENT PARSING

```
/supabase-toolkit:migration-lint                    # Lint all pending
/supabase-toolkit:migration-lint 20250113_orders   # Lint specific file
```

## STAP 1: Vind Migration Files

```bash
# Find all migration files
find supabase/migrations -name "*.sql" -type f 2>/dev/null | sort

# Or check for pending migrations
ls -la supabase/migrations/*.sql 2>/dev/null | tail -10
```

## STAP 2: Lees Migration Content

Lees het migration bestand en analyseer de SQL.

## STAP 3: Voer Checks Uit

### Check 1: Naming Conventions

```
TABLES:
✅ snake_case: user_profiles, order_items
❌ camelCase: userProfiles, orderItems
❌ PascalCase: UserProfiles, OrderItems
❌ Singular: user, order (should be users, orders)

COLUMNS:
✅ snake_case: user_id, created_at, order_total
❌ camelCase: userId, createdAt, orderTotal
❌ Abbreviations: usr_id, crt_at (spell out)

INDEXES:
✅ Pattern: idx_[table]_[column]
   Example: idx_orders_user_id, idx_users_email

FOREIGN KEYS:
✅ Pattern: fk_[table]_[reference]
   Example: fk_orders_user_id

CONSTRAINTS:
✅ Pattern: chk_[table]_[description]
   Example: chk_orders_positive_total
```

### Check 2: RLS Security

```sql
-- Pattern to check: Every CREATE TABLE should have
ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;
CREATE POLICY ... ON [table] ...

-- RED FLAGS:
-- ❌ CREATE TABLE without subsequent RLS enable
-- ❌ RLS enabled without policies
-- ❌ Policy with USING (true) without comment
-- ❌ INSERT policy without WITH CHECK
```

### Check 3: Foreign Keys

```sql
-- Good pattern:
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE

-- Issues to flag:
-- ⚠️ Missing ON DELETE clause
-- ⚠️ ON DELETE SET NULL on NOT NULL column
-- ⚠️ No index on foreign key column
```

### Check 4: Indexes

```sql
-- Recommend indexes for:
-- 1. Foreign key columns
-- 2. Columns used in WHERE clauses
-- 3. Columns used in ORDER BY
-- 4. Unique constraints

-- Pattern:
CREATE INDEX idx_[table]_[column] ON [table]([column]);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

### Check 5: Functions Security

```sql
-- Good pattern:
CREATE OR REPLACE FUNCTION my_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- ✅ Important!
AS $$
...
$$;

-- Issues to flag:
-- ❌ SECURITY DEFINER without search_path
-- ⚠️ SECURITY INVOKER when DEFINER intended
```

### Check 6: Rollback Safety

```
SAFE OPERATIONS:
✅ CREATE TABLE (can DROP)
✅ CREATE INDEX (can DROP)
✅ ADD COLUMN (can DROP COLUMN)
✅ CREATE FUNCTION (can DROP)

RISKY OPERATIONS:
⚠️ ALTER COLUMN TYPE (may lose data)
⚠️ DROP COLUMN (data loss)
⚠️ DROP TABLE (data loss)
⚠️ TRUNCATE TABLE (data loss)

DANGEROUS OPERATIONS:
❌ DROP TABLE without backup note
❌ DELETE FROM without WHERE
❌ UPDATE without WHERE
```

### Check 7: Best Practices

```sql
-- Required columns for most tables:
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

-- Updated at trigger:
CREATE TRIGGER set_[table]_updated_at
  BEFORE UPDATE ON [table]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Check for common update_updated_at_column function:
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## STAP 4: Genereer Rapport

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    📋 MIGRATION LINT REPORT                                ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  File: [migration_file.sql]                                                ║
║  Tables: X created, Y altered                                              ║
║  Functions: X created                                                      ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  SUMMARY                                                                   ║
║  ┌────────────────────────┬────────┬────────┐                              ║
║  │ Category               │ Status │ Issues │                              ║
║  ├────────────────────────┼────────┼────────┤                              ║
║  │ Naming Conventions     │  ✅/❌  │   X    │                              ║
║  │ RLS Security           │  ✅/❌  │   X    │                              ║
║  │ Foreign Keys           │  ✅/❌  │   X    │                              ║
║  │ Indexes                │  ✅/⚠️  │   X    │                              ║
║  │ Function Security      │  ✅/❌  │   X    │                              ║
║  │ Rollback Safety        │  ✅/⚠️  │   X    │                              ║
║  │ Best Practices         │  ✅/⚠️  │   X    │                              ║
║  └────────────────────────┴────────┴────────┘                              ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  ❌ ERRORS (must fix)                                                      ║
║                                                                            ║
║  1. Line 15: Table name "UserProfile" should be "user_profiles"            ║
║     → Rename to snake_case plural                                          ║
║                                                                            ║
║  2. Line 23: Missing RLS policies for table "orders"                       ║
║     → Run: /supabase-toolkit:generate-rls orders hybrid                    ║
║                                                                            ║
║  3. Line 45: Function missing search_path                                  ║
║     → Add: SET search_path = public                                        ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  ⚠️ WARNINGS (should fix)                                                  ║
║                                                                            ║
║  1. Line 18: Foreign key "user_id" has no index                            ║
║     → Add: CREATE INDEX idx_orders_user_id ON orders(user_id);             ║
║                                                                            ║
║  2. Line 20: Missing ON DELETE clause on foreign key                       ║
║     → Consider: ON DELETE CASCADE or ON DELETE SET NULL                    ║
║                                                                            ║
║  3. Line 30: INSERT policy without WITH CHECK                              ║
║     → Add: WITH CHECK (auth.uid() = user_id)                               ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  💡 SUGGESTIONS (nice to have)                                             ║
║                                                                            ║
║  1. Line 12: Consider adding "updated_at" column with trigger              ║
║                                                                            ║
║  2. Line 25: Consider adding compound index for common query pattern       ║
║     → CREATE INDEX idx_orders_user_status ON orders(user_id, status);      ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🔄 ROLLBACK NOTES                                                         ║
║                                                                            ║
║  This migration:                                                           ║
║  ├─ ✅ Can be safely rolled back                                           ║
║  ├─ Creates: 2 tables, 3 indexes, 1 function                               ║
║  └─ No data loss operations                                                ║
║                                                                            ║
║  Rollback command:                                                         ║
║  DROP TABLE IF EXISTS orders CASCADE;                                      ║
║  DROP FUNCTION IF EXISTS get_orders_results;                               ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  RECOMMENDATION: [PASS / NEEDS FIXES / REVIEW REQUIRED]                    ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

## AUTO-FIX SUGGESTIONS

Voor elke error/warning, genereer een concrete fix:

### Naming Fix
```sql
-- Before
CREATE TABLE UserProfile (...);

-- After
CREATE TABLE user_profiles (...);
```

### RLS Fix
```sql
-- Add after CREATE TABLE
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (auth.uid() = user_id);
-- ... etc
```

### Index Fix
```sql
-- Add after table creation
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

### Function Fix
```sql
-- Before
CREATE FUNCTION my_func() RETURNS void LANGUAGE plpgsql AS $$...$$;

-- After
CREATE FUNCTION my_func()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$...$$;
```

## USAGE PATTERNS

```bash
# Lint all migrations
/supabase-toolkit:migration-lint

# Lint specific file
/supabase-toolkit:migration-lint 20250113_create_orders

# Lint with auto-fix suggestions
/supabase-toolkit:migration-lint --suggest-fixes
```

---

*Onderdeel van [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
