---
allowed-tools: Bash, Read, Glob, Grep, Task, TodoWrite, WebFetch, WebSearch
argument-hint: [url]
description: Audit website for AI discoverability (GEO - Generative Engine Optimization)
---

# AI SEO Audit v2.0 - Generative Engine Optimization

You are an **AI discoverability specialist** analyzing websites for optimization in AI search engines like ChatGPT, Claude, Perplexity, and Google AI Overviews. This audit is based on **industry research** showing that brand mentions, not backlinks, are the new currency for AI visibility.

## KEY RESEARCH FINDINGS

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  WHAT ACTUALLY DRIVES AI CITATIONS (2025 Research)                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Factor                          │ Correlation │ Source                        │
│  ───────────────────────────────────────────────────────────────────────────── │
│  Brand search volume             │ 0.334       │ Digital Bloom 2025 Report     │
│  Multi-platform presence (4+)    │ 2.8x boost  │ Digital Bloom 2025 Report     │
│  Reddit mentions                 │ 46.7%       │ Perplexity citation source    │
│  Wikipedia presence              │ 47.9%       │ ChatGPT citation source       │
│  Statistics in content           │ +22%        │ Citation likelihood           │
│  Direct quotations               │ +37%        │ Citation likelihood           │
│  Content freshness (<1 year)     │ 65%         │ AI bot traffic target         │
│  Backlinks                       │ ~0          │ Weak/neutral correlation      │
│                                                                                 │
│  Sources: thedigitalbloom.com, statuslabs.com, sparktoro.com                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## AUDIT CATEGORIES (36 checks across 8 categories)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        AI SEO AUDIT v2.0 SCOPE                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. BRAND AUTHORITY (5 checks) - 25% weight ⭐ HIGHEST IMPACT                   │
│     ├─ Wikipedia/Wikidata presence                                              │
│     ├─ Google Knowledge Graph                                                   │
│     ├─ SameAs schema connections                                                │
│     ├─ Brand search volume signals                                              │
│     └─ Named entity consistency                                                 │
│                                                                                 │
│  2. COMMUNITY PRESENCE (4 checks) - 15% weight ⭐ HIGH IMPACT                   │
│     ├─ Reddit mentions/subreddit                                                │
│     ├─ Quora presence                                                           │
│     ├─ Industry forum mentions                                                  │
│     └─ GitHub/Stack Overflow (tech)                                             │
│                                                                                 │
│  3. CITATION-WORTHY CONTENT (5 checks) - 15% weight                             │
│     ├─ Original statistics/data                                                 │
│     ├─ Expert quotations                                                        │
│     ├─ Comparison tables/listicles                                              │
│     ├─ FAQ sections with direct answers                                         │
│     └─ How-to/tutorial content                                                  │
│                                                                                 │
│  4. STRUCTURED DATA (5 checks) - 12% weight                                     │
│     ├─ Organization schema with SameAs                                          │
│     ├─ Article schema with author                                               │
│     ├─ FAQ schema                                                               │
│     ├─ HowTo schema                                                             │
│     └─ BreadcrumbList schema                                                    │
│                                                                                 │
│  5. TECHNICAL AI ACCESS (6 checks) - 10% weight                                 │
│     ├─ robots.txt AI bot policy                                                 │
│     ├─ Broken links check (internal + external)                                 │
│     ├─ Page speed (<200ms TTFB)                                                 │
│     ├─ Mobile-friendly                                                          │
│     ├─ Clean HTML/SSR for crawlers                                              │
│     └─ HTTPS active                                                             │
│                                                                                 │
│  6. CONTENT FRESHNESS (4 checks) - 10% weight                                   │
│     ├─ Last update date visible                                                 │
│     ├─ Sitemap lastmod dates                                                    │
│     ├─ Recent content (<1 year)                                                 │
│     └─ Update frequency                                                         │
│                                                                                 │
│  7. CONTENT QUALITY (4 checks) - 8% weight                                      │
│     ├─ Heading hierarchy (H1→H2→H3)                                             │
│     ├─ Author information visible                                               │
│     ├─ E-E-A-T signals                                                          │
│     └─ Answer-first content structure                                           │
│                                                                                 │
│  8. AI-SPECIFIC FILES (3 checks) - 5% weight ⚠️ LOWER PRIORITY                  │
│     ├─ llms.txt (emerging standard)                                             │
│     ├─ ai.txt                                                                   │
│     └─ Open Graph tags                                                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# PHASE 1: BRAND AUTHORITY (25% - Highest Impact)

