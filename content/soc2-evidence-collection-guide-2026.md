---
title: "SOC 2 Evidence Collection Guide 2026: Automated vs Manual Collection"
published: "2026-08-14"
description: "Complete guide to SOC 2 evidence collection in 2026. Covers automated evidence collection via API integrations, manual evidence procedures, evidence retention requirements (12 months minimum for Type II), common evidence gaps, and evidence acceptance criteria by major audit firms. Includes integration patterns for cloud infrastructure, identity providers, and code repositories."
author: "Spire Team"
tags:
  - SOC 2
  - Evidence Collection
  - Automation
  - Audit
  - B2B SaaS
---

Evidence collection is the most time-intensive component of SOC 2 compliance, accounting for 60% to 70% of total compliance effort according to a 2025 AICPA practice aid. Automated evidence collection via API integrations can reduce this effort by 80% to 90%, with top compliance platforms now offering 200 to 400+ pre-built integrations that capture evidence from cloud providers, identity systems, code repositories, and endpoint management tools continuously rather than through point-in-time manual screenshots.

## What Evidence Must Be Collected for a SOC 2 Type II?

The SOC 2 Type II evidence set covers the full 6 to 12 month observation period and must demonstrate consistent control operation. The six categories are: configuration evidence (system configurations showing controls are in place — network security groups, identity provider MFA enforcement, log retention settings), activity evidence (logs showing controls operated — access logs, change management records, authentication logs), review evidence (quarterly access reviews, risk assessments, board updates), policy evidence (current, approved policies and procedures), test evidence (penetration tests, tabletop exercises, DR tests), and training evidence (security awareness training completion, IR training records).

Each evidence artifact must include a timestamp showing when the evidence was created, the system or source that generated it, and an indication that it represents the actual control state at that time.

## What Is the Difference Between Automated and Manual Evidence?

Automated evidence is collected via API integrations with cloud platforms, identity providers, code repositories, and security tools — providing continuous, timestamped evidence with no manual effort after initial configuration. Manual evidence includes signed documents, screenshots of system configurations that cannot be API-connected, and attestations from system owners.

The AICPA's 2025 Technology Guidance explicitly recognizes API-collected evidence as equivalent to or superior to manual collection, provided the evidence includes timestamps and configuration state. Manual evidence is acceptable for controls that cannot be API-connected but must include the collector's identity and collection timestamp.

## How Long Must Evidence Be Retained?

SOC 2 Type II evidence must cover the entire observation period — minimum 6 consecutive months. After the report is issued, evidence should be retained for the duration of the report validity period (typically 12 months) plus any additional retention required by the audit firm or regulatory requirements.

## What Are the Most Common Evidence Gaps?

The most common evidence gaps identified by SOC 2 auditors are: missing evidence for employee terminations (deprovisioning not documented), incomplete change management records (changes deployed without approval records), and insufficient access review documentation (reviews conducted but sign-off not captured).

## FAQ

### Can screenshots serve as SOC 2 evidence?

Screenshots with visible timestamps and system indicators are acceptable evidence for controls where automated collection is not available. However, screenshots are point-in-time and do not demonstrate continuous control operation the way API-collected evidence does.

### Do compliance platforms store evidence for free?

Most compliance platforms include evidence storage in their subscription. Evidence storage outside the platform — in cloud storage buckets or document management systems — is acceptable if access controls and retention policies are documented.
