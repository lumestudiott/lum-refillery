# Lumë Refillery — New Sections UX Spec

**Author:** Senior UX / Front-end Engineering  
**Date:** 2025-05-17  
**Scope:** Two new homepage sections — *Small Makers* and *Complaints & Queries*  
**Position in page:** After `<Testimonials />`, before `<FAQ />`

---

## 1. SMALL MAKERS

### 1.1 Purpose & User Goal

| Dimension | Detail |
|---|---|
| **Business goal** | Educate visitors on Lumë's sourcing philosophy; build emotional trust in small-batch, local producers. |
| **User goal** | Understand *why* prices reflect real value and *who* is behind the products. |
| **Emotional register** | Pride, respect, cultural identity — warm but authoritative. |

### 1.2 Information Architecture

```
Eyebrow: "SMALL MAKERS"
H2:      "Some things can't be mass-produced — and they shouldn't be."

Block A — Cultural Context (left text / right image on desktop)
  Body copy about T&T's food culture, MSMEs, Agri-SMEs, 85–95% stat.
  Stat callout: "85–95% of registered T&T businesses are MSMEs / Agri-SMEs*"
  Source footnote: small, muted text with asterisk.

Block B — Lumë Definition (full-width pull-quote band on ceramic bg)
  "At Lumë Refillery, we define small makers as those who operate
   at a human scale…"
  Three value pills: Craft · Transparency · Local Impact

Block C — Fair Exchange (right text / left image on desktop)
  Body copy about pricing, real labour, fair exchange.
  CTA line (no button — just a quiet, bold sentence):
  "Choosing a small maker isn't just a purchase; it's an investment
   in culture, food security, and a food system built to last."
```

### 1.3 Layout & Visual Treatment

| Element | Spec |
|---|---|
| **Section bg** | `bg-canvas` (warm white) |
| **Pull-quote band** | `bg-ceramic` with left accent line `w-1 bg-lume-accent` |
| **Images** | Full-height parallax (`parallax-viewport` + `parallax-img-y-sm`), depicting artisan hands / small-batch production / local fruits |
| **Stat callout** | `font-display text-[clamp(2.4rem,5vw,4rem)]` in `text-lume-accent`, with the supporting text in `text-text-secondary` below |
| **Typography** | Eyebrow → `13px semibold uppercase tracking-[0.2em] text-lume-accent`. H2 → `font-display text-[clamp(2rem,4vw,3rem)]`. Body → `16px leading-[1.8] text-text-secondary`. |
| **Grid** | `grid lg:grid-cols-2` with alternating image/text order (same pattern as `About.tsx` benefits) |
| **Value pills** | `inline-flex` rounded-full chips: `bg-lume-accent/10 text-lume-accent text-[13px] font-semibold px-4 py-1.5` |

### 1.4 Motion

| Element | Animation | Timing |
|---|---|---|
| Eyebrow | `<Reveal>` fade, direction="none" | 1200ms |
| H2 | `<Reveal>` slide-up | 1000ms |
| Body paragraphs | `<Reveal>` fade-up per block | 800ms, 100ms stagger |
| Stat number | `<Reveal>` scale-up from 0.9 | 900ms |
| Pull-quote band | `<Reveal>` direction="none" | 1000ms |
| Images | CSS-only parallax (`parallax-img-y-sm`) | Scroll-driven |

### 1.5 Responsive

- **Mobile (< lg):** Single column. Image → Text stacking. Stat callout centered. Pull-quote full-width with generous `px-6 py-12`.
- **Desktop (≥ lg):** Two-column alternating grid. Pull-quote spans full width between the two grid rows.

### 1.6 Accessibility

- All images have descriptive `alt` text referencing T&T food culture.
- Stat uses `aria-label` for screen readers: "85 to 95 percent of registered businesses in Trinidad and Tobago".
- `prefers-reduced-motion` respected via `<Reveal>` and CSS parallax fallback (static image).