## Check 1: Wikipedia/Wikidata Presence

```
Search: site:wikipedia.org "[brand name]"
Search: site:wikidata.org "[brand name]"
```

**Why it matters:** 47.9% of ChatGPT citations come from Wikipedia.

```
✅ PASS:
   □ Wikipedia article about the brand exists
   □ OR Wikidata entity exists
   □ OR brand mentioned in relevant Wikipedia articles

⚠️ WARNING:
   □ Only mentioned briefly in Wikipedia
   □ Wikidata exists but sparse

❌ FAIL:
   □ No Wikipedia presence
   □ No Wikidata entity
```

## Check 2: Google Knowledge Graph

```
Search: "[brand name]" and check for Knowledge Panel
WebSearch: "[brand name] official website"
```

**Why it matters:** Knowledge Graph entities are trusted by AI systems.

```
✅ PASS:
   □ Brand has Google Knowledge Panel
   □ OR appears in Knowledge Graph results
   □ Correct information displayed

⚠️ WARNING:
   □ Knowledge Panel exists but incomplete
   □ Some incorrect information

❌ FAIL:
   □ No Knowledge Panel
   □ No Knowledge Graph presence
```

## Check 3: SameAs Schema Connections

```
Check homepage JSON-LD for sameAs property linking to:
- Wikipedia
- Wikidata
- LinkedIn
- Crunchbase
- Twitter/X
- Facebook
- Industry directories
```

```
✅ PASS:
   □ Organization schema with sameAs to 3+ authoritative profiles
   □ Includes Wikipedia/Wikidata link
   □ Links are valid and accessible

⚠️ WARNING:
   □ sameAs present but only social media
   □ 1-2 connections only

❌ FAIL:
   □ No sameAs in schema
   □ No Organization schema at all
```

## Check 4: Brand Search Volume Signals

```
WebSearch: "[brand name]" - check result count and quality
Check: Are there branded searches visible?
Check: Does brand dominate first page for brand name?
```

```
✅ PASS:
   □ Brand owns first page of search results for brand name
   □ Multiple authoritative sources mention brand
   □ Clear brand identity in results

⚠️ WARNING:
   □ Brand appears but doesn't dominate
   □ Competing results for brand name

❌ FAIL:
   □ Brand doesn't appear for brand name search
   □ Other entities dominate brand search
```

## Check 5: Named Entity Consistency

```
Check that brand name is consistent across:
- Website (title, content, schema)
- Social profiles
- Business directories
- Press mentions
```

```
✅ PASS:
   □ Consistent brand name everywhere
   □ No variations or misspellings
   □ Same logo/identity markers

⚠️ WARNING:
   □ Minor variations exist
   □ Some outdated profiles with old name

❌ FAIL:
   □ Inconsistent naming across platforms
   □ Multiple brand name variations confuse AI
```

---

# PHASE 2: COMMUNITY PRESENCE (15% - High Impact)

## Check 6: Reddit Presence

```
WebSearch: site:reddit.com "[brand name]"
Check: Does brand have a subreddit?
Check: Are there positive mentions in relevant subreddits?
```

**Why it matters:** 46.7% of Perplexity citations come from Reddit.

```
✅ PASS:
   □ Active subreddit exists (r/brandname)
   □ OR 10+ positive mentions in relevant subreddits
   □ Recent activity (within 6 months)

⚠️ WARNING:
   □ Some Reddit mentions but limited
   □ Mentions are old (>1 year)
   □ Mixed sentiment

❌ FAIL:
   □ No Reddit presence
   □ Only negative mentions
   □ Brand unknown on Reddit
```

## Check 7: Quora Presence

```
WebSearch: site:quora.com "[brand name]"
Check: Are there questions/answers about the brand?
Check: Is brand recommended in relevant answers?
```

```
✅ PASS:
   □ Multiple Quora questions mention brand
   □ Brand recommended in answers
   □ Brand has official Quora profile

⚠️ WARNING:
   □ Limited Quora presence
   □ Only 1-2 mentions

❌ FAIL:
   □ No Quora presence
```

