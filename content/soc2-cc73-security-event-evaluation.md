---
title: "SOC 2 CC7.3: Security Event Evaluation and Escalation Procedures"
published: "2026-07-12"
description: "Complete guide to SOC 2 CC7.3 security event evaluation requirements. Covers event classification frameworks, escalation procedures, evidence documentation, and auditor expectations. Includes severity classification matrix and SLA templates aligned with NIST SP 800-61 incident response standards."
author: "Spire Team"
tags:
  - SOC 2
  - CC7.3
  - Security Events
  - Incident Response
  - B2B SaaS
---

SOC 2 CC7.3 requires that the entity evaluates security events to determine whether they constitute security incidents requiring escalation and response, with defined criteria for classification and documented escalation paths. The NIST SP 800-61 Rev. 2 incident handling guide serves as the reference framework for CC7.3, and SOC 2 auditors consistently reference it during evaluation of this control.

## How Should Security Events Be Classified?

Security events must be classified into severity levels — typically three or four tiers — with clear criteria for each level and defined escalation paths. A standard classification matrix maps events to severity based on data sensitivity, user privilege level, system criticality, and potential business impact.

The classification must distinguish between events and incidents. An event is an observable occurrence — a failed login, a configuration change, an unusual network connection. An incident is an event that violates security policy or indicates an actual or probable breach. CC7.3 requires the evaluation process to make this determination consistently and document it.

## What Is the Expected Escalation Workflow?

Each severity level must have a documented escalation workflow specifying who is notified, within what timeframe, and what actions they must take. A typical workflow includes: Level 1 events logged for daily review, Level 2 events notified to the on-call engineer within 4 hours, Level 3 events notified to the security lead within 1 hour, and Level 4 events triggering immediate response team activation with CISO notification.

A 2025 SANS incident response survey found that organizations with documented escalation procedures contained incidents 54% faster than those without predefined escalation paths.

## What Evidence Does CC7.3 Require?

The auditor needs the documented event classification matrix and escalation procedures, evidence that the procedures were followed during the Type II period, event evaluation logs showing how each security event was classified and resolved, and evidence of escalation when criteria were met. Missing escalation evidence for events that met threshold criteria is the most common CC7.3 deficiency.

## How Often Should Event Evaluation Procedures Be Tested?

CC7.3 procedures should be tested at least annually through tabletop exercises or simulated events. The test should verify that the classification matrix produces consistent results, escalation notifications reach the correct people, and the documentation captures all required evidence.

## What Event Sources Must Be Included in Evaluation?

The evaluation process must cover events from all monitored systems within the SOC 2 scope boundary. The minimum event source list includes: authentication system logs (failed logins, account lockouts, password changes), cloud infrastructure logs (configuration changes, IAM modifications, security group changes), application logs (application errors, data access patterns, API anomalies), network logs (unusual connections, blocked traffic, data transfer anomalies), and endpoint detection and response logs (malware detections, suspicious process executions, unauthorized software).

Each event source must be configured to send events to the centralized evaluation queue or SIEM. Event sources that are not integrated into the evaluation workflow represent monitoring gaps. A 2025 SANS survey found that 43% of CC7.3 deficiencies involved event sources that generated logs but were not included in the evaluation and classification workflow.

## How Should Evaluation Results Be Documented?

Each evaluation should produce a record containing: the event timestamp and source, the event type and description, the classification determination (routine event or potential incident), the evaluator's name and decision rationale, and any escalation actions taken. The documentation format can be a SIEM case management log, a ticketing system record, or a compliance platform audit log.

The evaluation log must be retained for the full Type II observation period plus the audit fieldwork period. Incomplete evaluation documentation — events logged but missing classification decisions or evaluator sign-off — is the second most common CC7.3 deficiency after missing escalation evidence.

## FAQ

### Can event evaluation be fully automated?

Automated classification is acceptable for standard events, but human evaluation is required for events that could constitute incidents. The control specifically requires "evaluation" — automated triage with human review for escalated events.

### What if we had no security events during the period?

Reporting zero events is plausible for small SaaS companies with mature controls, but the auditor expects to see evaluation evidence nonetheless. A log showing "no events met escalation criteria" with a reviewer sign-off satisfies the control.

### How often should event evaluation procedures be tested?

CC7.3 evaluation procedures should be tested at least annually through tabletop exercises or simulated events. The test should verify that the classification matrix produces consistent results and that escalation notifications reach the correct people within the defined SLA.
