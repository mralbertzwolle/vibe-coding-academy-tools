# Vibe Coding Academy Tools

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Plugins](https://img.shields.io/badge/plugins-6-blue)]()
[![Commands](https://img.shields.io/badge/commands-17-green)]()

**Open-source Claude Code plugins for secure, AI-assisted development.**

Built by [Vibe Coding Academy](https://vibecodingacademy.nl) (Netherlands) • [Albert Barth](https://linkedin.com/in/albertbarth/)

---

## Quick Start

```bash
curl -fsSL https://raw.githubusercontent.com/mralbertzwolle/vibe-coding-academy-tools/main/install.sh | bash
```

Restart Claude Code and all 6 plugins are ready.

---

## Plugins

| Plugin | Command | What it does |
|--------|---------|--------------|
| **security-audit** | `/security-audit:run` | 95+ security checks (OWASP, RLS bypass, secrets, payments) |
| **ai-seo-audit** | `/ai-seo-audit:run` | AI discoverability for ChatGPT/Claude/Perplexity |
| **codebase-setup** | `/codebase-setup:init` | Project architecture, migrations, cleanup |
| **supabase-toolkit** | `/supabase-toolkit:rls-audit` | RLS policies, auth, RPC generation |
| **performance-audit** | `/performance-audit:run` | Bundle size, React, database queries |
| **accessibility-audit** | `/accessibility-audit:run` | WCAG 2.1 Level AA compliance |

**Perfect for developers migrating from Lovable, Bolt, or v0.**

---

## Why This Project?

AI tools make coding faster, but they often skip security and architecture best practices. These plugins help you:

- **Catch security issues** before deployment
- **Structure your codebase** professionally
- **Enforce naming conventions** (database + code)
- **Get discovered by AI** search engines

Tested on production apps with 400+ database tables.

---

## Documentation

- [Full plugin documentation](docs/PLUGINS.md)
- [Naming conventions](docs/NAMING.md)
- [Contributing guide](CONTRIBUTING.md)
- [Roadmap](ROADMAP.md)

---

## Standards & Credits

These plugins implement patterns from:

- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [SQL Style Guide by Simon Holywell](https://www.sqlstyle.guide/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

AI-SEO research based on:
- [Digital Bloom - AI Visibility Report](https://digitalbloom.com/)
- [SparkToro - How to Appear in AI Answers](https://sparktoro.com/)
- [Status Labs - How AI Decides Sources](https://statuslabs.com/)

---

## Tech Stack Support

Optimized for: React, Next.js, Vue, Vite, Node.js, Express, Supabase, PostgreSQL, Mollie, Stripe

Works with any JavaScript/TypeScript project.

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

**CC BY-NC 4.0** - You can use, share, and adapt this work for **non-commercial purposes** with attribution.

See [LICENSE](LICENSE) for details.

---

## Author

**Albert Barth** - [LinkedIn](https://linkedin.com/in/albertbarth/) • [X/Twitter](https://x.com/albertbarth_nl)

[Vibe Coding Academy](https://vibecodingacademy.nl) - The Dutch academy for AI-assisted development.

---

*Made with ❤️ in the Netherlands*
