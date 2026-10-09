# Agent GitHub identity

The VPS agent acts on GitHub as **mycoaster-agent[bot]**, a GitHub App installed only on this repository (ADR 001). It never uses the Engineer's account, so the Engineer can review and approve every agent PR.

## Permissions

| Permission | Level |
| --- | --- |
| Contents, Pull requests, Issues | Read and write |
| Actions, Checks | Read only |
| Workflows, Administration | No access |

Without the Workflows permission, GitHub rejects any push from the agent that changes `.github/workflows/`.

## How it authenticates (VPS)

- Private key: `/root/.config/mycoaster-agent/private-key.pem` (mode 600)
- `/usr/local/bin/mycoaster-gh-token` signs a JWT with the key and exchanges it for an installation token (valid 1 hour, cached until 5 minutes before expiry)
- git: repo-local credential helper calls the script; commits are authored by `mycoaster-agent[bot]`
- gh: `/usr/local/bin/gh` wraps the real binary and sets `GH_TOKEN` from the script

## Rotating the key

1. GitHub: App settings > Credentials > generate a new key
2. Replace `private-key.pem` on the VPS and delete `token.json`
3. Run `mycoaster-gh-token | cut -c1-4` (expect `ghs_`)
4. Delete the old key on GitHub
