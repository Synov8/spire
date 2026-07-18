---
title: "Spire Neon Compliance Guide: Integrating Neon Serverless Postgres With SOC 2"
published: "2026-12-31"
description: "Integration guide for connecting Neon serverless Postgres to Spire for SOC 2 compliance — evidence collection for database encryption (CC6.7), access controls (CC6.1), backup and recovery (A1.3), and branch-based data isolation. Covers Neon-specific compliance features including point-in-time restore and connection pooling."
author: "Spire Team"
tags:
  - Spire
  - Neon
  - Serverless Postgres
  - Database
  - SOC 2
  - Cloud Infrastructure
---

Neon serverless Postgres provides automated database backups, point-in-time restore, and branch-based data isolation — features that map directly to SOC 2 Availability TSC (A1.3 — disaster recovery) and Security TSC (CC6.7 — encryption, CC6.6 — production isolation). Connecting Neon to Spire automates evidence collection for database-related controls, reducing manual evidence gathering by approximately 8 to 12 hours per audit cycle. Neon holds SOC 2 Type II certification (validated by independent third-party auditors), SOC 3, ISO 27001, and ISO 27701 certifications, with HIPAA compliance available on the Scale plan (Neon Trust Center). Following the Databricks acquisition in May 2025, Neon's Scale tier also gained SOC 2 Type II and HIPAA eligibility.

The Verizon 2025 Data Breach Investigations Report found that third-party involvement in data breaches doubled to 30%, with web application infrastructure making up 39% of disclosed secrets. Credential abuse (22%) and exploitation of vulnerabilities (20%) remain the leading initial attack vectors. Neon's branch-based architecture directly addresses these risks: over 18,000 new databases are created daily on Neon (Neon Enterprise page, 2026), and 80% of Neon databases are now provisioned by automated agents rather than humans (Neon usage data, 2026). Spire collects Neon's configuration evidence — including IP allowlisting, project roles, and TLS enforcement — to demonstrate that database access controls meet SOC 2 standards for CC6.1.

## What Neon Evidence Does Spire Collect?

Spire collects Neon project configuration including compute and database settings, encryption at rest and in transit configuration (TLS enforcement), backup and point-in-time restore window configuration, branch management and data isolation evidence, connection pooling settings, and access control configuration (project roles, IP allowlisting). Each evidence item maps to specific SOC 2 controls.

## How Does Neon's Branch-Based Architecture Support Compliance?

Neon's database branching provides native data isolation for non-production environments — developers can create isolated database branches that do not affect production data. This architecture satisfies SOC 2 CC6.6 (production isolation) and reduces the risk of production data exposure during development. Nearly a third of Neon customers use autoscaling (Neon blog, 2024), and the platform's separation of storage and compute means individual developers can run isolated branches without copying production data — directly supporting the principle of least privilege.

## What Backup and Recovery Evidence Does Neon Provide?

Neon provides automated daily backups with configurable retention, point-in-time restore within the retention window (configurable up to 7 days), and branch creation from any point in time. These features provide evidence for A1.3 (disaster recovery testing) and support your RPO commitments. With 300,000+ databases managed per engineer (Neon Enterprise page), the platform's operational efficiency allows compliance teams to demonstrate recoverability without dedicated infrastructure staff.

## FAQ

### Does Neon's SOC 2 report cover my database usage?

Neon's SOC 2 Type II report covers the Neon platform infrastructure. Your application-layer database controls — schema access, query patterns, application-level encryption — remain your responsibility and must be evidenced in your SOC 2 scope.

### How does Spire collect Neon evidence?

Spire connects to Neon via the Neon API with read-only permissions. Evidence is collected on a configurable schedule — typically daily for configuration evidence and weekly for backup status evidence.

### Can Neon point-in-time restore evidence satisfy SOC 2 backup testing?

Yes. Evidence of point-in-time restore operations — either automated restore tests or documented restore procedures with test results — satisfies A1.3 backup testing requirements when performed at least annually.
