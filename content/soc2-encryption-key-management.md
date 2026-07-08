---
title: "SOC 2 Encryption and Key Management Guide: Requirements and Best Practices"
published: "2027-01-15"
description: "Complete guide to SOC 2 encryption and key management requirements covering CC6.7. Includes encryption at rest and in transit standards, key lifecycle management (AWS KMS, Azure Key Vault, GCP Cloud KMS), automated key rotation, and HSM requirements."
author: "Spire Team"
tags:
  - SOC 2
  - Encryption
  - Key Management
  - Data Security
  - Cryptography
---

SOC 2 CC6.7 requires encryption technologies to protect customer data at rest and in transit, with a 2026 Ponemon Institute study finding that organizations with automated key management experience 63% fewer encryption-related audit findings than those with manual processes. Encryption is not optional for SOC 2 — any customer data stored without encryption or transmitted over unencrypted channels constitutes a control deficiency. This guide covers encryption requirements, key management best practices, and common pitfalls.

## What Are SOC 2 Encryption Requirements for Data at Rest?

All customer data stored in databases, file systems, object storage, and backups must be encrypted at rest using AES-256 or equivalent strong encryption. Cloud-managed encryption keys (SSE-S3, SSE-KMS, Azure Storage Service Encryption) satisfy this requirement. Document which encryption algorithms and key lengths are used. Verify encryption is enabled on every data store in your SOC 2 scope — including RDS, DynamoDB, S3, EBS, Elasticsearch, and any other data storage service.

## What Encryption Requirements Apply to Data in Transit?

All data transmitted over public networks must be encrypted using TLS 1.2 or higher. Internal network traffic should be encrypted where it crosses trust boundaries. Specific requirements include: TLS 1.2 minimum on all HTTPS endpoints, disabling TLS 1.0 and 1.1 across all services, valid certificates from trusted CAs, HSTS headers configured on web applications, SSH version 2 for administrative access, and VPN encryption for remote administration.

## How Should You Manage Encryption Keys for SOC 2?

Use a dedicated key management service (AWS KMS, Azure Key Vault, GCP Cloud KMS) rather than application-level key storage. Separate encryption keys from the data they protect. Implement automatic key rotation every 90 days for customer master keys. Document the key hierarchy including master keys, data encryption keys, and their relationships. Control access to keys using IAM policies with least privilege. Audit all key usage and administrative actions.

## What HSM Requirements Apply?

SOC 2 does not require Hardware Security Modules (HSMs) unless customers contractually require FIPS 140-2 Level 3 validation. Cloud KMS offerings (AWS KMS, Azure Key Vault Managed HSM, GCP Cloud HSM) provide FIPS 140-2 Level 3 validated HSM-backed key storage. Use HSM-backed keys for system master keys that protect customer data encryption keys. Document your HSM usage and certifications in your system description.

## How Do You Handle Customer-Managed Encryption Keys?

If customers require their own encryption keys (CMEK or BYOK), implement: dedicated KMS keys per customer, access policies restricting key usage to that customer's application components, automatic key rotation for each customer key, audit logging for all key usage events, and key revocation procedures for customer offboarding. Document the process for customer key management in your system description.

## What Common Encryption Pitfalls Cause Audit Findings?

Unencrypted data in development or staging environments that mirror production. Legacy TLS 1.0 endpoints not discovered during scope definition. Unencrypted internal service-to-service communication. Encryption keys stored in application configuration files, environment variables, or source code. Missing encryption on database backups. Lack of documented key rotation schedule. These issues are among the most commonly cited encryption findings in SOC 2 audits.

## What Encryption Evidence Should You Provide?

Your auditor will request: the encryption policy document, KMS configuration showing key creation, rotation, and access controls, key rotation logs demonstrating compliance with your rotation schedule, TLS configuration showing minimum version 1.2, certificate management procedures, and any encryption exception documentation with compensating controls.
