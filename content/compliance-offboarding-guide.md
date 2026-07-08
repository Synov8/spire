---
title: "Compliance Offboarding Guide: Secure Employee Departure Procedures for SOC 2"
published: "2027-02-10"
description: "Complete guide to compliance offboarding for departing employees. Covers access revocation, credential rotation, data recovery, exit interviews, and SOC 2 evidence requirements for timely and complete user offboarding."
author: "Spire Team"
tags:
  - Compliance
  - Offboarding
  - Access Control
  - Data Security
  - User Lifecycle
---

Employee offboarding is one of the highest-risk compliance processes — a 2026 Ponemon Institute study found that 31% of data breaches involved former employees with active credentials, with an average detection time of 98 days after departure. SOC 2 CC6.1 and CC6.3 require timely access revocation upon termination or role change. This guide covers a comprehensive compliance offboarding process that satisfies SOC 2 requirements and prevents unauthorized access by former employees.

## What Are SOC 2 Offboarding Requirements?

SOC 2 CC6.1 requires "logical access security" including the revocation of access upon termination. CC6.3 requires "role-based access" controls including timely access changes. Auditor expectations include: access revoked within 24 hours of termination, verification of revocation after completion, recovery of company-issued devices, return of physical access credentials, and a documented offboarding checklist completed for each departure.

## What Steps Should Be in Your Offboarding Checklist?

Within the first hour of termination notification: disable all active directory and SSO accounts, revoke access to all SaaS applications, rotate shared credentials the employee had access to, revoke VPN and network access, and remove from distribution lists and collaboration tools. Within 24 hours: disable physical access credentials, recover company devices (laptop, phone, security keys), export and archive employee data as needed, notify the security team, and verify account revocation.

## How Do You Automate Offboarding?

Use SCIM provisioning in your identity provider to automatically deprovision users when they are marked as terminated in your HR system. Configure lifecycle management workflows that trigger: account suspension, application access revocation, manager notification, IT device recovery ticket, and compliance evidence capture. Automate verification — run a reconciliation report 24 hours after offboarding to confirm no active accounts remain. Automated offboarding reduces the risk of credential oversight by 90%.

## What Credential Rotation Is Required After Departure?

Rotate any credentials the departing employee had access to: shared service account passwords, API keys the employee created or had access to, cloud provider access keys, database credentials (if the employee had database access), third-party integration tokens, and SSH keys. Document credential rotation in your offboarding checklist. Use a secrets manager with automatic rotation where possible.

## How Do You Handle Voluntary Departures vs Terminations?

For voluntary departures with notice: maintain normal access until the last day but restrict data export capabilities. Begin access transfer to replacement employees. Schedule an exit interview covering confidentiality obligations. Deactivate accounts immediately on the last day. For involuntary terminations: deactivate accounts immediately upon notification, before the employee is informed. Recover company devices immediately. Escort the employee from the premises if physical security is a concern.

## What Offboarding Evidence Should You Keep for SOC 2?

Documentation for each departure: the offboarding checklist with completion timestamps, account deactivation confirmation from your identity provider, credential rotation evidence if applicable, device recovery receipt, exit interview documentation with signed confidentiality reminder, and verification report showing no active accounts after 24 hours. Retain offboarding records for at least 2 years for audit evidence.
