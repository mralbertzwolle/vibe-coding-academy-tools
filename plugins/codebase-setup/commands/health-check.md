---
allowed-tools: Bash, Read, Glob, Grep, Task, TodoWrite, WebFetch
description: Meta-audit for codebase health - config consistency, documentation links, project structure, and duplicate code detection
---

# Codebase Setup: Health Check

You are a **codebase health auditor** that identifies inconsistencies, dead links, structural issues, and duplicate code. This command helps maintain professional, consistent codebases.

---

# WHY CODEBASE HEALTH MATTERS

> "Inconsistency is the silent killer of developer productivity. When every config file has a different structure, every developer wastes time figuring out 'how we do it here'."

Common health issues in vibe-coded projects:
- Config files with inconsistent schemas
- README links pointing to non-existent files
- License mismatches between files
- Duplicate code copy-pasted across components
- Structural inconsistencies (file vs folder)

---

# HEALTH CHECK CATEGORIES

## 1. Config Consistency
Ensures all configuration files follow the same patterns.

## 2. Documentation Health
Verifies all links work and docs are up-to-date.

## 3. Project Structure
Checks for structural consistency across the codebase.

## 4. Duplicate Code Detection
Finds copy-pasted code that should be abstracted.

---

# SCAN PROCEDURE

## STEP 1: Config Consistency Audit

### 1A: Package.json Consistency (for monorepos)

```bash
echo "=== Package.json Files ==="
find . -name "package.json" -not -path "*/node_modules/*" 2>/dev/null

echo -e "\n=== Checking Required Fields ==="
for pkg in $(find . -name "package.json" -not -path "*/node_modules/*" 2>/dev/null); do
  echo "--- $pkg ---"
  # Check for required fields
  for field in "name" "version" "license" "author"; do
    if grep -q "\"$field\"" "$pkg"; then
      echo "  ✓ $field"
    else
      echo "  ✗ MISSING: $field"
    fi
  done
done
```

### 1B: Plugin.json Consistency (for Claude plugins)

```bash
echo "=== Plugin.json Files ==="
find . -name "plugin.json" -not -path "*/node_modules/*" 2>/dev/null

echo -e "\n=== Schema Comparison ==="
# Get all plugin.json files and compare their keys
for plugin in $(find . -name "plugin.json" -not -path "*/node_modules/*" 2>/dev/null); do
  echo "--- $plugin ---"
  # Extract top-level keys
  grep -E '^\s*"[^"]+":' "$plugin" | sed 's/:.*//' | tr -d ' "' | sort
  echo ""
done
```

### 1C: License Consistency

```bash
echo "=== License Check ==="

# Check LICENSE file
if [ -f "LICENSE" ]; then
  echo "LICENSE file: $(head -5 LICENSE | grep -iE 'MIT|Apache|CC|GPL|BSD' | head -1)"
fi

# Check package.json license
if [ -f "package.json" ]; then
  echo "package.json: $(grep '"license"' package.json | head -1)"
fi

# Check all plugin.json licenses
echo -e "\nPlugin licenses:"
for plugin in $(find . -name "plugin.json" -not -path "*/node_modules/*" 2>/dev/null); do
  license=$(grep '"license"' "$plugin" | head -1 | sed 's/.*: *"//' | sed 's/".*//')
  echo "  $plugin: $license"
done

# Check README badge
if [ -f "README.md" ]; then
  echo -e "\nREADME badge:"
  grep -i "license" README.md | head -2
fi
```

### 1D: Author/Repository Consistency

```bash
echo "=== Author/Repository Check ==="

# Extract author from all config files
echo "Authors found:"
grep -rh '"author"' --include="*.json" . 2>/dev/null | \
  grep -v node_modules | sort | uniq -c | sort -rn

echo -e "\nRepositories found:"
grep -rh '"repository"\|"homepage"' --include="*.json" . 2>/dev/null | \
  grep -v node_modules | sort | uniq -c | sort -rn
```

---

## STEP 2: Documentation Health Audit

### 2A: Find All Markdown Links

```bash
echo "=== Markdown Files ==="
find . -name "*.md" -not -path "*/node_modules/*" 2>/dev/null

echo -e "\n=== Internal Links ==="
# Find all relative links in markdown files
grep -rhoE '\[([^]]+)\]\(([^)]+)\)' --include="*.md" . 2>/dev/null | \
  grep -v "http" | grep -v node_modules | sort | uniq
```

### 2B: Check for Dead Internal Links

