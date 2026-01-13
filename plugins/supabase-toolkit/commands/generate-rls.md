---
allowed-tools: Bash, Read, Glob, Grep, Write, Task, TodoWrite, AskUserQuestion, mcp__plugin_supabase_supabase__list_tables, mcp__plugin_supabase_supabase__execute_sql, mcp__plugin_supabase_supabase__apply_migration
argument-hint: <table-name> [pattern]
description: Generate RLS policies for a table using predefined patterns
---

# Supabase Toolkit: Generate RLS

You are a **database security engineer** generating Row Level Security policies. This command creates secure, battle-tested RLS policies based on common access patterns.

## ARGUMENT PARSING

```
/supabase-toolkit:generate-rls orders owner-only
                                ↑       ↑
                              table   pattern
```

**Table:** De database tabel (snake_case)
**Pattern:** Het access pattern (zie hieronder)

Als geen pattern opgegeven, vraag de gebruiker.

## RLS PATTERNS

### Pattern 1: `owner-only`
Gebruikers zien alleen hun eigen data.

**Geschikt voor:** orders, profiles, preferences, personal data

```sql
-- Table must have: user_id column referencing auth.users(id)

CREATE POLICY "[table]_select_own" ON [table]
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "[table]_insert_own" ON [table]
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "[table]_update_own" ON [table]
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "[table]_delete_own" ON [table]
  FOR DELETE USING (auth.uid() = user_id);
```

### Pattern 2: `admin-only`
Alleen admins hebben toegang.

**Geschikt voor:** user_roles, audit_logs, system_settings

```sql
CREATE POLICY "[table]_admin_all" ON [table]
  FOR ALL USING (auth.is_admin());
```

### Pattern 3: `hybrid`
Users zien eigen data, admins zien alles.

