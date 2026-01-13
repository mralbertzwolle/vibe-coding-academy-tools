# Claude Project Context

This is the **vibe-coding-academy-tools** repository - a collection of Claude Code plugins for AI-assisted development.

## Project Overview

Open-source Claude Code plugins designed for developers migrating from Lovable, Bolt, or v0 to production-ready codebases. Built by Vibe Coding Academy (Netherlands).

## Repository Structure

```
plugins/
├── security-audit/        # 75+ security checks (OWASP, RLS, secrets)
├── ai-seo-audit/          # GEO - AI discoverability (35 checks)
├── codebase-setup/        # Project scaffolding & migrations
├── supabase-toolkit/      # Supabase-specific tools (RLS, auth, schema)
├── performance-audit/     # Bundle, React, DB query analysis
└── accessibility-audit/   # WCAG 2.1 Level AA compliance
```

## Plugin Architecture

Each plugin follows this structure:
```
plugin-name/
├── .claude-plugin        # Plugin metadata (JSON)
├── commands/             # Slash commands (/plugin:command)
│   └── run.md           # Command definition with frontmatter
└── skills/               # Domain knowledge for Claude
    └── plugin-name/
        └── SKILL.md      # Skill definition
```

### IMPORTANT: Every command needs a skill

When adding a new `run.md` command, **always create a corresponding SKILL.md**:
- Command = HOW to execute (step-by-step instructions)
- Skill = WHAT it can do (discovery/indexing for Claude)

### Commands vs Skills

| Type | Purpose | Invocation |
|------|---------|------------|
| **Commands** | Execute specific tasks with defined inputs | `/security-audit:run full` |
| **Skills** | Provide domain knowledge and context | Loaded automatically when relevant |

**Commands** have frontmatter with `allowed-tools` and `description`.
**Skills** provide summary, features, and usage examples.

## Current Stats

- **6 plugins**
- **17 commands**
- **6 skills** (one per plugin)

## Key Standards

All plugins enforce these naming conventions:

| Layer | Convention | Example |
|-------|------------|---------|
| TypeScript | camelCase | `userId`, `getUserById()` |
| React Components | PascalCase | `UserProfile.tsx` |
| Database | snake_case | `user_id`, `created_at` |
| API JSON | camelCase | `{ userId, createdAt }` |

## Common Tasks

### Adding a new command
1. Create `plugins/{plugin}/commands/{command-name}.md`
2. Add frontmatter with `allowed-tools` and `description`
3. Write the command instructions

### Adding a new skill
1. Create `plugins/{plugin}/skills/{plugin-name}/SKILL.md`
2. Write comprehensive domain knowledge
3. Include checklists, patterns, and examples

### Testing plugins
Run audits on real projects to verify:
- Commands execute correctly
- Output is formatted properly
- Recommendations are actionable

## Technology Focus

Optimized for:
- React, Vue, Next.js, Vite
- Node.js, Express
- Supabase, PostgreSQL
- Mollie, Stripe payments
- Mailgun email

## Quick Reference

| Plugin | Main Command | Key Feature |
|--------|-------------|-------------|
| security-audit | `/security-audit:run` | 75+ OWASP checks |
| ai-seo-audit | `/ai-seo-audit:run` | GEO for AI visibility |
| codebase-setup | `/codebase-setup:init` | Project scaffolding |
| supabase-toolkit | `/supabase-toolkit:rls-audit` | RLS policy analysis |
| performance-audit | `/performance-audit:run` | Bundle & query analysis |
| accessibility-audit | `/accessibility-audit:run` | WCAG 2.1 AA compliance |

## Recent Updates

- **health-check**: Config consistency, dead links, duplicate code detection
- **codebase-cleanup**: Find orphaned scripts, temp files, build artifacts
- **schema-usage-audit**: Detect unused database columns/tables
- **ai-seo-audit v2.0**: 35 checks with research-backed weights
- **security-audit**: Intelligent project size scaling

## Links

- Website: https://vibecodingacademy.nl
- Repository: https://github.com/mralbertzwolle/vibe-coding-academy-tools
