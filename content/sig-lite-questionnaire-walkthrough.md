---
title: "SIG Lite Questionnaire Walkthrough: Complete Answer Guide for B2B SaaS"
published: "2026-07-22"
description: "Complete walkthrough of the Standard Information Gathering (SIG) Lite questionnaire for B2B SaaS vendors. Covers all 17 core questions with recommended answers, supporting evidence requirements, and common pitfalls. Includes mapping to SOC 2 controls and guidance for vendors responding to their first enterprise SIG request."
author: "Spire Team"
tags:
  - SIG Lite
  - Security Questionnaires
  - Enterprise Sales
  - Vendor Risk
  - B2B SaaS
---

The Standard Information Gathering (SIG) Lite questionnaire — developed by the Cloud Security Alliance (CSA) and Shared Assessments — is the most widely used vendor risk assessment in enterprise procurement, appearing in approximately 35% of all enterprise security reviews according to a 2025 Shared Assessments benchmarking report. The SIG Lite contains 17 core questions covering information security, access control, and data protection, and B2B SaaS vendors can complete it in under 2 hours with proper preparation.

## What Are the 17 SIG Lite Questions and How Should You Answer?

SIG Lite Question 1 (Information Security Program): State that your security program aligns with SOC 2 Trust Services Criteria and reference your SOC 2 Type II report. Question 2 (Security Policy): State that policies are reviewed annually and reference your policy repository. Question 3 (Access Control): Reference SOC 2 CC6.1 and CC6.2 controls with MFA enforcement and quarterly access reviews.

Question 4 (Encryption): Specify AES-256 for data at rest and TLS 1.2 or higher for data in transit. Provide the specific encryption protocols rather than a generic "we encrypt data" response. Question 5 (Data Classification): Describe your data classification policy and how customer data is classified as confidential or restricted. Question 6 (Incident Response): Reference your SOC 2 CC7.4 incident response plan, tabletop exercise cadence, and notify customers within the timeframe defined in your contract (typically 72 hours for security breaches).

Question 7 (Business Continuity): Describe your BCDR plan, RTO and RPO objectives, and annual testing evidence. Question 8 (Vulnerability Management): Reference your vulnerability scanning cadence — weekly external scans and monthly internal scans with remediation SLAs. Question 9 (Penetration Testing): State annual penetration testing with a qualified third party, and offer to share the executive summary. Question 10 (Third-Party Management): Describe your vendor risk management program aligned with SOC 2 CC9.2.

Questions 11 through 17 cover compliance (GDPR, CCPA, HIPAA applicability), data handling, sub-processors, data deletion procedures, employee screening, insurance coverage, and the SIG attestation. Each should include specific reference to your SOC 2 report or ISO 27001 certification.

## What Evidence Should Accompany Each Answer?

SOC 2 Type II report for questions about security program and controls, penetration testing report summary for question 9, BCDR test results for question 7, and data processing agreement for questions about GDPR compliance. Offering to share certain documents under NDA is acceptable.

## What Are Common SIG Lite Mistakes?

The most common mistakes are: providing yes/no answers without context, failing to reference specific certifications, claiming compliance with frameworks that are not actually certified, inconsistent answers (saying MFA is required but later saying it is optional), and missing the attestation signature at the end.

## How Should You Prepare Your SIG Lite Response Package?

The SIG Lite response package should include the completed questionnaire with answers mapped to SOC 2 controls, a cover letter introducing your security program and certifications, the current SOC 2 Type II report (under NDA), and supporting evidence for the most critical claims (MFA enforcement evidence, encryption configuration, incident response plan documentation).

Prepare the package in a structured format — PDF with bookmarks for each question section — so enterprise reviewers can navigate quickly. Reviewers spending more than 30 minutes on a SIG Lite submission typically flag it for follow-up. The goal is to answer every question so clearly that the reviewer' approves without additional questions.

## How Does SIG Lite Scoring Work?

Enterprise procurement teams typically use a weighted scoring rubric for SIG Lite responses. Questions about SOC 2 certification, encryption, and access control carry the highest weight — typically 3x to 5x the score of administrative questions about policies and training. A high score on these weighted questions can offset lower scores on less critical questions.

Understanding the scoring methodology helps prioritize response quality. Companies should invest disproportionate effort in the highest-weighted questions, ensuring those answers are complete, specific, and supported by evidence.

## FAQ

### Can I reference my SOC 2 report instead of answering each question?

SOC 2 reports cover many SIG Lite questions but not all. The most efficient approach is referencing specific SOC 2 controls for each applicable question while providing a direct answer for questions outside SOC 2 scope (insurance, data deletion timelines).

### How do I handle questions we cannot answer affirmatively?

Be transparent. If you do not yet have a specific control, state the compensating control or timeline for implementation. Misrepresenting control status that the customer later validates damages trust and the deal.