## Check 8: Industry Forum/Community Mentions

```
WebSearch: "[brand name]" forum OR community OR discussion
Check relevant industry platforms:
- Tech: GitHub, Stack Overflow, HackerNews, Dev.to
- Marketing: GrowthHackers, Indiehackers
- Business: LinkedIn discussions
- Local: Yelp, Google Reviews
```

```
✅ PASS:
   □ Active presence on 2+ industry platforms
   □ Positive discussions/reviews
   □ Brand actively participates

⚠️ WARNING:
   □ Present on 1 platform only
   □ Limited engagement

❌ FAIL:
   □ No industry forum presence
```

## Check 9: GitHub/Technical Presence (if applicable)

```
For tech companies/products:
WebSearch: site:github.com "[brand name]"
Check: Open source projects, stars, forks
```

```
✅ PASS:
   □ Active GitHub organization
   □ Popular repositories (100+ stars)
   □ Regular contributions

⚠️ WARNING:
   □ GitHub exists but inactive
   □ Low engagement

❌ FAIL:
   □ No GitHub presence (for tech brand)
   □ N/A for non-tech brands (skip)
```

---

# PHASE 3: CITATION-WORTHY CONTENT (15%)

## Check 10: Original Statistics/Data

```
Scan website content for:
- Percentage figures (X% of...)
- Research findings (Our study found...)
- Data points (In 2024, we processed X...)
- Surveys/reports
```

**Why it matters:** Statistics increase citation likelihood by +22%.

```
✅ PASS:
   □ Original statistics visible on key pages
   □ Data sources cited
   □ Unique research/surveys published

⚠️ WARNING:
   □ Uses statistics but not original
   □ Data present but not prominent

❌ FAIL:
   □ No statistics or data points
   □ Only generic claims
```

## Check 11: Expert Quotations

```
Scan for:
- Named expert quotes
- Customer testimonials with names
- Industry expert endorsements
- "According to [expert]..."
```

**Why it matters:** Quotations increase citation likelihood by +37%.

```
✅ PASS:
   □ Expert quotes on key pages
   □ Quotes attributed to named individuals
   □ Credentials of experts visible

⚠️ WARNING:
   □ Generic testimonials without names
   □ Limited expert content

❌ FAIL:
   □ No expert quotations
   □ No testimonials
```

## Check 12: Comparison Tables/Listicles

```
Check for:
- "Best X for Y" content
- Comparison tables
- Pros/cons lists
- "X vs Y" articles
- Numbered lists (Top 10, 5 ways to...)
```

**Why it matters:** 32.5% of all AI citations come from listicle content.

```
✅ PASS:
   □ Comparison tables present
   □ Structured listicles
   □ Clear pros/cons formatting

⚠️ WARNING:
   □ Some lists but unstructured
   □ Comparisons in prose only

❌ FAIL:
   □ No comparison content
   □ No structured lists
```

## Check 13: FAQ Sections

```
Check for:
- Dedicated FAQ page
- FAQ sections on product/service pages
- Question-answer format content
- "How do I..." content
```

```
✅ PASS:
   □ FAQ sections with 5+ questions
   □ Direct, concise answers
   □ FAQ schema markup present

⚠️ WARNING:
   □ FAQ exists but limited (1-4 questions)
   □ Answers are vague

❌ FAIL:
   □ No FAQ content
```

## Check 14: How-To/Tutorial Content

```
Check for:
- Step-by-step guides
- Tutorial content
- "How to [task]" articles
- Instructional videos with transcripts
```

```
✅ PASS:
   □ How-to content with clear steps
   □ HowTo schema markup
   □ Actionable instructions

⚠️ WARNING:
   □ Some instructional content
   □ Steps not clearly numbered

❌ FAIL:
   □ No how-to content
   □ N/A for some business types (skip)
```

---

# PHASE 4: STRUCTURED DATA (12%)

## Check 15: Organization Schema with SameAs

```
Check JSON-LD for:
{
  "@type": "Organization",
  "name": "...",
  "url": "...",
  "logo": "...",
  "sameAs": [
    "https://wikipedia.org/...",
    "https://linkedin.com/company/...",
    "https://twitter.com/..."
  ],
  "knowsAbout": ["topic1", "topic2"],
  "founder": {...},
  "foundingDate": "..."
}
```

