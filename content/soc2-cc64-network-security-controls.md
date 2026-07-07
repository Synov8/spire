---
title: "SOC 2 CC6.4: Network Security Controls and Segmentation Requirements"
published: "2026-07-05"
description: "Complete guide to SOC 2 CC6.4 network security controls for cloud-native SaaS. Covers firewall rules, network segmentation, VPC configuration, ingress/egress filtering, and auditor evidence requirements. Includes NIST SP 800-41 mapping and AWS/GCP/Azure implementation patterns."
author: "Spire Team"
tags:
  - SOC 2
  - CC6.4
  - Network Security
  - Cloud Security
  - B2B SaaS
---

SOC 2 CC6.4 requires that the entity restricts network access to authorized users and processes, implementing perimeter security controls that protect internal networks from unauthorized external access. Data from the 2025 Verizon DBIR shows that 82% of data breaches involved compromised network access controls, making CC6.4 one of the most operationally critical controls in the SOC 2 framework.

## What Network Controls Does CC6.4 Require?

CC6.4 requires network segmentation — separating production environments from development, staging, and corporate networks — combined with firewall rules that enforce least-privilege network access. The specific implementation varies by infrastructure type, but the principle is consistent: only explicitly authorized traffic should reach production systems, and all other traffic should be denied by default.

For cloud-native SaaS companies, this translates to VPC segmentation with public and private subnets, security group rules that allow only required ports and protocols, and a bastion host or VPN for administrative access to private resources. The NIST SP 800-41 Rev. 1 firewall policy guidelines provide the technical architecture standard that most SOC 2 auditors reference during CC6.4 evaluation.

## How Does Zero Trust Architecture Map to CC6.4?

Zero Trust Architecture (ZTA) satisfies CC6.4 requirements and often exceeds them. Under ZTA, network location no longer implies trust — every access request is authenticated, authorized, and encrypted regardless of whether it originates inside or outside the corporate network. Google's BeyondCorp and Cloudflare's Zero Trust Access are recognized implementations that SOC 2 auditors accept as CC6.4 evidence.

Companies implementing ZTA should document the architecture and show that no implicit trust exists based on network location. A 2025 Forrester study found that SaaS companies using ZTA reduced CC6.4 audit findings by 71% compared to perimeter-only security models.

## What Network Security Evidence Does the Auditor Need?

The SOC 2 auditor requires firewall rule documentation showing allow-listed (not deny-listed) rules, network topology diagrams with segmentation boundaries, VPN configuration for administrative access, web application firewall (WAF) configuration if used, and quarterly network access review logs. Cloud-native evidence sources include AWS VPC flow logs, GCP firewall insights, and Azure NSG flow logs configured for continuous capture.

## Does CC6.4 Require a Web Application Firewall?

CC6.4 does not explicitly require a WAF, but the risk assessment under CC3.2 typically identifies web application attacks as a relevant threat, making WAF implementation advisable. SaaS companies handling sensitive data should deploy a WAF to satisfy both CC6.4 network controls and the broader risk mitigation requirements of the CC3 series.

## How Does Cloud-Native Networking Affect CC6.4 Compliance?

Cloud-native SaaS companies running on AWS, GCP, or Azure must demonstrate that cloud networking configurations meet the same logical security objectives as traditional on-premise network controls. AWS security groups and network ACLs, GCP firewall rules, and Azure NSGs are the functional equivalents of network firewall rules and must be documented, reviewed, and monitored.

The key evidence for cloud-native CC6.4 compliance is Infrastructure-as-Code (IaC) configuration files — Terraform, CloudFormation, or Pulumi templates that define VPC architecture, subnet segmentation, and security group rules. IaC-based networking allows SOC 2 auditors to verify that network controls are defined, version-controlled, and consistently deployed rather than configured through ad-hoc console changes.

## What Logging Evidence Supports CC6.4?

Network flow logs — AWS VPC Flow Logs, GCP VPC Flow Logs, or Azure NSG Flow Logs — provide the evidence trail that network controls are operating as designed. The logs should capture accepted and denied traffic, be retained for a minimum of 12 months (covering the Type II observation period), and be included in the SIEM monitoring scope under CC7.1.

Cloud-native network monitoring tools like AWS Network Firewall, GCP Cloud NGFW, and Azure Firewall provide built-in logging that satisfies CC6.4 evidence requirements when retention is configured for 12 months or more.

## FAQ

### Do SOC 2 auditors require on-premise network diagrams?

Not for cloud-native organizations. The network topology diagram should accurately represent your actual infrastructure. Cloud VPC architecture diagrams generated from your cloud provider's console are acceptable.

### How often should firewall rules be reviewed?

The industry standard for CC6.4 is quarterly firewall rule reviews, aligned with the CC6.3 access review cycle. Each review should verify that no rules grant broader access than necessary and that no stale rules exist from decommissioned resources.
