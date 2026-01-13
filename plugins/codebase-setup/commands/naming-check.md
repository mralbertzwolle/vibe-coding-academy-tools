---
allowed-tools: Bash, Read, Glob, Grep, Task, TodoWrite, mcp__plugin_supabase_supabase__execute_sql, mcp__plugin_supabase_supabase__list_tables
description: Check naming convention compliance across codebase AND database schema
---

# Codebase Setup: Naming Check

You are a **code quality auditor** checking naming convention compliance. This command analyzes BOTH the codebase AND database schema for consistency violations.

---

# PART 1: DATABASE SCHEMA NAMING AUDIT

**This is the most important check.** Database naming inconsistencies cause bugs, confusion, and technical debt that compounds over time.

## DATABASE NAMING STANDARDS

### PostgreSQL Naming Conventions

| Element | Convention | Example | Anti-Pattern |
|---------|------------|---------|--------------|
| Tables | snake_case, plural | `users`, `order_items` | `Users`, `orderItems` |
| Columns | snake_case | `user_id`, `created_at` | `userId`, `createdAt` |
| Foreign Keys | `{table_singular}_id` | `user_id`, `order_id` | `userid`, `userID` |
| Timestamps | `{action}_at` | `created_at`, `updated_at` | `createdat`, `last_edited` |
| Booleans | `is_{property}` | `is_active`, `is_published` | `active`, `published` |
| Status | `status` (consistent) | `status` | `state`, `type` (mixed) |

### CRITICAL: Consistency Over Convention

The **#1 rule** is CONSISTENCY within your schema. If you have:
- 67 columns named `organization_id`
- 71 columns named `organizationid`

This is a **CRITICAL** issue regardless of which format is "correct".

## STAP 1: Query Database Schema

Use Supabase MCP to get ALL columns:

```sql
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY column_name, table_name;
```

## STAP 2: Foreign Key Consistency Check

### Check: organization_id variations

```sql
SELECT column_name, COUNT(*) as usage_count,
       array_agg(DISTINCT table_name) as tables
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
  column_name LIKE '%organization%'
  OR column_name LIKE '%org%'
)
GROUP BY column_name
ORDER BY usage_count DESC;
```

**Expected variations to find:**
- `organization_id` vs `organizationid` vs `org_id`
- `organisation_id` (British spelling)

### Check: user_id variations

```sql
SELECT column_name, COUNT(*) as usage_count,
       array_agg(DISTINCT table_name) as tables
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
  column_name LIKE '%user%id%'
  OR column_name LIKE '%created_by%'
  OR column_name LIKE '%author%'
  OR column_name LIKE '%owner%'
)
GROUP BY column_name
ORDER BY usage_count DESC;
```

**Expected variations:**
- `user_id` vs `userid`
- `created_by` vs `created_by_id` vs `creator_id`
- `author_id` vs `owner_id`

## STAP 3: Timestamp Consistency Check

```sql
SELECT column_name, COUNT(*) as usage_count
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
  column_name LIKE '%creat%'
  OR column_name LIKE '%updat%'
  OR column_name LIKE '%modif%'
  OR column_name LIKE '%edit%'
  OR column_name LIKE '%delet%'
)
AND data_type IN ('timestamp with time zone', 'timestamp without time zone', 'date')
GROUP BY column_name
ORDER BY usage_count DESC;
```

**Expected variations:**
- `created_at` vs `createdat` vs `date_created` vs `creation_date`
- `updated_at` vs `last_edited` vs `modified_at` vs `last_updated`
- `deleted_at` vs `removed_at`

## STAP 4: Boolean Consistency Check

```sql
SELECT column_name, COUNT(*) as usage_count
FROM information_schema.columns
WHERE table_schema = 'public'
AND data_type = 'boolean'
GROUP BY column_name
ORDER BY usage_count DESC;
```

**Check for patterns:**
- `is_active` vs `active` vs `isactive`
- `is_published` vs `published`
- `has_access` vs `can_access`
- Unique one-off names (red flag if >50% are unique)

