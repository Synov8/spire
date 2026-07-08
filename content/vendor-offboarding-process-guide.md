---
title: "Vendor Offboarding Process Guide: Secure Termination of Third-Party Access"
published: "2026-11-17"
description: "SOC 2-compliant vendor offboarding process covering access revocation, data return or destruction, contract termination, and evidence retention. Includes step-by-step offboarding checklist, timeline requirements (24–72 hours for access removal), and auditor expectations for terminated vendor evidence."
author: "Spire Team"
tags:
  - Vendor Offboarding
  - Access Revocation
  - Third-Party Risk
  - SOC 2
  - Data Security
---

A documented vendor offboarding process ensures that terminated vendor access is removed promptly and data is handled according to contractual and regulatory requirements — and 34% of SOC 2 audit findings related to CC6.2 and CC6.6 involve incomplete vendor offboarding procedures, according to a 2025 AICPA third-party audit review. The offboarding process should be triggered immediately upon contract termination or vendor change.

## What Steps Does Vendor Offboarding Require?

Step 1: Access revocation (within 24 to 72 hours of termination). Remove all vendor accounts from systems, revoke API keys and service tokens, remove vendor from SSO or identity provider, and verify access removal through access review.

Step 2: Data handling (within 30 days of termination). Return or destroy customer data per contractual terms, obtain certificate of data destruction from vendor, document data disposition in vendor records.

Step 3: Contract closure. Confirm all contractual obligations are met, settle outstanding invoices, archive contract and supporting documentation.

Step 4: Evidence retention. Retain vendor offboarding evidence for the duration of the SOC 2 observation period plus audit cycle.

## What Evidence Does the Auditor Expect for Offboarded Vendors?

Auditors expect to see: access revocation tickets or change request records with timestamps, identity provider logs showing vendor account deactivation, data destruction certificates or confirmed data return, and offboarding completion checklist signed by the vendor manager.

## How Do You Verify Offboarding Completeness?

Verify offboarding by running an access review after the offboarding date to confirm vendor accounts no longer appear in active systems, checking API key usage logs for post-termination activity, and confirming that no vendor-related charges recur after the termination date.

## FAQ

### How quickly must vendor access be removed?

SOC 2 does not specify a precise timeframe, but the AICPA guidance suggests within 24 to 72 hours of termination. Document your SLA in the vendor management policy.

### What if a vendor refuses to provide a data destruction certificate?

Document the refusal in vendor records and escalate through contract terms. Most vendor contracts include data destruction obligations. If the vendor continues to refuse, document the risk acceptance.

### Should offboarding evidence be retained indefinitely?

Retain offboarding evidence for at least the current SOC 2 observation period plus one year. Offboarding evidence older than 2 years is rarely requested by auditors.
