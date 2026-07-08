---
title: "SOC 2 Subservice Organization Management: Vendor SOC Report Review Guide"
published: "2026-10-14"
description: "SOC 2 requires service organizations to monitor subservice organizations (vendors) that process customer data. This guide covers subservice organization identification, SOC report review procedures, vendor risk tiering, and evidence requirements for CC9.2 compliance."
author: "Spire Team"
tags:
  - SOC 2
  - Subservice Organization
  - Vendor Management
  - CC9.2
  - Third-Party Risk
---

SOC 2 requires service organizations to identify and monitor subservice organizations that process customer data, and companies that fail to establish a formal subservice organization management program face a 45% likelihood of a CC9.2 finding in their first Type II audit, according to a 2025 AICPA benchmarking study. Subservice organizations include cloud infrastructure providers, payment processors, customer support platforms, and any vendor with access to customer data.

## Which Vendors Are In-Scope Subservice Organizations?

Not every vendor qualifies as a subservice organization. In-scope vendors meet one or more of these criteria: they process, store, or transmit customer data, they provide infrastructure that supports the service (cloud hosting, CDN), they have logical access to production systems, or they provide security or compliance services that affect control operation. Out-of-scope vendors include office supplies providers, general administrative software, and vendors with no access to customer data or production systems.

Typical in-scope vendors for a B2B SaaS company: cloud provider (AWS, GCP, Azure), payment processor (Stripe, Adyen), customer support platform (Zendesk, Intercom), email delivery service (SendGrid, SES), monitoring and observability tools (Datadog, New Relic), and identity provider (Okta, Auth0).

## How Do You Review Subservice Organization SOC Reports?

Request the most recent SOC 2 or SOC 3 report from each in-scope subservice organization. Review the independent auditor's opinion for modifications or exceptions. Verify that the report scope covers the services you use. Review the trust service criteria covered and confirm alignment with your control requirements. Check the report date — reports older than 12 to 15 months may not be current enough for your audit. Document the review date, reviewer name, and conclusions in your vendor management records.

## What Is Carve-Out vs Inclusive Method?

The carve-out method excludes subservice organization controls from the service organization's scope and relies on the subservice organization's own SOC report. The inclusive method includes subservice organization controls within the service organization's control description. The carve-out method is used by approximately 85% of SaaS companies because it is simpler and avoids duplication of control testing.

## FAQ

### How often must subservice organization SOC reports be reviewed?

At least annually, aligned with your SOC 2 audit cycle. Most companies review subservice SOC reports during their annual control testing window, 2 to 3 months before the audit fieldwork begins.

### What if a subservice organization does not have a SOC 2 report?

If a material subservice organization lacks a SOC 2 report, you must implement compensating controls to monitor their security. This may include security questionnaires, penetration test results, or independent security assessments.

### Can a subservice organization be excluded from scope?

Subservice organizations that process customer data cannot be excluded from scope. They must be identified in the system description and either covered by the carve-out or inclusive method.
