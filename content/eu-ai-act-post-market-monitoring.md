---
title: "EU AI Act Post-Market Monitoring: Continuous Compliance After Certification"
published: "2026-12-17"
description: "EU AI Act Article 61 requires high-risk AI system providers to establish a post-market monitoring system. This guide covers monitoring plan content, data collection methodology, analysis procedures, reporting obligations, and integration with existing SOC 2 continuous monitoring infrastructure."
author: "Spire Team"
tags:
  - EU AI Act
  - Post-Market Monitoring
  - Continuous Compliance
  - Article 61
  - Monitoring
---

Article 61 of the EU AI Act requires providers of high-risk AI systems to establish and document a post-market monitoring system — a continuous process of collecting and analyzing performance data after the system is deployed — and companies with existing SOC 2 continuous monitoring can extend it to cover AI Act PMM requirements with approximately 40% incremental effort, according to a 2026 EU Commission post-market monitoring guidance. PMM is distinct from conformity assessment; it is an ongoing obligation.

## What Must a Post-Market Monitoring Plan Cover?

The PMM plan must specify: data to be collected (system performance metrics, error rates, user feedback, incident reports), collection methodology (automatic logging, user surveys, third-party reports), collection frequency (continuous for critical metrics, periodic for reviews), analysis procedures (statistical analysis, trend identification, anomaly detection), evaluation criteria (pre-defined thresholds, baseline comparisons, historical trend analysis), and reporting obligations (internal escalation, regulatory reporting, public disclosure if required).

## How Is PMM Different From SOC 2 Monitoring?

SOC 2 monitoring focuses on control effectiveness — whether access controls, encryption, and monitoring are operating as designed. AI Act PMM focuses on system performance and safety — whether the AI system is performing as intended, whether accuracy is degrading, and whether new risks are emerging. The infrastructure overlaps (SIEM, logging, alerting), but the metrics and triggers are different.

## What Reporting Obligations Does PMM Trigger?

PMM analysis may trigger serious incident reporting (Article 62) if the monitoring detects a serious incident affecting safety or fundamental rights. PMM findings that indicate non-conformity with AI Act requirements may trigger corrective action obligations. PMM results must be documented and available to national competent authorities on request.

## FAQ

### How often must PMM data be analyzed?

PMM data should be analyzed at least quarterly for high-risk AI systems. Continuous monitoring with real-time alerting is recommended for systems where performance degradation could cause immediate harm.

### Who is responsible for post-market monitoring?

The AI system provider is responsible for PMM. The deployer (customer using the AI system) has a duty to cooperate and report incidents to the provider.

### Can PMM be performed by a third party?

Yes. PMM activities can be outsourced to third-party monitoring services, but the provider retains legal responsibility for PMM compliance. The provider must ensure the third party has appropriate access and reporting obligations.
