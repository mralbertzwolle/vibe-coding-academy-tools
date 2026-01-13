# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- CODE_OF_CONDUCT.md for community guidelines
- SECURITY.md for responsible disclosure policy
- GitHub issue and PR templates
- CHANGELOG.md for version history

## [1.0.0] - 2025-01-14

### Added

#### Plugins
- **security-audit** — 75+ security checks covering OWASP Top 10, Supabase RLS, payment security, secrets detection, and more
- **ai-seo-audit** — 35 checks for AI discoverability (GEO), structured data, and search engine optimization
- **codebase-setup** — Project scaffolding, Lovable migrations, feature scaffolding, naming conventions
- **supabase-toolkit** — RLS policy audit, auth setup, schema usage analysis, migration linting
- **performance-audit** — Bundle analysis, React performance, database query optimization
- **accessibility-audit** — WCAG 2.1 Level AA compliance checks

#### Commands
- `/security-audit:run` — Full security audit with intelligent project size scaling
- `/ai-seo-audit:run` — AI discoverability and SEO analysis
- `/codebase-setup:init` — Initialize new projects with best practices
- `/codebase-setup:feature` — Scaffold new features
- `/codebase-setup:lovable-migrate` — Migrate from Lovable to production-ready code
- `/codebase-setup:naming-check` — Verify naming conventions
- `/codebase-setup:codebase-cleanup` — Find orphaned files and build artifacts
- `/supabase-toolkit:rls-audit` — Analyze RLS policies
- `/supabase-toolkit:auth-setup` — Configure Supabase authentication
- `/supabase-toolkit:generate-rls` — Generate RLS policies
- `/supabase-toolkit:generate-rpc` — Generate RPC functions
- `/supabase-toolkit:migration-lint` — Lint migration files
- `/supabase-toolkit:schema-usage-audit` — Detect unused database columns/tables
- `/performance-audit:run` — Full performance analysis
- `/accessibility-audit:run` — WCAG compliance check

#### Documentation
- README with quick start and plugin overview
- CONTRIBUTING guide with plugin scaffolding template
- Detailed plugin documentation in /docs
- CLAUDE.md for AI assistant context

### Technical Details
- One-liner installation script
- CC BY-NC 4.0 license (free for non-commercial use)
- Optimized for React, Vue, Next.js, Vite, Supabase

---

[Unreleased]: https://github.com/mralbertzwolle/vibe-coding-academy-tools/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/mralbertzwolle/vibe-coding-academy-tools/releases/tag/v1.0.0
