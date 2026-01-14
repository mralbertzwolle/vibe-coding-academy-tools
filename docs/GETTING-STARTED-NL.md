# Aan de Slag

**Nieuw met coderen? Kom je van Lovable, Bolt of v0?** Deze handleiding is voor jou.

---

## Wat is Claude Code?

Claude Code is een AI-assistent die in je terminal draait (het zwarte scherm waar developers commando's typen). Het kan je code lezen, verbeteringen voorstellen, en deze audit-plugins draaien om problemen te vinden.

**Je hebt eerst Claude Code nodig.** Als je dat nog niet hebt:
1. Ga naar [claude.ai/download](https://claude.ai/download)
2. Download en installeer Claude Code voor jouw computer
3. Open je terminal en typ `claude` om te starten

---

## De Plugins Installeren

Kopieer en plak dit commando in je terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/mralbertzwolle/vibe-coding-academy-tools/main/install.sh | bash
```

**Wat doet dit?**
- Downloadt 6 audit-plugins naar je computer
- Configureert Claude Code om ze te gebruiken
- Duurt ongeveer 10 seconden

Na de installatie: **sluit Claude Code en open het opnieuw**.

---

## Je Eerste Security Audit

### Stap 1: Open je project

Navigeer in je terminal naar je projectmap:

```bash
cd ~/pad/naar/je/project
```

**Weet je het pad niet?**
- Op Mac: Open Finder, sleep je projectmap naar de terminal
- Op Windows: Rechtermuisklik op je map → "Kopieer als pad"

### Stap 2: Start Claude Code

```bash
claude
```

### Stap 3: Voer een security audit uit

Typ dit commando in Claude Code:

```
/security-audit:run
```

Claude controleert nu je code op 75+ beveiligingsproblemen en laat zien wat je moet fixen.

---

## De Resultaten Begrijpen

Na een audit zie je zoiets als:

```
SECURITY AUDIT RESULTATEN
=========================

KRITIEK (direct fixen):
- Hardcoded API key gevonden in src/config.js:12

HOOG (fixen voor je live gaat):
- Geen rate limiting op login endpoint
- CSRF-beveiliging ontbreekt

MEDIUM (zou je moeten fixen):
- Console.log statements in productie-code

Score: 6/10
```

**Wat betekenen de niveaus?**

| Niveau | Wat het betekent | Wanneer fixen |
|--------|-----------------|---------------|
| KRITIEK | Hackers kunnen dit makkelijk misbruiken | Nu meteen |
| HOOG | Serieus beveiligingsrisico | Voor lancering |
| MEDIUM | Kan problemen veroorzaken | Als je tijd hebt |
| LAAG | Best practice suggesties | Nice to have |

---

## Belangrijke Audits voor Lovable Projecten

Heb je je app gebouwd met Lovable? Voer deze audits uit:

### 1. Security Check
```
/security-audit:run
```
Vindt: hardcoded secrets, ontbrekende authenticatie, SQL-injectie risico's

### 2. Supabase RLS Audit
```
/supabase-toolkit:rls-audit
```
Vindt: database tabellen zonder Row Level Security (iedereen kan je data lezen!)

### 3. Performance Check
```
/performance-audit:run
```
Vindt: trage database queries, grote bundle sizes, ontbrekende optimalisaties

### 4. Toegankelijkheid Check
```
/accessibility-audit:run
```
Vindt: ontbrekende alt-teksten, slecht contrast, keyboard navigatie problemen

---

## Problemen Oplossen

Na een audit legt Claude elk probleem uit en stelt vaak fixes voor. Je kunt vragen:

- "Fix de kritieke problemen"
- "Leg uit wat RLS betekent"
- "Laat zien hoe ik rate limiting toevoeg"
- "Fix probleem #3"

Claude past je code direct aan.

---

## Migreren vanaf Lovable

Heb je je code geëxporteerd vanuit Lovable en wil je het productie-klaar maken?

```
/codebase-setup:lovable-migrate
```

Dit commando:
- Herstructureert je projectmappen
- Voegt goede error handling toe
- Zet environment variabelen correct op
- Maakt een deployment checklist

---

## Hulp Nodig?

**Vastgelopen?** Vraag Claude:
- "Wat betekent deze error?"
- "Hoe run ik mijn project lokaal?"
- "Leg uit wat Supabase RLS doet"

**Nog steeds vast?**
- [Vibe Coding Academy](https://vibecodingacademy.nl) - Nederlandse cursussen
- [GitHub Issues](https://github.com/mralbertzwolle/vibe-coding-academy-tools/issues) - Bugs melden

---

## Woordenlijst

| Term | Simpele uitleg |
|------|---------------|
| **Terminal** | Het zwarte scherm waar je commando's typt |
| **Repository** | Een map met je code, bijgehouden door Git |
| **API key** | Een geheim wachtwoord voor verbinding met services |
| **RLS** | Row Level Security - bepaalt wie welke data kan zien |
| **Environment variables** | Geheime instellingen buiten je code opgeslagen |
| **Bundle size** | Hoe groot je app is bij downloaden |
| **WCAG** | Regels om websites toegankelijk te maken voor iedereen |

---

## Veelgestelde Vragen

### "Ik krijg een foutmelding bij het installeren"

Controleer of je:
1. Claude Code al hebt geïnstalleerd
2. Verbonden bent met internet
3. Het commando in je terminal plakt (niet in Claude Code zelf)

### "Claude herkent de commando's niet"

- Heb je Claude Code herstart na installatie?
- Typ `/` en kijk of je de commando's ziet verschijnen

### "Ik snap de audit resultaten niet"

Vraag gewoon aan Claude: "Leg deze resultaten uit in simpele taal" of "Wat moet ik eerst fixen?"

### "Mijn Lovable project werkt niet meer na migratie"

Voer uit: `/codebase-setup:health-check` om te zien wat er mis is. Claude helpt je stap voor stap.

---

*Gemaakt door [Vibe Coding Academy](https://vibecodingacademy.nl) - AI-gebouwde apps productie-klaar maken.*
