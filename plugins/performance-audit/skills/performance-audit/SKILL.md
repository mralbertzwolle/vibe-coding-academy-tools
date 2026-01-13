---
name: performance-audit
description: Performance auditing for web applications. Analyzes bundle size, React rendering, database queries, network patterns, and assets. Provides actionable recommendations with effort estimates.
---

# Performance Audit Skill

This skill analyzes web application performance and provides actionable optimization recommendations.

## Command

### `/performance-audit:run [quick|full]`
Run a complete performance audit.

**Quick Mode (5 min):**
- Package dependency analysis
- React anti-pattern detection
- Database query patterns
- Image optimization check
- Import analysis

**Full Mode (15 min):**
- All quick checks +
- Production build analysis
- Bundle size breakdown
- Code splitting opportunities
- API response analysis

## What It Checks

### Bundle Size
- Heavy dependencies (moment, lodash, etc.)
- Code splitting opportunities
- Tree shaking effectiveness
- Duplicate packages

### React Performance
- Unnecessary re-renders
- Missing memoization
- Inline object/function creation
- Context overuse
- Large component trees

### Database Queries
- N+1 query patterns
- Sequential vs parallel queries
- Missing pagination
- Over-fetching data

### Network
- Request waterfalls
- Caching opportunities
- Payload sizes

### Assets
- Unoptimized images
- Missing lazy loading
- Font loading strategy

## When to Use

Use this skill when:
- App feels slow
- Before production deployment
- After adding major features
- Bundle size is growing
- Users complain about loading times

---

*Part of [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
