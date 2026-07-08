---
title: "SOC 2 System Description: How to Write the System Boundaries Section"
published: "2026-10-12"
description: "The SOC 2 system description is the foundational document defining audit scope. This guide covers how to write the five required sections — system boundaries, infrastructure, software, data, and people — with AICPA compliance specifications and common scope definition mistakes."
author: "Spire Team"
tags:
  - SOC 2
  - System Description
  - Audit Scope
  - Documentation
  - Compliance
---

The SOC 2 system description is the foundational document that defines the boundaries of your audit, and companies that invest 15 to 25 hours developing a precise system description reduce audit fieldwork time by approximately 30% according to a 2025 AICPA practice guide. The system description must cover five components: infrastructure, software, people, data, and procedures — defined precisely enough that a reader can understand what is in scope and what is excluded.

## What Are the Five Required System Description Sections?

Infrastructure: physical or virtual hardware components used to provide the service. List every production environment — AWS account IDs, GCP project IDs, data center locations, and hosting regions. Software: application software, middleware, and operating systems supporting the service. List every major system component with version numbers. People: personnel involved in system operation and governance. Define roles and responsibilities by function, not by individual name — this prevents the document from becoming outdated when team members change.

Data: data processed by the system including data sources, data flows, and data retention. Include a data flow diagram showing how data moves through the system from input to storage to processing to output. Procedures: automated and manual procedures used to operate the system. Reference your documented policies and procedures for each control area.

## What Should Be Explicitly Excluded?

The system description should explicitly state what is excluded from scope: third-party subservice organizations and their responsibilities, customer controls that complement the system (complementary user entity controls), non-production environments unless specifically included, and corporate systems not involved in service delivery such as payroll or HR systems.

## How Often Should the System Description Be Updated?

The system description must be updated for every SOC 2 reporting period. Most companies update it quarterly to reflect infrastructure changes, and the description must accurately reflect the system as it existed during the entire observation period.

## FAQ

### Who writes the system description?

The entity writes the system description. The auditor reviews it for accuracy and completeness but does not write it. Writing the system description is the service organization's responsibility.

### How long should a SOC 2 system description be?

A SOC 2 system description for a typical SaaS company ranges from 10 to 25 pages including diagrams. Longer descriptions are not better — precision and clarity matter more than length. Each excluded system or function should have a clear rationale.

### Can the system description include forward-looking statements?

No. The system description must describe the system as it existed during the observation period. Forward-looking statements about planned improvements belong in management's discussion and analysis (MD&A), not in the system description.
