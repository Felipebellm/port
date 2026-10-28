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
  classes) plus inline styles, no CSS framework.
- `src/portfolio/useLocale.js` — picks `en` or `pt-BR` (browser-language auto-detect,
  overridable via the EN / PT-BR toggle, persisted in `localStorage`), and keeps
  `<html lang>` / `document.title` / the meta description in sync.
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

On desktop with motion allowed, Projects renders as `ProjectTower` (a scroll-pinned 3D helix
of all live + internal cards; spin driven by CSS scroll-driven animations where supported, JS
fallback setting the same `--tp`/`--k` vars otherwise). Mobile / reduced-motion get the stacked
card list. Tower cards show a summary; "Details" opens the full card in a `<dialog>`.
Smooth wheel scrolling uses **Lenis** (the one runtime dependency besides React, added on
request); its `lenis/snap` plugin snaps the tower to cards. Lenis is skipped under reduced
motion. Don't add CSS `scroll-snap` or `scroll-behavior: smooth` — they fight Lenis.

Contact is a `mailto:` CTA (`contact.cta` / `contact.email`) — there is no backend to
receive form submissions.

## Conventions

- No CSS framework or Sass — `Portfolio.jsx` is self-contained (CSS-in-JS via a
  template-literal `<style>` block + inline `style` props).
- Design tokens live in `/DESIGN.md` (Google Labs design.md format). `cd frontend && npm run tokens`
  regenerates `src/portfolio/tokens.css` (CSS vars + `.t-*` type classes); `npm run lint:design`
  validates it. In `Portfolio.jsx` use `v("token")` / `mix("token", pct)` / `sp()` / `r()` and `.t-*`
  classes — never raw hex or font sizes. Don't edit `tokens.css` by hand.
- Don't add routing, state management, or a backend unless explicitly asked — the
  project was deliberately reduced to a static content-driven SPA.

> The original static Apache site is archived in `_legacy_static/` (kept only for the color palette
> reference; not part of the build).
