---
title: "SOC 2 Availability Trust Service Criteria: Complete Deep Dive"
published: "2026-10-09"
description: "Complete guide to SOC 2 Availability TSC (A1.1–A1.3) covering infrastructure capacity planning, uptime monitoring, incident communication, and disaster recovery testing. Includes SLA alignment strategies, monitoring tool requirements, and auditor evidence expectations for all three controls."
author: "Spire Team"
tags:
  - SOC 2
  - Availability
  - TSC
  - SLA
  - Disaster Recovery
  - Monitoring
---

The SOC 2 Availability trust service criterion covers three controls — A1.1 (capacity planning and monitoring), A1.2 (incident communication), and A1.3 (disaster recovery testing) — and companies that include it see customer contract values increase by 12% to 18% when they can back uptime SLAs with audited availability controls, according to a 2025 Gartner analysis. Approximately 31% of SOC 2 reports include the Availability TSC.

## A1.1: Capacity Planning and Monitoring

A1.1 requires the entity to monitor system capacity and plan for capacity growth to maintain availability commitments. Evidence for A1.1 includes capacity monitoring dashboards showing CPU, memory, storage, and network utilization over the observation period, documented capacity planning procedures with defined thresholds, evidence of capacity reviews at least monthly, and records of infrastructure scaling events or capacity increases.

The capacity plan should include current utilization trends, projected growth based on customer acquisition forecasts, and trigger thresholds for adding capacity. AWS CloudWatch, Datadog, New Relic, and Grafana are the most common monitoring tools used as evidence sources.

## A1.2: Incident Communication

A1.2 requires the entity to communicate incidents affecting availability to internal and external stakeholders according to defined procedures. Evidence for A1.2 includes documented incident communication procedures specifying notification channels, escalation timelines, and stakeholder communication templates. The procedures must define communication timing — typically within 15 to 30 minutes of incident declaration for critical availability events.

Evidence also includes incident communication records showing that notifications were sent within defined SLAs. Status page tools like Statuspage, incident management platforms like PagerDuty, and customer notification systems serve as evidence sources.

## A1.3: Disaster Recovery Testing

A1.3 requires the entity to test disaster recovery procedures at least annually and document the results. Evidence for A1.3 includes a documented disaster recovery plan with defined RTO and RPO targets, DR test reports showing test date, scope, participants, and results, remediation plans for identified gaps, and evidence of DR plan updates based on test outcomes.

The AICPA recommends DR testing evidence include tabletop exercise records, technical failover test results, and post-test remediation tracking. RTO and RPO targets must be specified in customer SLAs to provide context for the adequacy of the DR plan.

## FAQ

### Does SOC 2 Availability require specific uptime percentages?

No. SOC 2 Availability TSC requires the entity to meet its stated availability commitments. The uptime target is defined by the entity in customer SLAs, not by SOC 2. Evidence must demonstrate that actual availability met or exceeded the stated targets.

### How often should DR testing occur?

SOC 2 requires at least annual DR testing. Most auditors recommend quarterly tabletop exercises plus annual technical failover testing. Companies with strict SLAs (99.99%+ uptime) should test more frequently.

### What RPO/RTO is typical for SaaS companies?

Typical RPO for SaaS companies: 15 to 60 minutes. Typical RTO: 4 to 24 hours. These targets should be based on customer SLAs and business impact analysis results.