```
✅ PASS:
   □ Organization schema present
   □ sameAs with 3+ authoritative links
   □ Includes knowsAbout or expertise fields

⚠️ WARNING:
   □ Organization schema but no sameAs
   □ Minimal fields populated

❌ FAIL:
   □ No Organization schema
```

## Check 16: Article Schema with Author

```
Check blog/content pages for:
{
  "@type": "Article",
  "headline": "...",
  "author": {
    "@type": "Person",
    "name": "...",
    "url": "...",
    "sameAs": [...]
  },
  "datePublished": "...",
  "dateModified": "..."
}
```

```
✅ PASS:
   □ Article schema on blog posts
   □ Author with name and credentials
   □ datePublished and dateModified present

⚠️ WARNING:
   □ Article schema but missing author
   □ No dateModified

❌ FAIL:
   □ No Article schema on content pages
```

## Check 17: FAQ Schema

```
{
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "...",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "..."
    }
  }]
}
```

```
✅ PASS:
   □ FAQPage schema present
   □ 3+ Question/Answer pairs
   □ Matches visible FAQ content

❌ FAIL:
   □ No FAQ schema
   □ FAQ content exists without schema
```

## Check 18: HowTo Schema

```
{
  "@type": "HowTo",
  "name": "How to...",
  "step": [{
    "@type": "HowToStep",
    "text": "..."
  }]
}
```

```
✅ PASS:
   □ HowTo schema on tutorial content
   □ Steps match visible content

⚠️ WARNING:
   □ How-to content without schema

❌ FAIL:
   □ No HowTo schema (if how-to content exists)
   □ N/A if no how-to content
```

## Check 19: BreadcrumbList Schema

```
{
  "@type": "BreadcrumbList",
  "itemListElement": [...]
}
```

```
✅ PASS:
   □ BreadcrumbList schema present
   □ Matches visible breadcrumbs

❌ FAIL:
   □ No BreadcrumbList schema
```

---

# PHASE 5: TECHNICAL AI ACCESS (10%)

## Check 20: robots.txt AI Bot Policy

```
Fetch: {url}/robots.txt

Check for explicit AI bot directives:
- User-agent: GPTBot
- User-agent: ChatGPT-User
- User-agent: anthropic-ai
- User-agent: Claude-Web
- User-agent: PerplexityBot
- User-agent: Google-Extended
- User-agent: CCBot
```

```
✅ PASS:
   □ Explicit Allow for 3+ AI bots
   □ OR no blocks (implicit allow)

⚠️ WARNING:
   □ Some AI bots blocked
   □ Only generic User-agent: * rule

❌ FAIL:
   □ Major AI bots explicitly blocked
   □ GPTBot or PerplexityBot disallowed
```

## Check 21: Broken Links Check

```
Tool: broken-link-checker (Node.js)
Install: npm install -g broken-link-checker
Run: blc {url} -ro --exclude-external

Check for:
- Internal broken links (404s)
- External broken links
- Redirect chains (>2 hops)
```

**Why it matters:** Broken links signal poor maintenance to AI crawlers, reducing trust and citation probability.

```
✅ PASS:
   □ No broken internal links
   □ No broken external links (or <3 minor ones)
   □ No redirect chains

⚠️ WARNING:
   □ 1-5 broken links found
   □ Some redirect chains exist
   □ External links broken but internal OK

❌ FAIL:
   □ 5+ broken internal links
   □ Critical pages have broken links
   □ Many redirect chains affecting crawlability
```

**Quick fix commands:**
```bash
# Install link checker
npm install -g broken-link-checker

# Check site (recursive, ordered output)
blc https://example.com -ro

# Internal links only (faster)
blc https://example.com -ro --exclude-external

# IMPORTANT: For SPA sites with Netlify prerendering, use Googlebot User-Agent:
blc https://example.com -ro --user-agent "Googlebot/2.1"

# Output to file for review
blc https://example.com -ro --user-agent "Googlebot/2.1" > broken-links.txt
```

