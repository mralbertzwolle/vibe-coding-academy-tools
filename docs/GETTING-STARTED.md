# Getting Started

**New to coding? Coming from Lovable, Bolt, or v0?** This guide is for you.

---

## What is Claude Code?

Claude Code is a coding assistant that runs in your terminal (the black screen where developers type commands). It can read your code, suggest improvements, and run these audit plugins to find problems.

**You need Claude Code installed first.** If you don't have it yet:
1. Go to [claude.ai/download](https://claude.ai/download)
2. Download and install Claude Code for your computer
3. Open your terminal and type `claude` to start

---

## Installing the Plugins

Copy and paste this command into your terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/mralbertzwolle/vibe-coding-academy-tools/main/install.sh | bash
```

**What does this do?**
- Downloads 6 audit plugins to your computer
- Configures Claude Code to use them
- Takes about 10 seconds

After installation, **close and reopen Claude Code**.

---

## Your First Security Audit

### Step 1: Open your project

In your terminal, navigate to your project folder:

```bash
cd ~/path/to/your/project
```

**Don't know the path?**
- On Mac: Open Finder, drag your project folder into the terminal
- On Windows: Right-click your folder → "Copy as path"

### Step 2: Start Claude Code

```bash
claude
```

### Step 3: Run a security audit

Type this command in Claude Code:

```
/security-audit:run
```

Claude will now check your code for 75+ security issues and show you what to fix.

---

## Understanding the Results

After an audit, you'll see something like:

```
SECURITY AUDIT RESULTS
======================

CRITICAL (fix immediately):
- Hardcoded API key found in src/config.js:12

HIGH (fix before going live):
- No rate limiting on login endpoint
- Missing CSRF protection

MEDIUM (should fix):
- Console.log statements in production code

Score: 6/10
```

**What do the levels mean?**

| Level | What it means | When to fix |
|-------|--------------|-------------|
| CRITICAL | Hackers can easily exploit this | Right now |
| HIGH | Serious security risk | Before launch |
| MEDIUM | Could cause problems | When you have time |
| LOW | Best practice suggestions | Nice to have |

---

## Common Audits for Lovable Projects

If you built your app with Lovable, run these audits:

### 1. Security Check
```
/security-audit:run
```
Finds: hardcoded secrets, missing authentication, SQL injection risks

### 2. Supabase RLS Audit
```
/supabase-toolkit:rls-audit
```
Finds: database tables without Row Level Security (anyone could read your data!)

### 3. Performance Check
```
/performance-audit:run
```
Finds: slow database queries, large bundle sizes, missing optimizations

### 4. Accessibility Check
```
/accessibility-audit:run
```
Finds: missing alt texts, poor contrast, keyboard navigation issues

---

## Fixing Issues

After an audit, Claude will explain each issue and often suggest fixes. You can ask:

- "Fix the critical issues"
- "Explain what RLS means"
- "Show me how to add rate limiting"
- "Fix issue #3"

Claude will update your code directly.

---

## Migrating from Lovable

If you exported your code from Lovable and want to make it production-ready:

```
/codebase-setup:lovable-migrate
```

This command:
- Restructures your project folders
- Adds proper error handling
- Sets up environment variables correctly
- Creates a deployment checklist

---

## Getting Help

**Stuck?** Ask Claude:
- "What does this error mean?"
- "How do I run my project locally?"
- "Explain what Supabase RLS does"

**Still stuck?**
- [Vibe Coding Academy](https://vibecodingacademy.nl) - Dutch courses
- [GitHub Issues](https://github.com/mralbertzwolle/vibe-coding-academy-tools/issues) - Report bugs

---

## Glossary

| Term | Simple explanation |
|------|-------------------|
| **Terminal** | The black screen where you type commands |
| **Repository** | A folder with your code, tracked by Git |
| **API key** | A secret password for connecting to services |
| **RLS** | Row Level Security - controls who can see what data |
| **Environment variables** | Secret settings stored outside your code |
| **Bundle size** | How big your app is when downloaded |
| **WCAG** | Rules for making websites accessible to everyone |

---

*Built by [Vibe Coding Academy](https://vibecodingacademy.nl) - Making AI-built apps production-ready.*
