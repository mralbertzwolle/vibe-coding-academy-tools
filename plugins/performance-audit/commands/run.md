---
allowed-tools: Bash, Read, Glob, Grep, Task, TodoWrite, AskUserQuestion
argument-hint: [quick|full]
description: Run a complete performance audit (quick or full)
---

# Performance Audit

You are a **performance engineer** analyzing web applications for bottlenecks and optimization opportunities. This command performs comprehensive checks on bundle size, rendering, database queries, and network patterns.

## AUDIT MODES

```
/performance-audit:run quick   → 5-minute checks, no build required
/performance-audit:run full    → Complete analysis, may require build
/performance-audit:run         → Asks which mode
```

## AUDIT CATEGORIES

```
┌─────────────────────────────────────────────────────────────────┐
│                     PERFORMANCE AUDIT SCOPE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. BUNDLE SIZE                                                  │
│     ├─ Total bundle size                                         │
│     ├─ Code splitting analysis                                   │
│     ├─ Tree shaking effectiveness                                │
│     ├─ Duplicate dependencies                                    │
│     └─ Large dependencies                                        │
│                                                                  │
│  2. REACT PERFORMANCE                                            │
│     ├─ Unnecessary re-renders                                    │
│     ├─ Missing memoization                                       │
│     ├─ Large component trees                                     │
│     ├─ Context overuse                                           │
│     └─ useEffect dependencies                                    │
│                                                                  │
│  3. DATABASE QUERIES                                             │
│     ├─ N+1 query patterns                                        │
│     ├─ Missing indexes                                           │
│     ├─ Large result sets                                         │
│     ├─ Sequential queries (should be parallel)                   │
│     └─ Unnecessary data fetching                                 │
│                                                                  │
│  4. NETWORK                                                      │
│     ├─ Request waterfall                                         │
│     ├─ Parallel request opportunities                            │
│     ├─ Caching strategy                                          │
│     ├─ Payload sizes                                             │
│     └─ API response times                                        │
│                                                                  │
│  5. ASSETS                                                       │
│     ├─ Image optimization                                        │
│     ├─ Font loading                                              │
│     ├─ CSS optimization                                          │
│     └─ Static asset caching                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

# QUICK MODE

## Check 1: Package Analysis

```bash
# Check bundle dependencies
cat package.json | grep -E '"dependencies"|"devDependencies"' -A 100 | head -50

# Find large dependencies
npm ls --depth=0 2>/dev/null | head -30

# Check for duplicate packages (if npm-dedupe available)
npm dedupe --dry-run 2>/dev/null | head -20
```

### Known Heavy Packages

Flag if found:
- `moment` (312KB) → Use `date-fns` (25KB) or `dayjs` (6KB)
- `lodash` (72KB) → Use `lodash-es` or specific imports
- `@mui/material` full import → Use tree shaking
- `chart.js` full bundle → Use specific modules
- `aws-sdk` v2 → Use `@aws-sdk/client-*` v3

## Check 2: React Performance Patterns

```bash
# Find components without memo
grep -rn "export function\|export const" src/components --include="*.tsx" | \
  grep -v "memo\|useMemo\|useCallback" | head -20

# Find large useEffect dependencies
grep -rn "useEffect" src/ --include="*.tsx" -A 3 | \
  grep -E "\[.*,.*,.*,.*\]" | head -10

# Find context providers at root level
grep -rn "Provider" src/App.tsx src/main.tsx 2>/dev/null | head -10

# Check for inline object/array creation in JSX
grep -rn "={{" src/ --include="*.tsx" | head -15
```

### Anti-Patterns to Flag

```typescript
// ❌ Inline object creation (new reference every render)
<Component style={{ color: 'red' }} />
<Component data={{ items: [] }} />

// ❌ Inline function (new reference every render)
<Component onClick={() => handleClick(id)} />

// ❌ Missing dependencies
useEffect(() => {
  fetchData(userId);
}, []); // userId should be in deps

// ❌ Unnecessary state
const [items, setItems] = useState(props.items); // Just use props!

// ❌ Large context with frequent updates
<AppContext.Provider value={{ user, theme, cart, notifications, ... }}>
```

## Check 3: Database Query Patterns

```bash
# Find potential N+1 queries (loop with await)
grep -rn "for.*await\|\.forEach.*await\|\.map.*await" src/ --include="*.ts" | head -10

# Find sequential queries that could be parallel
grep -rn "await.*await" src/ --include="*.ts" -B 2 -A 2 | head -20

# Find queries without pagination
grep -rn "\.select\(\)" src/ --include="*.ts" | grep -v "limit\|range" | head -10

