---
allowed-tools: Bash, Read, Glob, Grep, Edit, Write, WebSearch, WebFetch, Task, TodoWrite
argument-hint: [quick|full|fix]
description: Complete security audit with 75+ checks - OWASP, Supabase, payments, IDOR, XSS, and more
---

# Security Audit - by Vibe Coding Academy

You are the **coordinator** of a security audit team. You intelligently scale the audit based on project size and delegate work to specialized agents.

---

# PHASE 0: PROJECT SIZE DETECTION (ALWAYS RUN FIRST)

**Before anything else, determine project size to decide audit strategy.**

```bash
echo "=== PROJECT SIZE ANALYSIS ==="

# Count files per directory (2 levels deep)
echo -e "\n=== DIRECTORY SIZES ==="
for dir in $(find . -maxdepth 2 -type d -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | sort); do
  count=$(find "$dir" -maxdepth 1 -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.sql" \) 2>/dev/null | wc -l | tr -d ' ')
  if [ "$count" -gt 0 ]; then
    echo "$count files: $dir"
  fi
done | sort -rn | head -30

# Total source files
echo -e "\n=== TOTALS ==="
total_ts=$(find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ')
total_sql=$(find . -type f -name "*.sql" -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ')
total_lines=$(find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')

echo "TypeScript/TSX files: $total_ts"
echo "SQL files: $total_sql"
echo "Total lines (approx): $total_lines"

# Detect project type
echo -e "\n=== PROJECT TYPE ==="
[ -d "backend" ] && echo "HAS: backend/"
[ -d "src" ] && echo "HAS: src/"
[ -d "supabase" ] && echo "HAS: supabase/"
[ -d "supabase/functions" ] && echo "HAS: supabase/functions/ (edge functions)"
[ -d "supabase/migrations" ] && migrations=$(ls supabase/migrations/*.sql 2>/dev/null | wc -l | tr -d ' ') && echo "HAS: $migrations migrations"
[ -f "package.json" ] && echo "HAS: package.json"
```

## Size Classification

| Size | Files | Lines | Strategy |
|------|-------|-------|----------|
| **SMALL** | <50 | <5,000 | Single coordinator, no sub-agents |
| **MEDIUM** | 50-200 | 5,000-20,000 | 3-4 domain agents |
| **LARGE** | 200-500 | 20,000-50,000 | 6-9 domain agents |
| **HUGE** | >500 | >50,000 | Directory-based splitting + domain agents |

**Decision tree:**
- IF total_ts + total_sql < 50 → SMALL project → coordinator handles all
- IF total_ts + total_sql < 200 → MEDIUM project → use 3-4 agents
- IF total_ts + total_sql < 500 → LARGE project → use 6-9 agents
- IF total_ts + total_sql >= 500 → HUGE project → split by directory first

---

# HUGE PROJECT STRATEGY (500+ files)

For projects with 500+ files (like vitaluxe-flow with 1800 files), use **directory-based splitting**:

## Step 1: Identify Major Directories

```bash
# Find top directories by file count
echo "=== MAJOR DIRECTORIES TO AUDIT ==="
for dir in src backend supabase/functions supabase/migrations; do
  if [ -d "$dir" ]; then
    count=$(find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.sql" \) 2>/dev/null | wc -l | tr -d ' ')
    echo "$count files: $dir"
  fi
done | sort -rn
```

## Step 2: Create Directory Agents

For HUGE projects, spawn **directory-specific agents** instead of domain agents:

```
┌─────────────────────────────────────────────────────────────────┐
│                    COORDINATOR (you)                            │
│  1. Detect project size                                         │
│  2. Identify major directories                                  │
│  3. Spawn directory-specific agents                             │
│  4. Spawn cross-cutting agents (secrets, dependencies)          │
│  5. Collect and merge results                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
     ┌────────────────────────┼────────────────────────┐
     ▼                        ▼                        ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Agent: src/  │    │ Agent:       │    │ Agent:       │
│ Frontend     │    │ backend/     │    │ supabase/    │
│ Security     │    │ API Security │    │ DB Security  │
└──────────────┘    └──────────────┘    └──────────────┘
     │                        │                        │
     ▼                        ▼                        ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Agent:       │    │ Agent:       │    │ Agent:       │
│ Secrets &    │    │ Dependencies │    │ Config &     │
│ .env         │    │ & CVEs       │    │ Headers      │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Step 3: Directory Agent Prompts

### Frontend Agent (src/)
```
Task subagent_type: "Explore"
prompt: |
  You are auditing ONLY the src/ directory for frontend security issues.

  SCOPE: src/ directory only (ignore backend/, supabase/)

  CHECK:
  1. XSS: dangerouslySetInnerHTML, innerHTML usage
  2. Exposed secrets: API keys, tokens in frontend code
  3. localStorage token storage (vs httpOnly cookies)
  4. Console.log with sensitive data
  5. Hardcoded credentials

  REPORT FORMAT:
  - Issue, File:line, Severity, Remediation
  - Summary counts
