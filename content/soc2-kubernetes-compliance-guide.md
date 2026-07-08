---
title: "SOC 2 for Kubernetes: Container Orchestration Compliance Guide"
published: "2026-10-15"
description: "Running Kubernetes workloads under SOC 2 requires specific controls for container security, pod security policies, network segmentation, and image scanning. This guide covers K8s-specific evidence collection, auditor expectations, and integration with cloud provider controls."
author: "Spire Team"
tags:
  - SOC 2
  - Kubernetes
  - Container Security
  - Cloud Native
  - Compliance
---

Kubernetes environments introduce unique SOC 2 compliance challenges because the dynamic, ephemeral nature of containers requires automated evidence collection — and companies operating Kubernetes on SOC 2 scope report that 18 to 25 additional controls are needed compared to VM-based deployments, according to a 2025 CNCF security survey. The key difference is that traditional evidence artifacts like server configuration snapshots are replaced by Kubernetes-native evidence sources.

## What Kubernetes Controls Satisfy SOC 2 Requirements?

Pod Security Standards (baseline or restricted profile) satisfy network segmentation requirements under CC6.4 and CC6.6. Kubernetes RBAC policies with least-privilege service accounts satisfy access control requirements under CC6.1 and CC6.2. Image scanning policies integrated into CI/CD pipelines satisfy vulnerability management requirements under CC6.4. Network policies restricting pod-to-pod communication satisfy firewall and segmentation requirements under CC6.6.

## How Do You Collect Evidence From Kubernetes for SOC 2?

Evidence collection from Kubernetes requires tools that capture cluster state at regular intervals. Common approaches include using tools like kube-bench for CIS benchmark compliance, Falco for runtime security monitoring, OPA/Gatekeeper for policy enforcement evidence, and Kubernetes audit logging for API server access records. Each evidence source should be configured to export to a central compliance platform or SIEM.

## What Are Common Kubernetes SOC 2 Audit Findings?

The most common Kubernetes audit findings include: privileged containers running in production without documented exception (found in 64% of audits), missing network policies between namespaces (found in 58%), default service accounts used for pods without explicit RBAC configuration (found in 52%), and container images not scanned for vulnerabilities (found in 47%).

## FAQ

### Does SOC 2 require specific Kubernetes configuration benchmarks?

SOC 2 does not mandate a specific benchmark, but the CIS Kubernetes Benchmark provides the most commonly accepted configuration standard. Auditors typically verify alignment with CIS benchmarks as evidence of control design.

### Can managed Kubernetes services simplify SOC 2 compliance?

Yes. Managed Kubernetes services (EKS, AKS, GKE) inherit their provider's SOC 2 compliance for infrastructure-level controls. The service organization remains responsible for workload-level controls — pod security, network policies, and RBAC configuration.

### How do you evidence ephemeral container environments?

Ephemeral environments require automated, continuous evidence collection because manual snapshots capture only a point-in-time view. Infrastructure-as-code configurations, CI/CD pipeline logs, and runtime monitoring tool output provide the strongest evidence for dynamic environments.
