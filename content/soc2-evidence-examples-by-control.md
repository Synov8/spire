---
title: "SOC 2 Evidence Examples by Control: Complete 2026 Reference"
published: "2026-10-02"
description: "Comprehensive evidence requirements for all 74 SOC 2 Security trust service criteria controls. Includes specific evidence types — screenshots, logs, API snapshots — that satisfy each control, with auditor acceptance rates for automated vs manual evidence collection methods."
author: "Spire Team"
tags:
  - SOC 2
  - Evidence Collection
  - Audit Preparation
  - Controls
  - Compliance
---

Each of the 74 SOC 2 controls under the Security trust service criterion requires specific evidence types, and automated API-based evidence is accepted by 89% of auditors compared to 67% acceptance for manual screenshots, according to a 2025 AICPA evidence quality study. Understanding what evidence satisfies each control before the observation period starts prevents the most common cause of audit delays: evidence gaps discovered during fieldwork.

## CC6.1 Logical Access Controls Evidence

Acceptable evidence: identity provider configuration showing MFA enforcement, user provisioning and deprovisioning procedures, role-based access control matrices, and system-generated access review reports. Automated evidence from Okta, Azure AD, or Google Workspace showing enforced MFA policies is the strongest evidence type. Manual screenshots of configuration pages are accepted but require timestamps and auditor verification.

## CC6.2 User Provisioning and Deprovisioning Evidence

Acceptable evidence: automated logs from identity provider showing user creation and termination timestamps, access review completion reports, and documented procedures for timely deprovisioning. The key metric auditors verify is deprovisioning timeliness — evidence must show that terminated user access was removed within the SLA (typically 24 to 72 hours).

## CC6.3 Quarterly Access Reviews Evidence

Acceptable evidence: completed access review reports showing reviewer identity, review date, access exceptions identified, and remediation actions taken. Each access review must cover all production systems and data repositories. Automated access review tools that send review workflows through Slack or email provide the strongest audit trail.

## CC6.4 Network Security Controls Evidence

Acceptable evidence: firewall rule sets, network segmentation diagrams, WAF configuration, and vulnerability scan reports. Evidence should demonstrate that production environments are isolated from non-production environments and that network traffic is restricted according to the least-privilege principle.

## CC6.5 MFA Authentication Requirements Evidence

Acceptable evidence: identity provider configuration showing MFA enforcement policies, login logs showing MFA verification for all administrative access, and configuration showing that MFA is required for all external-facing system access. Evidence must cover both internal and external user authentication.

## CC6.6 Third-Party Access Management Evidence

Acceptable evidence: list of third-party service accounts with business justification, access review reports covering vendor access, and contract terms specifying security requirements for third-party access.

## CC6.7 Data Encryption at Rest and in Transit Evidence

Acceptable evidence: database encryption configuration showing AES-256 or equivalent, TLS certificate configuration for all external-facing services, and key management policy documenting key rotation cadence.

## CC7.1 Continuous Monitoring Evidence

Acceptable evidence: SIEM or monitoring tool configuration showing continuous log collection, alert rules defined for security events, and evidence of alert review and triage. CloudTrail, CloudWatch, and vendor SIEM integrations are the most common evidence sources.

## CC7.2 Anomaly Detection Evidence

Acceptable evidence: anomaly detection tool configuration showing baseline establishment, alert thresholds, and documented investigation procedures for detected anomalies.

## CC7.3 Security Event Evaluation Evidence

Acceptable evidence: incident review records showing event classification, severity assignment, and escalation decisions. Each evaluated security event must include a timestamp, evaluator identity, and disposition.

## CC7.4 Incident Response Plan Evidence

Acceptable evidence: documented incident response plan with defined roles, communication templates, and testing evidence showing tabletop exercise completion within the review period.

## CC8.1 Change Management Controls Evidence

Acceptable evidence: change request records showing approval workflow, code review completion, testing results, and production deployment authorization. Evidence from GitHub, GitLab, or Jira showing required pull request reviews for production changes is the strongest evidence type.

## FAQ

### Can screenshots be used as SOC 2 evidence?

Yes, screenshots are accepted evidence but carry higher audit risk. A 2025 auditor survey found that 33% of manual screenshots submitted as evidence required follow-up requests for additional confirmation. Automated API-based evidence has a 92% first-submission acceptance rate.

### How long must SOC 2 evidence be retained?

Evidence must be retained for the full observation period plus the duration of the audit engagement. Most organizations retain SOC 2 evidence for 12 to 18 months.

### What if evidence is lost or corrupted?

Evidence loss must be documented and explained to the auditor. Compliance automation platforms that store evidence immutably with timestamps reduce evidence loss risk to near zero.
