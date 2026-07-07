---
title: "SOC 2 Penetration Testing: Requirements, Scope, and Vendor Selection"
published: "2026-08-19"
description: "Deep-dive guide to SOC 2 penetration testing requirements for B2B SaaS. Covers annual testing cadence expectations, scope definition (internal vs external, web application, API, and infrastructure), methodology standards (OSSTMM, OWASP, PTES), remediation SLAs, and vendor selection. Includes auditor expectations for penetration test report content."
author: "Spire Team"
tags:
  - SOC 2
  - Penetration Testing
  - Security Testing
  - Vulnerability Management
  - B2B SaaS
---

SOC 2 does not explicitly require penetration testing as a specific control, but the risk assessment requirement under CC3.2 typically identifies penetration testing as the appropriate risk response for the threat of external attackers exploiting system vulnerabilities. As a result, 94% of SOC 2 reports for SaaS companies include a penetration testing control, making it effectively required for B2B SaaS SOC 2 compliance according to a 2025 AICPA trust services benchmarking analysis.

## What Penetration Testing Scope Does a SOC 2 Auditor Expect?

The penetration testing scope must cover the systems within the SOC 2 report scope boundary. For B2B SaaS companies, this includes the web application (typically the customer-facing SaaS product), APIs (REST, GraphQL, or gRPC endpoints), cloud infrastructure (AWS, GCP, or Azure configurations and network perimeters), employee endpoints if in scope, and the identity provider configuration and SSO implementation.

External penetration testing (from outside the network perimeter) is the minimum expectation. Internal penetration testing (assuming an attacker with internal network access) provides stronger assurance and is recommended for companies with maturity objectives. Mobile application testing is required if iOS or Android apps are within the SOC 2 scope.

## What Penetration Testing Methodology Is Acceptable?

SOC 2 auditors accept the OWASP Web Security Testing Guide, OSSTMM (Open Source Security Testing Methodology Manual), and PTES (Penetration Testing Execution Standard) as authoritative testing methodologies. The test report should reference the methodology used, describe the testing approach for each test type, and explain any testing limitations.

Automated scanning alone — vulnerability scanning without manual exploitation testing — does not constitute penetration testing for SOC 2 purposes. A credentialed vulnerability scan combined with manual testing by a qualified tester is the minimum acceptable approach.

## When Should Penetration Testing Be Performed?

Penetration testing should be performed annually and scheduled so the report is current (within 12 months) at the time of the SOC 2 Type II audit. Testing should also be performed after significant infrastructure changes — major application releases, cloud provider migrations, or architecture changes.

## What Should a Penetration Testing Report Include?

The report must include an executive summary with overall risk rating, detailed findings with CVSS scores and severity ratings, confirmed vulnerabilities with proof-of-concept evidence, false positives declared and explained, methodology and scope description, tester credentials (certifications, experience), and remediation recommendations with priority levels.

## FAQ

### How much does SOC 2 penetration testing cost?

SaaS company penetration testing ranges from $5,000 to $15,000 for a standard web application and API test. Cloud infrastructure testing adds $3,000 to $8,000. Annual retesting with the same vendor typically costs 20% to 30% less than the initial test.

### Do high-severity findings need to be remediated before the SOC 2 report?

High-severity findings must be remediated or have a documented remediation plan with timeline before the SOC 2 Type II report can be issued. Low and medium findings may be accepted with a remediation timeline.
