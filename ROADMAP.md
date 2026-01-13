# Vibe Coding Academy Tools - Roadmap

> **Missie:** Open-source Claude Code plugins voor developers die van Lovable/Bolt/v0 komen en hun codebase professioneel willen opzetten.

---

## Current Status (January 2025)

### Completed Plugins

| Plugin | Commands | Status | Tested |
|--------|----------|--------|--------|
| **security-audit** | 1 | Complete | SparkBuddy-Live |
| **codebase-setup** | 5 | Complete | SparkBuddy-Live |
| **supabase-toolkit** | 5 | Complete | SparkBuddy-Live |
| **performance-audit** | 1 | Complete | SparkBuddy-Live |
| **accessibility-audit** | 1 | Complete | SparkBuddy-Live |

**Total: 5 plugins, 13 commands**

### Standards Compliance (100%)

All plugins have been audited and standardized against:
- Google TypeScript Style Guide
- Airbnb React/JavaScript Style Guide
- SQL Style Guide (Simon Holywell)
- Turborepo monorepo patterns
- Microsoft/Google REST API Guidelines

---

## Completed Features

### Phase 1: Security Foundation
- [x] `/security-audit:run` - 75+ security checks with 9 parallel agents
- [x] TruffleHog integration for git history scanning
- [x] OWASP Top 10 coverage
- [x] Supabase RLS validation
- [x] Payment security (Mollie, Stripe)

### Phase 2: Codebase Setup
- [x] `/codebase-setup:init` - Project structure initialization
- [x] `/codebase-setup:feature` - Feature scaffolding with full architecture
- [x] `/codebase-setup:naming-check` - Database + code naming audit
- [x] `/codebase-setup:config-driven` - Config-driven pattern migration
- [x] `/codebase-setup:lovable-migrate` - Lovable → production architecture

### Phase 3: Supabase Toolkit
- [x] `/supabase-toolkit:auth-setup` - JWT middleware + role-based access
- [x] `/supabase-toolkit:rls-audit` - RLS policy security audit
- [x] `/supabase-toolkit:generate-rls` - 7 RLS patterns generator
- [x] `/supabase-toolkit:generate-rpc` - Window function RPC generator
- [x] `/supabase-toolkit:migration-lint` - SQL migration linting

### Phase 4: Quality Audits
- [x] `/performance-audit:run` - Bundle, React, DB, network analysis
- [x] `/accessibility-audit:run` - WCAG 2.1 AA compliance

### Phase 5: Standards Consolidation
- [x] Global standards audit across all plugins
- [x] `userDB(token)` pattern standardization
- [x] Boundary transformation documentation
- [x] Middleware naming standardization
- [x] Database naming conventions

---

## Future Roadmap

### v1.1 - Testing & Documentation
- [ ] Add automated tests for each command
- [ ] Create video tutorials for each plugin
- [ ] Expand documentation with real-world examples
- [ ] Create migration guide from Lovable/Bolt/v0

### v1.2 - Enhanced Generators
- [ ] `/codebase-setup:component` - React component generator
- [ ] `/codebase-setup:hook` - Custom hook generator
- [ ] `/supabase-toolkit:storage-setup` - Storage bucket configuration
- [ ] `/supabase-toolkit:realtime-setup` - Realtime subscription patterns

### v1.3 - CI/CD Integration
- [ ] GitHub Actions workflow generator
- [ ] Pre-commit hooks configuration
- [ ] Automated security scanning on PR
- [ ] Deployment pipelines (Railway, Vercel, Fly.io)

### v1.4 - Advanced Features
- [ ] `/api-docs:generate` - OpenAPI documentation from code
- [ ] `/test:generate` - Test file scaffolding
- [ ] `/migration:plan` - Database migration planning
- [ ] `/refactor:boundary` - Automated boundary transformation

### v2.0 - Multi-Framework Support
- [ ] Vue.js support
- [ ] Svelte support
- [ ] Next.js App Router patterns
- [ ] Fastify backend patterns

---

## Key Patterns Implemented

### Database Helpers Hierarchy

```typescript
// User operations (respects RLS)
const db = userDB(req.accessToken);

// Admin operations (bypasses RLS)
const admin = adminDB();

// System operations (webhooks, cron)
const system = systemDB();
```

### Feature Module Structure

```
src/features/[name]/
├── routes.ts           # API endpoints
├── controller.ts       # Request handling
├── service.ts          # Business logic
├── repository.ts       # Database queries
├── types.ts            # TypeScript interfaces
├── transformers.ts     # DB ↔ API transformation
├── validators.ts       # Zod schemas
└── index.ts            # Public exports
```

### Naming Convention Matrix

| Layer | Convention | Example |
|-------|------------|---------|
| TypeScript vars | camelCase | `userId`, `orderTotal` |
| TypeScript types | PascalCase | `User`, `OrderRow` |
| Files (backend) | kebab-case | `auth-middleware.ts` |
| Files (React) | PascalCase | `UserProfile.tsx` |
| Database tables | snake_case, plural | `users`, `order_items` |
| Database columns | snake_case | `user_id`, `created_at` |
| Foreign keys | `{table}_id` | `user_id`, `order_id` |
| Booleans | `is_{property}` | `is_active`, `is_published` |
| Timestamps | `{action}_at` | `created_at`, `updated_at` |
| REST URLs | lowercase, plural | `/api/v1/orders` |
| JSON fields | camelCase | `{ userId, createdAt }` |

---

## Differentiatie vs Concurrentie

| Feature | Other Tools | Vibe Coding Academy |
|---------|-------------|---------------------|
| Focus | Generiek | **Lovable → Pro migratie** |
| Supabase | Basic | **Deep integration** |
| Config-driven | Nee | **98% boilerplate reduction** |
| RLS Generator | Nee | **7 patterns, auto-generate** |
| SQL Generator | Nee | **Window functions, JOINs** |
| Standards | Varied | **100% global standards** |
| Tested | Unknown | **Production (SparkBuddy)** |

---

## Contributing

### How to Contribute
1. Fork the repo
2. Create a feature branch
3. Submit a PR with:
   - Clear description
   - Tests if applicable
   - Documentation updates

### Feature Requests
- Open a GitHub Issue with [FEATURE REQUEST]
- Join the discussion in Discussions
- Vote on existing feature requests

---

## Resources & Inspiration

Based on:
- SparkBuddy Production Patterns (private)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [SQL Style Guide](https://www.sqlstyle.guide/)
- [Turborepo Documentation](https://turborepo.dev/)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)

---

## Contact

- **Website:** [vibecodingacademy.nl](https://vibecodingacademy.nl)
- **GitHub:** [mralbertzwolle/vibe-coding-academy-tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)
- **Issues:** [GitHub Issues](https://github.com/mralbertzwolle/vibe-coding-academy-tools/issues)

---

*Built with love by Vibe Coding Academy - The Dutch academy for AI-assisted development*
