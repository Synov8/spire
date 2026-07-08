---
title: "SOC 2 Incident Response with PagerDuty: Configuration and Compliance Automation"
published: "2027-01-12"
description: "Complete guide to configuring PagerDuty for SOC 2 CC7.3 incident response compliance. Covers escalation policies, on-call schedules, incident classification, response time SLAs, postmortems, and automated evidence capture."
author: "Spire Team"
tags:
  - SOC 2
  - PagerDuty
  - Incident Response
  - On-Call
  - Monitoring
---

PagerDuty processes over 52 million incidents annually and is SOC 2 Type II certified, yet a 2026 PagerDuty report found that organizations using structured escalation policies respond to incidents 4.3x faster than those without. SOC 2 CC7.3 requires documented incident response procedures that include detection, analysis, containment, eradication, and recovery. PagerDuty's incident response platform transforms these requirements into automated, measurable workflows. This guide covers PagerDuty configuration for SOC 2 incident response compliance.

## How Does PagerDuty Map to SOC 2 Controls?

CC7.3 maps to PagerDuty's incident management lifecycle: auto-escalation, severity classification, notification rules, and post-incident review. CC7.2 maps to PagerDuty's alert rules, event intelligence, and monitoring integration. CC6.1 maps to PagerDuty's SSO enforcement and team-based access controls. CC7.1 maps to PagerDuty's integration with threat detection tools.

## What Escalation Policies Should You Configure?

Create tiered escalation policies: first responder acknowledges within 15 minutes, escalates to secondary after 15 minutes of no acknowledgement, escalates to incident manager after 30 minutes, and escalates to engineering director after 60 minutes for critical incidents. Configure severity levels: SEV1 (critical service degradation) with 15-minute response, SEV2 (partial outage) with 30-minute response, SEV3 (non-critical) with 4-hour response, and SEV4 (informational) with next business day response. Document these SLA targets in your incident response policy.

## How Do You Integrate Monitoring Tools for CC7.2?

Connect PagerDuty to your monitoring stack: Datadog, CloudWatch, Azure Monitor, and Prometheus for infrastructure alerts; Sentry or Rollbar for application errors; and WAF or IDS/IPS tools for security alerts. Configure event intelligence rules to deduplicate, suppress, and group related alerts. Set priority thresholds aligning alert severity with PagerDuty incident severity. This integration satisfies CC7.2's requirement for continuous monitoring and alerting.

## What Incident Response Documentation Satisfies CC7.3?

Require incident responders to document: detection time and source, incident classification (security, availability, performance, or data integrity), systems affected, impact assessment, containment actions taken with timestamps, root cause analysis, remediation steps, and verification of recovery. Use PagerDuty's incident notes and custom fields to capture each element. Link each incident to a post-incident review (postmortem) completed within 5 business days.

## How Do You Generate SOC 2 Evidence from PagerDuty?

Create a PagerDuty dashboard showing: incident count by severity over the audit period, mean time to acknowledge per severity, mean time to resolve per severity, escalation rate, and postmortem completion rate. Export incident logs showing the full lifecycle — detection timestamp, first acknowledgement, escalation chain, response actions, and resolution timestamp. Schedule automated weekly compliance report exports.

## What Post-Incident Review Process Should You Follow?

After every SEV1 and SEV2 incident, complete a postmortem within 5 business days documenting: incident summary with timeline, root cause analysis, what worked and what didn't, action items with owners and deadlines, and any policy or control improvements needed. Track action items to completion in PagerDuty or linked Jira. Review postmortem completion as a SOC 2 control metric. Map each postmortem action item to specific SOC 2 control improvements.

## How Should You Prepare for a SOC 2 Audit with PagerDuty?

Export PagerDuty incident logs for the full audit period showing every incident with lifecycle timestamps. Export escalation policy configurations. Generate mean-time-to-acknowledge and mean-time-to-resolve metrics. Export postmortem documents for all SEV1 and SEV2 incidents. Document PagerDuty's SOC 2 Type II certification. Provide auditors with view-only access to PagerDuty's incident timeline and configuration settings.
