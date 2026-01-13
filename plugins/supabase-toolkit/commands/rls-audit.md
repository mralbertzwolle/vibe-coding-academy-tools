---
allowed-tools: Bash, Read, Glob, Grep, Task, TodoWrite, mcp__plugin_supabase_supabase__list_tables, mcp__plugin_supabase_supabase__execute_sql, mcp__plugin_supabase_supabase__get_advisors
description: Audit Row Level Security policies and identify vulnerabilities
---

# Supabase Toolkit: RLS Audit

You are a **database security auditor** analyzing Row Level Security policies. This command identifies vulnerabilities, missing policies, and overly permissive configurations.

## RLS SECURITY LEVELS

```
┌─────────────────────────────────────────────────────────────────┐
│                     RLS SECURITY MATRIX                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Level 1: RLS Enabled                                            │
│  └─ Table has ALTER TABLE ... ENABLE ROW LEVEL SECURITY         │
│                                                                  │
│  Level 2: Policies Defined                                       │
│  └─ SELECT, INSERT, UPDATE, DELETE policies exist               │
│                                                                  │
│  Level 3: WITH CHECK Clauses                                     │
│  └─ INSERT/UPDATE have WITH CHECK for data validation           │
│                                                                  │
│  Level 4: Ownership Enforced                                     │
│  └─ Policies use auth.uid() for user-specific access            │
│                                                                  │
│  Level 5: Admin Separation                                       │
│  └─ Admin policies use auth.is_admin() not public access        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## STAP 1: Gebruik Supabase MCP Tools

Gebruik de Supabase MCP tools om tabellen en advisories te verkrijgen:

```
1. mcp__plugin_supabase_supabase__list_tables - Lijst alle tabellen
2. mcp__plugin_supabase_supabase__get_advisors (type: "security") - Security issues
3. mcp__plugin_supabase_supabase__execute_sql - Custom queries
```

## STAP 2: Check RLS Status per Tabel

Voer deze SQL query uit via `mcp__plugin_supabase_supabase__execute_sql`:

```sql
-- Get all tables with RLS status
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;
```

## STAP 3: Analyseer Policies Detail

```sql
-- Get detailed policy information
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

## STAP 4: Identificeer Vulnerabilities

### Check 1: Tables zonder RLS

```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false
AND tablename NOT IN ('schema_migrations', 'spatial_ref_sys');
```

**Ernst:** CRITICAL
**Risico:** Alle data is publiek toegankelijk via Supabase client

### Check 2: Tables met RLS maar zonder policies

```sql
SELECT t.tablename
FROM pg_tables t
WHERE t.schemaname = 'public'
AND t.rowsecurity = true
AND NOT EXISTS (
  SELECT 1 FROM pg_policies p
  WHERE p.tablename = t.tablename
);
```

**Ernst:** CRITICAL
**Risico:** RLS enabled maar geen policies = alle data GEBLOKKEERD (denial of service)

### Check 3: Overly Permissive SELECT Policies

```sql
SELECT tablename, policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
AND cmd = 'SELECT'
AND (
  qual = 'true'
  OR qual IS NULL
  OR qual = '(true)'
);
```

**Ernst:** HIGH
**Risico:** Iedereen kan alle data lezen

### Check 4: INSERT zonder WITH CHECK

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND cmd = 'INSERT'
AND with_check IS NULL;
```

**Ernst:** HIGH
**Risico:** Gebruikers kunnen data invoeren voor andere users

### Check 5: UPDATE/DELETE zonder ownership check

```sql
SELECT tablename, policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
AND cmd IN ('UPDATE', 'DELETE')
AND qual NOT LIKE '%auth.uid()%';
```

**Ernst:** MEDIUM
**Risico:** Mogelijk kunnen users elkaars data wijzigen

### Check 6: Public INSERT policies

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND cmd = 'INSERT'
AND 'anon' = ANY(roles);
```

**Ernst:** MEDIUM (context-dependent)
**Risico:** Anonymous users kunnen data invoeren

## STAP 5: Check Common Patterns

### Pattern A: User Owns Data

```sql
-- Check if tables with user_id have proper ownership policies
SELECT t.tablename
FROM pg_tables t
JOIN information_schema.columns c
  ON c.table_name = t.tablename
  AND c.column_name = 'user_id'
WHERE t.schemaname = 'public'
AND NOT EXISTS (
  SELECT 1 FROM pg_policies p
  WHERE p.tablename = t.tablename
  AND p.qual LIKE '%auth.uid()%'
);
```

### Pattern B: Organization-Based Access