---

## 2. COMPLAINTS & QUERIES

### 2.1 Purpose & User Goal

| Dimension | Detail |
|---|---|
| **Business goal** | Surface trust and accountability; reduce friction for support requests. |
| **User goal** | Quickly find the right form (complaint vs. general query) and feel respected. |
| **Emotional register** | Honest, empathetic, straightforward — never corporate. |

### 2.2 Information Architecture

```
Eyebrow: "WE'RE LISTENING"
H2:      "Something not right? Let's fix it."

Apology line (body text):
  "If for some reason you received an error in your order or are
   unsatisfied, please accept our apology. Everyone is essential to us."

Two-card layout:
  Card A — Complaints
    Icon: AlertCircle (lucide)
    Title: "File a Complaint"
    Description: short supportive copy
    CTA: pill button → "/complaints" (or anchor to form)

  Card B — General Queries
    Icon: MessageCircle (lucide)
    Title: "Contact Us"
    Description: short supportive copy
    CTA: pill button → "/contact-us" (or anchor to form)

Respect line (small, muted):
  "We simply ask that you are respectful in doing so."
```

### 2.3 Layout & Visual Treatment

| Element | Spec |
|---|---|
| **Section bg** | `bg-lume-house` (dark green) — contrast band before FAQ |
| **Cards** | `bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8` |
| **Icon** | `h-10 w-10` inside a `bg-white/10 rounded-xl p-2.5` container |
| **Card title** | `text-[18px] font-semibold text-white` |
| **Card description** | `text-[14px] text-white/50 leading-[1.7]` |
| **CTA button** | `btn-pill bg-white text-lume-house text-[13px] font-semibold px-6 py-2.5` — inverted pill on dark bg |
| **Grid** | `grid sm:grid-cols-2 gap-6` centered at `max-w-3xl` |
| **Respect line** | `text-[13px] text-white/25 text-center mt-10` |

### 2.4 Motion

| Element | Animation | Timing |
|---|---|---|
| Eyebrow + H2 | `<Reveal>` stagger (eyebrow first, then H2 100ms later) | 1200ms / 1000ms |
| Body text | `<Reveal>` fade | 800ms, 200ms delay |
| Cards | `<Reveal>` stagger, direction="up" | 800ms each, 150ms apart |
| Respect line | `<Reveal>` direction="none" | 800ms, 400ms delay |

### 2.5 Responsive

- **Mobile:** Cards stack vertically. Full `px-6` gutter. H2 scales down via `clamp()`.
- **Desktop:** Side-by-side cards with equal height via CSS grid.

### 2.6 Accessibility

- Cards are `<a>` wrappers (entire card clickable) with `role="link"` and descriptive `aria-label`.
- CTA buttons have visible focus rings (`focus-visible:ring-2 ring-white/40`).
- Sufficient color contrast: white text on `bg-lume-house` passes WCAG AA for large text.

---

## 3. PAGE PLACEMENT

```
<Hero />
<About />
<HowItWorks />
<Sourcing />
<WhoItsFor />
<Testimonials />
<SmallMakers />          ← NEW
<ComplaintsAndQueries />  ← NEW
<FAQ />
<Newsletter />
<Footer />
```

**Rationale:** Small Makers deepens the sourcing/values narrative that peaks in `<Sourcing />` and `<Testimonials />`. Complaints & Queries sits on a dark band that naturally transitions into the `bg-ceramic` FAQ section, creating a satisfying light→dark→warm rhythm.

---

## 4. DEPENDENCIES

- No new packages needed.
- Components: `Reveal.tsx` (existing), `lucide-react` (existing).
- Routes: `/contact-us` and `/complaints` — these should exist or be created as form pages. For now, the buttons link to `#contact-us` / `#complaints` anchors (can be swapped to routes when forms are built).

---

*This spec follows the Lumë Design System documented in `docs/DESIGN_SYSTEM.md`.*
