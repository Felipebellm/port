# Switching a VPS from root+password to key-based deploy access

Do this once per VPS. Test key login before disabling password auth, so you don't lock yourself out.

**If this VPS already has another project deployed with a working GitHub Actions → SSH pipeline, skip to "Reusing an existing deploy key" at the bottom instead of generating a new user/key.** Fragmenting access (a different user or key per project on the same box) adds operational overhead without adding real security, since compromising any one of them still means full access to whatever that key can reach.

## 1. Generate a dedicated deploy key (on your local machine, not the VPS)

```bash
ssh-keygen -t ed25519 -C "deploy@<project>" -f ./deploy_key -N ""
```

This creates `deploy_key` (private) and `deploy_key.pub` (public). No passphrase, since GitHub Actions needs to use it non-interactively — the key itself will live only in GitHub Secrets, not on disk anywhere public.

## 2. Create a non-root deploy user on the VPS (log in as root one last time)

```bash
adduser deploy
usermod -aG docker deploy   # so it can run docker without sudo
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
```

## 3. Install the public key for that user

From your local machine:

```bash
cat deploy_key.pub | ssh root@<vps-host> "cat >> /home/deploy/.ssh/authorized_keys"
ssh root@<vps-host> "chmod 600 /home/deploy/.ssh/authorized_keys && chown -R deploy:deploy /home/deploy/.ssh"
```

## 4. Test the new access before touching anything else

```bash
ssh -i ./deploy_key deploy@<vps-host>
```

Confirm this logs in successfully and `docker ps` works for that user.

## 5. (Optional but recommended) let `deploy` reload nginx without a password

```bash
sudo visudo -f /etc/sudoers.d/deploy-nginx
```
Add:
```
deploy ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t, /bin/systemctl reload nginx
```
Only grant exactly these two commands — not blanket sudo.

## 6. Lock down SSH (only after step 4 succeeds)

Edit `/etc/ssh/sshd_config` on the VPS:
```
PermitRootLogin no
PasswordAuthentication no
```
Then:
```bash
sudo systemctl restart sshd
```

## 7. Add the private key to GitHub Secrets

```bash
cat deploy_key
```
Copy the full output (including the `BEGIN`/`END` lines) into the GitHub repo secret `VPS_SSH_KEY`. Delete the local `deploy_key` file once it's safely in GitHub Secrets, or keep it somewhere secure (password manager) — never commit it to the repo.

Corresponding secrets to set alongside it: `VPS_HOST` (the IP or domain), `VPS_USER=deploy`, `VPS_PORT` (usually 22).

## Reusing an existing deploy key for another project on the same VPS

When a VPS already has one project deployed with a working GitHub Actions → SSH pipeline, a new project should normally reuse that same access rather than mint a separate user/key. Two ways to get the value into the new repo's `VPS_SSH_KEY` secret:

### Option A — retrieve the existing private key

GitHub Secrets are **write-only**: once saved, nobody — including the account owner — can view the value again, from that repo or any other. So "copy it from the other repo's secret" isn't possible. Instead, get it from where it was actually generated: the VPS itself. Setup scripts for this kind of pipeline typically generate the key directly on the VPS (e.g. `ssh-keygen -f /root/.ssh/github_deploy`) and never delete it afterward. SSH in and check:

```bash
ls -la /root/.ssh/
cat /root/.ssh/<key-file>   # e.g. github_deploy — the private half, no .pub extension
```

Copy the full output (including the `BEGIN`/`END` lines) directly into the new repo's `VPS_SSH_KEY` secret. Never have this pasted into chat — it should go from the user's own terminal straight into GitHub's secret form.

If nothing turns up under `/root/.ssh/`, check other likely users' home directories, or check whatever password manager the user might have saved it in originally.

### Option B — mint a fresh key, same access level

If the original key can't be found, generating a new one is just as valid — it doesn't need to be bit-for-bit the same key, only grant the same access:

```bash
ssh-keygen -t ed25519 -C "<new-project>-deploy" -f /root/.ssh/<new-project>_deploy -N ""
cat /root/.ssh/<new-project>_deploy.pub >> /root/.ssh/authorized_keys
cat /root/.ssh/<new-project>_deploy   # paste this as VPS_SSH_KEY for the new repo
```

Either way, `VPS_HOST` and `VPS_USER` are just whatever the existing projects already use (commonly `root` if that's the established pattern on this box) — no need to create a new user to match.
