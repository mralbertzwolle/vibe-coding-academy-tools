---
allowed-tools: Bash, Read, Glob, Grep, Task, TodoWrite, mcp__plugin_supabase_supabase__list_tables, mcp__plugin_supabase_supabase__execute_sql, mcp__plugin_supabase_supabase__generate_typescript_types
description: Find unused database columns and tables - detect "rotzooi" in your schema that code no longer references
---

# Supabase Toolkit: Schema Usage Audit

You are a **database schema auditor** that identifies unused columns and tables in your Supabase database. This command helps vibe coders keep their database clean by finding fields that exist in the schema but are never referenced in code.

---

# WHY THIS MATTERS

> "Database schema debt accumulates silently. Every unused column is storage cost, cognitive overhead, and potential confusion for new developers."

Common causes of unused database fields:
- Features that were removed but schema wasn't cleaned up
- Renamed columns where old column wasn't dropped
- Experimental fields that never made it to production
- Copy-pasted schemas from tutorials
- Fields added "just in case" but never used

---

# WHAT THIS AUDIT FINDS

## 1. Orphaned Columns
Columns that exist in the database but have NO references in:
- TypeScript/JavaScript code
- SQL migrations (except their creation)
- API routes and handlers
- Frontend components

## 2. Orphaned Tables
Entire tables that are never queried or referenced

