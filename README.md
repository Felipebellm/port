# Portfolio

Personal portfolio site. A single-page **React (Vite)** app — bilingual (EN / PT-BR),
with all content sourced from static JSON files. No backend, no database.

## Stack

- **React 18 + Vite** — lives in [frontend/](frontend/)
- Content-driven: [frontend/src/portfolio/content/en.json](frontend/src/portfolio/content/en.json) and
  [pt-BR.json](frontend/src/portfolio/content/pt-BR.json)

## Run with Docker

```bash
docker compose up --build
```

| Service  | URL                    |
| -------- | ---------------------- |
| Frontend | http://localhost:5180  |

## Run without Docker

```bash
cd frontend
npm install
npm run dev   # http://localhost:5180
```

## Editing content

Everything on the page — hero, about, experience, projects, talks, contact — is
rendered by [frontend/src/portfolio/Portfolio.jsx](frontend/src/portfolio/Portfolio.jsx)
from the two JSON files above. To change the site's content, edit those JSON files;
no code changes needed. Language is auto-detected from the visitor's browser and can
be switched with the EN / PT-BR toggle (persisted in `localStorage`); see
[frontend/src/portfolio/useLocale.js](frontend/src/portfolio/useLocale.js).

> The previous static Apache version is archived under [_legacy_static/](_legacy_static/).