# Find SELECT * patterns
grep -rn "select\('\*'\)" src/ --include="*.ts" | head -10
```

### Query Anti-Patterns

```typescript
// ❌ N+1 Query
for (const order of orders) {
  const customer = await getCustomer(order.customerId); // N queries!
}

// ✅ Single query with join
const ordersWithCustomers = await getOrdersWithCustomers();

// ❌ Sequential when could be parallel
const users = await getUsers();
const orders = await getOrders();
const stats = await getStats();

// ✅ Parallel
const [users, orders, stats] = await Promise.all([
  getUsers(),
  getOrders(),
  getStats()
]);

// ❌ Fetching all data
const allOrders = await supabase.from('orders').select('*');

// ✅ Paginated with specific columns
const orders = await supabase
  .from('orders')
  .select('id, status, total, created_at')
  .range(0, 19);
```

## Check 4: Image Assets

```bash
# Find unoptimized images (large files)
find public src -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) \
  -size +100k 2>/dev/null | head -10

# Find images without lazy loading
grep -rn "<img" src/ --include="*.tsx" | grep -v "loading=" | head -10

# Find background images in CSS (should be optimized)
grep -rn "background-image\|background:" src/ --include="*.css" --include="*.scss" | head -10
```

## Check 5: Import Analysis

```bash
# Find barrel imports (import everything from index)
grep -rn "from '\.\./\.\./\.\./\|from '@/'" src/ --include="*.ts" --include="*.tsx" | \
  grep -v "from '@/" | head -20

# Find wildcard imports
grep -rn "import \*" src/ --include="*.ts" --include="*.tsx" | head -10

# Find dynamic imports (good for code splitting)
grep -rn "import(" src/ --include="*.tsx" | head -10
```

---

# FULL MODE (Additional Checks)

## Check 6: Build Analysis

```bash
# Run production build and analyze
npm run build 2>&1 | tail -30

