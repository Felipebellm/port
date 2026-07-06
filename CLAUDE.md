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
  is a single scrolling page with hash-anchor nav: `#about`, `#experience`, `#projects`,
  `#talks`, `#contact`).
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

Contact is a `mailto:` CTA (`contact.cta` / `contact.email`) — there is no backend to
receive form submissions.

## Conventions

- No CSS framework or Sass — `Portfolio.jsx` is self-contained (CSS-in-JS via a
  template-literal `<style>` block + inline `style` props).
- Don't add routing, state management, or a backend unless explicitly asked — the
  project was deliberately reduced to a static content-driven SPA.

> The original static Apache site is archived in `_legacy_static/` (kept only for the color palette
> reference; not part of the build).
