---
title: "SOC 2 for AI Companies: How AI-Native B2B SaaS Startups Pass Compliance"
published: "2026-05-26"
description: "SOC 2 compliance guide for AI companies building on LLM APIs: evidence collection for AI infrastructure, prompt security monitoring, training data governance, and the unique controls AI-native startups must implement beyond standard cloud security."
author: "Spire Team"
tags:
  - SOC 2
  - AI
  - LLM
  - AI Compliance
  - B2B SaaS
---

SOC 2 compliance for AI companies follows the same trust service criteria as any B2B SaaS company, but AI-native infrastructure introduces unique control considerations that standard compliance templates do not cover. AI companies must collect evidence for prompt security monitoring, LLM API access controls, training data governance, model output verification, and subprocessor management for AI model providers — all within the standard SOC 2 framework that was designed before generative AI existed.

## What Makes SOC 2 Different for AI-Native Companies?

AI-native B2B SaaS companies — startups that build products on top of LLM APIs from OpenAI, Anthropic, or Google — face three compliance challenges that traditional SaaS companies do not. First, the AI model provider is a critical subprocessor with access to customer data sent as prompts, which requires vendor due diligence and DPA verification for the LLM provider. Second, prompt data may be used for model training unless explicitly opted out, which requires contractual guarantees and customer disclosures under SOC 2's privacy criterion. Third, AI system outputs are probabilistic and may contain errors or hallucinations, which creates unique risk assessment and monitoring requirements beyond traditional deterministic software.

The Trend Rays analysis of enterprise AI vendor procurement in June 2026 found that standard SOC 2 reports are increasingly rejected for AI vendor evaluation because static security attestations do not address generative AI-specific risks — probabilistic output risk, automated third-party model API routing, and untrusted token data persistence.

AI companies should include AI-specific controls in their SOC 2 control matrix alongside standard infrastructure controls. This satisfies both the SOC 2 auditor and enterprise customers who evaluate AI vendors differently than traditional SaaS.

## What Evidence Should AI Companies Collect for SOC 2?

AI companies need standard evidence collection for cloud infrastructure, identity provider, and code repository controls — just like any SaaS company. Additionally, AI-specific evidence should include LLM API access controls (API key rotation, rate limiting, prompt logging configuration), data retention configuration for prompts and model outputs, model version tracking and change management records, prompt injection and jailbreak testing results, output filtering and content moderation configuration, subprocessor due diligence for each AI model provider used, and data processing agreements with zero data retention (ZDR) configuration parameters.

A 2025 IAPP survey found that 73% of US technology companies selling to European customers had updated their compliance documentation to address AI-specific controls. The same survey found that security questionnaires from buyers increasingly include AI-specific questions alongside standard SOC 2 inquiries.

The privacy trust service criterion (P6) is particularly relevant for AI companies. The auditor evaluates whether personal information collected as prompts or model inputs is collected, used, retained, and disclosed in conformity with commitments. Companies must demonstrate that customer prompt data is not used for model training unless explicitly authorized.

## How Do You Manage LLM API Vendor Risk for SOC 2?

The LLM API provider — OpenAI, Anthropic, Google, or another model provider — is a critical subprocessor under SOC 2. Your vendor risk management program must include due diligence on the LLM provider that covers SOC 2 Type II report review for the model provider, data processing agreement (DPA) verification for zero data retention and data usage policies, subprocessor inventory disclosure from the model provider, and incident notification terms covering model-related security events.

The EU AI Act's GPAI Code of Practice, finalized in July 2025, requires GPAI providers to furnish downstream deployers with an information package covering model capability documentation, intended purpose and acceptable use guidelines, transparency documentation, and copyright compliance. AI companies should request this package from their LLM API providers and include it in vendor due diligence records.

Enterprise customers increasingly ask which AI models your product uses, where they are deployed, and whether customer data is used for model training. Your vendor due diligence documentation for LLM providers directly supports these questionnaire responses.

## What SOC 2 Controls Are Most Relevant for AI Products?

Beyond the standard SOC 2 control set, AI products benefit from specific control mappings. CC6.1 (logical access controls) covers API key management and prompt access restrictions. CC7.1 (detection and monitoring) covers prompt injection detection and model output monitoring. CC7.2 (anomaly detection) covers unusual prompt patterns and data exfiltration attempts. CC8.1 (change management) covers model version deployment and rollback procedures. P6.1 (privacy) covers customer data usage consent and model training opt-out. A1.2 (capacity management) covers LLM API rate limiting and cost scaling.

AI companies that are also deployers of high-risk AI systems under the EU AI Act should map their SOC 2 controls to AI Act obligations. The SOC 2 privacy criterion partially covers AI Act transparency and data governance requirements. The AI Act's high-risk system provisions add requirements that SOC 2 does not cover — risk management, technical documentation, and human oversight — which should be documented separately.

ISO 42001, the AI management system standard published in late 2024, provides a complementary certification for AI governance that covers the gap between SOC 2 and AI Act requirements. Some industry observers expect ISO 42001 to become the SOC 2 equivalent for AI compliance within 12 to 18 months.

## How Do You Handle Prompt Data in SOC 2 Evidence?

Prompt data presents a unique evidence challenge because the data itself contains customer information that may be sensitive. Evidence collection for AI controls should capture access logs and configuration settings — not the content of prompts themselves — unless prompt logging is part of your monitoring control.

The general best practice is to collect evidence of prompt security controls — whether MFA is required for API access, whether keys are rotated, whether rate limiting is configured — rather than evidence of specific prompt content. If prompt logging is part of your AI monitoring framework, ensure the logged data is subject to the same access controls and retention policies as production data.

Companies using customer prompts for model fine-tuning or improvement should document customer consent mechanisms and opt-out processes. The auditor will evaluate whether prompt data handling is consistent with your privacy policy and customer agreements.

## FAQ

### Does SOC 2 cover AI-specific risks?

Partially. SOC 2's security, availability, and privacy trust service criteria cover the infrastructure and data governance layers of AI systems. However, SOC 2 does not cover AI-specific requirements like model transparency, bias testing, or human oversight. AI companies should supplement SOC 2 with ISO 42001 or documented AI governance policies to cover the gap.

### Can an AI company get SOC 2 if it uses third-party LLM APIs?

Yes. Using third-party LLM APIs does not prevent SOC 2 certification. The LLM provider is treated as a subservice organization under SOC 2. The AI company must perform vendor due diligence on the LLM provider and document how customer data is protected when transmitted to the API. The SOC 2 report will describe the LLM provider as a subprocessor using the carve-out or inclusive method.

### Do enterprise customers accept SOC 2 for AI products?

Yes, but with additional AI governance expectations. Enterprise procurement teams increasingly ask AI vendors for AI-specific documentation alongside SOC 2 — including model inventory, data usage policies, transparency disclosures, and AI risk assessments. Companies that provide both SOC 2 and AI governance documentation close enterprise deals faster.

### What is zero data retention (ZDR) for LLM APIs?

Zero data retention means the LLM API provider does not store or use prompts and model outputs for any purpose — including model training, service improvement, or debugging — after the API response is returned. ZDR is typically configured through the API provider's data governance settings and documented in a DPA. AI companies pursuing SOC 2 should enable ZDR on all LLM API integrations and verify the configuration in their evidence collection.
