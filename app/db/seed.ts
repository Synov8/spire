import { db } from "./index";
import { control } from "./schema";

const controls = [
  // CC1 — Control Environment
  ["soc2","CC1","CC1.1","Control Environment","The entity demonstrates a commitment to integrity and ethical values."],
  ["soc2","CC1","CC1.2","Board Oversight","The board of directors demonstrates independence from management and exercises oversight of internal control."],
  ["soc2","CC1","CC1.3","Organizational Structure","Management establishes structure, reporting lines, and appropriate authorities and responsibilities."],
  ["soc2","CC1","CC1.4","Commitment to Competence","The entity demonstrates a commitment to attract, develop, and retain competent individuals aligned with objectives."],
  ["soc2","CC1","CC1.5","Accountability","The entity holds individuals accountable for their internal control responsibilities."],
  // CC2 — Communication and Information
  ["soc2","CC2","CC2.1","Information and Communication","Information is obtained or generated and used to support the functioning of internal control."],
  ["soc2","CC2","CC2.2","Internal Communication","The entity internally communicates information necessary to support the functioning of internal control."],
  ["soc2","CC2","CC2.3","External Communication","The entity communicates with external parties regarding matters affecting the functioning of internal control."],
  // CC3 — Risk Assessment
  ["soc2","CC3","CC3.1","Risk Assessment","The entity identifies and assesses risks to the achievement of its objectives."],
  ["soc2","CC3","CC3.2","Fraud Risk","The entity assesses the potential for fraud in achieving its objectives."],
  ["soc2","CC3","CC3.3","Change Impact Assessment","The entity identifies and assesses changes that could significantly impact the system of internal control."],
  // CC4 — Monitoring Activities
  ["soc2","CC4","CC4.1","Monitoring of Controls","The entity selects, develops, and performs ongoing and separate evaluations of internal control."],
  ["soc2","CC4","CC4.2","Evaluation and Remediation","The entity evaluates and communicates internal control deficiencies in a timely manner."],
  // CC5 — Control Activities
  ["soc2","CC5","CC5.1","Control Activities","The entity selects and develops control activities that contribute to the mitigation of risks."],
  ["soc2","CC5","CC5.2","Technology Controls","The entity selects and develops general controls over technology to support the achievement of objectives."],
  ["soc2","CC5","CC5.3","Policies and Procedures","The entity deploys control activities through policies that establish expectations and procedures that implement them."],
  // CC6 — Logical and Physical Access (largest section, ~8 control points)
  ["soc2","CC6","CC6.1","Logical and Physical Access","Logical and physical access to assets is restricted to authorized personnel."],
  ["soc2","CC6","CC6.2","User Access Provisioning","Users are provisioned with appropriate access rights based on their role."],
  ["soc2","CC6","CC6.3","Access Removal","Access is removed when users no longer require it or are terminated."],
  ["soc2","CC6","CC6.4","Access Reviews","Access rights are periodically reviewed and recertified by data owners."],
  ["soc2","CC6","CC6.5","Physical Security","Physical access to facilities and sensitive assets is restricted and monitored."],
  ["soc2","CC6","CC6.6","Authentication Mechanisms","Authentication mechanisms including MFA are implemented for system access."],
  ["soc2","CC6","CC6.7","Data Protection at Rest and in Transit","Data is protected during transmission and storage using encryption."],
  ["soc2","CC6","CC6.8","Secrets and Credential Management","Credentials and secrets are securely managed and rotated."],
  // CC7 — System Operations
  ["soc2","CC7","CC7.1","System Monitoring","Systems are monitored to detect security events and anomalies."],
  ["soc2","CC7","CC7.2","Incident Response Process","Security incidents are identified, reported, and escalated."],
  ["soc2","CC7","CC7.3","Incident Remediation","Security incidents are responded to and remediated in a timely manner."],
  ["soc2","CC7","CC7.4","Vulnerability Management","Vulnerabilities are identified, assessed, and remediated."],
  ["soc2","CC7","CC7.5","Penetration Testing","Regular penetration tests are conducted and findings are remediated."],
  // CC8 — Change Management
  ["soc2","CC8","CC8.1","Change Authorisation","Changes to systems are authorised, tested, and tracked."],
  ["soc2","CC8","CC8.2","Emergency Changes","Emergency changes follow a separate process with retrospective approval."],
  ["soc2","CC8","CC8.3","Separation of Environments","Development, testing, and production environments are separated."],
  // CC9 — Risk Mitigation
  ["soc2","CC9","CC9.1","Risk Mitigation","Business disruptions are mitigated through planning and preparation."],
  ["soc2","CC9","CC9.2","Vendor Risk Management","Vendor and third-party risks are assessed and managed."],
  // A1 — Availability
  ["soc2","A1","A1.1","System Availability","The system is available for operation and use as committed."],
  ["soc2","A1","A1.2","Backup and Recovery","Backup and recovery procedures are established, documented, and tested."],
  ["soc2","A1","A1.3","Disaster Recovery Planning","A disaster recovery plan is maintained and tested."],
  // C1 — Confidentiality
  ["soc2","C1","C1.1","Confidential Information Protection","Confidential information is protected during processing, storage, and transmission."],
  ["soc2","C1","C1.2","Data Classification and Handling","Confidential data is classified and handled according to its classification level."],
  // PI1 — Processing Integrity
  ["soc2","PI1","PI1.1","Processing Completeness","System processing is complete and no data is omitted."],
  ["soc2","PI1","PI1.2","Processing Accuracy","System processing is accurate and free from material errors."],
  ["soc2","PI1","PI1.3","Processing Timeliness","System processing is timely and meets committed processing windows."],
  ["soc2","PI1","PI1.4","Authorised Processing","Processing is authorised and validated as correct."],
  ["soc2","PI1","PI1.5","Data Validation","Inputs and outputs are validated to ensure integrity of processing."],
  // P1-P3 — Privacy (notice, choice, collection)
  ["soc2","P1","P1.1","Privacy Notice","The entity provides clear privacy notices to data subjects."],
  ["soc2","P1","P1.2","Consent and Choice","Consent is obtained for personal data collection, use, and disclosure."],
  ["soc2","P1","P1.3","Collection Limitation","Personal data collection is limited to what is necessary."],
  ["soc2","P2","P2.1","Use and Retention","Personal data is used only for the purposes disclosed and retained only as necessary."],
  ["soc2","P2","P2.2","Data Minimisation","Personal data is minimised to what is relevant and necessary."],
  ["soc2","P3","P3.1","Data Subject Access","Data subjects can access their personal data and request corrections."],
  ["soc2","P3","P3.2","Data Subject Rights","Data subject requests are responded to within committed timeframes."],
  // P4-P5 — Disclosure, quality
  ["soc2","P4","P4.1","Disclosure to Third Parties","Personal data is disclosed to third parties only as committed or agreed."],
  ["soc2","P5","P5.1","Data Quality","Personal data is accurate, complete, and relevant."],
  // P6-P8 — Security for privacy, monitoring, breach response
  ["soc2","P6","P6.1","Security for Privacy","Personal data is protected against unauthorised access, use, or destruction."],
  ["soc2","P7","P7.1","Privacy Monitoring","The entity monitors compliance with its privacy commitments."],
  ["soc2","P8","P8.1","Breach Response","Data breaches are detected, responded to, and notified as required."],
  // AI-1 — AI Inventory
  ["ai-act","AI","AI-1","AI Inventory and Classification","Every AI feature used or provided must be documented and classified by risk tier (prohibited, high-risk, limited-risk, minimal-risk)."],
  ["ai-act","AI","AI-2","AI Transparency — Content Labelling","AI-generated text, image, audio, or video must be labelled as such using machine-readable markers (C2PA, SynthID) and visible labels where applicable (Article 50)."],
  ["ai-act","AI","AI-3","AI Transparency — Interaction Disclosure","Users interacting with an AI system (chatbot, AI assistant) must be informed they are interacting with AI (Article 50(1))."],
  ["ai-act","AI","AI-4","AI Literacy","All employees using AI for work must complete AI literacy training covering capabilities, limitations, and risks (Article 4)."],
  ["ai-act","AI","AI-5","AI Logging and Record-Keeping","Inputs, outputs, model IDs, and system prompt versions must be logged and retained for a minimum of 6 months."],
  ["ai-act","AI","AI-6","Human Oversight","Qualified personnel must be designated to review AI outputs with the authority to override or override decisions."],
  ["ai-act","AI","AI-7","AI Documentation","Each AI system must have documented intended purpose, known limitations, provider/model version, and accuracy metrics."],
  ["ai-act","AI","AI-8","AI Risk Management","AI-specific risk assessment covering bias, fairness, and fundamental rights must be conducted and documented."],
  ["ai-act","AI","AI-9","AI Vendor Due Diligence","Third-party AI providers (OpenAI, Anthropic, etc.) must be assessed for AI Act compliance via vendor questionnaires."],
  ["ai-act","AI","AI-10","Public AI Transparency Page","A public page at /ai must list all AI features, vendors used, and transparency posture for enterprise buyers."],
].map(([framework, category, controlId, title, description]) => ({
  id: controlId.replace(".", "-"),
  framework, category, controlId, title, description,
}));

async function seed() {
  for (const c of controls) {
    await db.insert(control).values(c).onConflictDoNothing({ target: control.controlId });
  }
  const frameworks = [...new Set(controls.map((c) => c.framework))];
  console.log(`Seeded ${controls.length} controls across ${frameworks.join(", ")}`);
}

seed().catch(console.error);
