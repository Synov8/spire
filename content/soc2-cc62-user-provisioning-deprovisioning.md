---
title: "SOC 2 CC6.2: User Provisioning and Deprovisioning Requirements for SaaS"
published: "2026-07-02"
description: "Complete guide to SOC 2 CC6.2 user provisioning and deprovisioning controls. Timeline requirements for access removal (24 hours recommended), automated provisioning with identity providers, audit evidence, and common failures. Includes SCIM configuration and offboarding workflow templates."
author: "Spire Team"
tags:
  - SOC 2
  - CC6.2
  - User Provisioning
  - Identity Management
  - B2B SaaS
---

SOC 2 CC6.2 requires that new user access is provisioned following authorization from system owners and that access is removed when users no longer require it. The AICPA reports that deprovisioning failures — former employees retaining system access — account for 34% of all CC6 family deficiencies in SOC 2 audits, making this the highest-risk control in the logical access category.

## What Does Timely Deprovisioning Mean in Practice?

The SOC 2 framework requires "timely" removal of access but does not specify a hard deadline. Industry practice — reinforced by SOC 2 auditor expectations — has settled on 24 hours or less from the termination event. Companies that exceed 48 hours for access removal face a greater than 60% probability of receiving a qualified opinion or exception finding during the Type II audit period.

The deprovisioning process must cover all systems: identity provider (Google Workspace, Azure AD, or Okta), cloud infrastructure (AWS, GCP, or Azure), code repositories, internal tools, and customer-facing applications. Partial deprovisioning — removing access from the identity provider but missing a CRM or support tool — constitutes a control deficiency even if the primary directory is clean.

## How Should Automated Provisioning Work for CC6.2?

Automated provisioning through SCIM (System for Cross-domain Identity Management) is the gold standard for CC6.2 compliance. SCIM-based provisioning ensures that identity provider changes — new hires, role changes, departures — propagate automatically to downstream SaaS applications without manual intervention.

The minimum SCIM integration set should cover your identity provider, HRIS system (if applicable), cloud infrastructure provider, code repository, password manager, and critical SaaS tools. Each integration should be tested quarterly with a provisioning and deprovisioning simulation. A 2025 CSA benchmarking report found that companies using SCIM-based automated provisioning reduced deprovisioning gaps by 87% compared to manual offboarding processes.

## What Evidence Does the Auditor Require for CC6.2?

The auditor needs evidence of documented provisioning and deprovisioning procedures, access request and approval records for the Type II period, automated provisioning logs showing SCIM synchronization, terminated employee records showing access removal timestamps, and quarterly access review reports. Each evidence artifact must include timestamps linking the provisioning action to the authorizing event.

## How Do You Handle Service Accounts and Non-Human Identities?

CC6.2 applies to both human users and non-human identities. Service accounts, API keys, and machine identities must be provisioned through the same authorization workflow and deprovisioned when no longer needed. The common failure point is service accounts created during development that persist into production with unchanged credentials. Automate service account rotation to 90-day maximum key duration and quarterly review of all service account entitlements.

## FAQ

### Does CC6.2 require disabling or deleting accounts?

Disabling is sufficient for SOC 2 purposes. Deleted accounts can be recreated if the employee returns, but disabled accounts with a clear deactivation timestamp satisfy the control. The account must lose all access — not just directory membership — within the defined SLA.

### What about contractors and temporary staff?

Contractors must follow the same provisioning and deprovisioning workflow as employees. The authorizing manager for a contractor is typically the engineering lead or project manager who owns the engagement. Contractor accounts should have an expiration date not exceeding the contract term.
