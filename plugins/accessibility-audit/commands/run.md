---
allowed-tools: Bash, Read, Glob, Grep, Task, TodoWrite, AskUserQuestion
argument-hint: [quick|full]
description: Run a WCAG 2.1 accessibility audit (quick or full)
---

# Accessibility Audit

You are an **accessibility specialist** auditing web applications for WCAG 2.1 compliance. This command identifies barriers that prevent users with disabilities from using the application.

## WCAG 2.1 OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                     WCAG 2.1 PRINCIPLES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. PERCEIVABLE                                                  │
│     Users must be able to perceive information                   │
│     ├─ Text alternatives for images                              │
│     ├─ Captions for video/audio                                  │
│     ├─ Color contrast                                            │
│     └─ Resizable text                                            │
│                                                                  │
│  2. OPERABLE                                                     │
│     Users must be able to operate the interface                  │
│     ├─ Keyboard accessible                                       │
│     ├─ No seizure-inducing content                               │
│     ├─ Navigable                                                 │
│     └─ Input modalities                                          │
│                                                                  │
│  3. UNDERSTANDABLE                                               │
│     Users must understand content and interface                  │
│     ├─ Readable text                                             │
│     ├─ Predictable behavior                                      │
│     └─ Input assistance                                          │
│                                                                  │
│  4. ROBUST                                                       │
│     Content must work with assistive technologies                │
│     ├─ Valid HTML                                                │
│     ├─ ARIA usage                                                │
│     └─ Status messages                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## AUDIT MODES

```
/accessibility-audit:run quick   → Code-based checks (5 min)
/accessibility-audit:run full    → Complete analysis (15 min)
```

---

# CHECK CATEGORIES

## 1. TEXT ALTERNATIVES (WCAG 1.1)

### Check: Images without alt text

```bash
# Find img tags without alt attribute
grep -rn "<img" src/ --include="*.tsx" --include="*.jsx" | \
  grep -v "alt=" | head -20

# Find img with empty alt (may be intentional for decorative)
grep -rn 'alt=""' src/ --include="*.tsx" | head -10

# Find background images (may need text alternative)
grep -rn "backgroundImage\|background-image" src/ --include="*.tsx" --include="*.css" | head -10
```

### Issues to Flag

```tsx
// ❌ Missing alt
<img src="/logo.png" />

// ❌ Non-descriptive alt
<img src="/chart.png" alt="image" />
<img src="/user.jpg" alt="photo" />

// ✅ Descriptive alt
<img src="/chart.png" alt="Sales growth chart showing 25% increase in Q4" />

// ✅ Decorative image (empty alt is correct)
<img src="/decoration.svg" alt="" role="presentation" />
```

### Check: Icons without labels

```bash
# Find icon components without aria-label
grep -rn "Icon\|<svg" src/ --include="*.tsx" | \
  grep -v "aria-label\|aria-hidden\|title" | head -20
```

```tsx
// ❌ Icon button without label
<button><TrashIcon /></button>

// ✅ Icon button with label
<button aria-label="Delete item"><TrashIcon aria-hidden="true" /></button>
```

---

## 2. COLOR CONTRAST (WCAG 1.4.3)

### Check: Low contrast text colors

```bash
# Find text color definitions
grep -rn "color:\|text-" src/ --include="*.css" --include="*.tsx" | \
  grep -E "#[a-fA-F0-9]{3,6}|rgb|gray|grey" | head -30

# Find gray text (often low contrast)
grep -rn "text-gray-\|gray-[345]\|#[89a-f]{6}" src/ --include="*.tsx" | head -20
```

### Contrast Requirements

```
WCAG AA (Minimum):
├─ Normal text: 4.5:1 ratio
├─ Large text (18px+ or 14px+ bold): 3:1 ratio
└─ UI components: 3:1 ratio

WCAG AAA (Enhanced):
├─ Normal text: 7:1 ratio
└─ Large text: 4.5:1 ratio
```

### Common Offenders (Tailwind)

```tsx
// ❌ Low contrast grays
<p className="text-gray-400">Hard to read</p>  // ~3:1 on white
<p className="text-gray-300">Very hard</p>     // ~2:1 on white

// ✅ Accessible grays
<p className="text-gray-600">Readable</p>      // ~5.7:1 on white
<p className="text-gray-700">Better</p>        // ~8.6:1 on white
```

