---
title: "EU AI Act Provider vs Deployer: Who Is Responsible for What?"
published: "2026-06-06"
description: "EU AI Act provider vs deployer obligations explained for B2B SaaS: provider develops and places the system, deployer uses it under authority. Article 25 role-shift rules for substantial modifications and changed intended purpose affecting US SaaS companies."
author: "Joseph Cooper"
tags:
  - EU AI Act
  - Provider
  - Deployer
  - Compliance
  - B2B SaaS
---

The EU AI Act divides compliance obligations between providers — companies that develop AI systems and place them on the market — and deployers — companies that use AI systems in a professional capacity. For B2B SaaS companies, the distinction determines which set of regulatory obligations apply and how much compliance infrastructure is required. A provider developing an AI hiring tool faces full Chapter III obligations including risk management, technical documentation, and conformity assessment. A deployer using the same tool via API faces lighter obligations focused on usage according to instructions, human oversight, and incident monitoring.

## What Is a Provider Under the EU AI Act?

A provider is defined in Article 3 as a natural or legal person that develops an AI system or a general-purpose AI model, or that has an AI system or GPAI model developed, and places it on the market or puts it into service under its own name or trademark. The provider is the primary bearer of compliance obligations under the AI Act.

Key indicators of provider status include: you develop the AI system yourself or commission its development, you distribute the system under your brand or trademark, you make the system available to third parties via API, open-weight distribution, or embedded in a product, and you control the intended purpose of the system as defined in the accompanying documentation.

For B2B SaaS companies, provider status typically applies when your product includes AI features that you develop or commission and that your customers use as part of your SaaS offering. If you integrate a third-party AI model via API but market the resulting product as your own AI feature, you are the provider of that AI system.

The AI Act distinguishes between GPAI model providers and AI system providers. A company that develops a foundation model like a large language model is a GPAI provider. A company that takes that foundation model, fine-tunes it, and embeds it in a SaaS product is an AI system provider. Both have obligations, but the GPAI Code of Practice specifically addresses foundation model providers.

## What Is a Deployer Under the EU AI Act?

A deployer is defined in Article 3 as a natural or legal person that uses an AI system under its authority, except where the AI system is used in the course of a personal non-professional activity. The deployer uses the AI system but does not place it on the market.

Key indicators of deployer status include: you subscribe to a SaaS product that includes AI features provided by the vendor, you use a third-party API (OpenAI, Anthropic, Google) to power internal tools or customer-facing features, you configure the system within the parameters set by the provider but do not modify its core functionality, and you do not rebrand or redistribute the AI system to third parties.

Deployer obligations under Article 26 are significantly lighter than provider obligations. Deployers must take technical and organizational measures to use the system according to the provider's instructions, assign human oversight, monitor system operation, keep logs where under their control, and report serious incidents to the provider.

The practical reality for most B2B SaaS companies is that they are both providers and deployers for different systems in their stack. A company might be the provider of its customer-facing AI features while being the deployer of the third-party API that powers them.

## When Does a Deployer Become a Provider Under Article 25?

Article 25 of the AI Act shifts provider obligations to a deployer, distributor, importer, or other third party when one of three triggers is met: the entity puts its name or trademark on a high-risk AI system already placed on the market, the entity makes a substantial modification to a high-risk AI system so that it remains high-risk, or the entity changes the intended purpose of an AI system — including a non-high-risk system — so that it becomes high-risk.

The Article 25 role-shift rule is the most underappreciated risk for US SaaS companies operating in the EU market. A company that takes a general-purpose chatbot from a third-party provider and deploys it for hiring decisions has changed its intended purpose to a high-risk use case. Under Article 25, that company becomes the provider of the modified system and is subject to full provider obligations.

The European Commission's guidance on Article 25 clarifies that not every modification triggers role-shift. Minor fine-tuning or configuration changes within the provider's stated intended purpose do not shift obligations. But modifications that significantly change the system's functionality, risk profile, or deployment context are likely to trigger provider obligations.

## What Documentation Should You Maintain for Your Role Assessment?

Companies should maintain a role matrix for each AI system and GPAI model version in their infrastructure. The matrix should document: the legal role (provider or deployer), the factual trigger for that classification (development, placement, modification, or usage), and the boundary of responsibility (which system components each role covers).

For provider evidence, maintain records of the intended purpose documentation for each AI system, risk assessment and management documentation, technical documentation per Annex IV or Annex XI, design choices and development methodology, data governance and training data documentation, accuracy, robustness and cybersecurity testing records, conformity assessment documentation where required, and post-market monitoring system records.

For deployer evidence, maintain records showing use according to provider instructions, human oversight assignment and training records, monitoring based on instructions for use, incident escalation to provider and authorities where relevant, logs under deployer control, worker information where workplace use is involved, and fundamental rights impact assessment where required.

The documentation requirements were outlined by the AI Act Service Desk in April 2026, which recommended maintaining a single AI system registry that tracks role, system version, deployment date, modification history, and evidence of compliance for each system.

## How Does the GPAI Code of Practice Affect Providers and Deployers?

The GPAI Code of Practice, finalized by the European AI Office on July 10, 2025, provides a voluntary compliance framework for GPAI model providers. Signing the Code creates a presumption of conformity with Articles 53 and 55 of the AI Act. The Code applies to GPAI providers — companies that develop foundation models — not to downstream deployers that use those models via API.

For downstream deployers, the Code requires GPAI providers to furnish an information package that includes model capability documentation, intended purpose and acceptable use guidelines, transparency documentation, and copyright compliance policies. Deployers should request this package from their GPAI API providers before August 2, 2026, when fine enforcement begins.

If a GPAI provider cannot supply the required information package, that is a vendor compliance risk that deployers should flag in their vendor due diligence reviews. Companies should include GPAI provider documentation requirements in their vendor risk assessment processes.

## FAQ

### Can a B2B SaaS company be both a provider and a deployer?

Yes. Most B2B SaaS companies are both. For example, a company that provides an AI-powered code assistant to customers while using OpenAI's API for internal customer support automation is a provider of the code assistant and a deployer of the OpenAI API. The compliance obligations for each role apply to the relevant system.

### Does using an AI API make you a provider?

No, not automatically. Using a third-party AI API to power internal tools makes you a deployer of that API. However, if you embed the API output into your product and market it as your own AI feature, you become the provider of that AI system to your customers.

### What is a substantial modification under Article 25?

A substantial modification is a change to the AI system that affects its compliance with the AI Act requirements. The Commission guidance on Article 25 indicates that fine-tuning a model on proprietary data does not necessarily constitute a substantial modification, but changing the system's intended purpose from general use to a high-risk use case does.

### What records should we keep for AI Act compliance?

Maintain a role matrix for each AI system documenting provider or deployer status, intended purpose documentation, risk assessment records, technical documentation, training data governance records, human oversight assignment records, usage monitoring records, incident reports, and provider information packages received from GPAI vendors.
