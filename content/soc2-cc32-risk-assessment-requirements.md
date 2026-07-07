---
title: "SOC 2 CC3.2: Risk Assessment Requirements for B2B SaaS"
published: "2026-07-19"
description: "Complete guide to SOC 2 CC3.2 risk assessment requirements. Covers annual risk assessment methodology, threat identification, likelihood and impact scoring, risk register maintenance, and management acceptance. Includes NIST SP 800-30 and ISO 31000 alignment, with templates for SaaS-specific threat modeling."
author: "Spire Team"
tags:
  - SOC 2
  - CC3.2
  - Risk Assessment
  - Enterprise Risk
  - B2B SaaS
---

SOC 2 CC3.2 requires that the entity identifies and assesses risks to the achievement of its system objectives — including security, availability, processing integrity, confidentiality, and privacy — across the full technology stack and business operations. The AICPA's framework references ISO 31000 risk management principles as the governing standard for risk assessment methodology. A 2025 CSA survey found that 54% of SOC 2 audit deficiencies were linked to incomplete risk assessments that failed to identify relevant threats.

## What Must the Risk Assessment Cover?

The risk assessment must identify assets and processes within the SOC 2 scope boundary, relevant threats applicable to each asset, the likelihood of each threat materializing, the potential impact if the threat occurs, and existing controls that mitigate each risk. The risk register must cover people, technology, processes, and third-party dependencies.

For SaaS companies, the risk assessment must specifically address cloud infrastructure risks, application-layer risks, identity and access management risks, data protection risks, and business continuity risks. Each risk should be documented with a unique identifier in the risk register.

## What Risk Scoring Methodology Should You Use?

The most common SOC 2 risk scoring methodology uses a 5x5 matrix: likelihood (1 = rare to 5 = almost certain) multiplied by impact (1 = negligible to 5 = catastrophic) produces a risk score from 1 to 25. Scores of 15 to 25 require immediate remediation, 8 to 14 require planned remediation, and 1 to 7 are acceptable with monitoring.

The NIST SP 800-30 Rev. 1 guide for conducting risk assessments provides the authoritative methodology reference. SOC 2 auditors will evaluate whether your scoring methodology is consistently applied and produces actionable results.

## How Often Must the Risk Assessment Be Updated?

CC3.2 requires that the risk assessment is updated annually at minimum. Updates should also occur when significant changes occur: new products or services, material infrastructure changes, regulatory changes affecting the business, or after a security incident. Each update must be documented with new findings and changes from the previous assessment.

## What Evidence Does CC3.2 Require?

The auditor needs a current, management-approved risk assessment document, a risk register with identified risks scored and assigned to owners, evidence that risk assessments were conducted at the required frequency, evidence that risk findings were addressed or formally accepted by management, and documentation of risk appetite thresholds.

## How Do You Map SaaS-Specific Threats in the Risk Assessment?

SaaS companies face distinct threats that must be explicitly identified in the risk assessment: multi-tenant data separation failure (a vulnerability in one customer's tenant exposing another customer's data), cloud provider misconfiguration (S3 bucket exposure, overly permissive IAM roles, unsecured databases), API abuse (rate limiting failures, authentication bypass, injection attacks via API endpoints), supply chain attacks via third-party SaaS integrations, and credential theft targeting developers with elevated infrastructure access.

Each threat should be assessed with likelihood and impact scores specific to your infrastructure and customer data sensitivity. A 2025 Cloud Security Alliance report found that 68% of SaaS risk assessments failed to explicitly assess multi-tenant data separation risks — creating a gap that SOC 2 auditors increasingly flag during CC3.2 evaluation.

## What Does Management Acceptance Look Like?

Management acceptance of risk is documented through a risk register sign-off process. The CEO, CISO, or designated management representative reviews the risk register, acknowledges the identified risks and their scores, and either approves the remediation plan or formally accepts the risk with signature and date. The risk acceptance document becomes part of the SOC 2 evidence package.

Management acceptance is not a one-time event. The risk register must be reviewed at the defined frequency — typically quarterly for high-severity risks and annually for all risks — with new acceptance or updated remediation plans documented at each review.

## FAQ

### Who should perform the risk assessment?

The risk assessment should be performed by someone with knowledge of the business and technical environment. A compliance lead or security engineer typically performs the assessment with review and approval by management.

### Can risk acceptance be used for high-severity risks?

Risk acceptance is permissible for high-severity risks but must be formally documented with management sign-off. The acceptance should include justification, a review date, and compensating controls.

### How many risks should a typical SaaS company identify?

A SaaS company with Security-only SOC 2 scope typically identifies 15 to 30 risks in their risk register. Fewer than 10 risks suggests incomplete assessment. More than 50 risks may indicate excessive granularity that dilutes actionable findings.
