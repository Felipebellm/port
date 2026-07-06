# GitHub Analysis & Improvement Plan — @Felipebellm

**Date:** July 2026 · **Repos analyzed:** 10 public repositories (code cloned and reviewed, not just metadata)

**Repos:** BellsMVC · sharedPost · desafio-backend-PHP · CV · ScalesMapApp · Lyrics · port · BKamban · study · Atividades_nivel2

---

## Executive summary

Your GitHub has genuinely good raw material — a hand-built MVC framework, a Laravel challenge with unit tests and interfaces, an Angular/Firebase app with real CI, and a React CV with i18n. But almost none of it is *presented*: no profile README, no pinned repos, no repo descriptions or topics, and READMEs that are one or two lines. A recruiter spending 60 seconds on your profile today sees `study`, `BKamban` (an empty repo), and Python beginner exercises before they ever find BellsMVC. The work below is mostly writing and housekeeping, not coding — high return for low effort.

**Priority order:** Topic 1 (profile) → Topic 2 (BellsMVC) → Topic 3 (documentation) → Topic 7 (security/legal, quick fixes) → everything else.

---

## Topic 1 — Profile-level presentation (highest impact, ~2 hours)

- [ ] **Create a profile README.** New repo named exactly `Felipebellm` with a `README.md`. Content: 3–4 line intro (Full Stack Developer · PHP/Laravel/WordPress · 10+ years, mainframe→web), tech-stack badges (shields.io), link to portfolio (once live), LinkedIn, email.
- [ ] **Pin 6 repos manually** (Profile → Customize your pins). Suggested order: `BellsMVC`, `sharedPost`, `desafio-backend-PHP`, `ScalesMapApp`, `CV`, and (future) `zeferino-architecture`. Right now GitHub auto-shows "Popular repositories," which surfaces `study` and `Atividades_nivel2` — beginner-signal repos.
- [ ] **Add your name, bio, location, and website** to the profile settings. Currently the profile shows only the username.
- [ ] **Add a description + topics to every repo** (Settings → About on each repo). None of your repos have descriptions. Topics to use across repos: `php`, `mvc`, `laravel`, `docker`, `mysql`, `angular`, `react`, `firebase`, `scss`, `oop`.

---

## Topic 2 — BellsMVC (your flagship — make it look like one)

**What I found:** Classic front-controller MVC (Core → Controller → View), PDO wrapper with typed bindValue, spl_autoload for libraries, Docker environment (PHP 8.2 Apache + MySQL 8 + phpMyAdmin), 8 commits, README is two lines ("Personal PHP MVC").

### Documentation
- [ ] **Write a real README** — this is the single most important item on this list. Sections: what it is and why you built it, architecture diagram (URL → Core router → Controller → Model/View), folder structure, features (routing convention `/controller/method/params`, PDO abstraction, Docker one-command startup), quick start (`docker-compose up -d` → localhost:8000, phpMyAdmin on 8080), roadmap.
- [ ] **Add a LICENSE** (MIT is fine) — signals a serious open-source repo.
- [ ] Mention that an evolved version of this framework powers a production back-office platform (multi-DB, RBAC, CI/CD) — link to the future `zeferino-architecture` showcase repo.

