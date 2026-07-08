# Switching a VPS from root+password to key-based deploy access

Do this once per VPS. Test key login before disabling password auth, so you don't lock yourself out.

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