---

## 3. KEYBOARD NAVIGATION (WCAG 2.1)

### Check: Missing keyboard support

```bash
# Find click handlers without keyboard equivalent
grep -rn "onClick" src/ --include="*.tsx" | \
  grep -v "onKeyDown\|onKeyPress\|onKeyUp\|button\|Button\|<a " | head -20

# Find div/span with click (should be button)
grep -rn "<div.*onClick\|<span.*onClick" src/ --include="*.tsx" | head -15

# Check for tabIndex usage
grep -rn "tabIndex" src/ --include="*.tsx" | head -10
```

### Issues to Flag

```tsx
// ❌ Clickable div (not keyboard accessible)
<div onClick={handleClick}>Click me</div>

// ✅ Use button instead
<button onClick={handleClick}>Click me</button>

// ❌ Negative tabIndex hides from keyboard users
<button tabIndex={-1}>Hidden from keyboard</button>

// ✅ If must use div, add role and keyboard handler
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

### Check: Focus management

```bash
# Find focus-related code
grep -rn "focus\|Focus" src/ --include="*.tsx" | head -20

# Find modals/dialogs (should trap focus)
grep -rn "Modal\|Dialog\|Drawer" src/ --include="*.tsx" | head -10
```

---

## 4. FORM ACCESSIBILITY (WCAG 1.3.1, 3.3)

### Check: Labels for inputs

```bash
# Find inputs without labels
grep -rn "<input\|<select\|<textarea" src/ --include="*.tsx" | \
  grep -v "aria-label\|aria-labelledby\|id=.*label" | head -20

# Find labels without htmlFor
grep -rn "<label" src/ --include="*.tsx" | \
  grep -v "htmlFor\|for=" | head -10
```

### Issues to Flag

```tsx
// ❌ Input without label
<input type="email" placeholder="Email" />

// ❌ Placeholder is not a label
<input type="email" placeholder="Enter your email" />

// ✅ Proper label association
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ Or aria-label for icon-only inputs
<input type="search" aria-label="Search products" />
```

### Check: Error messages

```bash
# Find form error handling
grep -rn "error\|Error\|invalid\|Invalid" src/ --include="*.tsx" | \
  grep -v "aria-describedby\|aria-invalid\|role=\"alert\"" | head -15
```

```tsx
// ❌ Error not associated with input
<input type="email" />
<span className="text-red-500">Invalid email</span>

// ✅ Error properly associated
<input
  type="email"
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
<span id="email-error" role="alert" className="text-red-500">
  Invalid email format
</span>
```

---

## 5. ARIA USAGE (WCAG 4.1.2)

### Check: ARIA attributes

```bash
# Find aria-* usage
grep -rn "aria-" src/ --include="*.tsx" | head -30

# Find role attributes
grep -rn "role=" src/ --include="*.tsx" | head -20

# Find potentially incorrect ARIA
grep -rn "aria-hidden=\"true\"" src/ --include="*.tsx" | head -10
```

### Common ARIA Mistakes

```tsx
// ❌ aria-hidden on focusable element
<button aria-hidden="true">Hidden but focusable!</button>

// ❌ Redundant ARIA (button already has role)
<button role="button">Click</button>

// ❌ aria-label on non-interactive element
<div aria-label="Info">Some text</div>

// ✅ Correct usage
<nav aria-label="Main navigation">...</nav>
<button aria-expanded={isOpen} aria-controls="menu">Menu</button>
```

### Check: Live regions

```bash
# Find dynamic content areas
grep -rn "aria-live\|role=\"alert\"\|role=\"status\"" src/ --include="*.tsx" | head -10

# Find toast/notification components
grep -rn "Toast\|Notification\|Alert" src/ --include="*.tsx" | head -10
```

```tsx
// ❌ Dynamic content without live region
<div>{successMessage}</div>

// ✅ Announce to screen readers
<div role="status" aria-live="polite">
  {successMessage}
</div>

// ✅ Urgent announcements
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

---

## 6. SEMANTIC HTML (WCAG 1.3.1)

### Check: Heading structure

```bash
# Find all headings
grep -rn "<h1\|<h2\|<h3\|<h4\|<h5\|<h6" src/ --include="*.tsx" | head -30

# Check for skipped heading levels
# Should be h1 → h2 → h3, not h1 → h3
```

