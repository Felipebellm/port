# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio. A **single-page React (Vite) app** — no backend, no database. All
content (hero, about, experience, projects, talks, contact) is bilingual (EN / PT-BR)
and lives in static JSON files, rendered by one component.

## Build & Run

```bash
docker compose up --build    # Vite dev server → :5180
```

Frontend-only dev (no Docker): `cd frontend && npm install && npm run dev`.

## Architecture

Everything lives in [frontend/](frontend/):

- `src/main.jsx` — entry point, renders `<Portfolio />` directly (no router — the site
  is a single scrolling, single-column page: hero → `#projects` → `#about` → `#experience`
  → `#talks` → `#contact`). Section links (hero nav + the floating `SideNav` that fades in
  after the hero) scroll via Lenis and focus the section heading.
- `src/portfolio/Portfolio.jsx` — the entire page. Renders purely from the active
  locale's content object; all styling is a single injected `<style>` tag (`fbm-*`
  classes) plus inline styles, no CSS framework. The look is **Punk Grunge** (see
  `/DESIGN.md`): a wall with paper pasted on it. Surfaces set local variables that every
  component reads (`--bg`, `--fg`, `--fg-strong`, `--mut`, `--ln`, `--focus`): the wall is
  the default, `.fbm-paper` (sheets) and `.fbm-band` (the torn About band) re-point them.
  Use those variables inside components instead of picking a color token per surface.
- `src/portfolio/useLocale.js` — picks `en` or `pt-BR` (browser-language auto-detect,
  overridable via the EN / PT-BR toggle, persisted in `localStorage`), and keeps
  `<html lang>` / `document.title` / the meta description in sync.
- `src/portfolio/useTheme.js` — dark (default) / light theme on `<html data-theme>`, saved in
  `localStorage("theme")`, OS preference as fallback; `index.html` sets it before first paint.
  Dark is palette 16 Acid Flyer (black wall, lime accent), light is 15 Xerox Riot (grey wall,
  red accent), both from the Design Reference in BPAgenda Projects. Theme colors are DESIGN.md
  tokens with a `-light` suffix, emitted by `gen-tokens.mjs` as a `:root[data-theme="light"]`
  override — never branch on the theme in JS for colors. The light theme's red is 4.2:1 on the
  wall: fills, large type and marks only, never small text.
- `src/portfolio/content/en.json`, `src/portfolio/content/pt-BR.json` — the actual
  content. **To change what's on the site, edit these files** — no component changes
  needed for text, project entries, experience roles, etc.

### Content shape

Each locale JSON has: `meta`, `ui`, `hero`, `nav`, `about`, `experience.roles[]`,
`projects.live[]` / `projects.internal[]` (project cards, each with a `variant`:
`featured` | `internalFlagship` | `simple` | `compact`, driving which card layout
`Portfolio.jsx` renders), `talks.items[]`, `contact`, `social`, `footer`. Keep both
locale files structurally identical — `Portfolio.jsx` indexes into them positionally
(e.g. `c.experience.roles.map(...)`).

On desktop with motion allowed, Projects renders as `ProjectTower`: a scroll-pinned 3D ring of all
live + internal cards, styled as taped paper flyers. The front card faces the viewer, with one neighbour
on each side, above a vinyl record that turns with the ring. Screenshots on tower cards are xeroxed at
rest and turn full colour on hover/focus (always full colour on touch, in the dialog and in the stacked
list). The spin is driven by CSS scroll-driven animations where supported; elsewhere a JS fallback sets
the same `--tp`/`--k` vars. `--e`/`--o` (JS) spin the ring in and out as the section arrives and leaves,
mirror images of each other. Prev/next arrows, the bottom rail, ←/→ keys and clicking a neighbour all
scroll to that card's position (`goTo`). Mobile / reduced-motion get the stacked card list. Tower cards
show a summary; "Details" opens the full card in a `<dialog>`.
Smooth wheel scrolling uses **Lenis** (the one runtime dependency besides React, added on
request). The tower has its own small snap (Lenis `virtual-scroll` listener) that settles on a card
**only while the section is pinned**, so nothing pulls you into the section or holds you back from
leaving it. Don't swap it for `lenis/snap`: its snap points pull visitors back past the last card.
Lenis is skipped under reduced motion. Don't add CSS `scroll-snap` or `scroll-behavior: smooth`, which
fight Lenis.
Animations use **Motion** (`motion@12`, `motion/react`) via `<LazyMotion strict>` — use `m.*`
components, never `motion.*`; features load lazily from `src/portfolio/motionFeatures.js`.
Presets live at the top of `Portfolio.jsx`: `stamp()` (a sheet lands rotated and over-scaled, then
settles), `reveal()` (the quiet version for text), `press`, `heroChild()`, `SPRING`.
Don't put CSS transitions on `transform`/`opacity` of Motion-animated elements. Buttons drop into
their hard shadow with the CSS `translate` property (`.fbm-btn`), which Motion never touches.

Parallax is the one big movement. The hero is a stack of `<Layer>`s (halftone sun, accent slab,
portrait, name lines, scrawls), each with its own `speed` / `drift` / `depth` / `rot`, fed by the
hero's scroll progress and the pointer through the `HeroFx` context. `mode` is `full` on desktop,
`lite` on mobile (shorter travel, no pointer) and `off` under reduced motion. Between sections,
`<Ghost>` (the oversized outlined section name) and `<TornStrip>` drift sideways with scroll.

Torn edges are `clip-path` polygons from `torn(seed, …)`: give every new torn element its own seed.
Hand scrawls are SVG paths (`SCRAWLS`, `HERO_SCRAWLS`) drawn in with `pathLength`; don't add a marker
font. The hero name renders the first and last words in display type and the middle name as ransom
tiles; the plain name is in a visually hidden span for assistive tech.
The hero portrait is `hero.photo` in the content JSON → `frontend/public/images/profile.jpg`; the
halftone look is CSS (`.fbm-halftone`), so a new photo needs no editing.

Contact is a `mailto:` CTA (`contact.cta` / `contact.email`) — there is no backend to
receive form submissions.

## Conventions

- No CSS framework or Sass — `Portfolio.jsx` is self-contained (CSS-in-JS via a
  template-literal `<style>` block + inline `style` props).
- Design tokens live in `/DESIGN.md` (Google Labs design.md format). `cd frontend && npm run tokens`
  regenerates `src/portfolio/tokens.css` (CSS vars, `--font-*` stacks + `.t-*` type classes, with font
  sizes converted to `rem` and line-heights to unitless); `npm run lint:design` validates it. In
  `Portfolio.jsx` use `v("token")` / `mix("token", pct)` / `sp()` / `r()` / `f("display"|"mono"|"body")`
  and `.t-*` classes — never raw hex or font sizes. Don't edit `tokens.css` by hand.
- Fonts are Anton (display, one weight: never bold, never under 18px), Courier Prime (labels, meta)
  and Manrope (reading text), loaded from `index.html`. Every radius is zero; depth is a 2px border
  plus a hard offset shadow. No gradients, glows or soft shadows.
- The chaos stays in the hero. Below it, only headings, dividers, frames, tape and texture carry the
  style; paragraphs stay plain on a capped measure (`.fbm-prose`).
- Don't add routing, state management, or a backend unless explicitly asked — the
  project was deliberately reduced to a static content-driven SPA.

> The original static Apache site is archived in `_legacy_static/` (kept only for the color palette
> reference; not part of the build).