```bash
echo "=== Dead Link Check ==="
# For each markdown file, extract relative links and verify they exist

find . -name "*.md" -not -path "*/node_modules/*" 2>/dev/null | while read mdfile; do
  dir=$(dirname "$mdfile")

  # Extract relative links (not http/https)
  grep -oE '\]\(([^)]+)\)' "$mdfile" 2>/dev/null | \
    sed 's/\](//' | sed 's/)//' | \
    grep -v "^http" | grep -v "^#" | \
    while read link; do
      # Remove anchor
      link_path=$(echo "$link" | sed 's/#.*//')

      if [ -n "$link_path" ]; then
        # Check if file exists relative to markdown file
        if [ ! -e "$dir/$link_path" ] && [ ! -e "$link_path" ]; then
          echo "DEAD LINK in $mdfile: $link"
        fi
      fi
    done
done
```

### 2C: Check External Links (Optional - use WebFetch)

For critical external links (in README), verify they're accessible:

```
Use WebFetch to check:
- Repository URL
- Author website
- Documentation links
```

### 2D: Documentation Completeness

```bash
echo "=== Documentation Completeness ==="

# Check for standard docs
for doc in "README.md" "CONTRIBUTING.md" "LICENSE" "CHANGELOG.md"; do
  if [ -f "$doc" ]; then
    echo "✓ $doc exists"
  else
    echo "✗ $doc MISSING"
  fi
done

# Check if all commands have documentation
echo -e "\n=== Command Documentation ==="
find . -path "*/commands/*.md" -not -path "*/node_modules/*" 2>/dev/null | while read cmd; do
  # Check if command has description in frontmatter
  if grep -q "^description:" "$cmd"; then
    echo "✓ $cmd has description"
  else
    echo "✗ $cmd MISSING description"
  fi
done
```

---

## STEP 3: Project Structure Audit

### 3A: Directory Naming Consistency

```bash
echo "=== Directory Naming Patterns ==="

# Check for inconsistent patterns
echo "Kebab-case directories:"
find . -type d -name "*-*" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | head -10

echo -e "\nCamelCase directories:"
find . -type d -regex '.*/[a-z]+[A-Z][a-zA-Z]*' -not -path "*/node_modules/*" 2>/dev/null | head -10

echo -e "\nsnake_case directories:"
find . -type d -name "*_*" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | head -10
```

### 3B: File vs Directory Inconsistencies

```bash
echo "=== Structure Inconsistencies ==="

# Example: Check if all plugins have same structure
echo "Plugin structures:"
for plugin_dir in $(find . -type d -name ".claude-plugin" 2>/dev/null); do
  parent=$(dirname "$plugin_dir")
  echo "--- $parent ---"
  ls -la "$plugin_dir" 2>/dev/null | grep -v "^total" | grep -v "^d"
done

# Check for config file vs directory patterns
echo -e "\n=== Config File Patterns ==="
echo "Files named .claude-plugin (should be directories):"
find . -type f -name ".claude-plugin" 2>/dev/null

echo "Directories named .claude-plugin:"
find . -type d -name ".claude-plugin" 2>/dev/null
```

### 3C: Missing Standard Directories

```bash
echo "=== Standard Directories Check ==="

# For typical project structures
for dir in "src" "tests" "docs"; do
  if [ -d "$dir" ]; then
    echo "✓ $dir/ exists"
  else
    echo "? $dir/ not found (may be intentional)"
  fi
done
```

---

## STEP 4: Duplicate Code Detection

### 4A: Find Exact Duplicate Files

```bash
echo "=== Exact Duplicate Files ==="

# Find files with identical content (by hash)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | \
  xargs md5 2>/dev/null | \
  sort -k4 | \
  awk '{
    if (prev == $4) {
      if (!printed_prev) { print prev_line; printed_prev = 1 }
      print $0
    } else {
      printed_prev = 0
    }
    prev = $4
    prev_line = $0
  }'
```

### 4B: Find Similar File Names (Potential Duplicates)

```bash
echo "=== Similar File Names ==="

# Files with same name in different directories
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) \
  -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | \
  xargs -I{} basename {} | \
  sort | uniq -d | while read dup; do
    echo "--- $dup ---"
    find . -name "$dup" -not -path "*/node_modules/*" 2>/dev/null
  done
```

### 4C: Find Duplicate Code Blocks (Function-Level)

```bash
echo "=== Potential Duplicate Functions ==="

# Find functions with same name defined multiple times
grep -rhn "^export function \|^export const .* = \|^function " \
  --include="*.ts" --include="*.tsx" --include="*.js" . 2>/dev/null | \
  grep -v node_modules | \
  sed 's/:.*//' | \
  sort | uniq -d
```

### 4D: Find Copy-Pasted Component Patterns