```

### Backend Agent (backend/)
```
Task subagent_type: "Explore"
prompt: |
  You are auditing ONLY the backend/ directory for API security.

  SCOPE: backend/ directory only

  CHECK:
  1. Authentication middleware on all routes
  2. IDOR vulnerabilities (ownership checks)
  3. Input validation on all endpoints
  4. Rate limiting configuration
  5. CORS settings
  6. SQL injection in raw queries
  7. Command injection

  REPORT FORMAT:
  - Per route: Path, Middleware, Validation, Ownership check
  - Summary: X/Y routes protected
```

### Supabase Agent (supabase/)
```
Task subagent_type: "Explore"
prompt: |
  You are auditing ONLY the supabase/ directory for database security.

  SCOPE: supabase/ directory only

  CHECK:
  1. RLS policies in migrations (look for USING (true) = bad)
  2. Function search_path settings
  3. Edge function authentication
  4. Overly permissive policies
  5. Missing RLS on sensitive tables

  DO NOT read all 500+ migrations. Sample:
  - Read the first 10 migrations
  - Read the last 10 migrations
  - Grep for "POLICY" and "RLS" patterns

  REPORT FORMAT:
  - RLS issues found
  - Function security issues
  - Summary
```

---

# STANDARD ARCHITECTURE (for reference)

## Standard Middleware Names

| Middleware | Purpose | Usage |
|------------|---------|-------|
| `authenticateToken` | Validates JWT, attaches `req.user` and `req.accessToken` | Required on ALL protected routes |
| `requireRole('admin')` | Requires minimum role level | After `authenticateToken` |
| `optionalAuth` | Auth optional, continues if missing | Public routes with auth features |
| `requireOrganization()` | Validates org membership | Multi-tenant routes |

**Database Helpers:**
| Helper | RLS | Usage |
|--------|-----|-------|
| `userDB(token)` | Respects | All user operations (pass `req.accessToken`) |
| `adminDB()` | Bypasses | Admin operations (verify ownership first!) |
| `systemDB()` | Bypasses | Webhooks, cron jobs |

---

# ARGUMENTS

- `/security-audit:run` or `/security-audit:run full` - Full audit with CLI tools + agents + internet research
- `/security-audit:run quick` - Pre-deploy checklist (5 minutes, critical checks only)
- `/security-audit:run fix` - Full audit + auto-fix CRITICAL/HIGH issues

**Argument received:** $ARGUMENTS

---

# PRE-DEPLOY CHECKLIST (when "quick")

If argument is "quick", run ONLY these critical checks (NO agents needed):

```bash
# 1. Secrets in git tracking
echo "=== SECRETS IN GIT ==="
git ls-files | grep -iE "\.env$|credentials|secret|\.pem$|\.key$" | grep -v "\.example" || echo "✅ PASS: No secrets in git"

# 2. NPM Audit Critical/High
echo "=== NPM AUDIT ==="
npm audit --json 2>/dev/null | jq '.metadata.vulnerabilities | {critical, high}' || npm audit 2>&1 | head -20

# 3. Service key in frontend (CRITICAL)
echo "=== SERVICE KEY EXPOSURE ==="
grep -rn "SUPABASE_SERVICE_KEY\|service_role" src/ --include="*.ts" --include="*.tsx" 2>/dev/null && echo "❌ CRITICAL: Service key in frontend!" || echo "✅ PASS: Service key protected"

# 4. Helmet enabled (if backend exists)
echo "=== SECURITY HEADERS ==="
find . -path ./node_modules -prune -o -name "index.ts" -print 2>/dev/null | xargs grep -l "helmet" 2>/dev/null && echo "✅ PASS: Helmet found" || echo "⚠️ WARNING: Helmet not found"