## STAP 5: Status/Type Column Check

```sql
SELECT column_name, COUNT(*) as usage_count
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
  column_name = 'status'
  OR column_name = 'state'
  OR column_name = 'type'
  OR column_name LIKE '%_status'
  OR column_name LIKE '%_state'
  OR column_name LIKE '%_type'
)
GROUP BY column_name
ORDER BY usage_count DESC;
```

## STAP 6: Typo Detection

```sql
-- Common typos
SELECT column_name, table_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
  -- Missing underscore
  column_name ~ '^[a-z]+id$'  -- userid, orderid, etc.
  OR column_name ~ '^[a-z]+at$'  -- createdat, updatedat
  -- British vs American spelling
  OR column_name LIKE '%colour%'
  OR column_name LIKE '%organisation%'
  OR column_name LIKE '%cancelled%'  -- vs canceled
  OR column_name LIKE '%favour%'
);
```

## DATABASE NAMING RAPPORT

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    🗄️  DATABASE SCHEMA NAMING AUDIT                        ║
║                    [PROJECT_NAME]                                          ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  SCHEMA OVERVIEW                                                           ║
║  ├─ Total Tables: XXX                                                      ║
║  ├─ Total Columns: XXXX                                                    ║
║  └─ Overall Consistency: XX%                                               ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🔴 CRITICAL: Foreign Key Inconsistencies                                  ║
║                                                                            ║
║  organization_id Pattern:                                                  ║
║  ┌─────────────────────┬───────┬────────────────────────────────┐          ║
║  │ Column Name         │ Count │ Standard?                      │          ║
║  ├─────────────────────┼───────┼────────────────────────────────┤          ║
║  │ organization_id     │  XX   │ ✅ Recommended                 │          ║
║  │ organizationid      │  XX   │ ❌ Missing underscore          │          ║
║  │ org_id              │  XX   │ ⚠️ Abbreviation                │          ║
║  └─────────────────────┴───────┴────────────────────────────────┘          ║
║                                                                            ║
║  RECOMMENDATION: Standardize on `organization_id`                          ║
║  AFFECTED TABLES: [list of tables with wrong naming]                       ║
║                                                                            ║
║  user_id Pattern:                                                          ║
║  ┌─────────────────────┬───────┬────────────────────────────────┐          ║
║  │ Column Name         │ Count │ Purpose                        │          ║
║  ├─────────────────────┼───────┼────────────────────────────────┤          ║
║  │ user_id             │  XX   │ ✅ Generic user reference      │          ║
║  │ created_by_id       │  XX   │ ✅ Creator reference           │          ║
║  │ created_by          │  XX   │ ⚠️ Inconsistent with _id       │          ║
║  │ author_id           │  XX   │ ⚠️ Same as created_by?         │          ║
║  └─────────────────────┴───────┴────────────────────────────────┘          ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🟠 HIGH: Timestamp Inconsistencies                                        ║
║                                                                            ║
║  created_at Pattern: XX% Consistent                                        ║
║  ├─ created_at: XXX columns ✅                                             ║
║  ├─ createdat: X columns ❌ (typo)                                         ║
║  └─ date_created: X columns ❌                                             ║
║                                                                            ║
║  updated_at Pattern: XX% Consistent                                        ║
║  ├─ updated_at: XX columns ✅                                              ║
║  ├─ last_edited: XX columns ❌ (different concept name)                    ║
║  ├─ modified_at: X columns ❌                                              ║
║  └─ last_updated: X columns ❌                                             ║
║                                                                            ║
║  RECOMMENDATION: Rename all to `updated_at`                                ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🟡 MEDIUM: Boolean Naming Chaos                                           ║
║                                                                            ║
║  Total Boolean Columns: XXX                                                ║
║  Unique Names: XX (XX% - should be <20%)                                   ║
║                                                                            ║
║  Standard `is_*` Pattern:                                                  ║
║  ├─ is_active: XX columns ✅                                               ║
║  ├─ is_published: X columns ✅                                             ║
║  └─ is_deleted: X columns ✅                                               ║
║                                                                            ║
║  Non-Standard (should be `is_*`):                                          ║
║  ├─ active: X columns → is_active                                          ║
║  ├─ published: X columns → is_published                                    ║
║  ├─ enabled: X columns → is_enabled                                        ║
║  └─ [one-off names]: XX columns                                            ║
║                                                                            ║
║  ONE-OFF BOOLEAN NAMES (red flags):                                        ║
║  ├─ repeatyesorno (table: X)                                               ║
║  ├─ activetruefalse (table: X)                                             ║
║  └─ publicated (table: X) - not even English!                              ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🔵 LOW: Typos & Spelling                                                  ║
║                                                                            ║
║  Missing Underscores:                                                      ║
║  ├─ organizationid → organization_id (XX tables)                           ║
║  ├─ createdat → created_at (X tables)                                      ║
║  └─ userid → user_id (X tables)                                            ║
║                                                                            ║
║  British vs American:                                                      ║
║  ├─ organisation → organization                                            ║
║  ├─ colour → color                                                         ║
║  └─ cancelled → canceled (pick one!)                                       ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  📋 MIGRATION ROADMAP                                                      ║
║                                                                            ║
║  Phase 1 (CRITICAL):                                                       ║
║  └─ organizationid → organization_id (XX tables)                           ║
║     Effort: X-X weeks                                                      ║
║                                                                            ║
║  Phase 2 (HIGH):                                                           ║
║  └─ last_edited → updated_at (XX tables)                                   ║
║     Effort: X-X weeks                                                      ║
║                                                                            ║
║  Phase 3 (MEDIUM):                                                         ║
║  └─ Standardize boolean naming                                             ║
║     Effort: X-X weeks                                                      ║
║                                                                            ║
║  Phase 4 (LOW):                                                            ║
║  └─ Fix typos (createdat, etc.)                                            ║
║     Effort: <1 week                                                        ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

