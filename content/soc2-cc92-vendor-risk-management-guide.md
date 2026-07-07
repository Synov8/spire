---
title: "SOC 2 CC9.2: Vendor Risk Management Requirements for B2B SaaS"
published: "2026-07-18"
description: "Complete guide to SOC 2 CC9.2 vendor risk management for SaaS companies. Covers vendor tiering strategies, due diligence questionnaires, ongoing monitoring, SOC 2 report review procedures, and termination processes. Includes risk assessment templates aligned with AICPA guidance and CSA STAR requirements."
author: "Spire Team"
tags:
  - SOC 2
  - CC9.2
  - Vendor Risk
  - Third Party
  - B2B SaaS
---

SOC 2 CC9.2 requires that the entity assesses, selects, and monitors vendors and business partners based on their ability to meet applicable control requirements, with ongoing monitoring throughout the vendor relationship. The AICPA's 2025 Trust Services Criteria update expanded CC9.2 to explicitly include sub-service organizations — vendors that process customer data on behalf of the reporting entity. A 2025 Gartner study found that 63% of SaaS companies experienced a vendor-related security incident despite having a vendor management policy on file.

## How Should Vendors Be Tiered for Risk Assessment?

Vendors must be classified into risk tiers based on the data they access and the criticality of their service. Tier 1 (high risk) vendors have access to customer data or production systems and require the most rigorous due diligence. Tier 2 (medium risk) vendors support business operations but do not access customer data. Tier 3 (low risk) vendors provide ancillary services with no system access.

Each tier has different due diligence requirements. Tier 1 vendors require SOC 2 Type II report review, security questionnaire completion, and quarterly monitoring. Tier 2 vendors require annual questionnaire and initial SOC 2 review. Tier 3 vendors require only initial assessment. A 2025 Ponemon study found that companies using tiered vendor risk programs reduced third-party incidents by 47% compared to single-tier approaches.

## What Vendor Due Diligence Documents Are Required?

At minimum, CC9.2 requires a vendor risk assessment document, a completed security questionnaire or review of the vendor's SOC 2 report, a business continuity assessment, and data processing agreements or business associate agreements where applicable. The due diligence must be completed before the vendor begins providing services — retroactive assessments are a common deficiency.

## How Often Must Vendors Be Reassessed?

Tier 1 vendors must be reassessed at least annually, with more frequent monitoring recommended for critical vendors. SOC 2 Type II reports are typically valid for one year and should be reviewed within 30 days of receipt. Tier 2 vendor reassessment is annual. Tier 3 vendors may be reassessed every 2 years unless a significant change occurs in the relationship.

## What Vendor Evidence Does the Auditor Need?

The auditor needs a complete vendor inventory with risk tier assignments, due diligence records including SOC 2 report reviews or questionnaire responses, ongoing monitoring evidence (quarterly for Tier 1), documented vendor termination procedures, and evidence of vendor access revocation when relationships end.

## How Should Vendor Termination Be Handled?

Vendor termination procedures must address access revocation, data return or destruction, and contract closure. When a vendor relationship ends, the vendor's access to your systems must be revoked immediately — the same deprovisioning SLA as employee termination (24 hours or less). Data held by the vendor must be returned or destroyed per the contract terms, with written confirmation of destruction obtained.

The SOC 2 auditor will examine vendor termination records to verify that access revocation and data disposition occurred within defined timeframes. Open-ended vendor relationships with no termination documentation are a common CC9.2 deficiency.

## What Vendor Monitoring Evidence Does the Auditor Need?

The auditor requests: the complete vendor inventory with risk tier assignments for the Type II period, SOC 2 report review records for each Tier 1 vendor (including review date and reviewer notes), security questionnaire evidence for Tier 2 vendors, ongoing monitoring evidence (quarterly for Tier 1), vendor risk assessment change logs (risk score updates), and termination records for vendors whose relationships ended during the period.

Each monitoring record must include a timestamp and reviewer identity. A vendor SOC 2 report that was received but never reviewed constitutes a monitoring gap.

## FAQ

### Do we need a SOC 2 report from every vendor?

No. Only Tier 1 vendors that access customer data require SOC 2 reports. For other vendors, a security questionnaire reviewed by your security team is sufficient.

### What if a vendor refuses to provide a SOC 2 report?

Document the refusal, assess compensating controls, and escalate to management. If the vendor is critical and no alternative exists, accept the risk with documented management sign-off.

### How many vendors should a typical SaaS company have in scope?

A B2B SaaS company typically has 15 to 40 vendors total, with 3 to 8 classified as Tier 1 (high risk). The vendor list should be reviewed each quarter to identify new vendors that were onboarded and vendors that should be removed.