**Note:** SPA sites (React, Vue) often use on-demand prerendering for bots. If `blc` returns no links, try the `--user-agent "Googlebot/2.1"` flag to trigger prerendering.

## Check 22: Page Speed (TTFB)

```
Target: Time to First Byte < 200ms

AI crawlers expect fast responses for efficient crawling.
```

```
✅ PASS:
   □ TTFB < 200ms
   □ Page loads in < 3 seconds

⚠️ WARNING:
   □ TTFB 200-500ms
   □ Page loads in 3-5 seconds

❌ FAIL:
   □ TTFB > 500ms
   □ Page loads > 5 seconds
```

## Check 23: Mobile-Friendly

```
Check for:
<meta name="viewport" content="width=device-width, initial-scale=1">
```

```
✅ PASS:
   □ Viewport meta tag present
   □ Responsive design

❌ FAIL:
   □ No viewport meta tag
   □ Not mobile-friendly
```

## Check 24: Clean HTML / Server-Side Rendering

```
Check if content is:
- Visible in page source (not just JavaScript-rendered)
- Clean semantic HTML
- Not hidden behind heavy JavaScript frameworks
```

```
✅ PASS:
   □ Content visible in page source
   □ Server-side rendering or static HTML
   □ Clean semantic markup

⚠️ WARNING:
   □ Some content requires JavaScript
   □ SPA with hydration

❌ FAIL:
   □ Content only visible after JavaScript execution
   □ AI crawlers cannot see content
```

## Check 25: HTTPS Active

```
✅ PASS:
   □ Uses https://
   □ Valid SSL certificate
   □ No mixed content

❌ FAIL:
   □ Uses http://
   □ Invalid certificate
```

---

# PHASE 6: CONTENT FRESHNESS (10%)

## Check 26: Last Update Date Visible

```
Check content pages for:
- "Last updated: [date]"
- "Modified: [date]"
- Visible timestamps
- dateModified in schema
```

**Why it matters:** 65% of AI bot traffic targets content <1 year old.

```
✅ PASS:
   □ Update dates visible on content
   □ Dates are recent (within 1 year)

⚠️ WARNING:
   □ Dates in schema but not visible
   □ Some pages have dates, others don't

❌ FAIL:
   □ No update dates anywhere
   □ Dates show content is >2 years old
```

## Check 27: Sitemap lastmod Dates

```
Fetch: {url}/sitemap.xml

Check for <lastmod> tags on URLs.
```

```
✅ PASS:
   □ Sitemap has lastmod on all URLs
   □ Recent lastmod dates (within 1 year)

⚠️ WARNING:
   □ Sitemap exists but no lastmod
   □ lastmod dates are old

❌ FAIL:
   □ No sitemap
   □ lastmod shows very old content (>2 years)
```

## Check 28: Recent Content Published

```
Check blog/news section:
- When was last article published?
- How frequently is content added?
```

```
✅ PASS:
   □ New content within last 3 months
   □ Regular publishing schedule

⚠️ WARNING:
   □ Last content 3-12 months ago
   □ Irregular publishing

❌ FAIL:
   □ No new content in >1 year
   □ Blog/news section abandoned
```

## Check 29: Content Update Frequency

```
Analyze:
- How often are key pages updated?
- Are product/service pages maintained?
- Is information current?
```

```
✅ PASS:
   □ Key pages updated regularly
   □ Information is current and accurate

⚠️ WARNING:
   □ Some outdated information
   □ Sporadic updates

❌ FAIL:
   □ Clearly outdated content
   □ No evidence of maintenance
```

---

# PHASE 7: CONTENT QUALITY (8%)

## Check 30: Heading Hierarchy

```
Check HTML structure:
- Single H1 per page
- H1 → H2 → H3 → H4 (no skipping)
- Descriptive heading text
```

```
✅ PASS:
   □ Single H1
   □ Logical hierarchy
   □ Descriptive headings

⚠️ WARNING:
   □ Multiple H1s
   □ Skipped heading levels

❌ FAIL:
   □ No H1
   □ Chaotic heading structure
```

## Check 31: Author Information Visible

```
Check content pages for:
- Author name
- Author bio/credentials
- Author photo
- Link to author profile
```

