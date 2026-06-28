---
title: "EU AI Act High-Risk Classification: Complete Guide for B2B SaaS Deployers"
published: "2026-06-08"
description: "EU AI Act high-risk classification guide for B2B SaaS: the eight high-risk categories under Annex III, the provider-led assessment process, deployer obligations, and how the December 2027 enforcement timeline affects US companies selling to Europe."
author: "Joseph Cooper"
tags:
  - EU AI Act
  - High Risk
  - AI Classification
  - Regulation
  - B2B SaaS
---

The EU AI Act defines high-risk AI systems based on their intended purpose and the sector in which they are deployed. For most B2B SaaS companies, high-risk classification depends on whether your AI system is used in one of eight specific areas — employment, credit, education, critical infrastructure, or biometric identification — and whether your customers deploy it for those purposes. If your AI system falls outside these eight categories, it is limited risk or minimal risk, requiring only transparency disclosures under Article 50.

## What Are the Eight High-Risk AI Categories Under Annex III?

The EU AI Act's Annex III lists eight areas where AI systems are classified as high-risk if they pose a significant risk of harm to health, safety, or fundamental rights. The eight categories are: biometric identification and categorization of natural persons, critical infrastructure management (roads, utilities, essential services), education and vocational training (access, admissions, assessment), employment and worker management (hiring, promotion, task allocation), access to essential services (credit, insurance, healthcare benefits), law enforcement, migration and border control, and administration of justice and democratic processes.

A B2B SaaS company that provides an AI-powered hiring tool falls into category four (employment). An AI system that evaluates creditworthiness falls into category five (essential services). An AI system that grades student assessments falls into category three (education). Each of these triggers high-risk provider and deployer obligations.

The European Commission published draft guidance on high-risk classification in May 2026, which includes practical examples of systems that would and would not fall within each category. The guidance is open for stakeholder feedback until June 23, 2026, and is expected to be finalized later this year.

## How Do You Determine Whether Your AI System Is High Risk?

The classification process is provider-led under Article 6 of the AI Act. The provider — the company that develops and places the AI system on the market — is responsible for determining whether the system falls into a high-risk category and documenting that assessment.

If the AI system is used in one of the Annex III areas, the provider must assess whether the system poses a significant risk of harm. If the provider determines it is not high-risk, they must document the assessment before placing the system on the market and register the system in the EU database under Article 49. The national competent authority can request this documentation at any time.

For deployers — companies that use a third-party AI system — the classification determination is made by the provider. The deployer must use the system according to the provider's instructions and within its stated intended purpose. If a deployer significantly modifies the system or changes its intended purpose to a high-risk use case, they may step into the role of the provider under Article 25 and become subject to full provider obligations.

A practical example: a SaaS company provides a general-purpose AI chatbot. If a customer deploys that chatbot for hiring decisions, the customer has modified the intended purpose to a high-risk use case. The customer may be treated as stepping into the provider role for that deployment.

## What Are the Obligations for High-Risk AI System Providers?

Providers of high-risk AI systems must comply with Chapter III of the AI Act, which includes: a risk management system throughout the AI system lifecycle, high-quality training and testing datasets to minimize discriminatory outcomes, detailed technical documentation including intended purpose and system architecture, automatic logging of activities to ensure traceability, transparency and provision of information to deployers, appropriate human oversight measures, and accuracy, robustness, and cybersecurity standards.

The provider must also register their high-risk AI system in the EU database under Article 49, establish a quality management system under Article 17, and comply with record-keeping obligations under Article 18.

Penalties for non-compliance with high-risk AI system requirements can reach €35 million or 7% of global annual turnover, whichever is higher, for violations of prohibited AI practices. Non-compliance with high-risk system obligations carries fines of up to €15 million or 3% of global annual turnover.

The enforcement timeline for high-risk rules was adjusted under the AI Omnibus proposal. Rules for stand-alone high-risk AI systems under Annex III apply from December 2, 2027. Rules for high-risk AI systems embedded in regulated products apply from August 2, 2028.

## What Obligations Do Deployers of High-Risk AI Systems Have?

Deployers of high-risk AI systems must take appropriate technical and organizational measures to ensure they use the system according to the provider's instructions (Article 26). Specific obligations include: assigning human oversight to natural persons who have the necessary competence, monitoring the operation of the system for anomalies and serious incidents, keeping logs automatically generated by the system, informing workers and worker representatives when AI systems are used in the workplace (if applicable), and conducting a fundamental rights impact assessment for deployers that are public authorities or that deploy systems in certain high-risk categories.

The deployer obligations are significantly lighter than provider obligations, but they are not trivial. Companies using high-risk AI systems provided by third parties should verify that their provider has completed the required technical documentation and risk assessment, and maintain clear records of how the system is used within their organization.

The Article 26 obligations for deployers of high-risk AI systems were analyzed by the AI Act Service Desk in May 2026, which clarified that deployers are responsible for using systems according to provider instructions — not for duplicating the provider's compliance work.

## How Can B2B SaaS Companies Prepare for High-Risk Classification?

B2B SaaS companies that may deploy high-risk AI systems should take five actions: document the intended purpose of each AI system in your product and confirm whether it falls into an Annex III category, review the European Commission's draft high-risk guidance for practical examples relevant to your use case, maintain clear documentation of your AI system classification assessment for each system you use or provide, establish a fundamental rights impact assessment process if you are a deployer in a regulated sector, and verify that your AI system providers have completed required technical documentation and risk assessments.

Companies that use general-purpose AI models via API — OpenAI, Anthropic, Google — are downstream deployers, not providers. The GPAI Code of Practice obligations apply to model providers, not API users. Deployers should request the information package from their GPAI provider that includes the documentation required for deployers to comply with their own obligations.

## FAQ

### What happens if an AI system is classified as high-risk incorrectly?

If a provider incorrectly classifies a system as not high-risk, the national competent authority can reclassify it and impose penalties. The provider bears the burden of proof for their classification assessment. Documentation of the classification assessment is required.

### Does the EU AI Act apply to AI systems used only internally?

Yes. The AI Act applies based on the intended purpose and deployment context, not on whether the system is customer-facing or internal. An internal AI hiring tool used by your HR department to screen candidates is subject to the same classification rules as a customer-facing product.

### What is a fundamental rights impact assessment?

A fundamental rights impact assessment (FRIA) is required for deployers that are public authorities, or for deployers of high-risk AI systems in certain categories. The FRIA evaluates the potential impact of the AI system on fundamental rights protected by EU law and identifies measures to mitigate identified risks.

### Are AI chatbots always limited risk?

AI chatbots that simply respond to user queries and do not make decisions in regulated areas are limited risk under the AI Act, requiring only transparency disclosure under Article 50. However, if a chatbot is used for employment decisions, credit evaluation, or educational assessment, it may be classified as high-risk depending on its intended purpose.
