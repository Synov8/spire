---
title: "SOC 2 Penetration Testing Requirements: What Auditors and Enterprise Customers Expect in 2026"
published: "2026-05-30"
description: "SOC 2 penetration testing requirements for 2026: annual minimum, scope alignment with system boundary, CVSS 4.0 scoring, $8K–$30K cost, and the CC4.1 and CC7.1 criteria that auditors evaluate when reviewing pen test evidence."
author: "Spire Team"
tags:
  - SOC 2
  - Penetration Testing
  - Security
  - Audit
  - B2B SaaS
---

SOC 2 does not explicitly require penetration testing in its trust service criteria, but in 2026 most auditors treat pen testing as de facto necessary evidence for controls CC7.1 (vulnerability management) and CC4.1 (risk assessment). Enterprise procurement teams routinely ask for pen test reports alongside SOC 2 reports during vendor due diligence, making penetration testing effectively mandatory for B2B SaaS companies pursuing enterprise deals.

## Is Penetration Testing Required for SOC 2?

The AICPA's trust service criteria do not contain a line that says "you must run a penetration test." SOC 2 is principles-based. However, criteria CC7.1 requires that the organization uses detection and monitoring procedures including performance of penetration tests and vulnerability assessments. CC4.1 requires risk assessment activities that identify potential threats. Both criteria are most convincingly satisfied with evidence of active security testing.

The practical reality in 2026: 94% of SOC 2 auditors expect pen test evidence for Type II audits, according to a 2026 survey by DSALTA. Without a documented penetration test within the audit observation period, you risk a finding against CC7.1. Evidence from a penetration test that falls within the observation window — typically month 3 to 8 of a 12-month audit period — is the most compelling single piece of evidence you can produce for control operating effectiveness.

Enterprise buyers are the second enforcement layer. When a prospect sends a security questionnaire asking for penetration test results, they expect a recent report. For B2B SaaS companies pursuing enterprise deals, a pen test is effectively mandatory because of buyer expectations, independent of what the SOC 2 standard technically says.

## What Scope Should a SOC 2 Penetration Test Cover?

The penetration test scope must mirror your SOC 2 system description exactly. If the system description says customer data lives in your production environment, APIs, and AWS infrastructure, all three must be in scope for the penetration test. Auditors check this alignment — scope misalignment is the primary reason pen test evidence gets challenged.

The minimum scope for a SaaS company's SOC 2 pen test covers: external web application endpoints, customer-facing and internal APIs, authentication mechanisms including OAuth flows, SSO integrations, and API key management, cloud infrastructure configuration (AWS, GCP, or Azure IAM policies, S3 bucket policies, security group rules), admin portals and internal tools with access to customer data, third-party integrations that handle customer data, and internal privilege escalation paths if applicable.

Grey box testing is the industry recommendation for SOC 2 compliance, according to ComplyJet's 2026 analysis. The tester receives partial information — enough to skip time-consuming discovery and focus directly on the controls your auditor cares about — but not full credentials, so real-world exploitation paths are still tested.

## How Often Should You Run a Penetration Test for SOC 2?

The minimum frequency is once per year, with the test falling within the SOC 2 Type II observation period to count as valid CC7.1 evidence. Most SOC 2 auditors expect annual penetration testing as the established industry standard.

For growth-stage companies (Series B+) processing sensitive data, semiannual testing is increasingly expected. The rate of product and infrastructure change at high-growth companies makes an annual test insufficient because every new feature shipped since the last test is unreviewed attack surface.

The ideal timing for the annual pen test is month 3 to 5 of a 12-month Type II observation period. This leaves 30 to 60 days for remediation of critical findings and a retest before the auditor begins fieldwork. A pen test conducted before or after the observation period does not satisfy CC7.1 for that audit cycle.

Trigger-based testing after significant infrastructure changes — major cloud provider migrations, new product launches, or architecture changes — supplements the annual cadence. Companies that ship weekly should consider Penetration Testing as a Service (PTaaS) for on-demand assessments between annual engagements.

## How Much Does a SOC 2 Penetration Test Cost?

SOC 2 penetration testing costs for a B2B SaaS startup range from $8,000 to $30,000 per engagement, depending on scope size, testing methodology, and tester seniority. A standard grey box test covering external web application, API, and cloud infrastructure typically costs $10,000 to $18,000.

Vulnerability scanning — automated tool-based scanning — costs $500 to $5,000 and is expected alongside penetration testing but does not replace it. Vulnerability scans answer "what weaknesses might exist?" while penetration tests answer "can these actually be exploited in sequence?"

The SOC 2 readiness review is a separate pre-audit control walkthrough that costs vary based on scope. Penetration test reports should use CVSS 4.0 scoring, released in October 2023 and now the expected standard in 2026.

## What Evidence Should a Penetration Test Report Include for SOC 2?

The penetration test report should include an executive summary with scope, methodology, finding severity distribution, and overall risk rating, a scope statement explicitly enumerating which applications, APIs, environments, and authentication flows were tested, a finding severity distribution table showing critical, high, medium, low, and informational findings, CVSS 4.0 scores with specific business impact context for each finding, remediation evidence showing that findings were addressed and retested, and tester credentials and qualifications.

Zero findings across all severity levels in a broad-scope test is suspicious to experienced procurement teams. Finding vulnerabilities and demonstrating remediation is evidence of a functional security program — not a weakness.

Penetration tests for SOC 2 should target production environments — not staging or development. A penetration test against a non-production environment does not satisfy the auditor's expectation for CC7.1 because it does not validate controls operating in the customer-facing environment.

## FAQ

### Can we do an automated vulnerability scan instead of a pen test?

No. Automated vulnerability scans and manual penetration tests serve different purposes. Vulnerability scans identify potential weaknesses using automated tools; penetration tests validate whether those weaknesses can actually be exploited in sequence by a skilled human attacker. SOC 2 auditors expect both. Vulnerability scans should run continuously or quarterly, with manual pen testing annually.

### Does the penetration test need to be conducted by an external firm?

SOC 2 does not explicitly require an external firm, but auditor and customer expectations strongly favor independent third-party testing. Internal security teams may conduct penetration tests, but the evidence is stronger and more credible when performed by an independent firm with verifiable credentials.

### What if a critical finding is discovered during the pen test?

Document the finding, remediate it, and conduct a retest to confirm the fix. The remediation evidence becomes part of your SOC 2 evidence package. Demonstrating that findings were identified and fixed within a defined timeframe is a positive control signal — not a negative one.

### How long is a SOC 2 penetration test valid for?

Enterprise customers typically expect a pen test within the past 12 months. For SOC 2 Type II, the pen test must fall within the observation period. A test from 18 months ago will draw scrutiny, especially if significant features were shipped in the interim.