### Code quality & security (reviewers *will* open these files)
- [ ] **Stop echoing PDO errors** (`Database.php` catches the exception and `echo`es the message — leaks connection details). Log it and show a generic error instead; even better, port your Zeferino context-aware error helper (HTML for web / plain text for CLI) into BellsMVC.
- [ ] **Move credentials out of `config.php`.** `root/root` is hardcoded, while your `docker-compose.yml` already injects `MYSQL_*` env vars that the app ignores. Read them with `getenv()` — small change, big "this person knows 12-factor" signal.
- [ ] **Harden the router.** `Core::getUrl()` uses `FILTER_SANITIZE_URL`, which does not strip `.` or `/`, and the controller name is fed into `file_exists('../app/controllers/' . ucwords($url[0]) . '.php')` + `require_once`. Whitelist with a regex like `preg_match('/^[a-zA-Z0-9_]+$/', $segment)` before touching the filesystem to close any path-traversal angle.
- [ ] **The `app/models/` directory doesn't exist** but `Controller::model()` requires from it — add it with a sample model so the pattern is complete.
- [ ] **Adopt Composer + PSR-4 namespaces.** Currently there are no namespaces and no `composer.json`. Migrating the autoload to Composer is exactly the kind of refactor that shows OOP maturity (and it's a great commit series for the graph).
- [ ] Reconsider `PDO::ATTR_PERSISTENT => true` as a default (surprising behavior under Apache prefork; make it configurable).
- [ ] **Fix comment typos** ("controoller", "Requirre", "Autolood", "HGet") — trivial, but this is a showcase repo and reviewers notice polish.

### Engineering signals
- [ ] **Add tests** (even 3–4 PHPUnit tests for the router and Database wrapper) and a **GitHub Actions workflow** that runs them. A green Actions badge on your own framework is a strong senior signal.
- [ ] Tag a release (`v1.0.0`) and keep a small CHANGELOG.

---

## Topic 3 — Documentation & READMEs (cross-cutting)

Current state per repo: `BellsMVC` 2 lines · `sharedPost` 1 line · `ScalesMapApp` title only · `CV` still the default Create-React-App README (with a `README.old.md` left behind) · `Lyrics` a `readme.txt` saying "first file" · `desafio-backend-PHP` the only real README (good!) · `BKamban`/`study` empty repos.

- [ ] Minimum README template for every kept repo: **what it is → screenshot or GIF → tech stack → how to run → what you learned/why it exists.**
- [ ] `CV`: delete the CRA boilerplate README and `README.old.md`; describe the actual project (React CV with EN/PT i18n via i18next, PDF export via jspdf/html2canvas, SCSS, gh-pages deploy). Add the live GitHub Pages link to the repo's About field.
- [ ] `desafio-backend-PHP`: README is solid but PT-only — make it **bilingual or English-first** (you're marketing fluency in English). Also remove the `chmod -R 777 .` step from the install instructions (bad-practice red flag in an otherwise clean repo; use proper `storage/` + `bootstrap/cache` permissions).
- [ ] Standardize on `README.md` (the `Lyrics` repo uses `readme.txt`).

---

## Topic 4 — Repo hygiene & curation

- [ ] **Delete or make private:** `BKamban` (contains only a `.gitignore` — an empty public repo looks abandoned) and `study` (empty).
- [ ] **Archive or make private:** `Atividades_nivel2` (Python beginner exercises, "Add files via upload" commit — undermines the senior narrative).
- [ ] **`port` is your portfolio starter** (HTML/SCSS + Docker + Apache config, 1 commit, no README). Rename it to `portfolio`, and use it to host the site you're about to build with Claude Design — then the repo itself becomes part of the story. Also: it has `logs/error.log` and `access.log` committed — remove them and gitignore `logs/`.
- [ ] **Stop committing build artifacts:** `ScalesMapApp` commits `dist/` (and compiled `.css`/`.css.map` files appear in `Lyrics` and `port`). Gitignore them; for `ScalesMapApp` the Firebase workflow builds anyway. (Committing compiled CSS is legitimate for the Zeferino server with no Node — but say so in the README when you do it intentionally.)
- [ ] **Improve commit messages.** Current history includes "update", "fix", "finished", "first file". Adopt a simple convention (`feat:`, `fix:`, `docs:`, `refactor:`) going forward — recruiters do read the commit list of a pinned repo.
- [ ] Keep the contribution graph alive with small, regular commits (docs count!). Most repos show single bursts of activity.

---

## Topic 5 — Per-repo deep notes

### sharedPost (best demo app of your MVC — promote it)
Full CRUD social-post app built on the BellsMVC pattern: auth (register/login), session + URL helpers, `User`/`Post` models, Bootstrap views, Docker. 16 commits.
- [ ] Write a README with screenshots (register → login → create/edit/delete posts) and explicitly frame it as "*a demo application built on my own BellsMVC framework*" — linking the two repos multiplies their value.
- [ ] Include a SQL seed/migration file so anyone can run it in one command.
- [ ] Check the same security items as BellsMVC (error echoing, credentials, password hashing — verify `password_hash()`/`password_verify()` are used in `Users.php`).

### desafio-backend-PHP (your best-engineered public repo)
Laravel currency ISO-4217 service: `CurrencyService`, `GuzzleHttpClient` + `WikipediaCurrencyParser` behind `HttpClientInterface`/`CurrencyParserInterface` (dependency inversion!), unit tests, Docker + Makefile.
- [ ] Add GitHub Actions running PHPUnit — you already have the tests; the green badge is free credibility.
- [ ] English README (see Topic 3) + description/topics: `laravel`, `php`, `guzzle`, `solid`, `unit-testing`, `docker`.
- [ ] In the README, call out the interface-driven design in one sentence — it's the most impressive part and it's currently invisible.

### ScalesMapApp (has real CI — surface it)
Angular + Firebase Hosting with two GitHub Actions workflows (merge + PR previews), Transloco/ngx-translate i18n, guitar-scales concept.
- [ ] Add the live Firebase URL to the repo About field and README (with a screenshot/GIF).
- [ ] Remove `dist/`, `.firebase/` cache, and the unused `@material-ui/*` packages (React libraries inside an Angular app will raise eyebrows) — also `update` as a dependency looks accidental.
- [ ] Trim the committed icon asset pack (hundreds of PNGs) or move to a CDN/sprite.

### CV (nice hidden gem)
React CV with EN/PT language switch and PDF download.
- [ ] Deploy it (`npm run deploy` script already targets gh-pages) and link it from your profile README and portfolio.
- [ ] Consider renaming to `interactive-cv` or `cv-react` for clarity.

### Lyrics
BellsMVC-based app serving song PDFs. See Topic 7 (legal) — this one needs action before you pin anything.

---

## Topic 6 — DevOps & CI/CD story

You market Docker + CI/CD heavily (rightly — the Zeferino pipeline is impressive), but on public GitHub only `ScalesMapApp` has Actions, and it's a Firebase template.
- [ ] Add a simple CI workflow to `BellsMVC` (PHP lint + PHPUnit) and `desafio-backend-PHP` (tests). Two green badges make the "CI/CD" claim on your portfolio verifiable.
- [ ] **Create the `zeferino-architecture` showcase repo** (as planned in your project notes): architecture diagram (MVC flow, the 5 database connections, deployment pipeline), the GitHub Actions self-hosted-runner workflow YAML with secrets redacted, and 3–4 sanitized snippets — the routing access gate, the multi-DB abstraction, the CLI/web-aware error helper. This gives your portfolio's flagship project something clickable and is the strongest possible pin alongside BellsMVC.
- [ ] Unify your Docker patterns: BellsMVC, sharedPost, Lyrics, and port each have near-identical Dockerfile/compose setups. Mention in BellsMVC's README that the environment is reusable (or extract a `bells-docker-env` template repo).

---

## Topic 7 — Security & legal (do these first, they're quick)

- [ ] **`Lyrics` repo hosts copyrighted song lyrics as PDFs** (Californication, Zombie, Hypnotize, etc.) publicly. That's a real copyright exposure and a bad look on a professional profile. Make the repo private, or strip the `public/docs/*.pdf` files (including from git history — `git filter-repo`) and keep only the app code with placeholder files.
- [ ] Committed credentials: all `config.php` files hardcode `root/root`. Local-dev only, but move to env vars anyway (see Topic 2) — reviewers grep for this.
- [ ] `port/logs/` committed access/error logs — delete and gitignore.
- [ ] Quick scan for anything Zeferino-specific accidentally committed in public repos before creating the showcase repo (hostnames, IPs, store names in code).

---

## Suggested 4-week plan

**Week 1 (presentation):** profile README, pins, bio, descriptions + topics on all repos, delete/archive `BKamban`, `study`, `Atividades_nivel2`, fix the `Lyrics` copyright issue.
**Week 2 (flagship):** full BellsMVC README + LICENSE, security fixes (error echo, env vars, router whitelist), fix typos, add models dir.
**Week 3 (proof):** PHPUnit + GitHub Actions on BellsMVC and desafio-backend-PHP, sharedPost README with screenshots, deploy the CV app.
**Week 4 (showcase):** build `zeferino-architecture` repo, rename `port` → `portfolio` and ship the Claude Design site there, English README for desafio-backend-PHP.