### Issues to Flag

```tsx
// ❌ Skipped heading level
<h1>Page Title</h1>
<h3>Section</h3>  // Skipped h2!

// ❌ Using heading for styling only
<h3 className="text-sm">Not really a heading</h3>

// ✅ Proper heading hierarchy
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

### Check: Landmark regions

```bash
# Find main, nav, header, footer, aside
grep -rn "<main\|<nav\|<header\|<footer\|<aside\|role=\"main\"\|role=\"navigation\"" \
  src/ --include="*.tsx" | head -20
```

```tsx
// ❌ No landmarks
<div className="app">
  <div className="nav">...</div>
  <div className="content">...</div>
</div>

// ✅ Semantic landmarks
<div className="app">
  <header>...</header>
  <nav aria-label="Main">...</nav>
  <main>...</main>
  <footer>...</footer>
</div>
```

---

## 7. SKIP LINKS (WCAG 2.4.1)

### Check: Skip navigation

```bash
# Find skip link implementations
grep -rn "skip\|Skip" src/ --include="*.tsx" | head -10
```

```tsx
// ✅ Skip link (first focusable element)
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// Main content target
<main id="main-content">...</main>
```

---

## 8. MOTION & ANIMATION (WCAG 2.3)

### Check: Reduced motion support

```bash
# Find animations/transitions
grep -rn "animation\|transition\|animate-" src/ --include="*.tsx" --include="*.css" | head -20

# Check for prefers-reduced-motion
grep -rn "prefers-reduced-motion\|motion-reduce" src/ | head -5
```

```tsx
// ❌ Animation without reduced-motion check
<div className="animate-bounce">...</div>

// ✅ Respects user preference
<div className="animate-bounce motion-reduce:animate-none">...</div>