```sql
-- Check tables with organization_id
SELECT t.tablename
FROM pg_tables t
JOIN information_schema.columns c
  ON c.table_name = t.tablename
  AND c.column_name = 'organization_id'
WHERE t.schemaname = 'public';
```

### Pattern C: Admin-Only Tables

```sql
-- Identify tables that should be admin-only
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'user_roles',
  'audit_logs',
  'system_settings',
  'admin_actions'
);
```

## STAP 6: Genereer Rapport

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    🔐 RLS SECURITY AUDIT REPORT                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  SUMMARY                                                                   ║
║  ├─ Total Tables: XX                                                       ║
║  ├─ RLS Enabled: XX/XX                                                     ║
║  ├─ With Policies: XX/XX                                                   ║
║  └─ Secure: XX/XX                                                          ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  SECURITY SCORES                                                           ║
║  ┌────────────────────────┬────────┬────────┐                              ║
║  │ Check                  │ Status │ Count  │                              ║
║  ├────────────────────────┼────────┼────────┤                              ║
║  │ RLS Enabled            │  ✅/❌  │  XX/XX │                              ║
║  │ Policies Defined       │  ✅/❌  │  XX/XX │                              ║
║  │ WITH CHECK Present     │  ✅/❌  │  XX/XX │                              ║
║  │ Ownership Enforced     │  ✅/❌  │  XX/XX │                              ║
║  │ No Public Write        │  ✅/❌  │  XX/XX │                              ║
║  └────────────────────────┴────────┴────────┘                              ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🔴 CRITICAL ISSUES                                                        ║
║                                                                            ║
║  1. Table: [table_name]                                                    ║
║     Issue: RLS not enabled                                                 ║
║     Risk: All data publicly accessible                                     ║
║     Fix: ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;               ║
║                                                                            ║
║  2. Table: [table_name]                                                    ║
║     Issue: No policies defined (RLS enabled)                               ║
║     Risk: All data inaccessible (DoS)                                      ║
║     Fix: Run /supabase-toolkit:generate-rls [table] [pattern]              ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🟠 HIGH ISSUES                                                            ║
║                                                                            ║
║  1. Table: [table_name]                                                    ║
║     Policy: [policy_name]                                                  ║
║     Issue: INSERT without WITH CHECK                                       ║
║     Risk: Users can insert data as other users                             ║
║     Current: FOR INSERT USING (true)                                       ║
║     Fix: ADD WITH CHECK (auth.uid() = user_id)                             ║
║                                                                            ║
║  2. Table: [table_name]                                                    ║
║     Policy: [policy_name]                                                  ║
║     Issue: SELECT allows all (qual = true)                                 ║
║     Risk: All data readable by anyone                                      ║
║     Fix: ADD USING (auth.uid() = user_id) or auth.is_admin()               ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🟡 MEDIUM ISSUES                                                          ║
║                                                                            ║
║  1. Table: [table_name]                                                    ║
║     Issue: UPDATE/DELETE without ownership check                           ║
║     Risk: Potential cross-user data modification                           ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🔵 LOW / INFO                                                             ║
║                                                                            ║
║  1. Table: audit_logs                                                      ║
║     Note: No RLS - intentional for logging?                                ║
║     Recommendation: Add comment or enable RLS with admin-only              ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  SUPABASE SECURITY ADVISORS                                                ║
║  (via mcp__plugin_supabase_supabase__get_advisors)                         ║
║                                                                            ║
║  [List advisors from Supabase with remediation URLs]                       ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  RECOMMENDED ACTIONS                                                       ║
║                                                                            ║
║  1. CRITICAL: Enable RLS on X tables                                       ║
║     Run: /supabase-toolkit:generate-rls [table] owner-only                 ║
║                                                                            ║
║  2. HIGH: Add WITH CHECK to X policies                                     ║
║     See detailed fixes above                                               ║
║                                                                            ║
║  3. Review: X tables may need different patterns                           ║
║     Run: /supabase-toolkit:generate-rls [table] [pattern]                  ║
║     Patterns: owner-only, admin-only, hybrid, org-based, public-read       ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

## BEST PRACTICES REMINDER

### DO:
- Enable RLS on ALL tables (even if admin-only)
- Use `auth.uid() = user_id` for ownership
- Add `WITH CHECK` to INSERT and UPDATE policies
- Create separate policies per operation (SELECT, INSERT, UPDATE, DELETE)
- Use `auth.is_admin()` function instead of hardcoding roles

### DON'T:
- Use `USING (true)` without good reason
- Forget WITH CHECK on INSERT policies
- Allow anonymous INSERT on sensitive tables
- Trust JWT claims for role checks (use database)
- Use service role in frontend code

---

*Onderdeel van [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
