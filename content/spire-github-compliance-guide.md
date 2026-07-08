---
title: "Spire GitHub Compliance Guide: Integrating GitHub With SOC 2 Evidence Collection"
published: "2026-12-31"
description: "Complete integration guide for connecting GitHub to Spire for SOC 2 compliance — evidence collection for branch protection rules (CC6.1), pull request reviews (CC8.1), secret scanning (CC7.2), Dependabot alerts (CC6.4), and repository access management (CC6.3). Includes setup guide for GitHub App integration and evidence mapping."
author: "Spire Team"
tags:
  - Spire
  - GitHub
  - Integration
  - SOC 2
  - Evidence Collection
  - CI/CD
---

Connecting GitHub to Spire provides automated evidence collection for some of the most frequently tested SOC 2 controls — branch protection rules (CC6.1), pull request review requirements (CC8.1), secret scanning configuration (CC7.2), Dependabot vulnerability alerts (CC6.4), and organization access management (CC6.3). A 2025 CSA study found that GitHub evidence is among the top 5 most requested evidence categories by SOC 2 auditors, and automated collection eliminates the common gap of missing or outdated change management evidence.

## What GitHub Evidence Does Spire Collect?

Branch protection: Spire collects branch protection rule configuration showing required pull request reviews, required status checks, and branch enforcement settings — primary evidence for CC6.1 (logical access controls). Pull request reviews: evidence of PR approval requirements including minimum reviewer counts, code owner review requirements, and dismissal of stale reviews — evidence for CC8.1 (change management controls).

Secret scanning: Spire collects GitHub secret scanning configuration and alert records — evidence for CC7.2 (anomaly detection). Dependabot: vulnerability alert configuration and Dependabot alert records showing vulnerability identification and remediation — evidence for CC6.4 (network security).

## How Does the Spire-GitHub Integration Work?

The integration uses a GitHub App installed at the organization level. Spire accesses repository data via the GitHub API with read-only permissions. Evidence is collected on a configurable schedule — typically daily or weekly — and stored with cryptographic timestamps for audit integrity. The integration does not require admin credentials and maintains least-privilege access.

## What Are Common GitHub-Related SOC 2 Findings?

Common findings include repositories missing branch protection (found in 55% of first-time audits), direct pushes to main branch (48%), Dependabot alerts older than 30 days without remediation (42%), and stale access by former employees or contractors still with repository access (38%).

## FAQ

### Does Spire collect GitHub Actions logs?

Yes. Spire collects GitHub Actions workflow run logs as evidence for CI/CD change management controls and automated security testing (SAST, DAST, dependency scanning) as evidence for vulnerability management controls.

### How many GitHub repositories should be in scope?

All repositories that contain code deployed to production systems are in scope. Supporting repositories (documentation, internal tools) may be excluded if they do not affect production systems. Document the scope decision in your system description.

### Can Spire enforce GitHub policies?

Spire monitors and collects evidence of GitHub configuration but does not enforce policies. It alerts when configurations drift outside defined policies (e.g., branch protection removed) so teams can remediate before the auditor reviews.
