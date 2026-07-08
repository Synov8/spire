---
title: "SOC 2 Logging Standards Guide: Requirements, Configuration, and Audit Evidence"
published: "2027-01-16"
description: "Complete guide to SOC 2 logging requirements covering CC7.2 monitoring. Includes log sources, retention periods, SIEM integration, log integrity, alerting rules, and automated evidence collection for audit readiness."
author: "Spire Team"
tags:
  - SOC 2
  - Logging
  - Monitoring
  - SIEM
  - Audit
---

SOC 2 CC7.2 requires organizations to "monitor system components and the execution of procedures to detect anomalies that could indicate potential security events." A 2026 SANS logging survey found that organizations with SOC 2-compliant logging practices detect security incidents 5.8x faster than those without structured logging programs. This guide covers comprehensive logging standards that satisfy SOC 2 auditor requirements across all five trust service criteria.

## What Log Sources Must Be Included in SOC 2 Scope?

All systems in your SOC 2 scope must generate logs. Critical log sources include: cloud provider activity logs (CloudTrail, Azure Activity Log, Cloud Audit Logs), authentication logs from identity providers, application logs from production systems, database audit logs, network device logs and VPC flow logs, API gateway logs, operating system audit logs (syslog, Windows Event Log), security tool logs (WAF, IDS/IPS, antivirus, EDR), and building access logs for physical security.

## What Log Retention Period Satisfies SOC 2?

Retain all security-relevant logs for a minimum of 365 days. Financial or regulated data may require longer retention (up to 7 years). Archive logs to immutable storage (S3 Object Lock, Azure Blob Storage immutability, GCS Bucket Lock) after the active retention period. Ensure archived logs are restorable within 24 hours. Active logs should be searchable in your SIEM for at least 90 days. Document your retention schedule by log type in your logging policy.

## How Do You Ensure Log Integrity for SOC 2?

Log integrity is critical for evidentiary value. Implement these mechanisms: forward logs directly from sources to a centralized logging platform to prevent local tampering, enable log file integrity validation (CloudTrail log file integrity, Windows EventLog forwarding), use write-once-read-many (WORM) storage for log archives, restrict log deletion and modification permissions to a limited set of authorized administrators, and enable audit trails on the logging platform itself.

## What SIEM Configuration Satisfies CC7.2?

Deploy a SIEM or centralized logging platform that: ingests logs from all in-scope systems within 5 minutes of generation, retains searchable logs for at least 90 days, archives logs for 365+ days, generates alerts on defined detection rules (unauthorized access, privilege escalation, anomaly detection, IAM changes, security group changes), and supports automated evidence export for SOC 2 audits.

## What Alert Rules Should You Configure?

Create detection rules for at minimum: unauthorized API calls (failed authentication, forbidden resource access), IAM policy changes, security group and firewall rule modifications, root or break-glass account usage, data export or large file downloads, service account and API key creation, user account modification and privilege escalation, and access from unusual geographic locations or at unusual times. Define severity levels and notification SLAs for each alert type.

## How Do You Generate SOC 2 Evidence from Logs?

Create predefined log queries that generate audit evidence on demand: user access logs for the audit period, system administrative activity reports, failed authentication attempt summaries, change management log traces (who modified what and when), incident response log trails showing detection and containment timelines, and log coverage reports demonstrating that all in-scope systems are logging. Store these queries as reusable SOC 2 evidence templates.

## What Evidence Should You Present to Your Auditor?

Your auditor will request: the logging policy documenting requirements and retention, a log source inventory listing every system and its log configuration, log retention configuration showing 365-day minimum retention, log integrity controls and immutability proof, SIEM alert rule definitions, evidence of monitoring coverage across all in-scope systems, and sample alert response documentation for detected anomalies.
