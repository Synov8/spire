---
title: "SOC 2 for Marketplace Vendors: Cloud Platform Marketplace Compliance Guide"
published: "2026-10-21"
description: "Selling through AWS Marketplace, Azure Marketplace, or GCP Marketplace requires SOC 2 compliance as a prerequisite. This guide covers marketplace-specific vendor requirements, listing prerequisites, shared responsibility boundaries, and evidence collection for marketplace-listed SaaS products."
author: "Spire Team"
tags:
  - SOC 2
  - Marketplace
  - AWS Marketplace
  - Azure Marketplace
  - GCP Marketplace
  - Cloud Vendor
---

All three major cloud marketplaces — AWS Marketplace, Azure Marketplace, and GCP Marketplace — require SaaS vendors to maintain SOC 2 Type II certification as a condition of listing or maintaining preferred partner status, and marketplace-listed vendors without SOC 2 face 60% lower conversion rates on marketplace leads according to a 2025 channel sales analysis. Each marketplace has specific compliance documentation requirements for listing approval and ongoing participation.

## What SOC 2 Evidence Does AWS Marketplace Require?

AWS Marketplace requires SaaS vendors to provide SOC 2 Type II reports during the listing review process and on an annual basis thereafter. The report must cover the specific service being listed in the marketplace. Vendors must also provide evidence of AWS Well-Architected Framework alignment for the listing. AWS Marketplace reviews the SOC 2 report scope to verify it covers the marketplace product.

## What SOC 2 Evidence Does Azure Marketplace Require?

Azure Marketplace requires SOC 2 Type II certification plus alignment with the Microsoft Security Development Lifecycle (SDL). Vendors must complete the Microsoft Seller Center compliance questionnaire as part of the listing process. Azure Marketplace also requires vendors to maintain a published trust center with current compliance documentation.

## What SOC 2 Evidence Does GCP Marketplace Require?

GCP Marketplace requires SOC 2 Type II certification and completion of the Google Cloud Partner Advantage compliance assessment. Vendors must also demonstrate alignment with the GCP Shared Responsibility Model in their SOC 2 system description.

## How Does Marketplace Listing Affect SOC 2 Scope?

Marketplace listing affects SOC 2 scope in three ways: marketplace-specific integrations (AWS PrivateLink, Azure Private Endpoint, GCP Service Directory) must be included in your system description, marketplace billing integration must be covered by processing integrity controls, and marketplace identity federation must be covered by access control controls.

## FAQ

### Can I use the same SOC 2 report for all three marketplaces?

Yes, if your SOC 2 scope covers all the services listed across marketplaces. Ensure your system description includes all marketplace-specific integrations and the report covers a unified service system.

### What happens if my SOC 2 report expires while listed?

Marketplace agreements require current SOC 2 certification. If your SOC 2 report expires, you risk marketplace suspension or removal. Maintain at least 3 months of overlap between annual SOC 2 reports.

### Does marketplace listing require additional trust service criteria?

Marketplace listing typically requires only the Security TSC. Availability TSC may be required for services with marketplace-specific SLAs. Payment-related listings may require Processing Integrity TSC.
