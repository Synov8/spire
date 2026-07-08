---
title: "SOC 2 Compliance with Google Workspace: Configuration and Audit Guide"
published: "2027-01-07"
description: "Complete guide to configuring Google Workspace for SOC 2 compliance. Covers admin console security settings, Google Vault for retention, audit log export, Drive DLP, Workspace Access Controls, and automated compliance evidence."
author: "Spire Team"
tags:
  - SOC 2
  - Google Workspace
  - Cloud Security
  - Email
  - Data Protection
---

Google Workspace serves over 3 billion users and is SOC 2 Type II certified, yet a 2026 compliance audit study found that 41% of SOC 2 audit findings related to workplace tool misconfigurations started in Google Workspace settings. The Google Workspace Admin console contains over 200 security settings that map to SOC 2 controls CC6.1, CC6.5, CC6.7, CC6.8, and CC7.2. This guide covers every setting you need to configure for SOC 2 compliance.

## How Does Google Workspace Map to SOC 2 Controls?

CC6.1 (logical access) maps to Workspace SSO enforcement, OAuth app allowlisting, and user account controls. CC6.5 (identification and authentication) maps to 2-Step Verification enforcement and session length policies. CC6.7 (encryption) maps to Google Workspace's encryption at rest and in transit plus S/MIME or Client-side encryption. CC6.8 (data transmission) maps to Drive sharing rules and external collaboration policies. CC7.2 (monitoring) maps to Workspace audit log export.

## What Security Settings Should You Configure in the Admin Console?

Enforce 2-Step Verification for all organizational units with a grace period of no more than 14 days. Set session length to 12 hours maximum. Allowlist only approved OAuth apps for your domain. Restrict Google Drive sharing to your domain for files containing sensitive data. Enable context-aware access for high-risk applications. Disable account recovery options that bypass SSO. Configure password length requirements to 12 characters minimum.

## How Do You Configure Google Vault for SOC 2?

Enable Google Vault for all services including Gmail, Drive, Chat, and Meet. Set retention policies to hold data for a minimum of 7 years for compliance-relevant records. Create custom retention rules for finance, legal, and HR departments with longer retention periods. Configure litigation holds for active compliance investigations. Export data on demand for audit evidence. Enable audit log export from Vault to BigQuery for queryable long-term access.

## What Audit Logging Should You Enable?

Export Workspace audit logs — including Admin, Login, Drive, Gmail, and Meet logs — to Google Cloud Logging or a SIEM. Monitor for high-risk events: admin role assignments, suspicious logins flagged by anomalous activity detection, Drive sharing outside the domain, and OAuth token grants to third-party apps. Retain audit logs for 365 days minimum. Create log-based metrics and alerts for unauthorized access attempts.

## How Do You Manage External Sharing for SOC 2?

Set Drive sharing defaults to your domain with warnings when sharing externally. Require expiration dates on external file shares. Disable sharing for training, confidential, and restricted data classification labels. Use Google Workspace's data classification service with DLP to automatically detect and restrict sharing of PII, financial data, and credentials. Audit external sharing activity weekly through Drive audit logs.

## What DLP Rules Should You Implement?

Create DLP rules in the Admin console to detect sensitive data types: credit card numbers, SSNs, API keys, passport numbers, and private keys. Configure automatic action on match: block sharing, warn the user, or quarantine the message. Enable DLP for Gmail and Drive content. Use optical character recognition rules for image-based data leakage. Test DLP rules against a sample of your data before full deployment.

## How Should You Prepare for a SOC 2 Audit with Workspace?

Generate a security settings report from the Admin console showing all configured policies. Export audit logs for the full audit period. Run a Google Workspace Security Center investigation showing threat detection and response. Export Google Vault retention policy documentation. Document Workspace's SOC 2 certification. Provide your auditor with a read-only Workspace administrator account to verify security configurations directly.
