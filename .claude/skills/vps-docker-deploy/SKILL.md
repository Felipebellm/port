---
name: vps-docker-deploy
description: Sets up a GitHub Actions CI/CD pipeline that deploys a project to a personal/company VPS running nginx, with separate staging and production environments. Despite the name, Docker is only used when the project has a backend service worth containerizing — static/frontend-only projects deploy natively via a git-pull + nginx pattern instead. Use this every time the user starts a new project and wants to deploy to their own VPS/server, mentions "set up my deploy pipeline", "GitHub Actions to my VPS", "staging and production server", "docker deploy to nginx", or is doing initial project setup and will need CI/CD to a self-hosted server. Always consult this instead of asking the user to re-explain their VPS setup, SSH access, or deploy flow from scratch — that context lives in this skill.
---

# VPS Docker Deploy Pipeline (GitHub Actions)

## What this skill is for

The user deploys projects to a **VPS** that runs **nginx**, with a **staging** and a **production** environment, using **GitHub Actions** for CI. This skill is the recipe so it doesn't need to be re-explained each time.

Despite the name, **Docker is only part of the picture** — it's used when a project has a backend service worth containerizing (e.g. a Laravel API + MySQL). Purely static/frontend-only projects are served natively by nginx with no container at all. Step 1 decides which path applies — don't assume Docker is needed just because this skill has "docker" in its name.

The load-bearing pattern across this user's VPS is **git-pull deploy**: GitHub Actions doesn't build or push anything itself. It SSHes into the VPS and runs a deploy script that already lives in the repo (checked out once on the VPS via git). That script does `git fetch && reset --hard` to sync code, then builds/restarts in place. There is **no container registry** (GHCR/Docker Hub) in this user's actual workflows — don't default to one; it adds a build stage, a registry login, and an image-pull step that nothing here needs.

## Step 0 — Security check (always do this first on a new VPS)

Ask the user (briefly, don't block on it if already confirmed before): "Is this VPS already set up with a non-root deploy user and SSH key auth, or still root+password?"

- **If this isn't the first project on this VPS**, ask instead whether to reuse the existing CI access: "Do your other projects here use a dedicated deploy user, or does GitHub Actions SSH in as root with an existing key?" If the user has other repos on this VPS cloned locally, check their `.github/workflows/*.yml` and any `scripts/deploy*.sh` — reading the actual working setup beats guessing, and matching what's already proven to work avoids fragmenting access across projects on the same box. In practice this user's existing projects SSH in as **root** using one shared key already sitting in `root`'s `authorized_keys` — that's a legitimate, established pattern here, not a mistake to correct.
- If still root+password with **no** existing key-based CI anywhere on the box: recommend switching before wiring up CI/CD, and walk through `references/ssh-key-setup.md`. Reasons if asked: password-over-SSH is the top vector for automated VPS compromise, and a leaked GitHub Secret with a password grants full root immediately.
- If key-based root access already exists and is used by other projects on this VPS: the pragmatic move is usually to reuse it (see `references/ssh-key-setup.md` → "Reusing an existing deploy key") rather than create a second, inconsistent access pattern. Note once that a leaked key still means full root, blast radius doesn't shrink just because it's "the pattern," but don't block on re-litigating an already-working setup.
- Never ask the user to paste a live password or private key into the chat. If they paste one anyway: don't echo it, don't write it to any file, and don't run any command that would put it into a shell history or tool-call transcript either (that's just relogging it somewhere else) — tell them to treat it as compromised and rotate it.
- If already key-based, skip to Step 1.

## Step 1 — Gather project specifics

Ask only for what isn't already known from the current conversation/repo context:

1. Project/repo name.
2. **Does this project have a backend/API service, or is it purely static (frontend-only)?** This decides everything downstream:
   - Static-only → nginx serves the built output directly via `root`. No Docker, no host port for the frontend.
   - Has a backend → the backend runs in Docker, **built and started on the VPS itself** (not pushed from CI), fronted by nginx proxying to `127.0.0.1:<port>`. Even then, a frontend build is typically still served natively via nginx `root` — this user's projects never containerize a pure frontend, backend or not.