**Geschikt voor:** orders, invoices, tickets (support scenario's)

```sql
-- Users: own data only
CREATE POLICY "[table]_select_own" ON [table]
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "[table]_insert_own" ON [table]
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "[table]_update_own" ON [table]
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "[table]_delete_own" ON [table]
  FOR DELETE USING (auth.uid() = user_id);

-- Admins: full access
CREATE POLICY "[table]_admin_select" ON [table]
  FOR SELECT USING (auth.is_admin());

CREATE POLICY "[table]_admin_all" ON [table]
  FOR ALL USING (auth.is_admin());
```

### Pattern 4: `org-based`
Gebruikers zien data van hun organisatie.

**Geschikt voor:** multi-tenant apps, team features

```sql
-- Requires: organization_id column AND user must be in that org

CREATE POLICY "[table]_select_org" ON [table]
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "[table]_insert_org" ON [table]
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "[table]_update_org" ON [table]
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  ) WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "[table]_delete_org" ON [table]
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Admins: full access
CREATE POLICY "[table]_admin_all" ON [table]
  FOR ALL USING (auth.is_admin());
```

### Pattern 5: `public-read`
Iedereen kan lezen, alleen admins kunnen schrijven.

**Geschikt voor:** products, categories, public content

```sql
-- Public read access
CREATE POLICY "[table]_public_select" ON [table]
  FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "[table]_admin_insert" ON [table]
  FOR INSERT WITH CHECK (auth.is_admin());

CREATE POLICY "[table]_admin_update" ON [table]
  FOR UPDATE USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

CREATE POLICY "[table]_admin_delete" ON [table]
  FOR DELETE USING (auth.is_admin());
```

### Pattern 6: `authenticated-read`
Ingelogde users kunnen lezen, alleen admins schrijven.

**Geschikt voor:** internal docs, team resources

```sql
-- Authenticated read
CREATE POLICY "[table]_auth_select" ON [table]
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin write
CREATE POLICY "[table]_admin_insert" ON [table]
  FOR INSERT WITH CHECK (auth.is_admin());

CREATE POLICY "[table]_admin_update" ON [table]
  FOR UPDATE USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

CREATE POLICY "[table]_admin_delete" ON [table]
  FOR DELETE USING (auth.is_admin());
```

### Pattern 7: `creator-sandbox`
Creators kunnen hun eigen content beheren, users kunnen alles lezen.

**Geschikt voor:** blogs, courses, content platforms

```sql
-- Users can read all published content
CREATE POLICY "[table]_public_select" ON [table]
  FOR SELECT USING (
    status = 'published'
    OR auth.uid() = created_by
    OR auth.is_admin()
  );

-- Creators can only manage their own content
CREATE POLICY "[table]_creator_insert" ON [table]
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND auth.user_role() IN ('creator', 'admin', 'superadmin')
  );

CREATE POLICY "[table]_creator_update" ON [table]
  FOR UPDATE USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "[table]_creator_delete" ON [table]
  FOR DELETE USING (auth.uid() = created_by);

-- Admins: full access
CREATE POLICY "[table]_admin_all" ON [table]
  FOR ALL USING (auth.is_admin());
```

## STAP 1: Vraag Pattern (indien niet opgegeven)

Als geen pattern argument:

```
Welk RLS pattern wil je gebruiken voor [table]?

1. owner-only - Users zien alleen eigen data
2. admin-only - Alleen admins
3. hybrid - Users eigen data, admins alles
4. org-based - Organisatie-gebaseerd
5. public-read - Publiek lezen, admin schrijven
6. authenticated-read - Ingelogd lezen, admin schrijven
7. creator-sandbox - Creators beheren eigen content
```

## STAP 2: Analyseer Tabel Structuur

Check welke kolommen aanwezig zijn:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = '[table]'
AND table_schema = 'public';
```

Controleer of benodigde kolommen bestaan:
- `owner-only` / `hybrid`: vereist `user_id`
- `org-based`: vereist `organization_id`
- `creator-sandbox`: vereist `created_by` en `status`

## STAP 3: Check Bestaande Policies

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = '[table]';
```

Als er al policies zijn, vraag:
```
Er bestaan al policies voor [table]:
- [policy_names]

Wil je:
1. Bestaande vervangen (DROP + CREATE)
2. Toevoegen aan bestaande
3. Annuleren
```

## STAP 4: Genereer Migration

Genereer een complete migration file:

```sql
-- Migration: add_rls_policies_[table]
-- Pattern: [pattern]
-- Generated by: /supabase-toolkit:generate-rls

-- ═══════════════════════════════════════════════════════════════════════════
-- ENABLE RLS
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- DROP EXISTING POLICIES (if replacing)
-- ═══════════════════════════════════════════════════════════════════════════

-- Uncomment if replacing existing policies:
-- DROP POLICY IF EXISTS "[table]_select_own" ON [table];
-- DROP POLICY IF EXISTS "[table]_insert_own" ON [table];
-- DROP POLICY IF EXISTS "[table]_update_own" ON [table];
-- DROP POLICY IF EXISTS "[table]_delete_own" ON [table];

-- ═══════════════════════════════════════════════════════════════════════════
-- CREATE POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

[POLICIES BASED ON PATTERN]

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════════════

-- Run after migration to verify:
-- SELECT tablename, policyname, cmd, qual, with_check
-- FROM pg_policies WHERE tablename = '[table]';
```

## STAP 5: Apply Migration

Vraag de gebruiker:

```
Migration gegenereerd. Wil je deze direct toepassen?

1. Ja, apply via Supabase MCP
2. Nee, alleen tonen (ik pas handmatig toe)
3. Opslaan als bestand
```

Als "Ja", gebruik `mcp__plugin_supabase_supabase__apply_migration`.

## STAP 6: Rapport

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    🔐 RLS POLICIES GENERATED                               ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  Table: [table]                                                            ║
║  Pattern: [pattern]                                                        ║
║                                                                            ║
║  POLICIES CREATED                                                          ║
║  ├─ [table]_select_own ··········· SELECT USING (auth.uid() = user_id)     ║
║  ├─ [table]_insert_own ··········· INSERT WITH CHECK (auth.uid()=user_id)  ║
║  ├─ [table]_update_own ··········· UPDATE USING + WITH CHECK               ║
║  └─ [table]_delete_own ··········· DELETE USING (auth.uid() = user_id)     ║
║                                                                            ║
║  STATUS: [Applied / Pending]                                               ║
║                                                                            ║
║  VERIFICATION                                                              ║
║  Run: /supabase-toolkit:rls-audit to verify policies                       ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

## HELPER FUNCTIONS

Als `auth.is_admin()` niet bestaat, genereer deze ook:

```sql
-- Helper function: Check if current user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: Get current user's role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM user_roles WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
```

## COMMON MISTAKES TO AVOID

1. **Vergeten WITH CHECK op INSERT**
   ```sql
   -- ❌ WRONG
   CREATE POLICY "insert" ON orders FOR INSERT USING (true);

   -- ✅ CORRECT
   CREATE POLICY "insert" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

2. **Duplicate policies**
   ```sql
   -- ❌ Creates conflict
   CREATE POLICY "admin" ON orders FOR SELECT USING (auth.is_admin());
   CREATE POLICY "admin" ON orders FOR UPDATE USING (auth.is_admin());

   -- ✅ Unique names
   CREATE POLICY "admin_select" ON orders FOR SELECT USING (auth.is_admin());
   CREATE POLICY "admin_update" ON orders FOR UPDATE USING (auth.is_admin());
   ```

3. **Missing RLS enable**
   ```sql
   -- ❌ Policies won't work
   CREATE POLICY "select" ON orders FOR SELECT USING (true);

   -- ✅ Enable first
   ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "select" ON orders FOR SELECT USING (true);
   ```

---

*Onderdeel van [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
