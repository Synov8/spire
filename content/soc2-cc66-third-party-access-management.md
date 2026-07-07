---
title: "SOC 2 CC6.6: Third-Party and Vendor Access Management Guide"
published: "2026-07-08"
description: "Complete guide to SOC 2 CC6.6 third-party access management for B2B SaaS. Covers vendor access controls, contractor provisioning, external user lifecycle management, and SOC 2 audit evidence. Includes template for third-party access agreements and quarterly review workflows."
author: "Spire Team"
tags:
  - SOC 2
  - CC6.6
  - Third-Party Access
  - Vendor Management
  - B2B SaaS
---

SOC 2 CC6.6 requires that the entity restricts logical access to systems from external parties — vendors, contractors, customers, and business partners — and documents the access agreements, security controls, and monitoring in place. A 2025 Ponemon Institute study found that 59% of data breaches involved third-party access, making CC6.6 one of the most business-critical controls in the SOC 2 framework for B2B SaaS companies.

## What Types of External Access Does CC6.6 Cover?

CC6.6 covers four categories of external access: vendor/consultant access to internal systems for support and maintenance, contractor access during project engagements, customer access to multi-tenant SaaS applications, and business partner access for system integration. Each category requires a different control approach but all must be documented and reviewed.

Vendor access receives the most auditor scrutiny because it typically involves the highest privilege levels. AWS, GCP, or Azure infrastructure vendors; managed database providers; and compliance platform vendors with read access to evidence repositories all fall under CC6.6.

## How Should You Document Third-Party Access Agreements?

Each third party with logical access must have a written agreement that specifies the access scope, duration, security requirements, and termination conditions. The agreement should reference the third party's own SOC 2 report or ISO 27001 certification as compensating evidence of their security controls. For vendors without independent certifications, a completed security questionnaire should be on file.

The access agreement should include a defined end date. Perpetual access agreements with no expiration date are a common CC6.6 deficiency. Contractor agreements tied to project milestones with automatic access revocation on milestone completion satisfy this requirement.

## What Monitoring Is Required for Third-Party Access?

CC6.6 requires that third-party activity is monitored for anomalous behavior. This can be achieved through log monitoring, session recording for privileged vendor access, or automated alerting on third-party account activity outside normal patterns. The monitoring must be documented and reviewed at least monthly.

A 2025 Gartner report found that organizations monitoring third-party access in real time detected credential compromise an average of 27 days faster than organizations relying on periodic log reviews alone.

## How Do You Handle Customer Access Under CC6.6?

For B2B SaaS companies, customer access to the multi-tenant application is in scope under CC6.6. The control requirement is that customer access is limited to their own data through application-level authorization, that authentication mechanisms meet the same standards as internal access (MFA for administrative customer accounts), and that terminated customers have their access revoked within the contractual notice period.

## FAQ

### Do we need a separate agreement for every contractor?

Each contractor with system access should be covered by either an individual agreement or a master services agreement with a statement of work that defines access scope. Agreements can be templated for efficiency.

### Are SOC 2 reports from third parties sufficient evidence?

A current SOC 2 Type II report from a third party reduces but does not eliminate the need for your own access agreement. The AICPA expects your entity to document how you oversee third-party access regardless of the vendor's own certifications.
