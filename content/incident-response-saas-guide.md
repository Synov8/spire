---
title: "Incident Response for SaaS: SOC 2 and GDPR-Aligned IR Plan Template"
published: "2026-12-31"
description: "SaaS incident response plan template aligned with SOC 2 CC7.4 and CC7.5 and GDPR Article 33 and 34 requirements. Covers incident classification (4 tiers), response team roles (IR team of 5–8), notification timelines (24-hour SOC 2, 72-hour GDPR), post-incident review, and testing cadence (quarterly tabletops, annual full exercise)."
author: "Spire Team"
tags:
  - Incident Response
  - IR Plan
  - SOC 2
  - GDPR
  - Breach Notification
  - Security
---

A documented and tested incident response plan is required by SOC 2 controls CC7.4 (incident response plan requirements) and CC7.5 (breach identification and notification), and companies with tested IR plans contain security incidents 54% faster than those without, according to a 2025 Ponemon Institute incident response cost study. The IR plan should cover incident classification, team roles, notification procedures, and post-incident improvement.

## What Incident Classification System Should SaaS Teams Use?

Tier 1 — Low: no customer data exposure, no service impact. Handled by standard operations. Example: phishing email reported by employee. Tier 2 — Medium: potential customer data exposure but no confirmed breach, minor service degradation. Requires IR team activation. Example: misconfigured S3 bucket with no evidence of access.

Tier 3 — High: confirmed customer data exposure, service outage exceeding SLA, or regulatory notification obligations. Requires full IR team activation with legal and executive notification. Example: confirmed unauthorized access to production database.

Tier 4 — Critical: widespread data exposure, extended service outage, imminent regulatory notification. Requires company-wide response with board notification. Example: ransomware attack affecting production systems.

## What Notification Timelines Apply?

SOC 2 CC7.5 requires breach notification consistent with commitments made to customers. Common SaaS SLA: 24 to 72 hours for confirmed incidents affecting customer data. GDPR Article 33 requires notification to supervisory authority within 72 hours of becoming aware of a personal data breach. GDPR Article 34 requires notification to affected individuals without undue delay when the breach poses high risk.

## How Often Should the IR Plan Be Tested?

SOC 2 auditors expect at least annual IR plan testing. Most SaaS companies conduct quarterly tabletop exercises (2 to 4 hours each) and an annual full-scale exercise involving technical containment, stakeholder communication, and post-incident review.

## FAQ

### Who should be on the SaaS incident response team?

Core IR team (5 to 8 members): incident commander (security lead), technical responders (2 to 3 engineers), communications lead (PR or customer success), legal counsel, executive sponsor (CTO or CEO), and compliance lead (for regulated incidents).

### What evidence of IR plan testing should I retain?

Evidence includes exercise invitation and agenda, exercise scenario description, participant lists and roles, exercise timeline log (when each action was taken), post-exercise report with improvement items, and remediation tracking for identified improvements.

### Should the IR plan be integrated with the SOC 2 evidence system?

Yes. IR plan testing evidence, incident records, and post-incident remediation tracking are primary evidence for CC7.4 and CC7.5. Maintain these records in your compliance platform or a structured repository.
