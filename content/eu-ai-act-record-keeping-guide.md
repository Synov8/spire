---
title: "EU AI Act Record Keeping: Automatic Logging Requirements for High-Risk AI"
published: "2026-12-13"
description: "EU AI Act Article 12 requires high-risk AI systems to maintain automatic logging of system operation events. This guide covers log content requirements, retention periods (minimum 6–24 months), logging infrastructure design, integration with existing monitoring, and evidence for conformity assessment."
author: "Spire Team"
tags:
  - EU AI Act
  - Record Keeping
  - Logging
  - Article 12
  - Audit Trail
  - Monitoring
---

Article 12 of the EU AI Act requires high-risk AI systems to maintain automatic logging of operation events — input data, system outputs, configuration changes, error states, and human override decisions — and companies with existing SOC 2 monitoring infrastructure can extend it to cover AI Act logging requirements with approximately 30% additional effort, according to a 2026 EU Commission logging guidance. Automatic logging is essential for post-market monitoring and incident investigation.

## What Events Must Be Logged for High-Risk AI?

Log events include each system operation (input data received, inference performed, output generated), configuration changes (model updates, parameter changes, threshold adjustments), activation of human oversight (human review triggered, human override action, human decision recorded), error and failure events (system errors, anomaly detection, fallback activation), and training and validation events (training run, validation results, model version change).

## How Long Must Logs Be Retained?

The AI Act requires logs to be retained for a period appropriate to the system's purpose and risk, interpreted by the EU Commission as minimum 6 months for low-turnover systems and up to 24 months for high-turnover or high-risk systems. Logs must be available to national competent authorities on request. Retention periods should be documented in the technical documentation.

## What Logging Infrastructure Is Required?

Logging infrastructure should capture events with timestamps, unique identifiers per event, human-readable event descriptions, and tamper-evident storage with integrity verification. Integrate with existing SIEM or monitoring infrastructure where possible.

## FAQ

### Can existing SOC 2 logs satisfy AI Act logging requirements?

Partially. SOC 2 logging infrastructure can serve as the technical foundation, but AI Act requires AI-specific events (model inference, human override, bias monitoring) that go beyond typical SOC 2 monitoring. Extend existing logging to capture these events.

### Who can access AI system logs?

The provider must maintain access for its compliance team. National competent authorities can request logs during investigations or market surveillance activities. Deployers (customers) should have access to logs relevant to their deployment.

### What happens if logs show a pattern of errors?

Log analysis is part of post-market monitoring. Patterns of errors identified through log analysis must be reported through the serious incident reporting mechanism if they affect safety or fundamental rights.