```bash
echo "=== Duplicate Component Patterns ==="

# Find React components with similar structure
# Look for components that might be copy-pasted

# Pattern 1: Multiple files with same imports
echo "Files with identical import blocks:"
find . -name "*.tsx" -not -path "*/node_modules/*" 2>/dev/null | while read f; do
  head -20 "$f" | grep "^import" | md5 | awk -v file="$f" '{print $4, file}'
done | sort | awk '{
  if (prev == $1) {
    if (!printed_prev) { print prev_line; printed_prev = 1 }
    print $0
  } else {
    printed_prev = 0
  }
  prev = $1
  prev_line = $0
}'
```

### 4E: Find Duplicate Hook Logic

```bash
echo "=== Duplicate Hooks ==="

# Find custom hooks that might be duplicated
find . -name "use*.ts" -o -name "use*.tsx" 2>/dev/null | \
  grep -v node_modules | \
  xargs -I{} basename {} | \
  sort | uniq -d | while read dup; do
    echo "--- $dup found in multiple locations ---"
    find . -name "$dup" -not -path "*/node_modules/*" 2>/dev/null
  done
```

### 4F: Detect Similar Code Blocks (Advanced)

Use Grep to find repeated patterns that suggest copy-paste:

```
Search for patterns like:
1. Same error handling blocks repeated
2. Same form validation logic
3. Same API call patterns
4. Same state management patterns
```

```bash
echo "=== Repeated Code Patterns ==="

# Find repeated try-catch patterns
echo "Identical try-catch blocks:"
grep -rhn "try {" --include="*.ts" --include="*.tsx" . 2>/dev/null | \
  grep -v node_modules | wc -l

# Find repeated console.log patterns (often indicates debugging left in)
echo -e "\nConsole.log statements (potential debug leftovers):"
grep -rn "console\\.log" --include="*.ts" --include="*.tsx" . 2>/dev/null | \
  grep -v node_modules | wc -l

# Find repeated TODO/FIXME comments
echo -e "\nTODO/FIXME comments:"
grep -rn "TODO\|FIXME\|HACK\|XXX" --include="*.ts" --include="*.tsx" . 2>/dev/null | \
  grep -v node_modules
```

---

## STEP 5: Generate Health Report

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                    🏥 CODEBASE HEALTH CHECK                                      ║
║                    [PROJECT_NAME]                                                ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  HEALTH SCORE: XX/100                                                            ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ ████████████████████████░░░░░░░░░░ 70%                                    │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  📋 CONFIG CONSISTENCY                                           Score: XX/25   ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ Issue                              │ Files    │ Status                    │  ║
║  ├────────────────────────────────────────────────────────────────────────────┤  ║
║  │ License mismatch                   │ 3        │ 🔴 INCONSISTENT           │  ║
║  │ Author format inconsistent         │ 2        │ 🟡 MINOR                  │  ║
║  │ Missing required fields            │ 0        │ 🟢 OK                     │  ║
║  │ Repository URL mismatch            │ 0        │ 🟢 OK                     │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  📚 DOCUMENTATION HEALTH                                         Score: XX/25   ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ Issue                              │ Count    │ Status                    │  ║
║  ├────────────────────────────────────────────────────────────────────────────┤  ║
║  │ Dead internal links                │ 2        │ 🔴 BROKEN                 │  ║
║  │ Missing standard docs              │ 1        │ 🟡 CHANGELOG.md           │  ║
║  │ Commands without description       │ 0        │ 🟢 OK                     │  ║
║  │ Outdated badges                    │ 0        │ 🟢 OK                     │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
║  Dead links found:                                                               ║
║  • README.md → docs/PLUGINS.md (file not found)                                  ║
║  • README.md → docs/NAMING.md (file not found)                                   ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  🏗️ PROJECT STRUCTURE                                            Score: XX/25   ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ Issue                              │ Count    │ Status                    │  ║
║  ├────────────────────────────────────────────────────────────────────────────┤  ║
║  │ File/directory inconsistency       │ 1        │ 🔴 .claude-plugin         │  ║
║  │ Naming convention violations       │ 0        │ 🟢 OK                     │  ║
║  │ Missing standard directories       │ 0        │ 🟢 OK                     │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  🔄 DUPLICATE CODE                                               Score: XX/25   ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ Issue                              │ Count    │ Severity                  │  ║
║  ├────────────────────────────────────────────────────────────────────────────┤  ║
║  │ Exact duplicate files              │ 2        │ 🔴 HIGH                   │  ║
║  │ Same filename in multiple dirs     │ 5        │ 🟡 REVIEW                 │  ║
║  │ Duplicate function definitions     │ 3        │ 🟡 REVIEW                 │  ║
║  │ Copy-pasted hooks                  │ 1        │ 🔴 HIGH                   │  ║
║  │ Console.log statements             │ 12       │ 🟡 CLEANUP                │  ║
║  │ TODO/FIXME comments                │ 8        │ 🟢 INFO                   │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
║  Duplicate files found:                                                          ║
║  • src/hooks/use-toast.ts = src/components/ui/use-toast.ts                       ║
║  • src/utils/format.ts = lib/format.ts                                           ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  🔧 RECOMMENDED FIXES                                                            ║
║                                                                                  ║
║  Priority 1 (Critical):                                                          ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ 1. Fix license inconsistency                                              │  ║
║  │    → Update all plugin.json to use "CC BY-NC 4.0"                         │  ║
║  │                                                                           │  ║
║  │ 2. Remove duplicate files                                                 │  ║
║  │    → Delete src/components/ui/use-toast.ts, keep src/hooks/use-toast.ts   │  ║
║  │    → Update imports across codebase                                       │  ║
║  │                                                                           │  ║
║  │ 3. Fix dead documentation links                                           │  ║
║  │    → Create docs/PLUGINS.md or remove link from README                    │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
║  Priority 2 (Recommended):                                                       ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ 1. Standardize author format in all config files                          │  ║
║  │ 2. Add missing CHANGELOG.md                                               │  ║
║  │ 3. Review and remove console.log statements                               │  ║
║  │ 4. Address TODO/FIXME comments or create issues                           │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  📊 DUPLICATE CODE DETAILS                                                       ║
║                                                                                  ║
║  These code blocks appear multiple times and should be abstracted:               ║
║                                                                                  ║
║  Pattern 1: Error handling                                                       ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ Found in: src/api/users.ts:45, src/api/products.ts:32, src/api/orders.ts:28│ ║
║  │                                                                           │  ║
║  │ try {                                                                     │  ║
║  │   const response = await fetch(url);                                      │  ║
║  │   if (!response.ok) throw new Error('Request failed');                    │  ║
║  │   return response.json();                                                 │  ║
║  │ } catch (error) {                                                         │  ║
║  │   console.error('API Error:', error);                                     │  ║
║  │   throw error;                                                            │  ║
║  │ }                                                                         │  ║
║  │                                                                           │  ║
║  │ SUGGESTION: Create a shared `fetchWithError()` utility                    │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
║  Pattern 2: Form validation                                                      ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ Found in: 5 form components                                               │  ║
║  │ SUGGESTION: Create a shared validation schema or hook                     │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

