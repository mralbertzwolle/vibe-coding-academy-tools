# Plugin Documentation

Full documentation for all Vibe Coding Academy Tools plugins.

---

## Security Audit

Complete security audits with **75+ checks** for web applications.

```bash
/security-audit:run full   # Complete audit with 9 parallel agents
/security-audit:run quick  # Pre-deploy checklist (5 minutes)
/security-audit:run fix    # Audit + auto-fix CRITICAL/HIGH issues
```

### Checks

- OWASP Top 10 coverage
- Supabase RLS & storage validation
- Payment security (Mollie, Stripe)
- Secret detection (TruffleHog integration)
- Dependency vulnerability scanning
- IDOR and access control issues
- XSS, SQL injection, command injection
- RLS bypass via RPC functions

---

## AI SEO Audit v2.0

**Generative Engine Optimization (GEO)** - Get discovered by ChatGPT, Claude, Perplexity, and Google AI Overviews.

```bash
/ai-seo-audit:run                      # Audit current project
/ai-seo-audit:run https://example.com  # Audit specific URL
```

### 36 Checks Across 8 Categories

| Category | Weight | Key Checks |
|----------|--------|------------|
| Brand Authority | 25% | Wikipedia, Knowledge Graph, SameAs schema |
| Community Presence | 15% | Reddit (46.7% Perplexity citations), Quora, forums |
| Citation-Worthy Content | 15% | Statistics (+22%), expert quotes (+37%), FAQs |
| Structured Data | 12% | Organization, Article, FAQ, HowTo schema |
| Technical AI Access | 10% | robots.txt AI policy, broken links, TTFB, SSR |
| Content Freshness | 10% | Update dates, sitemap lastmod |
| Content Quality | 8% | Heading hierarchy, E-E-A-T, author info |
| AI-Specific Files | 5% | llms.txt, ai.txt, Open Graph |

### Key Research Findings

- Brand mentions, not backlinks, drive AI visibility
- 47.9% of ChatGPT citations come from Wikipedia
- 46.7% of Perplexity citations come from Reddit
- Multi-platform presence (4+) gives 2.8x citation boost

---

## Codebase Setup

Professional codebase setup for **Lovable/Bolt/v0 migrations**.

```bash
/codebase-setup:init                  # Initialize project structure
/codebase-setup:feature orders        # Scaffold new feature
/codebase-setup:naming-check          # Check naming conventions (DB + code)
/codebase-setup:config-driven orders  # Migrate to config-driven pattern
/codebase-setup:lovable-migrate       # Migrate to frontend/backend architecture
/codebase-setup:codebase-cleanup      # Find and remove repository clutter
```

### Features

- Feature-based architecture scaffolding
- Complete feature generation (routes, controller, service, repository, types, transformers)
- Database schema naming consistency audit
- Code naming convention compliance
- Config-driven pattern migration (98% boilerplate reduction)
- Lovable → Production migration with Express backend

### Codebase Cleanup Detects

- One-time scripts (`fix-*.ts`, `migrate-*.ts`)
- Build artifacts in version control
- `.env` files accidentally committed
- Large media files
- Test artifacts & screenshots
- Empty directories
- System files (`.DS_Store`, `Thumbs.db`)

---

## Supabase Toolkit

Supabase-specific tools for security and efficiency.

```bash
/supabase-toolkit:auth-setup                    # Configure authentication
/supabase-toolkit:rls-audit                     # Audit RLS policies
/supabase-toolkit:generate-rls orders hybrid    # Generate RLS policies
/supabase-toolkit:generate-rpc orders           # Generate RPC functions
/supabase-toolkit:migration-lint                # Lint SQL migrations
/supabase-toolkit:schema-usage-audit            # Find unused columns/tables
```

### Features

- JWT validation middleware with role-based access
- 7 RLS policy patterns (owner-only, admin-only, hybrid, org-based, etc.)
- RPC generator with window functions for efficient queries
- Migration linting for best practices
- Database helpers: `userDB(token)`, `adminDB()`, `systemDB()`

### Schema Usage Audit Finds

- Orphaned columns never referenced in code
- Unused tables with zero code references
- Renamed columns where old wasn't dropped
- Experimental fields that never went live

### RLS Patterns

```
1. owner-only         → Users see only their own data
2. admin-only         → Only admins have access
3. hybrid             → Users own data, admins see all
4. org-based          → Organization-level access
5. public-read        → Public read, admin write
6. authenticated-read → Logged-in read, admin write
7. creator-sandbox    → Creators manage own content
```

---

## Performance Audit

Performance analysis for web applications.

```bash
/performance-audit:run quick  # Quick checks (5 min)
/performance-audit:run full   # Complete analysis (15 min)
```

### Checks

- Bundle size analysis (heavy dependencies, code splitting)
- React performance (re-renders, memoization, context)
- Database queries (N+1, sequential vs parallel, missing pagination)
- Network patterns (waterfalls, caching, React Query configuration)
- Asset optimization (images, fonts, lazy loading)

### Common Fixes Recommended

- Lazy load heavy components (MDEditor, Monaco, etc.)
- Parallelize database queries with `Promise.all()`
- Add `staleTime` and `gcTime` to React Query
- Memoize context values with `useMemo`

---

## Accessibility Audit

WCAG 2.1 Level AA compliance checking.

```bash
/accessibility-audit:run quick  # Code-based checks (5 min)
/accessibility-audit:run full   # Complete analysis (15 min)
```

### Checks

- Images without alt text
- Keyboard accessibility (clickable divs without keyboard handlers)
- Color contrast (4.5:1 minimum)
- Form labels and error messages
- ARIA usage and validity
- Heading structure (H1 → H2 → H3 hierarchy)
- Skip links
- Focus management
- Reduced motion support

---

## Skills vs Commands

| Type | Invocation | Purpose |
|------|------------|---------|
| **Commands** | `/plugin:command` | Specific tasks with defined inputs |
| **Skills** | Loaded automatically | Domain knowledge for Claude |

**Skills provide:**
- Deep context about each plugin's domain
- Best practices and patterns
- Detailed checklists and procedures
- Can be combined for complex workflows

---

## Key Patterns

### Boundary Transformation

All plugins enforce proper boundary transformation between database (snake_case) and API (camelCase):

```typescript
// Database Row (snake_case)
interface OrderRow {
  order_id: string;
  user_id: string;
  created_at: string;
}

// API Response (camelCase)
interface Order {
  orderId: string;
  userId: string;
  createdAt: string;
}
```

### Database Helpers

```typescript
// User operations (respects RLS)
const db = userDB(req.accessToken);
await db.from('orders').select('*');

// Admin operations (bypasses RLS)
const admin = adminDB();
await admin.from('orders').update({ status: 'completed' });

// System operations (webhooks, cron)
const system = systemDB();
await system.from('audit_logs').insert({ ... });
```

---

## Recommended Tools

For best results, install these CLI tools:

```bash
# Secret scanning in git history
brew install trufflehog

# Static analysis
brew install semgrep

# JSON processing
brew install jq
```

---

## Repository Structure

```
vibe-coding-academy-tools/
├── plugins/
│   ├── security-audit/
│   ├── ai-seo-audit/
│   ├── codebase-setup/
│   ├── supabase-toolkit/
│   ├── performance-audit/
│   └── accessibility-audit/
├── docs/
│   ├── PLUGINS.md
│   └── NAMING.md
├── README.md
├── CONTRIBUTING.md
├── ROADMAP.md
└── LICENSE
```

---

*Part of [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
