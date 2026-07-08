---
title: "SOC 2 Confidentiality Trust Service Criteria: Complete Deep Dive"
published: "2026-10-08"
description: "Complete guide to SOC 2 Confidentiality TSC (C1–C2) covering confidential information identification, protection, retention, and destruction. Includes data classification frameworks, encryption requirements, NDA management, and auditor evidence expectations for both controls."
author: "Spire Team"
tags:
  - SOC 2
  - Confidentiality
  - TSC
  - Data Classification
  - Encryption
  - Compliance
---

The SOC 2 Confidentiality trust service criterion covers two controls — C1 (confidential information identification and protection) and C2 (confidential information retention and destruction) — and companies handling non-public customer data benefit from adding it with only 15% to 20% additional audit cost compared to Security-only scope. Approximately 38% of SOC 2 reports include the Confidentiality TSC, making it the second most common criterion after Security.

## C1: Confidential Information Identification and Protection

C1 requires the entity to identify confidential information created or received and protect it throughout its lifecycle. Evidence for C1 includes a documented data classification policy with at least three sensitivity levels, access control rules enforcing least-privilege access to confidential data, encryption of confidential data at rest and in transit, and confidentiality agreements with employees and third parties.

The data classification policy must define each classification level — typically public, internal, confidential, and restricted — and specify protection requirements for each level. The policy must also identify specific data repositories where confidential information is stored and map protection controls to each repository.

## C2: Confidential Information Retention and Destruction

C2 requires the entity to retain confidential information consistent with its retention policy and securely destroy it at the end of the retention period. Evidence for C2 includes a data retention schedule specifying retention periods for each data category, secure destruction procedures for physical and digital media, and destruction verification records including certificates of destruction from third-party disposal services.

The retention schedule must comply with applicable legal and regulatory requirements. Retention periods vary by data type — financial records typically require 7 years, while customer communications may require 3 years or less. Secure destruction standards should reference NIST SP 800-88 for media sanitization.

## FAQ

### What is the difference between Confidentiality and Privacy TSC?

Confidentiality TSC (C1–C2) covers protection of confidential business information. Privacy TSC (P1–P10) covers protection of personal information. Companies handling both types of sensitive data should consider including both criteria.

### Does Confidentiality TSC require data loss prevention tools?

Data loss prevention (DLP) tools are not explicitly required by SOC 2 but provide strong evidence for C1. Companies handling highly sensitive confidential data should implement DLP monitoring as a best practice.

### How does Confidentiality TSC interact with NDA requirements?

C1 requires confidentiality agreements with all employees and third parties who access confidential information. NDAs serve as evidence for this control. Review NDA coverage annually to ensure all contractors and vendors are covered.
