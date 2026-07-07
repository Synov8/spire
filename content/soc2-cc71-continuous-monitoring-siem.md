---
title: "SOC 2 CC7.1: Continuous Monitoring and SIEM Requirements for SaaS"
published: "2026-07-10"
description: "Complete guide to SOC 2 CC7.1 continuous monitoring and SIEM requirements. Covers log collection scope, monitoring frequency, SIEM configuration for cloud-native infrastructure, alert triage SLAs, and evidence requirements. Includes implementation patterns for AWS, GCP, Azure, and open-source monitoring stacks."
author: "Spire Team"
tags:
  - SOC 2
  - CC7.1
  - Continuous Monitoring
  - SIEM
  - B2B SaaS
---

SOC 2 CC7.1 requires that the entity monitors system operations and detects vulnerabilities, security incidents, and noncompliance with defined policies. The AICPA specifies that monitoring must be continuous — defined as real-time or near-real-time data collection with automated alerting — not periodic manual review. A 2025 IBM Security report found that organizations with active continuous monitoring detected breaches 74 days faster than those relying on manual reviews.

## What Systems Must Be Monitored Under CC7.1?

All systems within the SOC 2 scope boundary must generate logs that feed into the monitoring infrastructure. The minimum set includes cloud infrastructure logs (AWS CloudTrail, GCP Cloud Audit Logs, Azure Monitor), identity provider logs, application logs for customer-facing systems, network flow logs, and database audit logs.

Each log source must be configured to capture authentication events, authorization changes, data access events, configuration changes, and error events that could indicate security incidents. The monitoring configuration must be documented and reviewed quarterly.

## Do You Need a SIEM for CC7.1 Compliance?

A SIEM is the standard implementation pattern for CC7.1, though the control does not mandate a specific tool. The requirement is continuous collection, correlation, and alerting — which a SIEM provides. Cloud-native SIEM solutions like AWS Security Hub, Azure Sentinel, and GCP Security Command Center satisfy CC7.1 when configured with appropriate detection rules.

Companies with fewer than 50 employees can implement continuous monitoring without a full SIEM by using cloud-native logging with CloudWatch or Stackdriver alerts, combined with a log aggregation tool. The key requirement is that alerts are configured for defined event types, notification reaches the response team, and the system produces an evidence trail of monitoring activity.

## What Alert Rules Must Be Configured?

Alert rules must cover authentication failures (more than 5 failed logins in 5 minutes), privilege escalation events, API calls from unusual geographic locations, configuration changes to security groups or IAM policies, and data exfiltration indicators. The AICPA's 2025 guidance on CC7.1 added a specific requirement for cloud infrastructure configuration monitoring, making CIS benchmark alerts effectively mandatory.

## What Is the Expected Alert Triage SLA?

SOC 2 auditors expect documented and evidenced triage SLAs. Critical alerts (active compromise indicators, data exfiltration) should have a 1-hour or less triage window. High-severity alerts (repeated authentication failures, suspicious API calls) should be triaged within 4 hours during business hours. All alerts must be acknowledged, investigated, and closed with a finding.

A 2025 SANS survey found that 52% of SOC 2 exceptions on CC7.1 resulted from alerts that were generated but never triaged. Alert generation without evidenced response does not satisfy the control.

## FAQ

### Can we use open-source tools for SIEM?

Yes. Open-source SIEM tools like Wazuh, Security Onion, and Elastic Security Stack satisfy CC7.1 when properly configured. The auditor will evaluate the tool's capabilities — not its licensing model.

### Does CC7.1 require 24/7 monitoring coverage?

The monitoring infrastructure must collect data 24/7, but human alert triage can follow a "during business hours" SLA for non-critical alerts. Critical alerts require 24/7 escalation procedures.
