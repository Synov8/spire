---
title: "Encryption Standards for SaaS: AES-256, TLS 1.3, and Key Management Compliance"
published: "2026-12-31"
description: "Encryption standards and requirements for SOC 2, HIPAA, PCI DSS, and GDPR compliance. Covers AES-256 encryption for data at rest, TLS 1.2+ for data in transit, key management practices (AWS KMS, GCP Cloud KMS, HashiCorp Vault), key rotation cadence, and evidence collection for encryption controls (CC6.7, CC6.1)."
author: "Spire Team"
tags:
  - Encryption
  - AES-256
  - TLS
  - Key Management
  - Compliance
  - Data Protection
---

Encryption is one of the most frequently tested SOC 2 controls (CC6.7 — encryption at rest and in transit) and a non-negotiable requirement for HIPAA, PCI DSS, GDPR, and most enterprise security policies — with AES-256 as the accepted standard for data at rest and TLS 1.2 minimum (TLS 1.3 preferred) for data in transit, according to a 2025 NIST cryptographic standards update. Evidence of encryption configuration is among the easiest SOC 2 controls to automate.

## What Encryption Is Required for Data at Rest?

Data at rest encryption requires AES-256 (Advanced Encryption Standard with 256-bit keys) as the minimum standard. Cloud provider-native encryption (AWS S3 SSE-S3 or SSE-KMS, GCP CSEK, Azure SSE) satisfies this requirement for infrastructure storage. Database encryption (AWS RDS encryption, GCP Cloud SQL CMEK, Azure TDE) covers database storage. Application-level encryption provides additional protection for sensitive fields.

## What Encryption Is Required for Data in Transit?

Data in transit encryption requires TLS 1.2 minimum, with TLS 1.3 strongly preferred. All HTTP traffic must be served over HTTPS. Internal service-to-service communication should use mTLS or equivalent. API endpoints must enforce TLS. Certificate management should include automated renewal via Let's Encrypt or equivalent. HSTS headers should be configured.

## What Key Management Practices Satisfy Auditors?

Key management evidence includes key rotation cadence (AES keys rotated at least annually, TLS certificates rotated at least every 398 days), access control for key management (IAM policies restricting key access, key usage auditing), and hardware security module (HSM) use for master keys.

## FAQ

### Does SOC 2 require specific encryption algorithms?

SOC 2 CC6.7 requires encryption to be consistent with industry standards but does not mandate specific algorithms. AES-256 and TLS 1.2+ are the accepted industry standards. Using weaker algorithms (DES, RC4, SSL 3.0) will result in findings.

### Can I use cloud provider encryption for SOC 2 evidence?

Yes. Cloud provider encryption configuration evidence (AWS KMS key policies, S3 bucket encryption settings, RDS encryption configuration) is accepted by SOC 2 auditors as evidence of CC6.7 compliance.

### What encryption evidence must I retain for the observation period?

Evidence of encryption configuration at the start and end of the observation period, plus evidence of any configuration changes during the period. Automated evidence collection that captures encryption configuration weekly provides the strongest audit trail.
