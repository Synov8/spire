---
title: "SOC 2 Compliance with Microsoft 365: Configuration and Audit Evidence Guide"
published: "2027-01-08"
description: "Complete guide to configuring Microsoft 365 for SOC 2 compliance. Covers Purview compliance portal, Conditional Access policies, DLP rules, audit log retention, retention labels, Defender for 365, and automated evidence collection."
author: "Spire Team"
tags:
  - SOC 2
  - Microsoft 365
  - Compliance
  - Email Security
  - Data Protection
---

Microsoft 365 is SOC 2 Type II certified and serves over 345 million paid commercial users, yet a 2026 Microsoft compliance survey found that 53% of organizations had audit findings related to M365 misconfigurations. Microsoft's Purview compliance portal provides over 70 pre-built compliance controls that map directly to SOC 2 trust criteria. This guide covers every configuration required to satisfy SOC 2 controls across Exchange Online, SharePoint, OneDrive, and Teams.

## How Does Microsoft 365 Map to SOC 2 Controls?

CC6.1 (logical access) maps to Entra ID Conditional Access policies and role-based access. CC6.5 (authentication) maps to MFA enforcement and password policies. CC6.7 (encryption) maps to Purview Message Encryption and Microsoft Information Protection. CC6.8 (configuration management) maps to device compliance policies and Intune. CC7.2 (monitoring) maps to Purview Audit log export and Microsoft Sentinel integration.

## What Conditional Access Policies Are Required?

Require MFA for all users with a conditional access policy covering all cloud apps. Block legacy authentication at the tenant level. Require compliant or hybrid-joined devices for access to sensitive data. Enforce session controls for risky sign-ins with a 14-day sign-in frequency policy. Use risk-based conditional access requiring password change with medium risk. Block access from unknown or unsupported locations. These policies satisfy CC6.1 and CC6.5.

## How Do You Configure Purview Audit for SOC 2?

Enable unified audit logging in Purview compliance portal. Configure audit log retention for 365 days minimum — use audit retention policies for compliance-critical workloads. Enable mailbox auditing for all users with default-on configuration. Stream audit logs to Microsoft Sentinel for SIEM integration. Create audit log search queries that generate SOC 2 evidence on demand. Export audit records programmatically via Purview Audit Graph API.

## What DLP and Information Protection Should You Deploy?

Create Microsoft Purview DLP policies for sensitive data types: credit card numbers, SWIFT codes, bank account numbers, PII, and credentials. Configure auto-labeling for sensitive content using trainable classifiers. Apply sensitivity labels with encryption to documents containing financial data or PII. Enable Microsoft Purview Data Lifecycle Management with retention labels that auto-archive compliance records. Map these to SOC 2 CC6.7 and CC6.8.

## What Insider Risk Controls Address SOC 2?

Deploy Microsoft Purview Insider Risk Management with policies for data theft, data leakage, and security policy violations. Configure risk indicators for downloads to unapproved devices, mass file copying, and abnormal file sharing. Set severity thresholds aligned to SOC 2's risk assessment framework. Enable communication compliance policies for executive and finance teams. Review and escalate insider alerts within the SOC 2 incident response window.

## How Do You Manage Access Reviews and Entitlements?

Schedule quarterly Entra ID access reviews for privileged roles, guest users, and application assignments. Use Azure AD Entitlement Management to create access packages with expiration dates. Automatically remove access when reviews are completed or access packages expire. Require manager approval for all access package requests. Generate access review reports as SOC 2 evidence. Map access reviews to SOC 2 CC6.3 and CC6.4.

## How Should You Prepare for a SOC 2 Audit with Microsoft 365?

Run Purview Compliance Manager's SOC 2 assessment to generate a readiness score. Export the SOC 2 assessment report showing control-by-control compliance. Stream Purview audit logs to Sentinel for the full audit period. Generate DLP incident reports and sensitivity label usage reports. Document Microsoft 365's SOC 2 Type II certification. Provide read-only auditor access to Purview Compliance Manager. Pre-audit evidence packages can be auto-generated through Compliance Manager, reducing preparation time by approximately 50%.