## 3. Deprecated Patterns
- Columns with names like `old_*`, `*_deprecated`, `*_backup`
- Tables with `_old`, `_backup`, `_archive` suffixes (that aren't intentional archives)

---

# AUDIT PROCEDURE

## STAP 1: Verzamel Database Schema

Gebruik de Supabase MCP tools om het volledige schema op te halen.

### 1A: Lijst alle tabellen

```
Gebruik: mcp__plugin_supabase_supabase__list_tables
```

### 1B: Haal alle kolommen op per tabel

Voer deze SQL uit via `mcp__plugin_supabase_supabase__execute_sql`:

```sql
SELECT
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c
  ON c.table_name = t.table_name
  AND c.table_schema = t.table_schema
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;
```

### 1C: Haal foreign key relaties op

```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';
```

## STAP 2: Identificeer Code Directories

Bepaal waar de applicatiecode staat:

```bash
# Find main code directories
echo "=== Source Directories ==="
for dir in src app lib components pages api routes services hooks utils types; do
  if [ -d "$dir" ]; then
    echo "Found: $dir/"
    find "$dir" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | wc -l | xargs echo "  Files:"
  fi
done

# Check for backend directories
for dir in backend server functions supabase/functions; do
  if [ -d "$dir" ]; then
    echo "Found: $dir/"
  fi
done
```

## STAP 3: Zoek Referenties per Kolom

Voor ELKE kolom uit het schema, zoek naar referenties in de code.

### Zoekstrategie per kolom:

```bash
# Search for column references (example for column "user_id")
# Pattern 1: Direct property access
grep -r "user_id" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ app/ lib/ 2>/dev/null

# Pattern 2: String literal (for dynamic access)
grep -r "'user_id'" --include="*.ts" --include="*.tsx" src/ 2>/dev/null
grep -r '"user_id"' --include="*.ts" --include="*.tsx" src/ 2>/dev/null

# Pattern 3: In SQL queries
grep -r "user_id" --include="*.sql" supabase/ 2>/dev/null
```

### Automatische scan voor alle kolommen:

Voor elke kolom voer je de volgende check uit:

```
1. Grep voor de kolomnaam in alle code bestanden
2. Tel het aantal matches
3. Als matches = 0 → potentieel ongebruikt
4. Als matches alleen in migrations → waarschijnlijk ongebruikt
```

**BELANGRIJK:** Gebruik de Grep tool, niet bash grep, voor betere resultaten:

```
Grep pattern: "column_name"
Include: *.ts, *.tsx, *.js, *.jsx
Exclude: node_modules, .git, supabase/migrations (voor eerste scan)
```

## STAP 4: Analyseer TypeScript Types

Als het project TypeScript types heeft gegenereerd:

```
Gebruik: mcp__plugin_supabase_supabase__generate_typescript_types
```

Zoek dan naar welke type properties daadwerkelijk gebruikt worden:

```bash
# Find generated types file
find . -name "database.types.ts" -o -name "supabase.ts" -o -name "types.ts" 2>/dev/null | head -5

# Check if types are imported and used
grep -r "Database\[" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | head -20
```

## STAP 5: Speciale Gevallen

### 5A: Kolommen die NIET als ongebruikt moeten worden gemarkeerd

Deze kolommen zijn vaak impliciet gebruikt:

| Kolom Pattern | Reden |
|---------------|-------|
| `id` | Primary key, vaak impliciet |
| `created_at` | Automatisch door database |
| `updated_at` | Automatisch door triggers |
| `user_id` met FK | Mogelijk alleen voor RLS policies |
| `*_id` foreign keys | Kunnen alleen in JOINs gebruikt worden |

### 5B: Database-only kolommen

Sommige kolommen worden alleen in database-logica gebruikt:

```sql
-- Check for columns used in triggers
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Check for columns used in views
SELECT
  table_name as view_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public';

-- Check for columns used in functions
SELECT
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION';
```

### 5C: RLS Policy Kolommen

```sql
-- Columns referenced in RLS policies
SELECT
  tablename,
  policyname,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public';
```

## STAP 6: Genereer Rapport

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                    🗄️ DATABASE SCHEMA USAGE AUDIT                                ║
║                    [PROJECT_NAME]                                                ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  OVERVIEW                                                                        ║
║  ┌────────────────────────────────┬──────────────────────────────────────────┐   ║
║  │ Total Tables                   │ XX                                       │   ║
║  │ Total Columns                  │ XXX                                      │   ║
║  │ Potentially Unused Columns     │ XX (X%)                                  │   ║
║  │ Potentially Unused Tables      │ X                                        │   ║
║  └────────────────────────────────┴──────────────────────────────────────────┘   ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  🔴 LIKELY UNUSED - No code references found                                     ║
║                                                                                  ║
║  Table: [table_name]                                                             ║
║  ┌─────────────────────┬──────────────┬──────────────────────────────────────┐   ║
║  │ Column              │ Type         │ Notes                                │   ║
║  ├─────────────────────┼──────────────┼──────────────────────────────────────┤   ║
║  │ old_status          │ text         │ Name suggests deprecated             │   ║
║  │ temp_field          │ text         │ Name suggests temporary              │   ║
║  │ legacy_id           │ integer      │ Zero code references                 │   ║
║  └─────────────────────┴──────────────┴──────────────────────────────────────┘   ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  🟠 PROBABLY UNUSED - Only in migrations                                         ║
║                                                                                  ║
║  Table: [table_name]                                                             ║
║  ┌─────────────────────┬──────────────┬──────────────────────────────────────┐   ║
║  │ Column              │ Type         │ References                           │   ║
║  ├─────────────────────┼──────────────┼──────────────────────────────────────┤   ║
║  │ category_code       │ varchar(10)  │ Only in: 001_create_tables.sql       │   ║
║  │ sort_order          │ integer      │ Only in: 003_add_sorting.sql         │   ║
║  └─────────────────────┴──────────────┴──────────────────────────────────────┘   ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  🟡 REVIEW NEEDED - Few references, might be unused                              ║
║                                                                                  ║
║  Table: [table_name]                                                             ║
║  ┌─────────────────────┬──────────────┬──────────────────────────────────────┐   ║
║  │ Column              │ Type         │ Found In                             │   ║
║  ├─────────────────────┼──────────────┼──────────────────────────────────────┤   ║
║  │ metadata            │ jsonb        │ 1 file: types/database.ts (type only)│   ║
║  │ extra_info          │ text         │ 1 file: migrations only              │   ║
║  └─────────────────────┴──────────────┴──────────────────────────────────────┘   ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  🟢 DATABASE-ONLY USAGE (Not in app code, but used in DB)                        ║
║                                                                                  ║
║  ┌─────────────────────┬──────────────┬──────────────────────────────────────┐   ║
║  │ Column              │ Table        │ Used In                              │   ║
║  ├─────────────────────┼──────────────┼──────────────────────────────────────┤   ║
║  │ organization_id     │ users        │ RLS policy: users_org_policy         │   ║
║  │ is_deleted          │ posts        │ View: active_posts                   │   ║
║  │ search_vector       │ articles     │ Trigger: update_search_vector        │   ║
║  └─────────────────────┴──────────────┴──────────────────────────────────────┘   ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  📋 POTENTIALLY UNUSED TABLES                                                    ║
║                                                                                  ║
║  ┌─────────────────────┬──────────────┬──────────────────────────────────────┐   ║
║  │ Table               │ Columns      │ Status                               │   ║
║  ├─────────────────────┼──────────────┼──────────────────────────────────────┤   ║
║  │ temp_imports        │ 5            │ Zero references - DELETE?            │   ║
║  │ old_users           │ 12           │ Name suggests deprecated             │   ║
║  │ test_data           │ 3            │ Test table in production?            │   ║
║  └─────────────────────┴──────────────┴──────────────────────────────────────┘   ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  ⚠️  CLEANUP RECOMMENDATIONS                                                     ║
║                                                                                  ║
║  BEFORE DELETING: Always verify in production that columns are truly unused!    ║
║                                                                                  ║
║  Step 1: Verify no runtime usage (check logs, queries)                          ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ -- Check if column has any non-null data                                  │  ║
║  │ SELECT COUNT(*) FROM [table] WHERE [column] IS NOT NULL;                  │  ║
║  │                                                                           │  ║
║  │ -- Check recent query logs (if pg_stat_statements enabled)                │  ║
║  │ SELECT query FROM pg_stat_statements                                      │  ║
║  │ WHERE query ILIKE '%column_name%' LIMIT 10;                               │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
║  Step 2: Create migration to drop unused columns                                 ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ -- Safe column removal (example)                                          │  ║
║  │ ALTER TABLE [table_name] DROP COLUMN IF EXISTS [column_name];             │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
║  Step 3: Update TypeScript types                                                 ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ Run: supabase gen types typescript --local > src/types/database.types.ts  │  ║
║  │ Or use: /supabase-toolkit:generate-types                                  │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  📊 COLUMN USAGE STATISTICS                                                      ║
║                                                                                  ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ Usage Level           │ Count │ Percentage │ Action                       │  ║
║  ├────────────────────────────────────────────────────────────────────────────┤  ║
║  │ ██████████ Active     │  XX   │   XX%      │ Keep                         │  ║
║  │ ████░░░░░░ Low Use    │  XX   │   XX%      │ Review                       │  ║
║  │ ██░░░░░░░░ DB-Only    │  XX   │   XX%      │ Document                     │  ║
║  │ ░░░░░░░░░░ Unused     │  XX   │   XX%      │ Consider removing            │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

# FALSE POSITIVES - WANNEER NIET VERWIJDEREN

## Kolommen die veilig LIJKEN ongebruikt maar dat NIET zijn:

1. **Foreign Keys voor JOINs**
   - Worden vaak alleen in database queries gebruikt, niet direct in code
   - Check: `SELECT * FROM table1 JOIN table2 ON ...`

2. **RLS Policy Kolommen**
   - `user_id`, `organization_id` kunnen alleen in policies gebruikt worden
   - Check met: `SELECT * FROM pg_policies WHERE qual LIKE '%column%'`

3. **Computed/Generated Kolommen**
   - Worden automatisch gevuld door database
   - Check: `column_default` in information_schema

4. **Audit Kolommen**
   - `created_at`, `updated_at`, `created_by`, `updated_by`
   - Vaak automatisch gevuld, zelden direct in code

5. **Soft Delete Kolommen**
   - `deleted_at`, `is_deleted`, `is_active`
   - Kunnen alleen in database views/policies gebruikt worden

6. **Full-Text Search Kolommen**
   - `search_vector`, `tsvector` kolommen
   - Gebruikt door PostgreSQL FTS, niet direct in code

---

# INTEGRATION MET ANDERE TOOLS

Na deze audit, gebruik:

- `/supabase-toolkit:migration-lint` - Valideer je cleanup migration
- `/codebase-setup:codebase-cleanup` - Vind ook code-side rotzooi
- `mcp__plugin_supabase_supabase__get_advisors` - Check voor andere DB issues

---

# PREVENTIE: SCHEMA HYGIENE

## Bij het toevoegen van nieuwe kolommen:

1. **Vraag:** Wordt dit veld daadwerkelijk gebruikt in de app?
2. **Vraag:** Is er een TypeScript type voor?
3. **Vraag:** Is er een UI element dat dit toont/bewerkt?

## Bij het verwijderen van features:

1. **Check:** Welke database kolommen hoorden bij deze feature?
2. **Actie:** Maak een cleanup migration
3. **Actie:** Regenereer TypeScript types

---

# SOURCES

- [Database Refactoring Best Practices - Martin Fowler](https://martinfowler.com/articles/evodb.html)
- [PostgreSQL Schema Management - Supabase Docs](https://supabase.com/docs/guides/database)
- [Dead Code Detection Patterns](https://refactoring.guru/smells/dead-code)

---

*Onderdeel van [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