# COMMON DUPLICATE CODE PATTERNS TO DETECT

## 1. API/Fetch Wrappers
Look for repeated fetch/axios patterns:
```typescript
// Often duplicated:
const response = await fetch(url);
if (!response.ok) throw new Error(...);
return response.json();
```
**Solution:** Create a shared API client utility.

## 2. Form Handling
Look for repeated form patterns:
```typescript
// Often duplicated:
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const handleSubmit = async () => { ... }
```
**Solution:** Create a `useFormSubmit` hook.

## 3. Toast/Notification Logic
Look for repeated notification patterns:
```typescript
// Often duplicated:
toast({ title: "Success", description: "..." });
toast({ title: "Error", variant: "destructive" });
```
**Solution:** Create typed toast helpers.

## 4. Loading States
Look for repeated loading patterns:
```typescript
// Often duplicated:
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
```
**Solution:** Create a `<QueryState>` wrapper component.

## 5. Table/List Components
Look for nearly-identical table implementations with just different columns.
**Solution:** Create a generic `<DataTable>` component with column config.

---

# DRY PRINCIPLE GUIDELINES

> "Don't Repeat Yourself - Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."

## When to Abstract

| Duplications | Action |
|--------------|--------|
| 2x | Consider abstracting if complex |
| 3x | Definitely abstract |
| 4x+ | Critical - abstract immediately |

## When NOT to Abstract

- Simple one-liners (don't over-engineer)
- Accidental similarity (code looks same but serves different purposes)
- Test code (some duplication is acceptable for clarity)

---

# INTEGRATION WITH OTHER COMMANDS

After running health-check, consider:

- `/codebase-setup:naming-check` - Fix naming convention issues
- `/codebase-setup:codebase-cleanup` - Remove dead files
- `/security-audit:run` - Check for security issues in duplicate code

---

# SOURCES

- [DRY Principle - Wikipedia](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- [Refactoring: Code Smells - Refactoring Guru](https://refactoring.guru/refactoring/smells)
- [The Rule of Three - Martin Fowler](https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming))
- [Detecting Code Clones - IEEE](https://ieeexplore.ieee.org/document/738758)
- [Documentation Best Practices - Write the Docs](https://www.writethedocs.org/guide/)

---

*Onderdeel van [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
