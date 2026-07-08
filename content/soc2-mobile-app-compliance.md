---
title: "SOC 2 for Mobile Apps: Device Security and Data Protection Controls"
published: "2026-10-19"
description: "Mobile applications under SOC 2 require controls for device-level data encryption, secure API communication, mobile-specific authentication (biometrics, device attestation), and app store compliance. Covers iOS and Android platform-specific evidence collection for mobile SOC 2 scoping."
author: "Spire Team"
tags:
  - SOC 2
  - Mobile App
  - iOS
  - Android
  - Data Protection
  - Compliance
---

Mobile applications introduce unique SOC 2 considerations because the device itself — outside the service organization's control — becomes part of the compliance boundary, and approximately 40% of SaaS companies with mobile apps under SOC 2 scope report challenges with device-level evidence collection according to a 2025 AICPA technology survey. Mobile-specific controls focus on what the service organization can control: the app, the API, and the data protection requirements communicated to users.

## What Mobile Controls Satisfy SOC 2 Requirements?

Mobile app-level data encryption using the platform's native file protection APIs (iOS Data Protection, Android EncryptedFile) satisfies CC6.7 for data at rest on the device. Certificate pinning and HTTPS-only API communication satisfy CC6.7 for data in transit. Biometric authentication (Face ID, Touch ID, Android Biometric) combined with app-level PIN requirements satisfies CC6.5 for user authentication. Remote wipe capabilities or automatic session timeout satisfy CC6.3 for access termination.

## How Do You Collect Evidence From Mobile Environments?

Mobile evidence collection differs from server-side compliance because the app runs on user-controlled devices. Evidence sources include app source code analysis showing encryption implementation, API gateway logs showing mobile API request patterns, mobile app security test results (SAST and DAST), and mobile-specific penetration testing reports. Device-level evidence — encryption configuration, biometric settings — is typically covered by CUECs (complementary user entity controls).

## What Mobile App Security Testing Is Required?

SOC 2 auditors expect evidence of mobile app security testing including static analysis (SAST) for code vulnerabilities, dynamic analysis (DAST) for runtime security, and API security testing for mobile endpoints. The OWASP Mobile Security Testing Guide (MSTG) provides the most commonly referenced testing standard.

## FAQ

### Does SOC 2 require mobile app store compliance?

SOC 2 does not directly require app store compliance, but the security controls enforced by Apple and Google app stores — code signing, sandboxing, permission models — provide underlying evidence for mobile security controls.

### Can mobile app evidence be collected automatically?

Some evidence — API gateway logs, server-side authentication records — is collected automatically. App-level evidence requires manual collection through the CI/CD pipeline or mobile app testing tools.

### What mobile-specific complementary controls should I define?

CUECs for mobile apps should include user responsibilities: keeping the device OS updated, enabling device passcode or biometric lock, installing app updates promptly, and reporting lost or stolen devices.