## RECOMMENDED DATABASE STANDARDS

After analysis, recommend these standards:

```sql
-- FOREIGN KEYS: Always {table_singular}_id
user_id UUID REFERENCES auth.users(id)
organization_id UUID REFERENCES organizations(id)
order_id UUID REFERENCES orders(id)

-- TIMESTAMPS: Always {action}_at
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
deleted_at TIMESTAMPTZ  -- soft delete

-- BOOLEANS: Always is_{property}
is_active BOOLEAN NOT NULL DEFAULT true
is_published BOOLEAN NOT NULL DEFAULT false
is_deleted BOOLEAN NOT NULL DEFAULT false

-- STATUS: Always 'status' (not state, type)
status VARCHAR(50) NOT NULL DEFAULT 'draft'

-- CREATORS: Always created_by_id (with _id suffix)
created_by_id UUID REFERENCES auth.users(id)
```

---

# PART 2: TYPESCRIPT/CODE NAMING

## NAMING CONVENTIONS

### TypeScript/JavaScript Standards

| Context | Convention | Example | Regex Pattern |
|---------|------------|---------|---------------|
| Variables | camelCase | `userId`, `orderTotal` | `^[a-z][a-zA-Z0-9]*$` |
| Functions | camelCase | `getUserById`, `calculateTotal` | `^[a-z][a-zA-Z0-9]*$` |
| Classes | PascalCase | `UserService`, `OrderController` | `^[A-Z][a-zA-Z0-9]*$` |
| Interfaces | PascalCase | `User`, `OrderInput` | `^[A-Z][a-zA-Z0-9]*$` |
| Types | PascalCase | `UserRole`, `OrderStatus` | `^[A-Z][a-zA-Z0-9]*$` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES`, `API_URL` | `^[A-Z][A-Z0-9_]*$` |

### File Naming Standards

| File Type | Convention | Example |
|-----------|------------|---------|
| Components | PascalCase | `UserProfile.tsx`, `OrderList.tsx` |
| Hooks | camelCase with 'use' prefix | `useAuth.ts`, `useOrders.ts` |
| Services | camelCase or PascalCase | `userService.ts`, `UserService.ts` |

### Boundary Transformation Rule

**CRITICAL:** Database snake_case must be transformed to TypeScript camelCase at the service/repository layer.

```typescript
// ❌ WRONG - Database naming leaked into TypeScript
interface User {
  user_id: string;      // ❌
  organization_id: string;   // ❌
}