// ✅ In CSS
@media (prefers-reduced-motion: reduce) {
  .animated {
    animation: none;
    transition: none;
  }
}
```

---

# RAPPORT

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    ♿ ACCESSIBILITY AUDIT REPORT                           ║
║                    WCAG 2.1 Level AA Compliance                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  SUMMARY                                                                   ║
║  ┌────────────────────────┬────────┬────────┬──────────┐                   ║
║  │ Principle              │ Status │ Issues │ WCAG Ref │                   ║
║  ├────────────────────────┼────────┼────────┼──────────┤                   ║
║  │ 1. Perceivable         │  ✅/❌  │   XX   │ 1.x      │                   ║
║  │ 2. Operable            │  ✅/❌  │   XX   │ 2.x      │                   ║
║  │ 3. Understandable      │  ✅/❌  │   XX   │ 3.x      │                   ║
║  │ 4. Robust              │  ✅/❌  │   XX   │ 4.x      │                   ║
║  └────────────────────────┴────────┴────────┴──────────┘                   ║
║                                                                            ║
║  COMPLIANCE: XX% (Target: 100% for AA)                                     ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🔴 CRITICAL (Blocks users)                                                ║
║                                                                            ║
║  1. Missing alt text on X images                                           ║
║     WCAG: 1.1.1 (Non-text Content)                                         ║
║     Impact: Screen reader users cannot understand images                   ║
║     Files:                                                                 ║
║     ├─ src/components/ProductCard.tsx:23                                   ║
║     ├─ src/components/UserAvatar.tsx:15                                    ║
║     └─ src/pages/About.tsx:45                                              ║
║                                                                            ║
║  2. X buttons not keyboard accessible                                      ║
║     WCAG: 2.1.1 (Keyboard)                                                 ║
║     Impact: Keyboard users cannot activate controls                        ║
║     Files:                                                                 ║
║     ├─ src/components/Dropdown.tsx:34 (div with onClick)                   ║
║     └─ src/components/Card.tsx:67 (span with onClick)                      ║
║                                                                            ║
║  3. Form inputs without labels                                             ║
║     WCAG: 1.3.1 (Info and Relationships)                                   ║
║     Impact: Screen reader users cannot identify inputs                     ║
║     Files:                                                                 ║
║     ├─ src/components/SearchBar.tsx:12                                     ║
║     └─ src/components/LoginForm.tsx:28, 35                                 ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🟠 HIGH (Significantly impacts users)                                     ║
║                                                                            ║
║  1. Low color contrast on X elements                                       ║
║     WCAG: 1.4.3 (Contrast Minimum)                                         ║
║     Impact: Users with low vision struggle to read                         ║
║     Examples:                                                              ║
║     ├─ text-gray-400 on white (~3:1, need 4.5:1)                           ║
║     └─ Placeholder text often too light                                    ║
║                                                                            ║
║  2. Missing skip link                                                      ║
║     WCAG: 2.4.1 (Bypass Blocks)                                            ║
║     Impact: Keyboard users must tab through nav on every page              ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🟡 MEDIUM (Impacts some users)                                            ║
║                                                                            ║
║  1. Heading hierarchy issues                                               ║
║     WCAG: 1.3.1 (Info and Relationships)                                   ║
║     Files: 3 pages skip from h1 to h3                                      ║
║                                                                            ║
║  2. Missing landmark regions                                               ║
║     WCAG: 1.3.1 (Info and Relationships)                                   ║
║     Missing: <main>, <nav> labels                                          ║
║                                                                            ║
║  3. No reduced motion support                                              ║
║     WCAG: 2.3.3 (Animation from Interactions)                              ║
║     Animations: 5 without motion-reduce                                    ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🔵 LOW (Best practices)                                                   ║
║                                                                            ║
║  1. Redundant ARIA roles on X elements                                     ║
║  2. aria-label on non-interactive elements                                 ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  📋 QUICK FIXES                                                            ║
║                                                                            ║
║  1. Add alt text:                                                          ║
║     <img src="..." alt="Descriptive text" />                               ║
║                                                                            ║
║  2. Replace div onClick with button:                                       ║
║     <button onClick={...}>Click me</button>                                ║
║                                                                            ║
║  3. Add form labels:                                                       ║
║     <label htmlFor="email">Email</label>                                   ║
║     <input id="email" type="email" />                                      ║
║                                                                            ║
║  4. Improve contrast (Tailwind):                                           ║
║     text-gray-400 → text-gray-600                                          ║
║                                                                            ║
║  5. Add skip link:                                                         ║
║     <a href="#main" className="sr-only focus:not-sr-only">                 ║
║       Skip to content                                                      ║
║     </a>                                                                   ║
║                                                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  🧪 MANUAL TESTING REQUIRED                                                ║
║                                                                            ║
║  These items need manual verification:                                     ║
║  □ Screen reader testing (VoiceOver, NVDA)                                 ║
║  □ Keyboard-only navigation test                                           ║
║  □ Zoom to 200% test                                                       ║
║  □ Color blindness simulation                                              ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## COMMON FIXES

### Fix: Add alt text

```tsx
// Images with content
<img src="/chart.png" alt="Sales increased 25% in Q4 2024" />

// Decorative images
<img src="/decoration.svg" alt="" role="presentation" />

// Complex images
<figure>
  <img src="/infographic.png" alt="Company growth infographic" />
  <figcaption>
    Full description: Our company grew from 10 to 50 employees...
  </figcaption>
</figure>
```

### Fix: Keyboard accessibility

```tsx
// Replace clickable div with button
<button onClick={handleClick} className="card-style">
  Click me
</button>

// Or if div styling is required
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click me
</div>
```

### Fix: Form labels

```tsx
// Visible label
<div>
  <label htmlFor="email" className="block text-sm font-medium">
    Email address
  </label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={errors.email ? 'true' : 'false'}
    aria-describedby={errors.email ? 'email-error' : undefined}
  />
  {errors.email && (
    <p id="email-error" role="alert" className="text-red-500 text-sm">
      {errors.email.message}
    </p>
  )}
</div>
```

### Fix: Skip link

```tsx
// Add as first element in body/app
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black"
>
  Skip to main content
</a>

// Add id to main content
<main id="main-content">
  ...
</main>
```

---

## TESTING RESOURCES

- **Screen Readers:** VoiceOver (Mac), NVDA (Windows), TalkBack (Android)
- **Browser Extensions:** axe DevTools, WAVE, Lighthouse
- **Contrast Checkers:** WebAIM Contrast Checker, Contrast Ratio
- **Keyboard Testing:** Tab through entire page without mouse

---

*Onderdeel van [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
