---
title: "SOC 2 Backup Policy Guide: Requirements, Configuration, and Evidence"
published: "2027-01-14"
description: "Complete guide to SOC 2 backup policy requirements covering CC6.6 and A1.2. Includes backup scheduling, retention periods, encryption, geographic redundancy, RPO/RTO targets, restore testing, and automated evidence capture."
author: "Spire Team"
tags:
  - SOC 2
  - Backup
  - Disaster Recovery
  - Availability
  - Data Protection
---

SOC 2 CC6.6 (prevention of theft and misuse) and A1.2 (processing integrity) require documented and tested backup policies that ensure data availability, integrity, and recoverability. A 2026 Gartner survey found that organizations with SOC 2-compliant backup policies recover from data loss incidents 6.2x faster than those without formal policies, with average recovery times under 4 hours compared to over 24 hours. This guide covers backup policy requirements and configuration for SOC 2 compliance.

## What Are SOC 2 Backup Requirements?

CC6.6 requires backup and recovery mechanisms to prevent data loss. A1.2 requires that processing activities be monitored to ensure data completeness, accuracy, timeliness, and authorization. Specific backup requirements include: automated daily backups for all critical systems, encryption of backups at rest and in transit, geographic separation of primary and backup data, documented RPO (Recovery Point Objective) and RTO (Recovery Time Objective), quarterly restore testing with documented results, and offsite or air-gapped backup storage.

## How Should You Configure Backup Schedules and Retention?

Set automated daily backups with a maximum RPO of 24 hours for production databases and systems. For critical financial or customer data, configure transactional backup frequency (every 15 minutes to hourly). Retain daily backups for 30 days, weekly backups for 12 weeks, and monthly backups for 12 months or longer based on contractual requirements. Store backups in at least two geographically separate regions. Enable immutable backup storage to prevent deletion or modification.

## What Encryption Requirements Apply to Backups?

Encrypt all backups at rest using AES-256 or equivalent. Encrypt backup data in transit during transmission to backup storage. Manage encryption keys separately from backup data using a key management service (AWS KMS, Azure Key Vault, GCP Cloud KMS). Document key management procedures including key rotation schedule. Ensure that backup decryption keys are available for restore even if primary systems are unavailable.

## How Do You Document RPO and RTO?

Set specific RPO and RTO targets for each system tier. Tier 1 (customer-facing production databases): RPO of 15 minutes, RTO of 1 hour. Tier 2 (internal business systems): RPO of 4 hours, RTO of 4 hours. Tier 3 (non-critical systems): RPO of 24 hours, RTO of 24 hours. Document these targets in your backup policy and test them quarterly. Update targets annually based on business requirement changes.

## What Restore Testing Satisfies SOC 2?

Conduct full restore testing quarterly for all Tier 1 and Tier 2 systems. Document each restore test including: date and time of restore, system restored, person performing the restore, steps followed, time to restore, verification that data is complete and accurate, any issues encountered, and sign-off by system owner. Retain restore test results for at least 2 years. Remediate any restore failures within 30 days and re-test.

## How Do You Automate Backup Compliance Evidence?

Monitor backup success rates through your cloud provider (AWS Backup, Azure Backup, GCP Backup) or backup tool. Set up alerts for backup failures with 24-hour remediation SLAs. Generate automated weekly reports showing: backup status by system (success, failure, or warning), retention compliance, encryption status, restore test completion and results, and any exceptions with remediation status. Integrate backup status with your compliance platform for continuous monitoring.

## What Evidence Should You Provide During an Audit?

Your SOC 2 auditor will request: the backup policy document with version history and approval, backup configuration showing schedule and retention for each system, encryption configuration for backup storage, RPO and RTO documentation by system tier, the last four quarterly restore test reports, backup success rate reports for the audit period (target 99.9% or higher), and any backup failure remediation documentation.
