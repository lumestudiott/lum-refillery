# Lumë Refillery — Design System

Inspired by the Starbucks design system (motion, illustration, typographic restraint) and Farm to People's clean editorial commerce layout. This is the source of truth for every page **except** the landing page (which has its own cinematic treatment).

## Principles

1. **Editorial first** — generous whitespace, large display headings, restrained palette.
2. **Motion has purpose** — reveal content as you scroll, never animate for decoration.
3. **Cards are the unit** — products, hauls, partners, testimonials all live in soft-shadow rounded cards.
4. **Pill buttons, dark CTAs** — primary action is always a dark `bg-lume-house` rounded-full button.
5. **Honest pricing** — never hide the price; show units (`/lb`, `/L`).
6. **Trinidad-grounded** — partners, sourcing origins, cultural cues should feel local, not generic.

---

## Tokens (already in `globals.css`)

### Easing
| Token | Curve | Use |
|---|---|---|
| `--ease-settle` | `cubic-bezier(0.22, 0.61, 0.36, 1)` | **Default**. Anything that arrives or settles. |
| `--ease-press` | `cubic-bezier(0.32, 2.08, 0.61, 0.27)` | Button press / scale-down. |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Cards entering on scroll. |
| `--ease-pour` | `cubic-bezier(0.76, 0, 0.24, 1)` | Slow, ceremonial fades. |
| `--ease-steam` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Ambient loops. |

### Duration scale
| Token | ms | Use |
|---|---|---|
| `--duration-instant` | 80 | Hover color flicker. |
| `--duration-fast` | 120 | Hover bg, link underline. |
| `--duration-snap` | 220 | Button press, tap feedback. |
| `--duration-base` | 260 | Standard click → state. |
| `--duration-measured` | 380 | Modal open, drawer slide. |
| `--duration-deliberate` | 440 | Card hover lift. |
| `--duration-page` | 480 | Page-section reveal. |
| `--duration-long` | 560 | Hero copy fade-in (default for `Reveal`). |
| `--duration-ceremony-beat` | 800 | Big-feature highlight. |

**Rule of thumb:** Click-feedback ≤ 220ms. Content reveal ≥ 440ms. Never exceed 800ms unless ceremonial.

---

## Type

- **Display**: `font-display` (DM Serif Display) — page titles, section H2s only.
- **Body / UI**: Inter — everything else.
- **Eyebrow**: 13px, semibold, uppercase, `tracking-[0.15em]`, accent green.
- **Page H1**: `font-display text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.1] tracking-snug`.
- **Section H2**: same as H1 but slightly smaller; reuse the H1 spec for impact.

---

## Color Roles

| Role | Var | Use |
|---|---|---|
| Surface (canvas) | `bg-canvas` | Page background. |
| Surface elevated | `bg-white` | Cards, drawers. |
| Surface inverse | `bg-lume-house` | Hero footers, dark CTAs. |
| Accent | `bg-lume-accent` (deep green) | Primary brand action, badges. |
| Text primary | `text-text-primary` | Headings, body. |
| Text secondary | `text-text-secondary` | Captions, metadata. |

Never use pure black or pure white text. Always the token.

---

## Layout grid

- Max content width: `max-w-7xl` (≈1280px).
- Page gutter: `px-6 lg:px-10`.
- Vertical rhythm: section separation = `py-20` to `py-28`. Inner blocks = `gap-6` or `gap-12`.
- Header offset: `pt-[72px]` on every non-home page (the fixed header is 72px).

---

## Page-shell pattern

Every non-home page MUST use this shell:

```tsx
<div className="min-h-screen bg-canvas text-text-primary">
  <Header />
  <main className="pt-[72px]">
    {/* optional sub-nav with category tabs */}
    {/* hero / page header */}
    {/* content sections */}
  </main>
  <Footer />
</div>
```

Sub-nav (Farm-to-People style) is the default for **catalog-like pages** (`/shop`, `/pricing`, `/sample-hauls`).

---

## Motion patterns

### 1. Scroll reveal (`<Reveal>`)
The default content-entry animation. 24px translate-up + opacity, 560ms, `ease-settle`. Use `<Reveal>` from `@/components/Reveal` not `framer-motion` for performance on long pages.

### 2. Stagger group
For lists (cards, items): parent `framer-motion` with `staggerChildren: 0.08` (80ms), child fades up 32px in 560ms.

### 3. Hover lift
Cards lift `y: -4` over 440ms `ease-settle`, shadow grows from `shadow-card` to `shadow-soft-float`.

### 4. Button press
`whileTap={{ scale: 0.97 }}` or CSS `active:scale-[0.97]`. 220ms `ease-press`.

### 5. Drawer / modal
Side drawer: `x: '100%' → 0`, spring `damping: 30 stiffness: 280`. Backdrop fades 200ms.

### 6. Page transition (entry)
On mount: stagger the **eyebrow → H1 → subtitle → CTA** with 80ms gap, each 560ms.

### 7. Reduced motion
Always respect `prefers-reduced-motion`. The CSS in `globals.css` already kills animations to 0.01ms.

---

## Component library (existing & to use)

- `Header.tsx` — fixed top, dark on home, white-blur on scroll/non-home.
- `Footer.tsx` — 4-column with newsletter.
- `Reveal.tsx` — IntersectionObserver-based fade-up.
- `shop/ProductCard.tsx` — square image + name + price + "Add" pill.
- `shop/CartDrawer.tsx` — side drawer.
- `TierCard.tsx` — haul card with badges, image, title+price, "What's Inside".

Reach for these before writing new ones.

---

## Page redesign checklist

When redesigning any non-home page:

- [ ] Wrap in `<Header /> + <main className="pt-[72px]"> + <Footer />`.
- [ ] Use `bg-canvas` surface; cards are `bg-white` with `shadow-card` and `rounded-2xl`.
- [ ] First section is a page hero: eyebrow + H1 + subtitle. Stagger entry on mount.
- [ ] If catalog-like, add the white sub-nav with underline-active tabs (see `/shop`).
- [ ] Replace any `whileInView` framer-motion content animations with `<Reveal>` for long pages; keep framer-motion for ambient/hover only.
- [ ] Pill buttons: dark `bg-lume-house` for primary, `bg-white border` for secondary.
- [ ] Include real Trinidad imagery / sourcing copy where relevant.
- [ ] Run `npx tsc --noEmit` after — no `any`, no unused imports.

---

## DON'Ts

- Don't add purple/blue accents. Stay in the green/cream/stone palette.
- Don't use `font-display` for body or buttons.
- Don't animate everything on the page — the more you animate, the less anything stands out.
- Don't put more than one primary CTA per viewport.
- Don't use pure motion-only sections without a textual purpose.
