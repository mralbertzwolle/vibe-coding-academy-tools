---
name: supabase-toolkit
description: Supabase-specific tools for authentication, Row Level Security, RPC generation, and migration validation. Built for developers using Supabase as their backend.
---

# Supabase Toolkit Skill

This skill provides specialized tools for Supabase development, focusing on security best practices and efficient database patterns.

## Commands

### `/supabase-toolkit:auth-setup`
Configure authentication with best practices.
- JWT validation middleware
- Role-based access control (user, creator, admin, superadmin)
- Database helpers (userDB, adminDB, systemDB)
- User roles table and functions

### `/supabase-toolkit:rls-audit`
Audit Row Level Security policies.
- Check RLS enabled on all tables
- Identify overly permissive policies
- Find missing WITH CHECK clauses
- Verify ownership patterns
- Integration with Supabase security advisors

### `/supabase-toolkit:generate-rls [table] [pattern]`
Generate RLS policies using predefined patterns.
- `owner-only`: Users see only their own data
- `admin-only`: Only admins have access
- `hybrid`: Users own data, admins see all
- `org-based`: Organization-level access
- `public-read`: Public read, admin write
- `creator-sandbox`: Creators manage own content

### `/supabase-toolkit:generate-rpc [feature]`
Auto-generate PostgreSQL RPC functions.
- Window functions for count + results in one query
- Built-in filters (status, search, date range)
- Dynamic sorting
- Pagination support
- TypeScript type generation

### `/supabase-toolkit:migration-lint [file]`
Validate SQL migrations.
- Naming conventions (snake_case)
- RLS security checks
- Foreign key best practices
- Index recommendations
- Rollback safety analysis

### `/supabase-toolkit:schema-usage-audit`
Find unused database columns and tables ("rotzooi").
- Scan all tables and columns from schema
- Search codebase for column references
- Identify orphaned columns (no code references)
- Detect deprecated naming patterns
- Check database-only usage (RLS, triggers, views)
- Generate cleanup recommendations

## When to Use

Use this skill when:
- Setting up authentication for a new Supabase project
- Adding new tables and need RLS policies
- Creating efficient query functions with filtering
- Reviewing migrations before deployment
- Auditing existing database security
- Cleaning up unused database columns and tables

## Security Patterns

This skill implements:
1. **Defense in depth**: RLS + backend validation
2. **Least privilege**: Role-based database helpers
3. **Secure functions**: search_path and SECURITY DEFINER
4. **Ownership verification**: auth.uid() checks everywhere

---

*Part of [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
