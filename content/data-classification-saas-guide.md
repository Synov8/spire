---
title: "Data Classification for SaaS: Building Your Data Sensitivity Framework"
published: "2026-12-30"
description: "Complete data classification framework for B2B SaaS platforms — four-tier classification model (Public, Internal, Confidential, Restricted), classification criteria by data type, automated classification tools, handling procedures per tier, and evidence collection for SOC 2 Confidentiality TSC compliance."
author: "Spire Team"
tags:
  - Data Classification
  - Data Governance
  - Confidentiality
  - SOC 2
  - Data Protection
---

A structured data classification framework is the foundation of SOC 2 Confidentiality TSC compliance and operational data protection — yet 55% of SaaS companies lack a documented data classification policy, making it one of the most common readiness gaps found in SOC 2 assessments, according to a 2025 AICPA control implementation study. The framework should define classification levels, criteria for each level, handling procedures, and required controls.

## What Are the Four Standard Classification Levels?

Public: information that can be freely shared without confidentiality concerns — marketing materials, blog posts, public documentation. Internal: information intended for internal use but without specific confidentiality restrictions — internal procedures, organizational charts, non-sensitive operational data. Confidential: sensitive business information that requires protection — customer data (non-PII), financial data, business plans, source code. Restricted: highly sensitive information requiring maximum protection — personally identifiable information (PII), PHI under HIPAA, payment card data (PCI), authentication credentials, encryption keys.

## How Do You Classify Data Automatically?

Automated classification tools scan data repositories and apply labels based on content patterns — regex patterns for credit card numbers, social security numbers, API keys. Data discovery tools (Microsoft Purview, Google DLP, AWS Macie) automatically identify and classify sensitive data across cloud storage, databases, and file shares.

## What Handling Procedures Does Each Classification Level Require?

Public: no specific handling controls. Internal: basic access controls, internal-use-only policy. Confidential: access control on a need-to-know basis, encryption at rest and in transit, data handling agreements with third parties. Restricted: least-privilege access with approval, encryption with key management, access audit logging, data loss prevention monitoring, and incident reporting.

## FAQ

### How often should data classification be reviewed?

Classify data at creation and review classification annually. Automated reclassification should occur when data sensitivity changes — a customer contract containing confidential pricing should be classified before it is shared externally.

### Does data classification need to be automated?

Automated classification is strongly recommended for SaaS platforms handling large volumes of data. Manual classification is error-prone and rarely maintained. Start with automated classification for high-risk data repositories (PII, PHI, payment data).

### Can data classification satisfy SOC 2 Confidentiality TSC?

Yes. A documented data classification framework with implemented handling controls provides primary evidence for SOC 2 C1 (confidential information identification and protection). The framework must be applied consistently and reviewed annually.