# 5. Rate limiting
echo "=== RATE LIMITING ==="
find . -path ./node_modules -prune -o -name "*.ts" -print 2>/dev/null | xargs grep -l "rateLimit" 2>/dev/null && echo "✅ PASS: Rate limiting found" || echo "⚠️ WARNING: Rate limiting not found"
```

If Supabase MCP is available, also run:
```
mcp__supabase__get_advisors type: "security"
```

Give compact report and stop.

---

# FULL AUDIT EXECUTION FLOW

## For SMALL projects (<50 files):

You (coordinator) handle everything directly:
1. Run CLI scans
2. Grep for common vulnerabilities
3. Check configurations
4. Generate report

## For MEDIUM projects (50-200 files):

Use 3-4 domain agents:
1. Agent A: Secrets & Frontend Security
2. Agent B: Backend/API Security
3. Agent C: Database/Supabase Security
4. Agent D: Dependencies & Config

## For LARGE projects (200-500 files):

Use 6-9 domain agents (full agent set below)

## For HUGE projects (500+ files):

Use directory-based splitting:
1. Identify major directories
2. Spawn directory-specific agents
3. Spawn cross-cutting agents (secrets, deps)
4. Merge results

---

# CLI SECURITY TOOLS (Coordinator runs these)

**Run BEFORE starting agents. Pass output to relevant agents.**

## TruffleHog - Git History Secrets Scan

```bash
# Check if TruffleHog is available
which trufflehog || echo "TruffleHog not installed - skip"

# Scan for verified (active) secrets
trufflehog filesystem . --only-verified --json 2>/dev/null | head -50 || echo "No verified secrets found"
```

## Git History .env Check

```bash
# Check if .env was ever in git history
git log --all --full-history -- "*.env*" --oneline 2>/dev/null | grep -v "example" | head -10 || echo "No .env in git history"

# Search for specific secret patterns in history
git grep -l "sk-ant-\|sbp_\|sk_live_\|PRIVATE_KEY" $(git rev-list --all 2>/dev/null | head -100) 2>/dev/null | head -10 || echo "No secrets in recent git history"
```

## NPM Audit with JSON Output

```bash
# Main directory
npm audit --json 2>/dev/null | jq '{total: .metadata.vulnerabilities.total, critical: .metadata.vulnerabilities.critical, high: .metadata.vulnerabilities.high, moderate: .metadata.vulnerabilities.moderate}' || npm audit 2>&1

# Backend if exists
[ -d "backend" ] && cd backend && npm audit --json 2>/dev/null | jq '{total: .metadata.vulnerabilities.total, critical: .metadata.vulnerabilities.critical, high: .metadata.vulnerabilities.high}' || echo "No backend directory"
```

---

# DOMAIN AGENTS (for MEDIUM/LARGE projects)

## AGENT A: Secrets & Vibe-Coding Issues

```
Task subagent_type: "Explore"
prompt: |
  You are a security auditor checking for SECRETS EXPOSURE and VIBE-CODING specific vulnerabilities.

  SECURITY_CONTEXT:
  [ADD TRUFFLEHOG RESULTS]

  CHECK VIBE-CODING ISSUES:

  1. EXPOSED SECRETS IN FRONTEND
     - Grep in src/ for: supabase.*key|anon.*key|api.*key|Bearer\s+[A-Za-z0-9]
     - CRITICAL: SUPABASE_SERVICE_KEY must NEVER be in src/

  2. UNLOCKED ADMIN ROUTES
     - Find all route files
     - Check EVERY route under /api/ (except webhooks)
     - Every admin route MUST have requireAdmin or requireAuth

  3. DEBUG ENDPOINTS
     - Grep for: /debug|/health-detailed|/internal/|/test/
     - Check if they are protected

  CHECK SECRETS MANAGEMENT:

  4. GIT SECRETS
     - Run: git ls-files | grep -iE "\.env$|credentials|secret|\.pem$|\.key$"

  5. GITIGNORE COMPLETENESS
     - Read .gitignore
     - Must contain: .env*, *.pem, *.key, credentials*

  6. HARDCODED SECRETS IN CODE
     - Grep for: password\s*=\s*['"][^'"]+['"]|api.?key\s*=\s*['"][^'"]+['"]
     - Grep for: sk_live|pk_live|sk-ant-|Bearer [A-Za-z0-9]{20,}
     - IGNORE references to process.env or import.meta.env

  OUTPUT FORMAT:
  Per issue: Location, Severity (CRITICAL/HIGH/MEDIUM/LOW), Description, Remediation
  SUMMARY: Count per severity level