// ✅ CORRECT - Transformed at boundary
interface User {
  userId: string;       // ✅
  organizationId: string;    // ✅
}
```

## STAP 7: Scan TypeScript/JavaScript Files

Find the correct source directory first:

```bash
# Detect project structure
ls -d src frontend/src backend/src 2>/dev/null
```

### Check 1: Variables met snake_case

```bash
# Adjust path based on project structure
grep -rn --include="*.ts" --include="*.tsx" \
  -E "(const|let|var)\s+[a-z]+_[a-z]+" \
  . --exclude-dir=node_modules 2>/dev/null | head -50
```

### Check 2: Interfaces/Types met snake_case properties

```bash
grep -rn --include="*.ts" --include="*.tsx" \
  -E "^\s+[a-z]+_[a-z]+(\?)?:" \
  . --exclude-dir=node_modules 2>/dev/null | \
  grep -v "// db" | grep -v "Row" | head -50
```

### Check 3: Leaky database naming in API responses

```bash
grep -rn --include="*.ts" \
  -E "res\.(json|send)\(.*[a-z]+_[a-z]+" \
  . --exclude-dir=node_modules 2>/dev/null | head -30
```

## STAP 8: Generate Combined Report

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    📋 NAMING COMPLIANCE REPORT                             ║
║                    [PROJECT_NAME]                                          ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  PART 1: DATABASE SCHEMA                                                   ║
║  ┌────────────────────────┬────────┬────────┐                              ║
║  │ Category               │ Score  │ Status │                              ║
║  ├────────────────────────┼────────┼────────┤                              ║
║  │ Foreign Keys           │   XX%  │  ✅/❌  │                              ║
║  │ Timestamps             │   XX%  │  ✅/❌  │                              ║
║  │ Booleans               │   XX%  │  ✅/❌  │                              ║
║  │ Status Columns         │   XX%  │  ✅/❌  │                              ║
║  └────────────────────────┴────────┴────────┘                              ║
║                                                                            ║
║  PART 2: CODE NAMING                                                       ║
║  ┌────────────────────────┬────────┬────────┐                              ║
║  │ Category               │ Score  │ Status │                              ║
║  ├────────────────────────┼────────┼────────┤                              ║
║  │ TypeScript Variables   │   XX%  │  ✅/❌  │                              ║
║  │ Interfaces & Types     │   XX%  │  ✅/❌  │                              ║
║  │ API Boundary           │   XX%  │  ✅/❌  │                              ║
║  │ File Names             │   XX%  │  ✅/❌  │                              ║
║  └────────────────────────┴────────┴────────┘                              ║
║                                                                            ║
║  OVERALL CONSISTENCY: XX%                                                  ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

## SEVERITY LEVELS

1. **CRITICAL** - Schema inconsistencies (organization_id vs organizationid)
2. **CRITICAL** - API boundary leaks (snake_case in responses)
3. **HIGH** - Timestamp inconsistencies (updated_at vs last_edited)
4. **MEDIUM** - Boolean naming chaos (is_active vs active)
5. **LOW** - Typos and spelling variations

## PRAGMATIC APPROACH

### For Database
- **DO** create a migration plan for critical inconsistencies
- **DO** enforce standards for NEW tables/columns
- **DON'T** rename everything at once (breaks API contracts)
- **DO** document the "old" vs "new" patterns during transition

### For Code
- **100% compliance vereist** voor nieuwe code
- **Legacy acceptabel** als het werkt
- **Boy Scout Rule** voor bestaande code

---

*Onderdeel van [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
