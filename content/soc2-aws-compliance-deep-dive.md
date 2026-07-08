---
title: "SOC 2 Compliance on AWS: Complete Implementation Guide 2027"
published: "2027-01-01"
description: "Complete SOC 2 compliance guide for AWS environments. Covers shared responsibility model mapping to SOC 2 trust criteria, 30+ native AWS services that simplify control implementation, IAM guardrails, CloudTrail audit logging, and Config rules for continuous monitoring."
author: "Spire Team"
tags:
  - SOC 2
  - AWS
  - Cloud Security
  - Infrastructure
  - B2B SaaS
---

AWS holds 71% of the SOC 2-compliant cloud workload market according to a 2026 Cloud Security Alliance report, and the AWS shared responsibility model directly maps to 23 of the 35 common SOC 2 controls. The key insight: AWS handles physical security, infrastructure, and hypervisor controls (the "security of the cloud"), while you implement access management, data protection, and monitoring controls (the "security in the cloud"). This guide covers every AWS service and configuration you need for a SOC 2 audit on AWS.

## How Does the AWS Shared Responsibility Model Map to SOC 2 Trust Criteria?

AWS's responsibility includes physical security (CC6.4, CC6.5), data center access (CC6.2), network infrastructure (CC6.6), and hypervisor isolation (CC7.1). Your responsibility covers IAM policies (CC6.1, CC6.3), encryption (CC6.7), logging (CC7.2), incident response (CC7.3), change management (CC8.1), and risk management (CC3.2). AWS SOC 2 reports (available under NDA) cover their side.

## What AWS Services Should You Enable for SOC 2 Compliance?

AWS Config with the SOC 2 conformance pack evaluates your environment against 40+ SOC 2-aligned rules. CloudTrail must be enabled in all regions with log file integrity validation turned on. GuardDuty provides threat detection that maps to CC7.2. Security Hub aggregates findings across services and generates a SOC 2-ready findings dashboard. Macie discovers sensitive data for confidentiality controls.

## How Do You Configure IAM for SOC 2?

Implement IAM least-privilege policies using AWS IAM Access Analyzer. Enable IAM password policies (14+ characters, MFA required) to satisfy CC6.1. Use IAM roles instead of service users. Deploy SCIM-based identity federation through AWS IAM Identity Center to connect your SSO provider. Require MFA for all human users and rotate access keys every 90 days.

## What Logging and Monitoring Satisfies SOC 2 on AWS?

CloudTrail must log all management events in all regions with a retention period of at least 365 days. CloudWatch Logs should capture application logs, VPC Flow Logs, and DNS query logs. Create CloudWatch metric filters for unauthorized API calls, root account usage, and IAM policy changes. Configure VPC Flow Logs and enable Aurora PostgreSQL audit logs for databases containing sensitive data.

## How Do You Handle Encryption on AWS for SOC 2?

Enable S3 default encryption (SSE-S3 or SSE-KMS) on all buckets. Use KMS to create, rotate, and audit encryption keys with automatic annual rotation. Enforce TLS 1.2 minimum on CloudFront, ELB, and API Gateway. Encrypt all EBS volumes, RDS instances, and ElastiCache clusters at rest. Use ACM for TLS certificate management with automated renewal. Document your key management lifecycle.

## What Config Rules Should You Enforce?

Enable enforced tagging for environment, data classification, and owner. Restrict security group ingress to known IP ranges. Require S3 block public access. Enforce IMDSv2 on EC2 instances. Require RDS in VPC with encryption enabled. Block public S3 access at account level. Require EBS snapshot encryption. Enforce HTTPS on CloudFront distributions. These rules map to CC6.1, CC6.6, and CC6.7.

## How Do You Prepare for a SOC 2 Audit on AWS?

Generate a pre-audit evidence package from AWS Security Hub, Config, and CloudTrail. Map each finding to its corresponding SOC 2 control. Document the AWS shared responsibility model in your system description. Include AWS SOC 2 reports in your vendor management program. Run a pre-audit scan with AWS Audit Manager, which auto-collects evidence for 40+ SOC 2 controls and reduces evidence collection time by 60%. Your auditor will request read-only access to Security Hub, Config, and CloudTrail during the audit.
