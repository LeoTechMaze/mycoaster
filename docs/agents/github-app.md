# Agent GitHub identity

AI agents working on MyCoaster act on GitHub as **mycoaster-agent[bot]**, a GitHub App installed only on this repository (ADR 001). Agents never use a personal account.

## What the agent does

- Opens branches and pull requests
- Comments on and updates issues
- Reads CI results to follow up on its own pull requests

## How its pull requests are reviewed

Agent pull requests follow the [review policy](../REVIEW.md):

- Every pull request targets `develop` and must pass the `ci-ok` check
- Changes to high risk paths (see `.github/CODEOWNERS`) always need the Engineer's approval
- A new push after an approval requires a new approval

## What the agent cannot do

- Push directly to `develop` or `main`
- Change GitHub Actions workflows
- Change repository settings or branch rules