```

## AGENT B: IDOR & Broken Access Control

```
Task subagent_type: "Explore"
prompt: |
  You are a security auditor checking for IDOR and Broken Access Control.

  CHECK:

  1. DIRECT OBJECT REFERENCES
     - Grep for: req.params.(id|userId|orderId|invoiceId|applicationId)
     - For EVERY route with :id parameter:
       * Is ownership checked? (user_id = req.user.id)

  2. SUPABASE CLIENT USAGE
     - SupabaseService.getInstance() OK in services
     - NOT OK in controllers - must be SupabaseUserClient

  3. ENUMERATION PROTECTION
     - Check if UUIDs are used (good) or integers (risk)

  OUTPUT FORMAT:
  Per route: Route path, File:line, Ownership check YES/NO, Severity
  SUMMARY: X/Y routes have ownership checks
```

## AGENT C: Payment Security

```
Task subagent_type: "Explore"
prompt: |
  You are a security auditor specialized in PAYMENT SECURITY.

  CHECK ALL 7 PRICE MANIPULATION VARIANTS:

  1. PRICE FROM REQUEST BODY
     - Grep for: req.body.(price|amount|total|cost)
     - CRITICAL: Price must come from database, NEVER from client

  2. QUANTITY TAMPERING
     - Check if negative values are blocked
     - Check minimum (>=1)

  3. CURRENCY CONFUSION
     - Check if currency is determined server-side

  4. INTEGER OVERFLOW
     - Check max value validation on prices

  5. PAYMENT WEBHOOK VERIFICATION
     - Payment status via API call (NOT webhook body)?
     - Fake payments blocked in production?
     - IP whitelist or signature verification?

  6. TEST CARDS IN PRODUCTION
     - Grep for: test|fake|sandbox in payment config

  7. COUPON/DISCOUNT ABUSE
     - If discount codes exist: check single-use + expiry

  OUTPUT FORMAT:
  Per check: Name, PASS/FAIL, Location, Severity, Details