# Check bundle size (Vite)
ls -la dist/assets/*.js 2>/dev/null | sort -k5 -n

# Check for source maps in production (should not be shipped)
find dist -name "*.map" 2>/dev/null
```

## Check 7: Code Splitting Opportunities

```bash
# Find route-based components (should be lazy loaded)
grep -rn "import.*Page\|import.*View\|import.*Screen" src/ --include="*.tsx" | \
  grep -v "lazy\|Suspense" | head -10

# Find heavy components that could be lazy loaded
find src -name "*.tsx" -exec wc -l {} \; | sort -n -r | head -10
```

### Lazy Loading Pattern

```typescript
// ❌ Static import (included in main bundle)
import { Dashboard } from './pages/Dashboard';

// ✅ Lazy import (separate chunk)
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Usage with Suspense
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

## Check 8: API Response Analysis

```bash
# Find large response objects
grep -rn "\.json()" src/ --include="*.ts" -B 5 | head -30

# Find endpoints without caching
grep -rn "fetch\|axios\|supabase" src/ --include="*.ts" | \
  grep -v "cache\|stale" | head -20
```

---

# RAPPORT

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    ⚡ PERFORMANCE AUDIT REPORT                             ║
║                    [PROJECT_NAME]                                          ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  SUMMARY                                                                   ║
║  ┌────────────────────────┬────────┬────────┐                              ║
║  │ Category               │ Score  │ Issues │                              ║
║  ├────────────────────────┼────────┼────────┤                              ║
║  │ Bundle Size            │  X/100 │   XX   │                              ║
║  │ React Performance      │  X/100 │   XX   │                              ║
║  │ Database Queries       │  X/100 │   XX   │                              ║
║  │ Network Patterns       │  X/100 │   XX   │                              ║
║  │ Assets                 │  X/100 │   XX   │                              ║
║  └────────────────────────┴────────┴────────┘                              ║
║                                                                            ║
║  OVERALL SCORE: XX/100                                                     ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  📦 BUNDLE SIZE                                                            ║
║                                                                            ║
║  Total Bundle: XXX KB (gzipped: XXX KB)                                    ║
║  Target: < 200 KB gzipped                                                  ║
║                                                                            ║
║  Heavy Dependencies:                                                       ║
║  ├─ moment.js (312 KB) → Replace with dayjs (6 KB)                         ║
║  ├─ lodash (72 KB) → Use lodash-es with tree shaking                       ║
║  └─ @mui/icons-material → Import specific icons only                       ║
║                                                                            ║
║  Code Splitting:                                                           ║
║  ├─ ❌ Dashboard not lazy loaded (150 KB in main bundle)                   ║
║  ├─ ❌ Admin routes not code split                                         ║
║  └─ ✅ Settings page lazy loaded                                           ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  ⚛️ REACT PERFORMANCE                                                      ║
║                                                                            ║
║  Re-render Issues:                                                         ║
║  ├─ src/components/OrderList.tsx:45                                        ║
║  │   ❌ Inline object in JSX: style={{ marginTop: 10 }}                    ║
║  │   → Extract to constant or useMemo                                      ║
║  │                                                                         ║
║  ├─ src/components/UserCard.tsx:23                                         ║
║  │   ❌ Inline function: onClick={() => handleClick(id)}                   ║
║  │   → Use useCallback or move handler outside                             ║
║  │                                                                         ║
║  └─ src/pages/Dashboard.tsx:78                                             ║
║      ⚠️ Large component (450 lines) - consider splitting                   ║
║                                                                            ║
║  Missing Memoization:                                                      ║
║  ├─ ExpensiveList.tsx → Wrap with React.memo()                             ║
║  └─ DataTable.tsx → Add useMemo for sorted data                            ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🗄️ DATABASE QUERIES                                                       ║
║                                                                            ║
║  N+1 Query Issues:                                                         ║
║  ├─ src/features/orders/service.ts:67                                      ║
║  │   ❌ Loop with individual customer queries                              ║
║  │   → Use JOIN or batch query                                             ║
║  │                                                                         ║
║  Sequential Queries (could be parallel):                                   ║
║  ├─ src/pages/Dashboard.tsx:23-28                                          ║
║  │   ⚠️ 3 sequential awaits → Use Promise.all()                            ║
║  │                                                                         ║
║  Missing Pagination:                                                       ║
║  └─ src/features/users/repository.ts:45                                    ║
║      ❌ SELECT * without LIMIT                                             ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🌐 NETWORK PATTERNS                                                       ║
║                                                                            ║
║  Request Waterfall:                                                        ║
║  ├─ Page load makes 5 sequential API calls                                 ║
║  │   → Combine into single RPC or use Promise.all()                        ║
║  │                                                                         ║
║  Caching:                                                                  ║
║  ├─ ❌ User data fetched on every page                                     ║
║  │   → Add React Query with staleTime                                      ║
║  └─ ✅ Products cached for 5 minutes                                       ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🖼️ ASSETS                                                                 ║
║                                                                            ║
║  Large Images (>100KB):                                                    ║
║  ├─ public/hero.png (1.2 MB) → Compress or use WebP                        ║
║  ├─ public/logo.png (450 KB) → Should be < 50 KB                           ║
║  └─ src/assets/background.jpg (890 KB) → Use responsive images             ║
║                                                                            ║
║  Missing Lazy Loading:                                                     ║
║  └─ X images without loading="lazy" attribute                              ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  📋 RECOMMENDATIONS (Priority Order)                                       ║
║                                                                            ║
║  1. 🔴 HIGH: Replace moment.js with dayjs                                  ║
║     Impact: -306 KB bundle size                                            ║
║     Effort: 2 hours                                                        ║
║                                                                            ║
║  2. 🔴 HIGH: Fix N+1 query in orders service                               ║
║     Impact: 10x faster page load                                           ║
║     Effort: 1 hour                                                         ║
║                                                                            ║
║  3. 🟠 MEDIUM: Add lazy loading to routes                                  ║
║     Impact: -150 KB initial bundle                                         ║
║     Effort: 30 minutes                                                     ║
║                                                                            ║
║  4. 🟠 MEDIUM: Compress hero image                                         ║
║     Impact: 1 second faster LCP                                            ║
║     Effort: 10 minutes                                                     ║
║                                                                            ║
║  5. 🟡 LOW: Add React.memo to list components                              ║
║     Impact: Smoother scrolling                                             ║
║     Effort: 30 minutes                                                     ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## QUICK WINS

### 1. Replace Heavy Dependencies

```bash
# Replace moment with dayjs
npm uninstall moment
npm install dayjs

# Update imports
# moment() → dayjs()
# moment().format() → dayjs().format()
```

### 2. Add Lazy Loading to Routes

```typescript
// Before
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

// After
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
```

### 3. Fix N+1 Queries

```typescript
// Before (N+1)
const orders = await getOrders();
for (const order of orders) {
  order.customer = await getCustomer(order.customerId);
}

// After (Single Query)
const orders = await supabase
  .from('orders')
  .select('*, customers(name, email)');
```

### 4. Parallelize API Calls

```typescript
// Before (Sequential)
const users = await getUsers();
const orders = await getOrders();
const stats = await getStats();

// After (Parallel)
const [users, orders, stats] = await Promise.all([
  getUsers(),
  getOrders(),
  getStats()
]);
```

---

*Onderdeel van [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