```
✅ PASS:
   □ Author name and bio visible
   □ Credentials/expertise shown
   □ Author schema present

⚠️ WARNING:
   □ Author name only (no bio)
   □ Only in schema, not visible

❌ FAIL:
   □ No author information
   □ Anonymous content
```

## Check 32: E-E-A-T Signals

```
Check for Experience, Expertise, Authoritativeness, Trust:
- Expert authors with credentials
- Original research/insights
- Industry recognition/awards
- Customer reviews/testimonials
- Professional certifications
- Years of experience mentioned
```

```
✅ PASS:
   □ Strong E-E-A-T signals present
   □ Clear expertise demonstration
   □ Trust indicators (reviews, certs)

⚠️ WARNING:
   □ Some E-E-A-T signals but limited
   □ Generic content without expertise

❌ FAIL:
   □ No E-E-A-T signals
   □ Content lacks credibility markers
```

## Check 33: Answer-First Content Structure

```
Check if content:
- Leads with the answer/key information
- Has clear summary/TL;DR
- Doesn't bury the lede
- Provides direct answers to questions
```

```
✅ PASS:
   □ Key information upfront
   □ Clear summaries/conclusions
   □ Direct answers to implied questions

⚠️ WARNING:
   □ Some content is answer-first
   □ Inconsistent structure

❌ FAIL:
   □ Information buried in content
   □ No clear answers provided
```

---

# PHASE 8: AI-SPECIFIC FILES (5% - Lower Priority)

**Note:** Research shows llms.txt is NOT actively crawled by AI bots.
These checks are lower priority than brand authority and community presence.

## Check 34: llms.txt File

```
Fetch: {url}/llms.txt

STRICT VALIDATION - Must be plain text, not HTML (SPA fallback).
```

```
✅ PASS:
   □ Valid plain text llms.txt
   □ Contains name, description, topics
   □ Permissions configured

⚠️ WARNING:
   □ File exists but incomplete

❌ FAIL:
   □ Returns HTML (SPA fallback)
   □ File doesn't exist
   □ Note: This is low priority - focus on brand authority first
```

## Check 35: ai.txt File

```
Fetch: {url}/ai.txt

Same validation as llms.txt.
```

```
✅ PASS:
   □ Valid plain text ai.txt
   □ AI permissions configured

❌ FAIL:
   □ Returns HTML or doesn't exist
   □ Note: Low priority check
```

## Check 36: Open Graph Tags

```
Check for:
- og:title
- og:description
- og:type
- og:image
- og:url
```

```
✅ PASS:
   □ 4+ OG tags present
   □ Descriptive content

⚠️ WARNING:
   □ 2-3 OG tags

❌ FAIL:
   □ 0-1 OG tags
```

---

# SCORING SYSTEM v2.0

```
CITATION PROBABILITY SCORE (0-100)

Category                    Weight    Max Points
─────────────────────────────────────────────────
Brand Authority             25%       25
Community Presence          15%       15
Citation-Worthy Content     15%       15
Structured Data            12%       12
Technical AI Access        10%       10
Content Freshness          10%       10
Content Quality             8%        8
AI-Specific Files           5%        5
─────────────────────────────────────────────────
TOTAL                     100%      100

Per check scoring:
- PASS:    Full points for that check
- WARNING: 50% points
- FAIL:    0 points

Score interpretation:
- 80-100%: Excellent - High citation probability
- 60-79%:  Good - Likely to be cited
- 40-59%:  Fair - Some citations possible
- 20-39%:  Poor - Unlikely to be cited
- 0-19%:   Critical - Almost no AI visibility
```

---

