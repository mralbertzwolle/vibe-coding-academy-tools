---
name: security-audit
description: Complete security audits with 95+ checks for web applications. Covers OWASP Top 10, Supabase RLS bypass attacks (22 vectors), payment security, IDOR, XSS, SQL injection, and more. Use /security-audit:run to start.
---

# Security Audit Skill

This skill provides comprehensive security auditing for web applications with special focus on **database bypass attacks**.

## Features

- **95+ security checks** across 10 categories
- **22 database bypass attack vectors** tested
- **RLS bypass detection** (anon vs service_role confusion)
- **Parallel agent architecture** for fast scanning
- **CLI tool integration** (TruffleHog, Semgrep, npm audit)
- **Current CVE awareness** via WebSearch
- **Supabase-specific checks** (RLS, storage, policies, RPC functions)
- **Auto-fix capability** for CRITICAL/HIGH issues

## Usage

```bash
/security-audit:run full   # Complete audit
/security-audit:run quick  # Pre-deploy checklist (5 min)
/security-audit:run fix    # Audit + auto-fix
```

## Categories

1. **Secrets & Vibe-Coding** - Exposed API keys, hardcoded credentials
2. **IDOR & Access Control** - Broken authorization, missing ownership checks
3. **Payment Security** - Price manipulation, webhook verification
4. **Injection Attacks** - SQL, XSS, command injection
5. **API Security** - Rate limiting, CORS, headers
6. **Supabase Database** - RLS policies, storage buckets
7. **Database Bypass Attacks** - 22 attack vectors (NEW)
8. **Dependencies** - CVEs, outdated packages
9. **Input Validation** - Missing validators, error handling
10. **Auth & Webhooks** - Token security, webhook signatures

## Database Bypass Attack Vectors (22 checks)

| Category | Vectors | Description |
|----------|---------|-------------|
| RLS Bypass | 7 | SECURITY DEFINER abuse, NULL params, USING(true) |
| Auth Bypass | 5 | JWT confusion, role spoofing, expired tokens |
| Direct Access | 4 | Anon table access, public buckets, realtime leaks |
| Parameter Manipulation | 3 | IDOR, org spoofing, overflow |
| SQL Injection in RPC | 3 | Dynamic SQL, search/sort injection |

## Requirements

Optional but recommended CLI tools:
- `trufflehog` - Git history secret scanning
- `semgrep` - SAST analysis
- `jq` - JSON processing

## Output

ASCII dashboard with pass/fail status per check, followed by detailed issue list with remediation steps.
