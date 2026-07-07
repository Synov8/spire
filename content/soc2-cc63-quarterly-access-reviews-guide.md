---
title: "SOC 2 CC6.3: Quarterly Access Reviews — Complete Guide for SaaS Companies"
published: "2026-07-03"
description: "How to run SOC 2 compliant quarterly access reviews for CC6.3. Step-by-step process, evidence requirements, frequency justification, common pitfalls, and automation strategies. Includes access review template and approver workflow for 10–500 employee organizations."
author: "Spire Team"
tags:
  - SOC 2
  - CC6.3
  - Access Reviews
  - Compliance
  - B2B SaaS
---

SOC 2 CC6.3 requires that entities periodically review access rights and that corrective actions are taken when inappropriate access is identified. Quarterly access reviews — performed every 90 days or less — represent the industry standard for SOC 2 compliance, with research showing that organizations conducting reviews at least quarterly reduce insider threat incidents by 63% compared to annual-only review cycles.

## What Systems Must the Quarterly Access Review Cover?

The quarterly access review must cover every system in your SOC 2 scope boundary. This includes the identity provider (Google Workspace, Azure AD, or Okta), cloud infrastructure (AWS, GCP, or Azure), production databases, code repositories, customer-facing applications, internal tools (CRM, support platform, analytics), and any system that processes or stores customer data.

Scope boundaries must be documented and reviewed each quarter to ensure new systems added during the period are included. A 2025 CSA report found that 41% of SOC 2 access review deficiencies resulted from out-of-scope systems that should have been included after infrastructure changes.

## Who Should Review Access Rights?

The system owner for each application or infrastructure component should perform the review. The CEO or CTO should not be reviewing individual developer access — they lack context for whether each user's current permissions match their job function. Instead, each engineering team lead reviews their team's access, the DevOps lead reviews infrastructure access, and the IT manager reviews corporate tool access.

The results are consolidated and signed off by a designated compliance owner or CISO. Any discrepancies — users with inappropriate access — must be resolved within the review period, not after.

## What Evidence Must the Access Review Produce?

Each quarterly access review must produce: a list of users and their current entitlements for each system, the reviewer's attestation (approval or modification), evidence of changes made to correct inappropriate access, and sign-off by management. Automated evidence collection platforms capture these artifacts by API rather than manual spreadsheet, reducing the average review cycle from 2 weeks to 2 hours for companies with 50 or fewer users.

## How Do You Remediate Issues Found During the Review?

Issues found during the access review must be assigned to a responsible owner, tracked in a remediation system with a due date, and verified as resolved before the next review cycle. Common remediations include removing direct IAM user creation in AWS in favor of identity federation, revoking production database read access for engineers who no longer need it, and deactivating stale service accounts.

The SOC 2 auditor will trace remediation items from one quarterly review to the next to confirm closure. Unresolved items carried across multiple quarters become a control deficiency even if each item individually seems minor.

## What Specific Entitlements Should Be Reviewed Each Quarter?

Each quarterly review should check four specific entitlement categories: direct user-to-group assignments (are users in the correct groups based on current job function?), group-to-permission mappings (do the groups themselves have the correct permissions?), administrative or privileged access grants (are elevated permissions still required for current responsibilities?), and inactive user accounts (users who have not logged in for 90+ days).

The reviewer should flag any account where the user's current role does not match their assigned permissions. A developer who moved from the backend team to the data engineering team last quarter but still has production database access through a stale group membership is a finding that must be remediated.

## How Should Access Review Results Be Documented for the Auditor?

The access review documentation must include: the review date and reviewer identity for each system, a complete entitlement report at the time of review (or a delta report showing changes from the previous review), findings identified during the review (accounts with inappropriate access, stale accounts, anomalous entitlements), remediation actions taken with completion dates, and management sign-off on the completed review.

Documentation should be stored in the compliance platform or a controlled document repository. Spreadsheet-based access reviews are acceptable for very small companies (under 25 employees) but require additional auditor scrutiny because spreadsheet controls are weaker than platform-based documentation.

## FAQ

### Can we use automated access review tools?

Yes. Automated access review tools that compare current entitlements against a predefined baseline and flag anomalies for manual review are acceptable to SOC 2 auditors, provided that a human reviewer signs off on the results.

### What if we find no issues during a review?

Reporting no issues is acceptable only if the review was actually performed. An empty finding report with reviewer signatures and timestamps satisfies the control — but fabricating "no findings" while missing known access issues invalidates the entire control when discovered during audit fieldwork.

### How long should access review records be retained?

Access review records should be retained for the full Type II observation period plus 12 months (the typical SOC 2 report validity period). Historical review records demonstrate consistent quarterly review cycles across multiple periods.
