---
name: accessibility-audit
description: WCAG 2.1 accessibility auditing for web applications. Checks color contrast, ARIA usage, keyboard navigation, form labels, and screen reader compatibility.
---

# Accessibility Audit Skill

This skill analyzes web applications for WCAG 2.1 Level AA compliance and provides actionable fixes.

## Command

### `/accessibility-audit:run [quick|full]`
Run a WCAG 2.1 accessibility audit.

**Quick Mode (5 min):**
- Alt text for images
- Keyboard accessibility
- Form labels
- Color contrast
- ARIA usage

**Full Mode (15 min):**
- All quick checks +
- Heading structure
- Landmark regions
- Focus management
- Animation/motion
- Manual testing checklist

## What It Checks

### Perceivable (WCAG 1.x)
- Images without alt text
- Icons without labels
- Low color contrast
- Missing captions

### Operable (WCAG 2.x)
- Keyboard navigation
- Focus management
- Skip links
- Motion/animation

### Understandable (WCAG 3.x)
- Form labels
- Error messages
- Predictable behavior

### Robust (WCAG 4.x)
- Valid ARIA usage
- Semantic HTML
- Live regions

## When to Use

Use this skill when:
- Building new features
- Before production deployment
- After user complaints
- For legal compliance
- Improving SEO (overlaps with a11y)

## Impact

Accessibility affects:
- 15-20% of users have disabilities
- SEO rankings
- Legal compliance (ADA, EAA)
- Overall UX quality

---

*Part of [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
