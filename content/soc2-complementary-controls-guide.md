---
title: "SOC 2 Complementary Controls: Guide to CUEC and CUIC Documentation"
published: "2026-10-13"
description: "Complete guide to SOC 2 complementary controls — complementary user entity controls (CUECs) and complementary subservice organization controls (CUICs). Covers how to identify, document, communicate, and verify complementary controls with customers and vendors."
author: "Spire Team"
tags:
  - SOC 2
  - Complementary Controls
  - CUEC
  - CUIC
  - Audit Scope
---

SOC 2 complementary controls — complementary user entity controls (CUECs) and complementary subservice organization controls (CUICs) — define the boundary between the service organization's responsibilities and those of its customers and vendors, and approximately 70% of SOC 2 audit findings related to scope gaps involve improperly documented complementary controls according to a 2025 AICPA practice analysis. Getting complementary controls right prevents the most common type of audit exception.

## What Are Complementary User Entity Controls?

CUECs are controls that the service organization expects customer to implement for the SOC 2 controls to operate effectively. Common CUECs include customer-side access management (customers must manage their own user accounts within the SaaS platform), customer network security (customers must secure their own network connections to the service), and customer incident notification (customers must notify the service organization of suspected security incidents affecting their accounts).

Each CUEC must be specific, actionable, and communicated to customers. The SOC 2 report lists CUECs in a dedicated section, and the audit opinion is conditioned on customers implementing these controls.

## What Are Complementary Subservice Organization Controls?

CUICs are controls that the service organization relies on from its subservice organizations — third-party vendors that process data on behalf of the service organization. Common CUICs include cloud infrastructure provider controls (AWS, GCP, Azure security controls), payment processor controls (Stripe, Adyen fraud and security controls), and support tool controls (Zendesk, Intercom access controls).

The service organization must obtain and review SOC 2 reports from each material subservice organization to verify CUIC effectiveness.

## How Do You Document Complementary Controls?

Document each complementary control with the following: control description (what the user or subservice organization must do), rationale (why this control is necessary for the service organization's control objectives), communication method (how the control is communicated — contract terms, customer agreements, trust portal, vendor agreements), verification approach (how the service organization verifies that complementary controls are implemented), and monitoring cadence (how often complementary control effectiveness is reviewed).

## FAQ

### What happens if a customer does not implement CUECs?

The service organization's SOC 2 report notes that the opinion is conditioned on CUEC implementation. If a customer does not implement CUECs and suffers a control failure, the service organization is not automatically liable — but the SOC 2 report will note the reliance on CUECs.

### How do you verify customer CUEC implementation?

Most service organizations rely on contractual agreements stating that customers will implement CUECs. Some organizations conduct periodic customer control assessments for high-value customers. The SOC 2 auditor accepts contractual verification as sufficient evidence.

### Do CUECs change between audit periods?

CUECs should be reviewed and updated annually. Changes in service architecture, new features, or changes in customer deployment models may require CUEC updates. Outdated CUECs are a common finding in SOC 2 audits.
