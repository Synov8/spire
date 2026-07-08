---
title: "Spire Cloudflare Compliance Guide: Integrating Cloudflare With SOC 2 Controls"
published: "2026-12-31"
description: "Integration guide for connecting Cloudflare to Spire for SOC 2 compliance — evidence collection for WAF rules (CC6.4), TLS configuration (CC6.7), DDoS protection (A1.1), DNS security, and bot management. Covers Cloudflare API integration setup and evidence mapping to specific controls."
author: "Spire Team"
tags:
  - Spire
  - Cloudflare
  - Integration
  - WAF
  - DDoS
  - SOC 2
---

Cloudflare provides critical network security and availability controls that support multiple SOC 2 trust service criteria — Web Application Firewall rules (CC6.4 — network security), TLS configuration and edge certificates (CC6.7 — encryption), DDoS protection (A1.1 — capacity planning), bot management (A1.1), and DNS security (CC6.4). Connecting Cloudflare to Spire automates evidence collection for these controls, reducing manual evidence gathering by approximately 15 to 20 hours per audit cycle.

## What Cloudflare Evidence Does Spire Collect?

WAF configuration and rule deployment history — Spire collects WAF rule sets, mode settings, and rule update history as evidence for CC6.4 (network segmentation and perimeter security). TLS and SSL configuration — edge certificate deployment, minimum TLS version enforcement, and SSL settings provide evidence for CC6.7 (encryption of data in transit).

DDoS protection — DDoS mitigation configuration and attack mitigation logs provide evidence for A1.1 (capacity monitoring and availability). Bot management — bot fight mode settings and bot analytics provide additional A1.1 evidence for managing non-human traffic.

## What Cloudflare Configurations Do SOC 2 Auditors Verify?

Auditors typically verify: WAF is actively deployed and protecting the service (not bypassed or in logging-only mode), TLS minimum version is set to TLS 1.2 or TLS 1.3, SSL is configured to Full or Full (Strict) mode, DDoS protection is enabled at the account or zone level, and firewall rules restrict access to legitimate traffic sources.

## What Cloudflare Custom Rule Evidence Is Important?

Custom WAF rules that explicitly block or challenge traffic based on specific patterns — rate limiting, geographic restrictions, IP reputation — provide strong evidence that access controls are actively enforced at the network edge. Document each custom rule's business purpose and deployment date in the evidence mapping.

## FAQ

### Does Cloudflare's SOC 2 compliance cover my use?

Cloudflare maintains its own SOC 2 Type II report covering Cloudflare infrastructure. This is a subservice organization report that supports the carve-out method for your SOC 2. Your evidence must still cover your Cloudflare configuration — report scope and zone-level settings.

### Can Spire collect Cloudflare analytics as evidence?

Yes. Spire collects Cloudflare analytics data including request volume, threat analytics, and performance metrics as supporting evidence for availability and security controls.

### What is the most common Cloudflare SOC 2 finding?

WAF configured in logging-only mode without active blocking. Auditors expect WAF to be actively blocking malicious traffic, not just logging it. Configure at least the OWASP Core Rule Set in block mode for production zones.
