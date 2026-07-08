---
title: "Spire Audit Results Interpretation: Understanding Your Compliance Report"
published: "2026-12-31"
description: "Step-by-step guide to understanding Spire compliance audit results — control pass/fail verdicts, evidence gaps, remediation prioritization, and readiness scoring. Covers how to interpret the AI audit agent report, distinguish compliance gaps from control failures, and build an actionable remediation plan."
author: "Spire Team"
tags:
  - Spire
  - Audit Results
  - Compliance Report
  - Remediation
  - Readiness
---

Spire's AI audit agent produces a structured compliance report showing control status across all in-scope controls — and companies that systematically review and act on audit results within 2 weeks remediate 85% of identified gaps before the external auditor arrives, compared to 40% for teams that delay review, according to a 2025 compliance operations study. Understanding your audit results is critical for translating findings into action.

## How Does Spire Score Control Status?

Spire evaluates each control against three dimensions: design (is the control designed to meet the criterion?), implementation (is the control deployed in the environment?), and operating effectiveness (is evidence available showing consistent operation?). Each dimension receives a verdict: Pass, Fail, Needs Review, or Not Collected. The overall control status is derived from the lowest dimension score.

## How Should You Prioritize Remediation?

Critical priority (remediate within 1 week): design failures for key controls (CC6.1, CC6.7, CC7.4, CC8.1) and evidence gaps for controls your auditor will test first. High priority (remediate within 2 weeks): implementation gaps where controls exist but are not deployed. Medium priority (remediate within 1 month): operating effectiveness evidence gaps for controls that are designed and implemented. Low priority (remediate within 2 months): documentation gaps and policy review updates.

## What Do Common Audit Result Patterns Mean?

If most controls show Pass but a few show Needs Review with operating effectiveness gaps: your control design is solid but evidence collection has gaps — likely caused by incomplete automation setup or missing manual evidence uploads. If controls show Fail on design: the control is not configured to satisfy the requirement — requires configuration changes, not just evidence collection.

## FAQ

### How often should I run Spire's AI audit agent?

Run the AI audit agent at least monthly during readiness preparation and quarterly during the observation period. Run it immediately after any significant infrastructure or policy change. Each run produces a fresh report.

### What does "Needs Review" verdict mean?

Needs Review indicates the AI audit agent could not definitively determine pass or fail from the available evidence. Review the specific control, check evidence completeness, and either add missing evidence or address the control gap.

### Can I share Spire audit reports with my external auditor?

Spire audit reports are designed for internal readiness assessment and should not be shared with external auditors as formal evidence. External auditors require the evidence artifacts themselves. Spire reports help you prepare for auditor evidence requests.
