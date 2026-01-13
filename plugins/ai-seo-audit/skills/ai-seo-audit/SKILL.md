---
name: ai-seo-audit
description: AI SEO Audit v2.0 for Generative Engine Optimization (GEO). Analyzes websites for AI discoverability in ChatGPT, Claude, Perplexity, and Google AI Overviews. Uses research-backed methodology with 36 checks across 8 categories (incl. broken link check). Use /ai-seo-audit:run to start.
---

# AI SEO Audit Skill (GEO - Generative Engine Optimization)

This skill provides comprehensive AI discoverability auditing based on 2025 research showing that **brand mentions, not backlinks**, are the new currency for AI visibility.

## Features

- **36 checks** across 8 weighted categories (incl. broken link check)
- **Research-backed methodology** (Digital Bloom, SparkToro, Status Labs)
- **Citation Probability Score** (0-100)
- **Prioritized recommendations** based on impact
- **Quick wins** with code examples

## Key Research Findings

| Factor | Impact | Source |
|--------|--------|--------|
| Wikipedia presence | 47.9% of ChatGPT citations | Citation analysis |
| Reddit mentions | 46.7% of Perplexity citations | Citation analysis |
| Multi-platform presence (4+) | 2.8x citation boost | Digital Bloom 2025 |
| Statistics in content | +22% citation likelihood | Content study |
| Expert quotations | +37% citation likelihood | Content study |
| Backlinks | ~0 correlation | Digital Bloom 2025 |

## Categories (Weighted by Impact)

| Category | Weight | Focus |
|----------|--------|-------|
| Brand Authority | 25% | Wikipedia, Knowledge Graph, SameAs schema |
| Community Presence | 15% | Reddit, Quora, forums, GitHub |
| Citation-Worthy Content | 15% | Statistics, quotes, FAQs, comparisons |
| Structured Data | 12% | Organization, Article, FAQ, HowTo schema |
| Technical AI Access | 10% | robots.txt, broken links, TTFB, SSR, HTTPS |
| Content Freshness | 10% | Update dates, sitemap lastmod |
| Content Quality | 8% | Headings, E-E-A-T, author info |
| AI-Specific Files | 5% | llms.txt, ai.txt, Open Graph |

## Usage

```bash
/ai-seo-audit:run                      # Audit current project
/ai-seo-audit:run https://example.com  # Audit specific URL
```

## Key Insight

The old SEO rules don't apply to AI:

| Old Thinking | New Reality |
|--------------|-------------|
| Backlinks = authority | Brand mentions = authority |
| Keyword optimization | Entity optimization |
| Technical SEO first | Brand authority first |
| llms.txt is critical | Reddit presence is critical |
| Website-only focus | Multi-platform presence |

## Output

Generates a Citation Probability Score report with:
- Overall score (0-100)
- Per-category breakdown
- Prioritized recommendations (Critical → High → Medium)
- Quick win code snippets (schema, robots.txt)
- Reddit playbook for community building