3. Staging and production domains. If there's no custom domain for this project, ask whether the user uses a subdomain-prefix off an existing VPS hostname (e.g. `<project>.<base-domain>`) — common for side projects without their own domain, and the VPS provider may already wildcard-resolve it.
4. Branch strategy — default suggestion: `develop` → staging, `main` → production. Note: this user's existing projects are actually production-only (deploy from `main`, no staging branch at all) — that's a legitimate, simpler default too if the user doesn't need staging for this project.
5. Internal container port (only relevant if there's a backend in Docker), and whether other containers on this VPS already use that host port — ask, don't assume it's free.
6. VPS host/IP, deploy username, SSH port (default 22) — these become GitHub Secrets, never literal values in a file. If this VPS already runs other projects, these are very likely identical to another repo's secrets already — copy secret-to-secret in GitHub's UI, or retrieve the key from the VPS itself (see Step 6).
7. Registry: **default is no registry at all.** Deploy scripts build in place via git-pull. Only reach for GHCR/Docker Hub if the user explicitly wants CI-built images (e.g. multi-VPS deploys, or a VPS too constrained to build on).

If given partial info, proceed with the defaults above and state assumptions rather than asking everything again.

## Step 2 — Generate the GitHub Actions workflow(s)

Base on `assets/deploy-workflow.yml.template` — a **thin SSH trigger**, nothing else. It:
1. SSHes into the VPS (`appleboy/ssh-action`, using `secrets.VPS_HOST`, `secrets.VPS_USER`, `secrets.VPS_SSH_KEY`, `secrets.VPS_PORT`) and runs the deploy script already living in the repo on the VPS (e.g. `bash /var/www/<project>/scripts/deploy-production.sh`).
2. Runs a post-deploy HTTPS health check (`curl -o /dev/null -s -w "%{http_code}"` against the live domain), failing the job on anything but 200.

Always write `port: ${{ secrets.VPS_PORT || 22 }}` — **not** `port: ${{ secrets.VPS_PORT }}`. The bare form evaluates to an empty string and breaks the SSH step if the secret isn't set, instead of falling back to 22.

Create two files only if there's a staging environment (see Step 1):
- `.github/workflows/deploy-staging.yml` (push to the staging branch)
- `.github/workflows/deploy-production.yml` (push to the production branch)

Otherwise just the production one.

## Step 3 — Generate the deploy script (lives in the repo, runs on the VPS)

This is where static vs. backend actually diverges:

- **Static-only** → `assets/deploy-script-static.sh.template`: `git fetch/reset --hard/clean -fd` on the deploy branch, then `npm ci && npm run build` in place. Nothing else — nginx reads straight from `dist/`, no reload needed for content-only changes.
- **Has a backend** → `assets/deploy-script-docker.sh.template`: same git sync, then `docker compose -f docker-compose.prod.yml up -d --build --remove-orphans`, a wait-for-healthy loop, then app-specific post-deploy commands (migrations, cache clears) — these are project-specific, ask rather than guess.

One script per environment (`scripts/deploy-staging.sh`, `scripts/deploy-production.sh`), each pointed at that environment's own clone directory on the VPS (e.g. `/var/www/<project>` and `/var/www/<project>-staging`) so the two environments never share a working tree.

## Step 4 — nginx config

- **Static-only** → `assets/nginx-static-site.conf.template`: `root` pointing at the built output directory, `index index.html`, SPA fallback (`try_files $uri $uri/ /index.html`), aggressive caching on hashed static assets, no `proxy_pass`.
- **Has a backend** → `assets/nginx-site.conf.template` (reverse-proxy version): `proxy_pass` to `127.0.0.1:<host_port>`.

Before writing either, ask if the VPS already has shared nginx snippets other projects use (security headers, ACME-challenge handling, etc.) — check an existing project's config if one's available locally, and reuse the same `include` lines instead of inlining duplicates.

One rendered file per environment. Tell the user to:
1. Copy it to `/etc/nginx/sites-available/<domain>`
2. Symlink into `sites-enabled`
3. `nginx -t && systemctl reload nginx`
4. `certbot --nginx -d <domain>` for HTTPS

## Step 5 — One-time VPS bootstrap (do this *before* the first push)

Skipping or reordering this is the single most common reason the first deploy fails — say so plainly, and give the steps in this order:

1. `git clone <repo> /var/www/<project>` (plus a second clone on the staging branch into `/var/www/<project>-staging`, if applicable). `chmod +x` the deploy scripts.
2. Place the Step 4 nginx config(s), enable the site(s), `nginx -t && systemctl reload nginx`. The domain should now load over **plain HTTP**.
3. `certbot --nginx -d <domain>` for each environment. This is what actually fixes `ERR_SSL_UNRECOGNIZED_NAME_ALERT` (or any other SSL error) — the browser error just means nginx has no certificate/server block matching that hostname's SNI yet, which is exactly the state before this step runs.
4. Run the deploy script manually once (`bash /var/www/<project>/scripts/deploy-production.sh`) so build output exists before the first CI-triggered deploy.
5. **Only now** add the GitHub Secrets (Step 6) and push to the trigger branch. Pushing before secrets exist produces `Error: missing server host` in the Action log — harmless, just means Step 6 hasn't happened yet, not a deeper bug.

## Step 6 — Required GitHub Secrets

Add these under repo **Settings → Secrets and variables → Actions**:

- `VPS_HOST`
- `VPS_USER` (root, or a scoped deploy user — whichever this VPS already uses, see Step 0)
- `VPS_SSH_KEY` (private key contents)
- `VPS_PORT` (optional, defaults to 22)

If this VPS already has other projects deployed, these are very likely identical to another repo's secrets already. GitHub secrets are **write-only** — a saved value can't be viewed again, from this repo or any other. If the key still lives on the VPS where it was generated (common — the original setup often doesn't clean it up), retrieve it directly (`cat /root/.ssh/<key-file>`) rather than trying to reconstruct matching access from scratch. See `references/ssh-key-setup.md` → "Reusing an existing deploy key" for both that path and the fallback (mint a fresh key, append its public half to `authorized_keys`).

`GITHUB_TOKEN` for GHCR is automatic and only relevant if the project actually uses a registry (uncommon here — see Step 1).

## Step 7 — Deliver

Write the actual rendered files (not templates with placeholders):
- `.github/workflows/deploy-staging.yml` (if applicable) and `deploy-production.yml`
- `scripts/deploy-staging.sh` (if applicable) and `deploy-production.sh`
- `nginx-staging.conf` (if applicable) and `nginx-production.conf`

Then walk through Step 5's bootstrap checklist and Step 6's secrets checklist, **in that order** — pushing before both are done is the failure mode described in Step 5.5.

## Reference files
- `references/ssh-key-setup.md` — commands for a fresh VPS (new deploy user, SSH-key auth), **and** how to reuse or retrieve an existing deploy key when onboarding another project onto a VPS that already has one
- `assets/deploy-workflow.yml.template` — thin SSH-trigger GitHub Actions workflow (no build/registry step)
- `assets/deploy-script-static.sh.template` — VPS-side deploy script for static/frontend-only projects
- `assets/deploy-script-docker.sh.template` — VPS-side deploy script for projects with a Dockerized backend
- `assets/nginx-static-site.conf.template` — nginx config serving a static build directly
- `assets/nginx-site.conf.template` — nginx reverse-proxy config for a backend running in a container
