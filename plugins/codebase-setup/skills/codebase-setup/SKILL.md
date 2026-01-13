---
name: codebase-setup
description: Professional codebase setup for developers migrating from Lovable, Bolt, or v0. Provides feature-based architecture scaffolding, naming convention checks, and config-driven pattern migration.
---

# Codebase Setup Skill

This skill helps developers set up and maintain a professional codebase structure, especially useful for those migrating from no-code/low-code tools like Lovable, Bolt, or v0.

## Commands

### `/codebase-setup:init`
Initialize a professional codebase structure with feature-based architecture.
- Analyzes current project structure
- Generates recommended folder organization
- Creates CLAUDE.md with project context
- Sets up .env.example template

### `/codebase-setup:feature [name]`
Scaffold a new feature with all required files.
- Backend: routes, controller, service, repository, types, validators
- Frontend: components, hooks, services
- Database: migration template with RLS policies
- Config: feature configuration file

### `/codebase-setup:naming-check`
Check naming convention compliance across codebase AND database schema.

**Database Schema Checks (NEW):**
- Foreign key consistency (organization_id vs organizationid)
- Timestamp naming (created_at vs last_edited vs createdat)
- Boolean patterns (is_active vs active vs isactive)
- Status column consistency
- Typo detection (missing underscores, British vs American spelling)

**Code Checks:**
- TypeScript: camelCase variables, PascalCase classes
- Database boundary transformation (snake_case → camelCase)
- API response consistency
- File naming standards

### `/codebase-setup:config-driven [feature]`
Migrate a feature to config-driven architecture.
- Reduces 370+ lines to ~8 lines of config
- Single source of truth for filters, sorting, pagination
- Auto-generated UI components
- Type-safe configuration

### `/codebase-setup:lovable-migrate`
Migrate a Lovable/Bolt/v0 frontend-only project to production-ready frontend/backend architecture.

**What it does:**
- Creates Express backend with same patterns as frontend
- Migrates Edge Functions to backend API endpoints
- Sets up shared Supabase Auth between frontend/backend
- Creates API client for frontend
- Optional monorepo setup

**Tech Stack (100% Lovable compatible):**
- Frontend: React 18, Vite 5, Tailwind, shadcn/ui, TanStack Query
- Backend: Express, TypeScript, Zod validation
- Database: Supabase PostgreSQL (unchanged)
- Auth: Supabase Auth (shared)

**Migrates:**
- Edge Functions → Backend features
- API keys/secrets → Backend environment
- External API calls → Backend services

**Keeps in Supabase:**
- Authentication (client-side)
- Real-time subscriptions
- File storage
- Simple CRUD with RLS

### `/codebase-setup:codebase-cleanup`
Find and remove codebase clutter - temporary files, orphaned scripts, generated artifacts.

**What it finds:**
- Orphaned one-time scripts (fix-*, migrate-*, insert-*)
- Build artifacts that shouldn't be committed
- Test screenshots and coverage reports
- Backup files (*.bak, *.old, *.orig)
- Large media files that belong on CDN
- Empty directories
- .gitignore gaps

### `/codebase-setup:health-check`
Meta-audit for codebase health - config consistency, documentation links, project structure, and duplicate code detection.

**Config Consistency:**
- License mismatch between files (README vs package.json vs plugin.json)
- Author format inconsistencies
- Missing required fields in config files
- Repository URL mismatches

**Documentation Health:**
- Dead internal links in README/docs
- Missing standard docs (CHANGELOG, CONTRIBUTING)
- Commands without descriptions

**Project Structure:**
- File vs directory inconsistencies (e.g., .claude-plugin file vs folder)
- Naming convention violations across directories
- Missing standard directories

**Duplicate Code Detection:**
- Exact duplicate files (via MD5 hash)
- Same filename in multiple directories
- Duplicate function definitions
- Copy-pasted hooks (use*.ts in multiple locations)
- Repeated code patterns (try-catch, form handling, API calls)
- Debug leftovers (console.log statements)
- Unfinished work (TODO/FIXME comments)

**Output:** Health Score (0-100) with breakdown per category and concrete fix suggestions.

## When to Use

Use this skill when:
- Starting a new project from scratch
- Migrating from Lovable/Bolt/v0 to professional code
- Adding new features to an existing project
- Standardizing naming conventions
- Reducing boilerplate with config-driven patterns
- Cleaning up accumulated clutter and dead code
- Checking codebase health and consistency
- Finding and eliminating duplicate code

## Architecture Patterns

This skill implements:
1. **Feature-based architecture** - Each feature is self-contained
2. **Boundary transformation** - snake_case DB → camelCase TypeScript
3. **Config-driven UI** - 98% boilerplate reduction
4. **RLS-first security** - Row Level Security by default

---

*Part of [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
