---
title: "SOC 2 Physical Security Controls: Data Center and Office Security Guide"
published: "2027-04-01"
description: "Complete guide to SOC 2 physical security controls covering CC6.4 and CC6.2. Covers data center access controls, office security, badge systems, visitor management, environmental protection, and physical security evidence for remote and cloud-first companies."
author: "Spire Team"
tags:
  - SOC 2
  - Physical Security
  - Data Center
  - Access Control
  - Office Security
```

Physical security is often overlooked by cloud-native SaaS companies — a 2026 Gartner physical security survey found that 31% of cloud-first companies had physical security findings in their SOC 2 audits because they assumed cloud providers handled all physical security. SOC 2 CC6.4 and CC6.2 require physical security protections, but for cloud-native companies, these controls primarily involve cloud provider physical security and their own office security. This guide covers physical security controls for SOC 2 compliance.

## What Physical Security Controls Does SOC 2 Require?

CC6.4 requires protection against environmental threats (fire, flood, power loss) and physical intrusion. CC6.2 requires physical access protections for systems containing customer data. Key controls: data center physical security (handled by cloud providers), office physical security (access control, visitor management), equipment security (locks, cable locks), environmental protections (fire suppression, climate control), and secure disposal (data destruction, secure shredding).

## How Do Cloud-First Companies Satisfy Physical Security Controls?

Cloud-native companies satisfy data center physical security through their cloud provider's SOC 2 report. AWS, Azure, and GCP all provide SOC 2 reports covering physical data center security including: multi-factor access controls, 24/7 monitoring, video surveillance, environmental controls, and disaster recovery facilities. Document your reliance on cloud provider physical security in your system description. Include cloud provider SOC 2 reports in your vendor management program.

## What Office Physical Security Controls Are Needed?

For companies with physical offices: badge or key card access for office entry, restricted access to server rooms or network closets (if any), visitor sign-in procedures with visitor badges, visitor escort policy for sensitive areas, clean desk policy for customer data, secure storage for laptops and devices, and shredding bins for sensitive documents. These controls satisfy CC6.2 for physical office environments.

## What Environmental Controls Apply to Offices?

Environmental protections: fire suppression and detection systems, climate control (HVAC) for any equipment rooms, uninterruptible power supply (UPS) for network equipment, emergency lighting, and documented emergency evacuation procedures. Most office-based environmental controls are handled by building management — verify their certifications and document your reliance.

## What Equipment Security and Disposal Controls Apply?

Equipment security: company-issued devices must be locked when unattended, device tracking and inventory management, encrypted hard drives on all devices, secure device disposal (data wiping or physical destruction), and removal of asset tags and data before disposal. Document your equipment security and disposal procedures in your system description.

## What Remote Work Physical Security Considerations Apply?

For remote employees: require company-managed devices with full-disk encryption, enforce screen lock policies, provide guidance on secure home office setup, prohibit public Wi-Fi without VPN, require physical security of company devices (not left unattended in public), and document incident reporting for lost or stolen devices. SOC 2 auditors increasingly expect remote work physical security controls as remote and hybrid work becomes the norm.

## What Physical Security Evidence Should You Prepare?

Your auditor will request: cloud provider SOC 2 report showing data center physical security, office access control procedures and visitor logs, server room or network closet access logs (if applicable), environmental protection documentation (fire suppression, UPS testing), equipment inventory and disposal records, remote work physical security policy, and incident records related to physical security (lost devices, unauthorized access).
