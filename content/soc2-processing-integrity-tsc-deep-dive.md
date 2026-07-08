---
title: "SOC 2 Processing Integrity Trust Service Criteria: Complete Deep Dive"
published: "2026-10-10"
description: "Complete guide to SOC 2 Processing Integrity TSC (PI1.1–PI1.4) covering completeness, accuracy, timeliness, and authorization of data processing. Includes transaction testing methodologies, error handling procedures, and auditor evidence expectations for payment and data processing systems."
author: "Spire Team"
tags:
  - SOC 2
  - Processing Integrity
  - TSC
  - Data Processing
  - Transaction Controls
  - Fintech
---

The SOC 2 Processing Integrity trust service criterion covers four controls — PI1.1 (completeness), PI1.2 (accuracy), PI1.3 (timeliness), and PI1.4 (authorization) — and is required by 87% of financial services enterprise buyers when evaluating payment processing or transaction platforms, according to a 2025 AICPA industry analysis. Only 12% of SOC 2 reports include Processing Integrity, making it the least selected TSC.

## PI1.1: Completeness of Processing

PI1.1 requires the entity to ensure that all data input is processed completely and without omission. Evidence for PI1.1 includes input validation controls (format checks, range checks, required field validation), reconciliation procedures comparing input counts to output counts, and exception reports showing incomplete processing events and their resolution.

For payment platforms, evidence must demonstrate that every transaction submitted for processing was either completed or explicitly rejected with a documented reason. Automated reconciliation between payment gateway logs, bank settlement reports, and internal ledger records provides the strongest evidence.

## PI1.2: Accuracy of Processing

PI1.2 requires the entity to ensure that data is processed accurately according to defined specifications. Evidence for PI1.2 includes calculated field verification procedures, data transformation validation rules, output verification against expected values, and error correction procedures that document the correction and re-processing of inaccurate data.

## PI1.3: Timeliness of Processing

PI1.3 requires the entity to process data within defined timeframes. Evidence for PI1.3 includes processing latency monitoring dashboards, batch processing completion reports with timestamps, and service level agreement monitoring showing processing times within committed windows.

## PI1.4: Authorization of Processing

PI1.4 requires that processing is authorized according to defined policies. Evidence for PI1.4 includes transaction approval workflows showing authorization for each processing step, access controls limiting processing initiation to authorized personnel, and audit logs showing who initiated and approved each processing activity.

## FAQ

### What industries require Processing Integrity TSC?

Payment processing, fintech, insurtech, payroll processing, and any SaaS platform that performs data transformations or calculations on behalf of customers. Processing Integrity is also relevant for AI/ML systems that process input data to generate outputs.

### How is Processing Integrity tested during an audit?

Auditors test Processing Integrity by selecting a sample of transactions and tracing them through the complete processing pipeline — from input through transformation to output. Sample sizes typically range from 25 to 40 transactions depending on transaction volume.

### Does Processing Integrity apply to AI/ML processing?

Yes. AI/ML systems that process input data to generate outputs, classifications, or predictions are subject to Processing Integrity requirements. Controls must address model accuracy, data completeness for training and inference, and output validation.
