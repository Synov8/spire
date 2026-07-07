---
title: "SOC 2 CC8.1: Change Management Controls for SaaS — Complete Guide"
published: "2026-07-16"
description: "Complete guide to SOC 2 CC8.1 change management controls for SaaS companies. Covers change authorization workflows, code review requirements, emergency change procedures, CI/CD pipeline controls, and audit evidence. Includes GitHub/GitLab implementation patterns and approval workflow templates."
author: "Spire Team"
tags:
  - SOC 2
  - CC8.1
  - Change Management
  - CI/CD
  - B2B SaaS
---

SOC 2 CC8.1 requires that the entity authorizes, documents, tests, and approves system changes before implementation, with defined controls for emergency changes that must bypass standard procedures. Data from the 2025 Verizon DBIR shows that 23% of data breaches involved misconfigured systems — changes deployed without proper authorization or testing — making CC8.1 a critical control for SaaS companies operating continuous deployment pipelines.

## What Changes Are in Scope for CC8.1?

CC8.1 covers application code changes deployed to production, infrastructure changes (cloud resource configurations, network rules, IAM policies), database schema changes, vendor and third-party system configuration changes, and security tool configuration changes. Not every code commit requires formal approval — the control applies to changes deployed to production, not development or staging environments.

The scope boundary for CC8.1 must be documented and aligned with your SOC 2 trust service criteria scope. Companies running multiple environments should clearly define which environments are production and which are non-production, with controls applied proportionally.

## How Does Code Review Satisfy CC8.1?

Code review — at least one reviewer who did not write the code — satisfies the testing and approval requirements of CC8.1 for application changes. The reviewer must be technically capable of evaluating the change and must explicitly approve it before merge to the deployment branch. The GitHub or GitLab pull request record serves as the primary evidence artifact.

The average SOC 2 auditor examines a sample of 10 to 20 pull requests from the Type II period to verify that reviews were substantive — not rubber-stamped approvals. Pull requests with zero comments merged in under a minute suggest inadequate review and may trigger deeper sampling.

## What Are Emergency Change Procedures?

Emergency changes — hotfixes for production outages, zero-day vulnerability patches, critical security fixes — may bypass standard approval and testing procedures but must be tracked and retroactively approved within 5 business days. The emergency change process must be documented in the change management policy, including who can authorize an emergency change, what documentation is required during the change, and the time window for retroactive approval.

A 2025 Gartner report found that 42% of organizations with weak emergency change procedures experienced at least one production incident caused by an undocumented emergency change in the prior year.

## What Evidence Does CC8.1 Require?

The auditor requires documented change management policy, pull request/merge request evidence for code changes, infrastructure-as-code change evidence (Terraform, CloudFormation, Pulumi), emergency change records with retroactive approvals, and separation of duties evidence showing developer and approver are different individuals.

## FAQ

### Does CC8.1 apply to database schema changes?

Yes. Database schema changes that could affect data integrity, availability, or confidentiality are in scope. Schema migration tools with peer review and approval satisfy the requirement.

### Can the same person write code and approve it for production?

No. CC8.1 requires segregation of duties. The developer and approver must be different individuals. For very small teams, consider using a senior engineer from a different team or an external reviewer.

### How quickly must emergency changes be approved?

SOC 2 auditors typically expect retroactive approval within 5 business days of the emergency change deployment.
