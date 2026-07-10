# Deploy pipeline status (for picking this up on another machine)

> **Update (July 2026)**: custom domain `felipebell.com` purchased at KingHost.
> New nginx site file: `nginx-felipebell.com.conf` (serves felipebell.com +
> www; old subdomain becomes a 301 redirect). Production health check in
> `deploy-production.yml` now targets https://felipebell.com/ — don't push
> that change until DNS + certbot for the new domain are live on the VPS.

No secrets/keys/passwords are in this file — only what's already public in the repo or generic facts.

## What's live right now

- **Production is deployed and working**: https://port.bell.vps-kinghost.net/
- Pattern: **no Docker for this project** (it's static-only) — nginx serves
  `frontend/dist` directly. GitHub Actions just SSHes into the VPS and runs
  a deploy script already checked out there; nothing is built in CI.
- VPS access: `VPS_USER=root`, reusing the **same SSH key already used for
  `bpagenda`/`bhelper`** on this VPS (not a new deploy user).
- GitHub Secrets already set on this repo: `VPS_HOST`, `VPS_USER`,
  `VPS_SSH_KEY` (optionally `VPS_PORT`). Nothing more to add for production.
- On the VPS: repo cloned at `/var/www/port`, nginx site config placed +
  enabled, certbot cert issued for `port.bell.vps-kinghost.net`.

## Not done yet — staging

Staging (`develop` branch → `port-staging.bell.vps-kinghost.net`) was scaffolded
in code but never actually bootstrapped:

- [ ] Create and push a `develop` branch (nothing exists there yet — only `main`)
- [ ] On the VPS: `git clone -b develop git@github.com:Felipebellm/port.git /var/www/port-staging`
      and `chmod +x /var/www/port-staging/scripts/*.sh`
- [ ] Copy `nginx-staging.conf` to `/etc/nginx/sites-available/port-staging.bell.vps-kinghost.net`,
      symlink into `sites-enabled`, `nginx -t && systemctl reload nginx`
- [ ] `certbot --nginx -d port-staging.bell.vps-kinghost.net`
- [ ] Run `bash /var/www/port-staging/scripts/deploy-staging.sh` once manually
- [ ] Push to `develop` and confirm `.github/workflows/deploy-staging.yml` succeeds

(Secrets are already shared between both workflows, so nothing new needed there.)

## Repo files relevant to this pipeline

- `.github/workflows/deploy-production.yml`, `deploy-staging.yml`
- `scripts/deploy-production.sh`, `deploy-staging.sh`
- `nginx-production.conf`, `nginx-staging.conf`
- `.claude/skills/vps-docker-deploy/` — the reusable skill, revised based on
  what actually broke/worked during this rollout (see its SKILL.md for the
  full recipe: git-pull deploy, no registry, static-vs-backend branch, etc.)

## Uncommitted as of this note

The skill revision under `.claude/skills/vps-docker-deploy/` was **not yet
committed** when this file was written — run `git status` to check before
assuming it's already pushed.

## Continuing on another computer

1. `git pull` this repo — gets you the project-level skill copy (in
   `.claude/skills/vps-docker-deploy/`) plus everything above, as long as it's
   been committed and pushed from this machine first.
2. The **personal** copy of the skill at `~/.claude/skills/vps-docker-deploy/`
   (which makes it usable from *other* project directories, not just this
   one) lives outside git and won't follow you automatically. On the other
   computer, copy it over again:
   ```bash
   mkdir -p ~/.claude/skills
   cp -r .claude/skills/vps-docker-deploy ~/.claude/skills/vps-docker-deploy
   ```
3. If you need `VPS_SSH_KEY` again on the other machine for anything manual
   (you generally won't — GitHub Actions already has it as a secret), retrieve
   it from the VPS itself (`cat /root/.ssh/<key-file>`), not from GitHub
   (secrets are write-only) and not from this repo (never stored here).
