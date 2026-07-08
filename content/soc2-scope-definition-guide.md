---
title: "SOC 2 Scope Definition Guide: How to Scope Your First SOC 2 Audit"
published: "2026-10-24"
description: "SOC 2 scope definition determines which systems, services, and controls are included in the audit. This guide covers scope boundary identification, trust service criteria selection, system description development, and common over-scoping and under-scoping mistakes."
author: "Spire Team"
tags:
  - SOC 2
  - Scope
  - Audit Planning
  - System Description
  - Trust Service Criteria
---

SOC 2 scope decisions directly determine audit cost, timeline, and complexity — adding an unnecessary trust service criterion increases costs by 20% to 30% and control count by 15 to 25 controls, according to a 2025 AICPA scope analysis. Getting scope right is the highest-leverage decision in the SOC 2 compliance journey, and scope changes mid-audit are expensive and time-consuming.

## How Do You Define System Boundaries?

System boundaries define what is in scope and what is excluded. Start by listing all systems and services that process, store, or transmit customer data — these are in scope. Include supporting infrastructure (authentication, monitoring, CI/CD) that is critical to the service operation. Exclude systems that support internal operations only — HR systems, internal communication tools, and general business applications — unless they process customer data.

## Which Trust Service Criteria Should You Select?

The Security criterion is mandatory for all SOC 2 audits. Select Availability only if customer contracts include uptime SLAs or commitments — an auditor will ask to see the SLA before accepting the criterion. Select Confidentiality only if the product handles non-public sensitive data protected by confidentiality agreements. Select Processing Integrity only for payment processing, transaction platforms, or data transformation services. Select Privacy only if processing personal data regulated by privacy laws.

## What Over-Scoping Mistakes Do First-Time Companies Make?

The most common over-scoping mistake is adding Availability or Confidentiality "just in case" — this adds 15 to 25 controls and 20% to 30% cost with no customer benefit. The second most common mistake is including non-production environments in scope when they do not process customer data. The third is including corporate IT systems that are not part of the service.

## FAQ

### Can I change scope after the audit starts?

Scope changes mid-audit are possible but disruptive. Changes require updating the system description, renegotiating the audit fee, and potentially extending the timeline. Define scope carefully before the engagement letter is signed.

### How do I decide which systems are in scope?

Apply the customer data test: any system that processes, stores, or transmits customer data is in scope. Any system that directly supports customer data processing is in scope. Any system that has administrative access to in-scope systems is in scope.

### Should my SOC 2 scope include subservice organizations?

Subservice organizations are included via the carve-out or inclusive method, not as direct scope additions. The carve-out method (used by 85% of SaaS companies) excludes subservice controls from direct testing and relies on their SOC reports instead.
