---
name: vps-docker-deploy
description: Sets up a GitHub Actions CI/CD pipeline that builds a Docker image and deploys it to a personal/company VPS running nginx as a reverse proxy, with separate staging and production environments. Use this every time the user starts a new project and wants to deploy to their own VPS/server, mentions "set up my deploy pipeline", "GitHub Actions to my VPS", "staging and production server", "docker deploy to nginx", or is doing initial project setup and will need CI/CD to a self-hosted server. Always consult this instead of asking the user to re-explain their VPS setup, SSH access, or deploy flow from scratch — that context lives in this skill.
---

# VPS Docker Deploy Pipeline (GitHub Actions)

## What this skill is for

The user builds locally with **Docker** and deploys to a **VPS** that runs **nginx** as a reverse proxy, with both a **staging** and a **production** environment. Every new project needs the same GitHub Actions pipeline wired up. This skill is the recipe so it doesn't need to be re-explained each time.

## Step 0 — Security check (always do this first, every new VPS)

Ask the user (briefly, don't block on it if they already confirmed before): "Is this VPS already set up with a non-root deploy user and SSH key auth, or still root+password?"

- If still root+password: strongly recommend switching before wiring up CI/CD. Walk them through `references/ssh-key-setup.md`. Reasons to give if asked: password-over-SSH (especially root) is the top vector for automated VPS compromise, and a leaked GitHub Secret with a password grants full root — a leaked deploy key scoped to a limited user is a much smaller blast radius.
- Never ask the user to paste a live password or private key into the chat. Passwords/keys go into GitHub Secrets, generated locally, not typed into the conversation. If the user pastes one anyway, don't echo it back or write it into any generated file.
- If they say it's already key-based with a deploy user, skip straight to Step 1.

## Step 1 — Gather project specifics

Ask only for what isn't already known from the current conversation/repo context:

1. Project/repo name
2. Internal container port the app listens on (e.g. `3000`)
3. Staging domain (e.g. `staging.example.com`) and production domain (e.g. `example.com`)
4. Branch strategy — default suggestion if user has no preference: `develop` → staging, `main` → production
5. Single container, or does it need a database/other services (docker-compose)?
6. Registry: default recommendation is **GHCR** (`ghcr.io`), using the repo's built-in `GITHUB_TOKEN` — no extra account needed. Only use Docker Hub if the user already has a workflow around it.
7. VPS host/IP, deploy username, SSH port (default 22) — these become GitHub Secrets, not literal values in the workflow file.

If the user gives partial info (e.g. only says "docker + nginx, staging and prod"), proceed with the defaults above and state the assumptions rather than asking everything again.

## Step 2 — Generate the GitHub Actions workflows

Base both workflows on `assets/deploy-workflow.yml.template`. Create **two** files in the user's repo:
- `.github/workflows/deploy-staging.yml` (triggers on push to the staging branch)
- `.github/workflows/deploy-production.yml` (triggers on push to the production branch)

Substitute the template placeholders (`__ENVIRONMENT__`, `__BRANCH__`, `__PROJECT_NAME__`, `__GITHUB_OWNER__`, `__CONTAINER_PORT__`, `__HOST_PORT__`) with the values gathered in Step 1. Use a different `__HOST_PORT__` for staging vs production so both containers can run on the same VPS at once (e.g. staging on 8081, production on 8080) — nginx is what exposes each on the public domain via port 80/443.

The workflow: checkout → build & push Docker image to GHCR tagged with the git SHA → SSH into the VPS (via `appleboy/ssh-action`, using `secrets.VPS_HOST`, `secrets.VPS_USER`, `secrets.VPS_SSH_KEY`, `secrets.VPS_PORT`) → on the VPS, pull the new image, stop/remove the old container, run the new one bound to `127.0.0.1:<host_port>` only (nginx handles the public-facing side, so don't expose the container port directly to the internet) → prune old images.

## Step 3 — nginx reverse proxy config

Use `assets/nginx-site.conf.template`, one rendered file per environment, substituting `__DOMAIN__` and `__HOST_PORT__`. Tell the user to:
1. Copy it to `/etc/nginx/sites-available/<project>-<environment>` on the VPS
2. Symlink into `sites-enabled`
3. `sudo nginx -t && sudo systemctl reload nginx`
4. Run `sudo certbot --nginx -d <domain>` for HTTPS if not already certified (mention this step, don't run it for them)

## Step 4 — Required GitHub Secrets (give this exact checklist)

Tell the user to add these under repo **Settings → Secrets and variables → Actions** (one set, shared by both workflows unless they want fully separate VPS hosts per environment, in which case suffix with `_STAGING` / `_PRODUCTION`):

- `VPS_HOST`
- `VPS_USER` (the deploy user, not root)
- `VPS_SSH_KEY` (private key contents, from `references/ssh-key-setup.md`)
- `VPS_PORT` (optional, defaults to 22 if omitted from the template)

`GITHUB_TOKEN` for GHCR is automatic — no secret needed for that part.

## Step 5 — Deliver

Write the actual rendered files (not templates with placeholders) for the user's specific project:
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-production.yml`
- `nginx-staging.conf` and `nginx-production.conf` (for them to copy onto the VPS)

Then give the Step 4 secrets checklist inline as the last thing, since that's the one manual step left for the user.

## Reference files
- `references/ssh-key-setup.md` — exact commands for creating a deploy user and switching to SSH-key auth (read this whenever Step 0 flags root/password access)
- `assets/deploy-workflow.yml.template` — GitHub Actions workflow template
- `assets/nginx-site.conf.template` — nginx reverse-proxy server block template