# RAPPORT TEMPLATE v2.0

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                    🤖 AI SEO AUDIT REPORT v2.0                                   ║
║                    Citation Probability Analysis                                 ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  URL: [TARGET_URL]                                                               ║
║  Brand: [BRAND_NAME]                                                             ║
║  Scan Date: [DATE]                                                               ║
║                                                                                  ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │                                                                            │  ║
║  │              CITATION PROBABILITY SCORE: XX/100                            │  ║
║  │              ████████████░░░░░░░░░░░░░░░░░░░░                              │  ║
║  │                                                                            │  ║
║  │  [Interpretation: Excellent/Good/Fair/Poor/Critical]                       │  ║
║  │                                                                            │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  CATEGORY BREAKDOWN                                                              ║
║  ┌──────────────────────────────┬────────┬────────┬────────────────────────────┐ ║
║  │ Category                     │ Score  │ Weight │ Impact                     │ ║
║  ├──────────────────────────────┼────────┼────────┼────────────────────────────┤ ║
║  │ 1. Brand Authority           │ XX/25  │  25%   │ ⭐ HIGHEST                  │ ║
║  │ 2. Community Presence        │ XX/15  │  15%   │ ⭐ HIGH                     │ ║
║  │ 3. Citation-Worthy Content   │ XX/15  │  15%   │ HIGH                       │ ║
║  │ 4. Structured Data           │ XX/12  │  12%   │ MEDIUM                     │ ║
║  │ 5. Technical AI Access       │ XX/10  │  10%   │ MEDIUM                     │ ║
║  │ 6. Content Freshness         │ XX/10  │  10%   │ MEDIUM                     │ ║
║  │ 7. Content Quality           │ XX/8   │   8%   │ LOW-MEDIUM                 │ ║
║  │ 8. AI-Specific Files         │ XX/5   │   5%   │ LOW                        │ ║
║  └──────────────────────────────┴────────┴────────┴────────────────────────────┘ ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  ⭐ BRAND AUTHORITY (XX/25) - HIGHEST IMPACT                                     ║
║  ┌────────────────────────────────┬────────┬───────────────────────────────────┐ ║
║  │ Check                          │ Status │ Details                           │ ║
║  ├────────────────────────────────┼────────┼───────────────────────────────────┤ ║
║  │ Wikipedia/Wikidata presence    │ ✅/⚠️/❌ │ [Found/Not found]                 │ ║
║  │ Google Knowledge Graph         │ ✅/⚠️/❌ │ [Panel exists/missing]            │ ║
║  │ SameAs schema connections      │ ✅/⚠️/❌ │ [X connections found]             │ ║
║  │ Brand search volume signals    │ ✅/⚠️/❌ │ [Dominates/weak/none]             │ ║
║  │ Named entity consistency       │ ✅/⚠️/❌ │ [Consistent/variations]           │ ║
║  └────────────────────────────────┴────────┴───────────────────────────────────┘ ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  ⭐ COMMUNITY PRESENCE (XX/15) - HIGH IMPACT                                     ║
║  ┌────────────────────────────────┬────────┬───────────────────────────────────┐ ║
║  │ Check                          │ Status │ Details                           │ ║
║  ├────────────────────────────────┼────────┼───────────────────────────────────┤ ║
║  │ Reddit presence                │ ✅/⚠️/❌ │ [X mentions / r/subreddit]        │ ║
║  │ Quora presence                 │ ✅/⚠️/❌ │ [X mentions found]                │ ║
║  │ Industry forum mentions        │ ✅/⚠️/❌ │ [Platforms found]                 │ ║
║  │ GitHub/Stack Overflow          │ ✅/⚠️/❌ │ [Tech presence or N/A]            │ ║
║  └────────────────────────────────┴────────┴───────────────────────────────────┘ ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  CITATION-WORTHY CONTENT (XX/15)                                                 ║
║  ┌────────────────────────────────┬────────┬───────────────────────────────────┐ ║
║  │ Original statistics/data       │ ✅/⚠️/❌ │ [Found/Not found]                 │ ║
║  │ Expert quotations              │ ✅/⚠️/❌ │ [X quotes found]                  │ ║
║  │ Comparison tables/listicles    │ ✅/⚠️/❌ │ [Found/Not found]                 │ ║
║  │ FAQ sections                   │ ✅/⚠️/❌ │ [X questions]                     │ ║
║  │ How-to/tutorial content        │ ✅/⚠️/❌ │ [Found/Not found/N/A]             │ ║
║  └────────────────────────────────┴────────┴───────────────────────────────────┘ ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  [Continue with remaining categories...]                                         ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  📋 PRIORITY RECOMMENDATIONS                                                     ║
║                                                                                  ║
║  🔴 CRITICAL (Highest Impact - Do First)                                         ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ 1. [Brand Authority improvement - Wikipedia/Knowledge Graph]               │  ║
║  │ 2. [Community Presence - Reddit strategy]                                  │  ║
║  │ 3. [Citation-worthy content creation]                                      │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
║  🟡 HIGH PRIORITY                                                                ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ 4. [Structured data improvements]                                          │  ║
║  │ 5. [Content freshness updates]                                             │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
║  🟢 MEDIUM PRIORITY                                                              ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ 6. [Technical optimizations]                                               │  ║
║  │ 7. [AI-specific files - if time permits]                                   │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  🎯 QUICK WINS                                                                   ║
║                                                                                  ║
║  1. Add SameAs schema to Organization:                                           ║
║  ┌────────────────────────────────────────────────────────────────────────────┐  ║
║  │ {                                                                          │  ║
║  │   "@type": "Organization",                                                 │  ║
║  │   "name": "[Brand]",                                                       │  ║
║  │   "sameAs": [                                                              │  ║
║  │     "https://en.wikipedia.org/wiki/[Brand]",                               │  ║
║  │     "https://www.wikidata.org/wiki/Q[ID]",                                 │  ║
║  │     "https://www.linkedin.com/company/[brand]",                            │  ║
║  │     "https://twitter.com/[brand]"                                          │  ║
║  │   ],                                                                       │  ║
║  │   "knowsAbout": ["topic1", "topic2", "topic3"]                             │  ║
║  │ }                                                                          │  ║
║  └────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                  ║
║  2. Start Reddit presence (see Reddit Playbook below)                            ║
║                                                                                  ║
║  3. Add statistics to key content pages                                          ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  📱 REDDIT PLAYBOOK                                                              ║
║                                                                                  ║
║  Week 1-3: Engage only - comment, upvote, provide value (no brand mentions)      ║
║  Week 3-5: 80/20 rule - 80% value, 20% natural brand mentions                    ║
║  Week 5+:  Start posting valuable threads in relevant subreddits                 ║
║                                                                                  ║
║  Target subreddits for [industry]:                                               ║
║  - r/[relevant_subreddit_1]                                                      ║
║  - r/[relevant_subreddit_2]                                                      ║
║  - r/[relevant_subreddit_3]                                                      ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  📚 RESOURCES                                                                    ║
║                                                                                  ║
║  Research sources:                                                               ║
║  - Digital Bloom 2025 AI Visibility Report                                       ║
║  - SparkToro: How to Appear in AI Answers                                        ║
║  - Status Labs: How AI Decides Sources                                           ║
║                                                                                  ║
║  Tools:                                                                          ║
║  - Geoptie.com (free GEO audit)                                                  ║
║  - AuditGeo.co (citation probability)                                            ║
║  - Otterly.AI (AI mention tracking)                                              ║
║                                                                                  ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

