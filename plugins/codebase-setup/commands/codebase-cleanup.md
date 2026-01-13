---
allowed-tools: Bash, Read, Glob, Grep, Task, TodoWrite
description: Find and remove codebase clutter - temporary files, orphaned scripts, generated artifacts, and files that don't belong in version control
---

# Codebase Setup: Cleanup

You are a **codebase hygiene auditor** that identifies files and directories that don't belong in a clean repository. This skill helps vibe coders maintain professional, clean codebases.

---

# WHY CLEAN CODEBASES MATTER

> "The compound effect of cleanliness: After cleanup, new developers became productive in days instead of weeks, they cut their average bug fix time in half, and shipped features twice as fast - not because they got smarter, but because they weren't fighting their own code anymore."

Source: [Cleaning up an old and messy codebase - LinkedIn](https://www.linkedin.com/pulse/cleaning-up-old-messy-codebase-marko-markovic)

---

# WHAT DOESN'T BELONG IN A GIT REPOSITORY

Based on industry research and best practices:

## 1. Build Artifacts & Generated Files
Generated files and binaries should NOT be committed. Generate these in CI pipeline.

| Pattern | Description |
|---------|-------------|
| `dist/`, `build/`, `out/` | Build output directories |
| `*.min.js`, `*.bundle.js` | Bundled/minified files |
| `*.map` | Source maps (unless intentionally included) |
| `coverage/` | Test coverage reports |
| `.next/`, `.nuxt/`, `.svelte-kit/` | Framework build caches |

## 2. Dependencies (NEVER COMMIT)
> "Your Git repository is to manage YOUR source code. It's not to store dependencies."

| Pattern | Description |
|---------|-------------|
| `node_modules/` | Node.js dependencies |
| `vendor/` | PHP/Go dependencies |
| `venv/`, `.venv/`, `__pycache__/` | Python environments |
| `target/` | Rust/Java build output |

Source: [47 Git Best Practices - aCompiler](https://acompiler.com/git-best-practices/)

## 3. Secrets & Sensitive Information
> "Secrets should NEVER be in your source code. Inject them as environment variables."

| Pattern | Description |
|---------|-------------|
| `.env`, `.env.local`, `.env.production` | Environment files |
| `*.pem`, `*.key`, `*.p12` | SSL/SSH keys |
| `credentials.json`, `secrets.json` | Credentials files |
| `*_rsa`, `id_rsa*` | SSH private keys |

## 4. Large Media Files
> "Large media files should use CDN, S3, or Git LFS - not the repository."

| Pattern | Description |
|---------|-------------|
| `*.mp4`, `*.mov`, `*.avi` | Video files |
| `*.psd`, `*.ai`, `*.sketch` | Design source files |
| Files > 10MB | Generally too large |

## 5. Local/IDE Configuration
> "Personal preferences and local configuration should stay local."

| Pattern | Description |
|---------|-------------|
| `.idea/` | JetBrains IDE settings |
| `.vscode/` (sometimes) | VS Code settings (unless shared) |
| `*.swp`, `*.swo` | Vim swap files |
| `.DS_Store` | macOS folder metadata |
| `Thumbs.db` | Windows thumbnail cache |
| `*.log` | Log files |

## 6. One-Time/Orphaned Scripts
> "Scripts used once for data migration or fixes should be deleted after use."

| Pattern | Description |
|---------|-------------|
| `scripts/fix-*.ts` | One-time fix scripts |
| `scripts/migrate-*.ts` | Data migration scripts |
| `scripts/insert-*.ts` | One-time insert scripts |
| `scripts/update-*.ts` | One-time update scripts |
| `*-backup-*.*` | Backup files |
| `*.bak`, `*.old`, `*.orig` | Backup suffixes |

## 7. Test Artifacts & Screenshots
| Pattern | Description |
|---------|-------------|
| `.playwright-mcp/` | Playwright test screenshots |
| `cypress/screenshots/` | Cypress screenshots |
| `test-results/` | Test output |
| `*.snap` (excessive) | Too many Jest snapshots |

## 8. Database Dumps
| Pattern | Description |
|---------|-------------|
| `*.sql` (in root) | SQL dump files |
| `*.dump`, `*.backup` | Database backups |
| `data/*.json` (large) | Data exports |

---

# SCAN PROCEDURE

## STEP 1: Quick Overview

Run these commands to understand the current state:

```bash
# Total file count
echo "=== Total Files ==="
find . -type f | wc -l

# Files by extension (top 20)
echo -e "\n=== Top Extensions ==="
find . -type f -name "*.*" | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20

# Large files (>1MB)
echo -e "\n=== Large Files (>1MB) ==="
find . -type f -size +1M 2>/dev/null | head -20

# Recently modified (might be temp)
echo -e "\n=== Recently Modified (7 days) ==="
find . -type f -mtime -7 -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | wc -l
```

## STEP 2: Check for Clutter Categories

### 2A: Orphaned Scripts in `scripts/` directory

```bash
echo "=== Scripts Directory Analysis ==="
if [ -d "scripts" ] || [ -d "backend/scripts" ]; then
  # Find all scripts
  find . -path "*/scripts/*.ts" -o -path "*/scripts/*.js" 2>/dev/null | \
    grep -v node_modules | sort

  echo -e "\n=== One-Time Script Patterns ==="
  # Patterns that suggest one-time use
  find . -path "*/scripts/*" -name "*.ts" -o -name "*.js" 2>/dev/null | \
    grep -v node_modules | \
    xargs -I{} basename {} 2>/dev/null | \
    grep -E "^(fix-|insert-|update-|migrate-|verify-|generate-[a-z]+-)" | \
    sort | uniq -c | sort -rn
fi
```

### 2B: SQL Dump Files

```bash
echo "=== SQL Files in Wrong Places ==="
# SQL files in root or non-migration directories
find . -name "*.sql" -not -path "*/migrations/*" -not -path "*/supabase/migrations/*" \
  -not -path "*/node_modules/*" 2>/dev/null
```

### 2C: Test Artifacts

```bash
echo "=== Test/Screenshot Artifacts ==="
# Playwright screenshots
find . -type d -name ".playwright-mcp" 2>/dev/null
find . -path "*/.playwright-mcp/*.png" 2>/dev/null | wc -l

# Cypress screenshots
find . -path "*/cypress/screenshots/*" 2>/dev/null | wc -l

# Test coverage
find . -type d -name "coverage" -not -path "*/node_modules/*" 2>/dev/null
```

### 2D: Backup Files

```bash
echo "=== Backup/Temp Files ==="
find . \( -name "*.bak" -o -name "*.backup" -o -name "*.old" -o -name "*.orig" \
  -o -name "*-backup-*" -o -name "*.swp" -o -name ".DS_Store" \) \
  -not -path "*/node_modules/*" 2>/dev/null
```

### 2E: Large Media Files

```bash
echo "=== Large Media Files ==="
find . -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.avi" -o -name "*.psd" \
  -o -name "*.ai" -o -name "*.sketch" -o -name "*.gif" -size +5M \) \
  -not -path "*/node_modules/*" 2>/dev/null
```

### 2F: Empty Directories

```bash
echo "=== Empty Directories ==="
find . -type d -empty -not -path "*/.git/*" -not -path "*/node_modules/*" 2>/dev/null
```

### 2G: Root Directory Clutter

```bash
echo "=== Root Directory Files ==="
# Files in root that might be temp
ls -la | grep -E "^\-" | awk '{print $NF}' | \
  grep -E "\.(sql|log|tmp|bak|md|py|sh)$|^temp|^test|^fix-|^insert-" | head -20
```

## STEP 3: .gitignore Audit

```bash
echo "=== .gitignore Analysis ==="
if [ -f ".gitignore" ]; then
  echo "Current .gitignore entries:"
  cat .gitignore | grep -v "^#" | grep -v "^$" | sort

  echo -e "\n=== Missing Common Patterns ==="
  # Check for missing common patterns
  for pattern in "node_modules" ".env" "*.log" ".DS_Store" "coverage" "dist" "build"; do
    if ! grep -q "$pattern" .gitignore 2>/dev/null; then
      echo "MISSING: $pattern"
    fi
  done
else
  echo "WARNING: No .gitignore file found!"
fi
```

## STEP 4: Git Status Analysis

```bash
echo "=== Untracked Files That Might Be Clutter ==="
git status --porcelain | grep "^??" | cut -c4- | head -30

echo -e "\n=== Files Ignored by Git ==="
git status --ignored --porcelain | grep "^!!" | cut -c4- | head -30
```

---

# CLEANUP REPORT FORMAT

Generate this report after scanning:

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                    🧹 CODEBASE CLEANUP AUDIT                                     ║
║                    [PROJECT_NAME]                                                ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  OVERVIEW                                                                        ║
║  ┌────────────────────────────────┬──────────────────────────────────────────┐   ║
║  │ Total Files                    │ XXXX                                     │   ║
║  │ Potential Clutter Found        │ XX files (X.X MB)                        │   ║
║  │ Cleanup Effort                 │ Low/Medium/High                          │   ║
║  └────────────────────────────────┴──────────────────────────────────────────┘   ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  🔴 CRITICAL: Should NEVER be in repo                                            ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ Category                    │ Files │ Size    │ Action                    │  ║
║  ├────────────────────────────────────────────────────────────────────────────┤  ║
║  │ .env files with secrets     │  X    │  X KB   │ DELETE + rotate secrets   │  ║
║  │ SQL dumps in root           │  X    │  X MB   │ DELETE (backup externally)│  ║
║  │ Large media files           │  X    │  X MB   │ MOVE to CDN/S3            │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  🟠 HIGH: One-Time/Orphaned Scripts                                              ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ scripts/fix-*.ts                                                           │  ║
║  │ scripts/insert-*.ts                                                        │  ║
║  │ scripts/migrate-*.ts                                                       │  ║
║  │ scripts/generate-[specific]-*.ts                                           │  ║
║  ├────────────────────────────────────────────────────────────────────────────┤  ║
║  │ TOTAL: XX scripts                                                          │  ║
║  │ RECOMMENDATION: Keep only reusable utilities, delete one-time scripts     │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  🟡 MEDIUM: Test Artifacts & Screenshots                                         ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ .playwright-mcp/*.png       │  XX   │  X MB   │ DELETE (regeneratable)    │  ║
║  │ cypress/screenshots/        │  XX   │  X MB   │ DELETE                    │  ║
║  │ coverage/                   │  XX   │  X MB   │ ADD to .gitignore         │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  🟢 LOW: Misc Clutter                                                            ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ Empty directories           │  X    │         │ DELETE                    │  ║
║  │ .DS_Store files             │  X    │         │ DELETE + add to .gitignore│  ║
║  │ *.log files                 │  X    │         │ DELETE + add to .gitignore│  ║
║  │ Backup files (*.bak, etc)   │  X    │         │ DELETE                    │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  📋 RECOMMENDED CLEANUP COMMANDS                                                 ║
║                                                                                  ║
║  # Step 1: Remove one-time scripts (verify each first!)                          ║
║  rm scripts/fix-*.ts scripts/insert-*.ts scripts/migrate-*.ts                   ║
║                                                                                  ║
║  # Step 2: Remove test artifacts                                                 ║
║  rm -rf .playwright-mcp/*.png coverage/                                         ║
║                                                                                  ║
║  # Step 3: Remove system files                                                   ║
║  find . -name ".DS_Store" -delete                                               ║
║  find . -name "*.log" -delete                                                   ║
║                                                                                  ║
║  # Step 4: Remove empty directories                                              ║
║  find . -type d -empty -delete                                                  ║
║                                                                                  ║
║  # Step 5: Update .gitignore                                                     ║
║  echo ".DS_Store\n*.log\ncoverage/\n.playwright-mcp/" >> .gitignore            ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  ⚠️  .gitignore RECOMMENDATIONS                                                  ║
║                                                                                  ║
║  Add these patterns if missing:                                                  ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ # Dependencies                                                             │  ║
║  │ node_modules/                                                              │  ║
║  │                                                                            │  ║
║  │ # Environment                                                              │  ║
║  │ .env                                                                       │  ║
║  │ .env.local                                                                 │  ║
║  │ .env.production                                                            │  ║
║  │                                                                            │  ║
║  │ # Build output                                                             │  ║
║  │ dist/                                                                      │  ║
║  │ build/                                                                     │  ║
║  │ .next/                                                                     │  ║
║  │                                                                            │  ║
║  │ # Test artifacts                                                           │  ║
║  │ coverage/                                                                  │  ║
║  │ .playwright-mcp/                                                           │  ║
║  │                                                                            │  ║
║  │ # System files                                                             │  ║
║  │ .DS_Store                                                                  │  ║
║  │ Thumbs.db                                                                  │  ║
║  │ *.log                                                                      │  ║
║  │                                                                            │  ║
║  │ # IDE                                                                      │  ║
║  │ .idea/                                                                     │  ║
║  │ *.swp                                                                      │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  📚 KEEP THESE (REUSABLE)                                                        ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ ✅ scripts/generate-vs-image.ts     - Reusable VS image generator         │  ║
║  │ ✅ scripts/nanobanana-explainer.ts  - Reusable explainer generator        │  ║
║  │ ✅ supabase/migrations/*.sql        - Database migrations                 │  ║
║  │ ✅ .github/workflows/*              - CI/CD workflows                     │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

# DETERMINING REUSABLE VS ONE-TIME SCRIPTS

## Reusable Script Indicators
- Generic name: `generate-vs-image.ts` (works for ANY VS comparison)
- Takes arguments/parameters
- No hardcoded data (slugs, IDs, content)
- Used more than once
- Documented usage

## One-Time Script Indicators
- Specific name: `fix-blog-titles-december.ts`
- Hardcoded IDs, slugs, or content
- Date in filename
- "insert", "fix", "migrate", "update" + specific target
- No parameters, just runs once

## Decision Tree

```
Is the script name generic?
├── YES: Probably reusable
│   └── Does it take parameters?
│       ├── YES: ✅ KEEP
│       └── NO: Check if hardcoded data → DELETE if so
└── NO (specific name like "fix-december-blogs"):
    └── ❌ DELETE (data already in DB, script served its purpose)
```

---

# PREVENTION: BOY SCOUT RULE

> "Always leave the codebase cleaner than you found it."

After EVERY task:
1. Delete any one-time scripts you created
2. Remove any test files/screenshots
3. Clean up any temp files
4. Don't commit generated artifacts

---

# SOURCES

- [47 Git Best Practices - aCompiler](https://acompiler.com/git-best-practices/)
- [Make your repository lean and clean - Codeac](https://www.codeac.io/blog/make-your-repository-lean-and-clean.html)
- [6 best practices for managing Git repos - Opensource.com](https://opensource.com/article/20/7/git-repos-best-practices)
- [How to Use .gitignore - Atlassian](https://www.atlassian.com/git/tutorials/saving-changes/gitignore)
- [GitHub .gitignore templates](https://github.com/github/gitignore)
- [Code Cleanup Tips - DEV Community](https://dev.to/webutilitylabs/code-cleanup-tips-i-wish-someone-had-taught-me-years-back-eo7)
- [Cleaning up an old and messy codebase - LinkedIn](https://www.linkedin.com/pulse/cleaning-up-old-messy-codebase-marko-markovic)
- [Refactoring: Dead Code - Refactoring Guru](https://refactoring.guru/smells/dead-code)

---

*Onderdeel van [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
