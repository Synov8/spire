---
title: "SOC 2 for APIs: Authentication, Rate Limiting, and Audit Logging Controls"
published: "2026-10-18"
description: "API-driven SaaS products face specific SOC 2 requirements around authentication (API keys, OAuth, JWT), rate limiting, input validation, and audit logging. This guide covers API-specific control mapping, evidence collection from API gateways, and common API audit findings."
author: "Spire Team"
tags:
  - SOC 2
  - API
  - API Security
  - Authentication
  - Audit Logging
  - Compliance
---

APIs are the primary attack surface for most SaaS products—82% of companies subject to SOC 2 operate public or partner APIs—yet only 34% of first-time SOC 2 candidates have adequate API-specific controls documented according to a 2025 API Security research report. API authentication, rate limiting, input validation, and audit logging require dedicated controls that go beyond general web application security.

## What API Authentication Controls Satisfy SOC 2?

API authentication controls must enforce that every API request is authenticated and authorized. Evidence includes API gateway configuration showing authentication required for all endpoints, token validation policies (JWT, OAuth 2.0), API key rotation schedules, and failed authentication attempt logging. The strongest evidence for CC6.1 is API gateway logs showing rejected unauthenticated requests, which demonstrates the control is operating effectively.

## How Do You Evidence API Rate Limiting for SOC 2?

Rate limiting policies satisfy A1.2 and CC6.1 by preventing abuse and ensuring availability. Evidence includes rate limit configuration showing defined thresholds, rate limit exceeded events with response actions, and capacity test results demonstrating rate limiting effectiveness under load. API gateway tools like Kong, AWS API Gateway, or Apigee provide built-in rate limiting evidence collection.

## What API Audit Logging Is Required for SOC 2?

CC7.1 requires that all API activity is logged and monitored. API audit logs must include request source IP and user identity, request method and endpoint, timestamp of each request, response status code, and payload size. Logs must be retained for the observation period and protected from tampering. Forwarding API logs to a SIEM or central logging platform provides stronger evidence than gateway-native log storage.

## FAQ

### Does SOC 2 require API penetration testing?

SOC 2 does not explicitly require API penetration testing, but the CC6.4 and CC7.2 controls effectively require it as a best practice. Most enterprise customers expect API security testing as part of your annual pen test scope.

### What are the most common API SOC 2 findings?

Unrestricted API access (no authentication on internal APIs), missing input validation on data modification endpoints, inadequate API key rotation (keys older than 12 months), and insufficient API logging (no payload logging, no failed attempt tracking).

### How do you scope partner APIs vs public APIs for SOC 2?

All APIs that process customer data or support the service system are in scope. Public APIs serving your customers are in scope. Partner APIs integrated with your production system are in scope. Internal development APIs that do not process customer data may be excluded.