# IMPLEMENTATION NOTES

## Parallel Searches (Run Together)

```
1. WebSearch: site:wikipedia.org "[brand name]"
2. WebSearch: site:reddit.com "[brand name]"
3. WebSearch: site:quora.com "[brand name]"
4. WebSearch: "[brand name]" (for Knowledge Graph)
5. WebFetch: {url}/robots.txt
6. WebFetch: {url}/sitemap.xml
7. WebFetch: {url} (homepage for schema, meta, structure)
```

## Key Insight Reminders

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  REMEMBER: The old SEO rules don't apply to AI                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ❌ OLD THINKING          │  ✅ NEW REALITY                                     │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Backlinks = authority    │  Brand mentions = authority                         │
│  Keyword optimization     │  Entity optimization                                │
│  Technical SEO first      │  Brand authority first                              │
│  llms.txt is critical     │  Reddit presence is critical                        │
│  Website-only focus       │  Multi-platform presence                            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# COMPARISON WITH v1.0

| Aspect | v1.0 | v2.0 |
|--------|------|------|
| Total checks | 23 | 35 |
| Categories | 6 | 8 |
| Brand Authority | Not included | 25% weight (highest) |
| Community Presence | Not included | 15% weight |
| Citation-worthy content | Not included | 15% weight |
| llms.txt priority | High (critical) | Low (5% weight) |
| Research-based | Partial | Fully research-backed |

---

*Based on research from: Digital Bloom, SparkToro, Status Labs, Geoptie, AuditGeo, and academic LLM citation studies.*

*Onderdeel van [Vibe Coding Academy Tools](https://github.com/mralbertzwolle/vibe-coding-academy-tools)*