```

## AGENT D: Injection Attacks

```
Task subagent_type: "Explore"
prompt: |
  You are a security auditor checking for INJECTION ATTACKS.

  CHECK:

  1. SQL INJECTION
     - Grep for: supabase.rpc|.raw(|.query(|.execute(
     - Check if user input is escaped

  2. COMMAND INJECTION
     - Grep for: exec(|spawn(|execSync|child_process
     - CRITICAL: User input must NEVER go to shell

  3. XSS (Cross-Site Scripting)
     - Grep in src/ for: dangerouslySetInnerHTML|innerHTML|document.write
     - For EACH location check: Admin only? User input? Sanitized?

  4. PATH TRAVERSAL
     - Grep for: path.join|fs.read|fs.write
     - Check if user input can contain ../

  OUTPUT FORMAT:
  Per issue: Type, File:line, Code snippet, Severity, Remediation
```

## AGENT E: API Security & Headers

```
Task subagent_type: "Explore"
prompt: |
  You are a security auditor checking for API SECURITY.

  CHECK:

  1. RATE LIMITING
     - Expected: ~100 req/15 min (general), ~10 req/hour (AI)
     - Are limiters applied to ALL public routes?

  2. CORS CONFIGURATION
     - Grep for: cors|origin|Access-Control
     - CRITICAL: No wildcard * with credentials

  3. SECURITY HEADERS (Helmet.js)
     - Grep for: helmet(
     - Check configuration

  4. REQUEST SIZE LIMITS
     - Grep for: express.json(|bodyParser
     - Check if there's a limit (e.g. 2mb)

  OUTPUT FORMAT:
  Per check: Name, PASS/FAIL, Config found, Severity
```

## AGENT F: Supabase Database Security

```
Task subagent_type: "Explore"
prompt: |
  You are a security auditor specialized in SUPABASE SECURITY.

  IF Supabase MCP is available:

  1. SECURITY ADVISORS
     mcp__supabase__get_advisors type: "security"
     Look for: rls_policy_always_true, function_search_path_mutable, rls_disabled_in_public

  2. RLS STATUS PER TABLE
     mcp__supabase__list_tables schemas: ["public"]
     Check for EACH table: rls_enabled: true

  3. STORAGE BUCKETS
     mcp__supabase__execute_sql query: "SELECT name, public FROM storage.buckets"

  IF NO Supabase MCP:
  - Check for RLS policies in migration files
  - Grep for: USING (true) or WITH CHECK (true)

  OUTPUT FORMAT:
  - Security advisors: X issues
  - RLS status per table
  - Storage risks
```

## AGENT F2: Database Bypass Attack Module (22 Attack Vectors)

**Comprehensive testing for ALL known database security bypass techniques.**

```
Task subagent_type: "Explore"
prompt: |
  You are a security auditor specialized in DATABASE BYPASS ATTACKS.
  Your job is to find ANY way to access data without proper authorization.

  TEST EACH ATTACK VECTOR BELOW. Report ALL findings.

  ═══════════════════════════════════════════════════════════════════
  CATEGORY 1: RLS BYPASS ATTACKS (7 vectors)
  ═══════════════════════════════════════════════════════════════════

  1.1 SECURITY DEFINER FUNCTION BYPASS
      RPC functions with SECURITY DEFINER run as postgres, bypassing RLS.
      ```sql
      SELECT proname FROM pg_proc
      WHERE pronamespace = 'public'::regnamespace AND prosecdef = true;
      ```
      For EACH function: test with anon key, should return 0 or error.

  1.2 ANON VS SERVICE_ROLE CONFUSION
      Both have auth.uid() = NULL and empty auth functions.
      Look for: NOT EXISTS (SELECT 1 FROM auth_admin_organizations())
      This pattern is TRUE for BOTH anon and service_role = VULNERABLE.

  1.3 NULL PARAMETER BYPASS
      RPC with p_org_id = NULL may return ALL rows if not handled:
      ```sql
      SELECT COUNT(*) FROM get_orders_results(p_org_id := NULL);
      ```
      Should return 0 or error, NOT all rows.

  1.4 POLICY WITH USING (true)
      ```sql
      SELECT schemaname, tablename, policyname, qual
      FROM pg_policies WHERE qual = 'true';
      ```
      Any result = CRITICAL (allows all access).

  1.5 MISSING RLS ON SENSITIVE TABLES
      ```sql
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN ('users', 'orders', 'payments', 'invoices')
        AND tablename NOT IN (
          SELECT tablename FROM pg_policies WHERE schemaname = 'public'
        );
      ```

  1.6 RLS DISABLED ON TABLE
      ```sql
      SELECT relname FROM pg_class
      WHERE relnamespace = 'public'::regnamespace
        AND relrowsecurity = false
        AND relkind = 'r';
      ```

  1.7 POLICY BYPASS VIA INHERITANCE
      Child tables may not inherit parent RLS policies.

  ═══════════════════════════════════════════════════════════════════
  CATEGORY 2: AUTHENTICATION BYPASS (5 vectors)
  ═══════════════════════════════════════════════════════════════════

  2.1 JWT ROLE CONFUSION
      Anon key sends role='anon', service_role sends role='service_role'.
      Check if functions distinguish:
      ```sql
      current_setting('request.jwt.claim.role', true)
      ```

  2.2 AUTH.UID() BYPASS IN RPC
      If function doesn't check auth.uid() and only checks org:
      User A with org access can see User B's data in same org.

  2.3 EXPIRED TOKEN ACCEPTANCE
      Test with expired JWT - should be rejected.

  2.4 ALGORITHM CONFUSION (none/HS256)
      If JWT accepts algorithm: none, anyone can forge tokens.

  2.5 WEAK JWT SECRET
      Check if using default or weak secret (dev environments).

  ═══════════════════════════════════════════════════════════════════
  CATEGORY 3: DIRECT TABLE ACCESS (4 vectors)
  ═══════════════════════════════════════════════════════════════════

  3.1 ANON SELECT ON TABLES
      ```bash
      curl "https://PROJECT.supabase.co/rest/v1/orders?select=*&limit=1" \
        -H "apikey: ANON_KEY"
      ```
      Should return error or empty, NOT data.

  3.2 STORAGE BUCKET PUBLIC ACCESS
      ```sql
      SELECT name, public FROM storage.buckets WHERE public = true;
      ```
      Public buckets with sensitive files = CRITICAL.

  3.3 REALTIME CHANNEL LEAKAGE
      Can anon subscribe to private channels?

  3.4 EDGE FUNCTION WITHOUT AUTH
      ```sql
      SELECT name FROM supabase_functions.functions
      WHERE verify_jwt = false;
      ```

  ═══════════════════════════════════════════════════════════════════
  CATEGORY 4: PARAMETER MANIPULATION (3 vectors)
  ═══════════════════════════════════════════════════════════════════

  4.1 IDOR VIA RPC PARAMETERS
      Can user A pass user B's ID to get their data?
      ```sql
      SELECT * FROM get_user_details(p_user_id := 'OTHER_USER_UUID');
      ```

  4.2 ORG_ID SPOOFING
      Can user pass org_id they don't belong to?
      Functions must verify: p_org_id IN (SELECT user_organizations())

  4.3 NEGATIVE/OVERFLOW VALUES
      Test with: -1, 0, MAX_INT, NULL for numeric parameters.

  ═══════════════════════════════════════════════════════════════════
  CATEGORY 5: SQL INJECTION IN RPC (3 vectors)
  ═══════════════════════════════════════════════════════════════════

  5.1 DYNAMIC SQL WITHOUT ESCAPING
      Look for: EXECUTE 'SELECT ' || user_input
      Must use: EXECUTE ... USING or format() with %L.

  5.2 SEARCH PARAMETER INJECTION
      If p_search goes into LIKE: '%' || p_search || '%'
      Can inject: %' OR '1'='1

  5.3 SORT/ORDER BY INJECTION
      If p_sort_by goes into ORDER BY dynamically:
      Can inject: id; DROP TABLE users; --

  ═══════════════════════════════════════════════════════════════════
  LIVE BYPASS TEST SUITE (run if Supabase MCP available)
  ═══════════════════════════════════════════════════════════════════

  For each sensitive table (orders, users, payments, invoices, etc.):

  Test 1: Direct anon access
  ```sql
  -- Should return 0 or error
  SELECT COUNT(*) FROM orders;  -- via anon key
  ```

  Test 2: RPC with NULL org
  ```sql
  SELECT COUNT(*) FROM get_orders_results(p_org_id := NULL);
  ```

  Test 3: RPC with random org
  ```sql
  SELECT COUNT(*) FROM get_orders_results(
    p_org_id := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  );
  ```

  Test 4: Check what data is returned
  If any test returns count > 0, capture sample (without PII):
  ```sql
  SELECT id, created_at FROM get_orders_results(p_org_id := NULL, p_limit := 1);
  ```

  ═══════════════════════════════════════════════════════════════════
  OUTPUT FORMAT
  ═══════════════════════════════════════════════════════════════════

  Per attack vector:
  | # | Attack | Tested | Result | Severity | Details |
  |---|--------|--------|--------|----------|---------|
  | 1.1 | SECURITY DEFINER bypass | ✅ | ❌ FAIL | CRITICAL | get_orders_results returns 696 rows |

  SUMMARY:
  - Vectors tested: X/22
  - Bypasses found: Y
  - CRITICAL: Z issues
```

### Coordinator Quick Bypass Tests

If Supabase MCP available, run these tests directly before spawning agent:

```sql
-- TEST 1: List all SECURITY DEFINER functions
SELECT proname, prosecdef FROM pg_proc
WHERE pronamespace = 'public'::regnamespace AND prosecdef = true
ORDER BY proname;

-- TEST 2: Check for USING (true) policies
SELECT tablename, policyname FROM pg_policies
WHERE schemaname = 'public' AND qual = 'true';

-- TEST 3: Tables without RLS
SELECT c.relname FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
  AND c.relrowsecurity = false
  AND c.relname NOT LIKE 'pg_%';

-- TEST 4: Public storage buckets
SELECT name FROM storage.buckets WHERE public = true;

-- TEST 5: Edge functions without JWT verification
SELECT name FROM supabase_functions.functions WHERE verify_jwt = false;
```

Report any findings immediately as they indicate potential bypass vectors.

## AGENT G: Dependencies & CVEs

```
Task subagent_type: "Explore"
prompt: |
  You are a security auditor checking for DEPENDENCY VULNERABILITIES.

  SECURITY_CONTEXT (npm audit results):
  [ADD NPM AUDIT RESULTS]

  CHECK:

  1. NPM AUDIT ANALYSIS
     - Categorize per severity

  2. OUTDATED PACKAGES
     - Run: npm outdated
     - Look for: helmet, express-rate-limit, @supabase/supabase-js

  3. PACKAGE HALLUCINATION
     - Check if all imports exist in package.json
     - AI sometimes generates non-existent packages

  OUTPUT FORMAT:
  - Frontend: X critical, Y high
  - Backend: X critical, Y high
  - Outdated packages with security impact
```

## AGENT H: Input Validation

```
Task subagent_type: "Explore"
prompt: |
  You are a security auditor checking for INPUT VALIDATION.

  CHECK:

  1. VALIDATOR IMPLEMENTATION
     - Find validators file
     - Check: email, price, string length, UUID

  2. VALIDATOR USAGE PER ROUTE
     - Make list of routes WITHOUT validation

  3. ERROR HANDLING
     - Stack traces NOT to client in production
     - Grep for: error.message|error.stack|JSON.stringify(error)

  OUTPUT FORMAT:
  Per route: Validation YES/NO, What's missing
  SUMMARY: X/Y routes have validation
```

## AGENT I: Authentication & Webhooks

```
Task subagent_type: "Explore"
prompt: |
  You are a security auditor checking for AUTHENTICATION and WEBHOOK SECURITY.

  CHECK AUTHENTICATION:

  1. TOKEN STORAGE
     - Grep in src/ for: localStorage.setItem.*token
     - Supabase = safe, custom = risk

  2. AUTH MIDDLEWARE COVERAGE
     - Make COMPLETE list of routes + middleware
     - Admin routes must have requireAdmin

  CHECK WEBHOOKS:

  3. PAYMENT WEBHOOKS
     - Rate limiting, IP whitelist/signature, API verification

  4. EMAIL WEBHOOKS
     - HMAC SHA256, Timestamp validation

  OUTPUT FORMAT:
  Per check: PASS/FAIL, Details, Severity
```

---

# REPORT FORMAT

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    🛡️  SECURITY AUDIT REPORT                               ║
║                     by Vibe Coding Academy                                 ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  PROJECT SIZE: [SMALL/MEDIUM/LARGE/HUGE]                                   ║
║  Files: XXX  |  Lines: XXX  |  Strategy: [single/domain/directory]         ║
║                                                                            ║
║  CLI SCANS                                                      [STATUS]   ║
║  ├─ TruffleHog Secrets ······················ ✅/❌                       ║
║  ├─ Git History Secrets ····················· ✅/❌                       ║
║  ├─ NPM Audit Frontend ······················ ✅/❌ (X crit, Y high)      ║
║  └─ NPM Audit Backend ······················· ✅/❌ (X crit, Y high)      ║
║                                                                            ║
║  SECRETS & VIBE-CODING                                          [STATUS]   ║
║  ├─ Exposed Secrets in Frontend ·············· ✅/❌                      ║
║  ├─ Unlocked Admin Routes ···················· ✅/❌ (X/Y routes)         ║
║  └─ Hardcoded Secrets ························ ✅/❌                      ║
║                                                                            ║
║  ACCESS CONTROL                                                 [STATUS]   ║
║  ├─ IDOR Vulnerabilities ···················· ✅/❌ (X routes)            ║
║  └─ Ownership Checks ························ ✅/❌ (X/Y)                 ║
║                                                                            ║
║  PAYMENT SECURITY                                               [STATUS]   ║
║  ├─ Price from Database ····················· ✅/❌                       ║
║  └─ Webhook Verification ···················· ✅/❌                       ║
║                                                                            ║
║  INJECTION ATTACKS                                              [STATUS]   ║
║  ├─ SQL Injection ··························· ✅/❌                       ║
║  ├─ XSS ····································· ✅/❌                       ║
║  └─ Command Injection ······················· ✅/❌                       ║
║                                                                            ║
║  API SECURITY                                                   [STATUS]   ║
║  ├─ Rate Limiting ··························· ✅/❌                       ║
║  ├─ CORS ···································· ✅/❌                       ║
║  └─ Security Headers ························ ✅/❌                       ║
║                                                                            ║
║  DATABASE SECURITY                                              [STATUS]   ║
║  ├─ RLS Enabled ····························· ✅/❌ (X/Y tables)          ║
║  ├─ Overly Permissive Policies ·············· ✅/❌                       ║
║  └─ RLS Bypass via RPC ······················ ✅/❌ (X/Y functions)       ║
║                                                                            ║
║  DEPENDENCIES                                                   [STATUS]   ║
║  ├─ Known CVEs ······························ ✅/❌                       ║
║  └─ Outdated Security Packages ·············· ✅/❌                       ║
║                                                                            ║
║  INPUT VALIDATION                                               [STATUS]   ║
║  ├─ Validators Used ························· ✅/❌ (X/Y routes)          ║
║  └─ Error Handling Safe ····················· ✅/❌                       ║
║                                                                            ║
║  AUTH & WEBHOOKS                                                [STATUS]   ║
║  ├─ Auth Middleware Coverage ················ ✅/❌                       ║
║  └─ Webhook Security ························ ✅/❌                       ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║  SUMMARY                                                                   ║
║  🔴 CRITICAL: X  |  🟠 HIGH: X  |  🟡 MEDIUM: X  |  🔵 LOW: X              ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

# SEVERITY CLASSIFICATION

- **CRITICAL:** Directly exploitable, data breach, RCE, exposed secrets, **RLS bypass**
- **HIGH:** Authentication bypass, payment manipulation, PII exposure, IDOR
- **MEDIUM:** Info leakage, missing rate limits, weak validation
- **LOW:** Best practice violations, performance issues

---

# SUPABASE RLS BYPASS REFERENCE

## The Problem

Supabase RPC functions with `SECURITY DEFINER` run as the database owner, bypassing Row Level Security.
This is **intentional** for backend operations (cron jobs, webhooks) using `service_role` key.
But it's a **CRITICAL vulnerability** if anonymous users can also bypass RLS.

## JWT Roles in Supabase

| Key Type | JWT Role | `auth.uid()` | `auth_admin_organizations()` |
|----------|----------|--------------|------------------------------|
| `anon` key | `anon` | NULL | Empty set |
| `service_role` key | `service_role` | NULL | Empty set |
| Authenticated user | `authenticated` | User UUID | User's orgs |

**The trap:** Both `anon` and `service_role` have `auth.uid() = NULL` and empty auth functions!

## Vulnerable Pattern

```sql
-- ❌ VULNERABLE: Cannot distinguish anon from service_role
AND (
  o.org_id IN (SELECT auth_admin_organizations())
  OR o.org_id IS NULL
  OR (NOT EXISTS (SELECT 1 FROM auth_admin_organizations())
      AND o.org_id = p_org_id)  -- If p_org_id = NULL, returns ALL rows!
)
```

## Secure Pattern

```sql
DECLARE
  v_jwt_role text;
  v_is_service_role boolean;
BEGIN
  -- Detect JWT role from PostgREST
  v_jwt_role := COALESCE(current_setting('request.jwt.claim.role', true), '');
  v_is_service_role := (v_jwt_role = 'service_role');

  -- SECURITY: Block anon users
  IF NOT v_is_service_role THEN
    IF NOT EXISTS (SELECT 1 FROM auth_admin_organizations()) THEN
      RAISE EXCEPTION 'Access denied: authentication required'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  -- Now safe: either service_role OR authenticated user with orgs
  RETURN QUERY
  SELECT * FROM sensitive_table
  WHERE v_is_service_role
     OR org_id IN (SELECT auth_admin_organizations());
END;
```

## Quick Detection Query

```sql
-- Find potentially vulnerable RPC functions
SELECT
  proname,
  CASE WHEN prosecdef THEN '⚠️ SECURITY DEFINER' ELSE '✅ INVOKER' END as security,
  CASE
    WHEN pg_get_functiondef(oid) LIKE '%request.jwt.claim.role%' THEN '✅ Has JWT check'
    WHEN pg_get_functiondef(oid) LIKE '%NOT EXISTS%auth_%' THEN '❌ VULNERABLE PATTERN'
    ELSE '⚠️ Manual review needed'
  END as auth_pattern
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND prosecdef = true
  AND proname LIKE 'get_%';
```

## Live Bypass Test

```sql
-- Test if anon can access data (should return 0 or error)
-- Run via Supabase Dashboard SQL Editor (simulates anon context)
SELECT COUNT(*) FROM get_orders_results(p_org_id := NULL, p_limit := 1);
SELECT COUNT(*) FROM get_users_results(p_org_id := NULL, p_limit := 1);
```

If count > 0, you have an **RLS BYPASS vulnerability**.

## Checklist for RPC Functions

| Check | Status |
|-------|--------|
| Function uses SECURITY DEFINER? | If yes, needs auth check |
| Has explicit JWT role detection? | `current_setting('request.jwt.claim.role', true)` |
| Blocks anon users? | `RAISE EXCEPTION` when no auth |
| Service role can access all? | For cron jobs, webhooks |
| Authenticated users scoped? | Only their org's data |
| Live anon test returns 0? | No data leakage |

---

# EXECUTION SUMMARY

1. **ALWAYS start with Phase 0** - detect project size
2. **Choose strategy based on size:**
   - SMALL: Coordinator handles all
   - MEDIUM: 3-4 domain agents
   - LARGE: 6-9 domain agents
   - HUGE: Directory-based + cross-cutting agents
3. **Run CLI scans first** (TruffleHog, npm audit)
4. **Spawn agents IN PARALLEL** (one message, multiple Task calls)
5. **Collect results and generate report**

---

*Onderdeel van [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
