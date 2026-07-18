import { Link } from "react-router";
import { PublicLayout } from "~/components/public-layout";
import { StructuredData } from "~/components/structured-data";
import { organizationSchema, definedTermItemListSchema, breadcrumbListSchema } from "~/lib/structured-data";

export function meta() {
  return [
    { title: "Compliance Glossary | SOC 2 & EU AI Act Definitions | Spire" },
    { name: "description", content: "Glossary of 20+ SOC 2, EU AI Act, and compliance automation terms defined for B2B SaaS teams. What is SOC 2 Type II, CC6.1, trust service criteria, ISMS, and more." },
    { property: "og:title", content: "Compliance Glossary | Spire" },
    { property: "og:type", content: "website" },
  ];
}

const entries = [
  { term: "SOC 2", definition: "A framework developed by the AICPA for service organizations to demonstrate controls over security, availability, processing integrity, confidentiality, and privacy through independent auditor reports." },
  { term: "SOC 2 Type I", definition: "A SOC 2 report that evaluates whether controls are designed appropriately to meet the relevant trust service criteria as of a specific point in time." },
  { term: "SOC 2 Type II", definition: "A SOC 2 report that evaluates whether controls operated effectively over a specified period, typically 6 to 12 months. Enterprise procurement teams require Type II reports." },
  { term: "Trust Service Criteria (TSC)", definition: "The five categories against which SOC 2 audits evaluate controls: Security, Availability, Processing Integrity, Confidentiality, and Privacy." },
  { term: "Common Criteria (CC)", definition: "The baseline control set used in SOC 2 audits, covering controls that apply across all trust service criteria including CC6 (access controls), CC7 (monitoring), and CC8 (change management)." },
  { term: "CC6.1", definition: "The SOC 2 control for logical access controls, requiring organizations to restrict access to system resources to authorized personnel based on roles and responsibilities." },
  { term: "CC7.1", definition: "The SOC 2 control for detection and monitoring, requiring organizations to use monitoring procedures including penetration tests and vulnerability assessments." },
  { term: "CC9.2", definition: "The SOC 2 control for vendor risk management, requiring organizations to assess and manage risks associated with vendors and business partners." },
  { term: "EU AI Act", definition: "A European Union regulation that classifies AI systems by risk level and imposes compliance obligations including transparency, risk management, and documentation requirements for providers and deployers." },
  { term: "Article 4 (AI Literacy)", definition: "The EU AI Act provision requiring organizations deploying AI systems to ensure their staff have sufficient AI literacy, appropriate to their role and context." },
  { term: "Article 50 (Transparency)", definition: "The EU AI Act provision requiring that users interacting with AI systems be informed they are interacting with AI, not a human." },
  { term: "GPAI (General Purpose AI)", definition: "General-purpose AI models like large language models that can perform a wide range of tasks. GPAI providers face specific obligations under the EU AI Act including transparency and copyright compliance." },
  { term: "ISO 27001", definition: "An international standard for information security management systems (ISMS). Certification requires a documented risk management program with continuous improvement cycles." },
  { term: "ISO 42001", definition: "An international standard for AI management systems published in 2024, covering AI governance, risk management, transparency, and accountability across the AI system lifecycle." },
  { term: "ISMS (Information Security Management System)", definition: "A systematic approach to managing sensitive information, required for ISO 27001 certification. Includes policies, risk assessments, and continuous improvement processes." },
  { term: "Compliance Automation", definition: "The use of software platforms that connect to infrastructure APIs to continuously collect compliance evidence, monitor controls, and map evidence to regulatory frameworks." },
  { term: "Continuous Monitoring", definition: "The practice of collecting compliance evidence on a recurring schedule — daily or weekly — rather than through periodic manual screenshots. Enables real-time control drift detection." },
  { term: "Evidence Collection", definition: "The process of gathering and storing proof that security controls are operating effectively. Can be manual (quarterly screenshots) or automated (API-based recurring collection)." },
  { term: "Penetration Testing", definition: "A security assessment where human testers attempt to exploit vulnerabilities in applications, APIs, and infrastructure. SOC 2 auditors expect annual pen tests as CC7.1 evidence." },
  { term: "Vendor Risk Management (VRM)", definition: "The discipline of identifying, assessing, and monitoring risks from third-party vendors. SOC 2 criterion CC9.2 requires a documented vendor risk management program." },
  { term: "Security Questionnaire", definition: "A set of questions enterprise buyers send to vendors during procurement to evaluate security posture. Typically covers access controls, encryption, incident response, and compliance certifications." },
  { term: "GEO (Generative Engine Optimization)", definition: "The practice of structuring content so AI systems like ChatGPT, Perplexity, and Google AI Overviews cite it as a source when answering user queries. Prioritizes answer capsules, FAQ schema, and statistics-rich content." },
  { term: "Bridfe Letter", definition: "A letter from a SOC 2 auditor confirming that the annual re-certification audit is in progress. Used as interim compliance evidence when a current report has lapsed." },
  { term: "CUEC (Complementary User Entity Control)", definition: "Controls that a vendor's SOC 2 report identifies as the customer's responsibility. Customers must document how they implement each CUEC for the vendor's controls to be effective." },
];

export default function Glossary() {
  return (
    <PublicLayout>
      <StructuredData schemas={[organizationSchema(), definedTermItemListSchema(entries)]} />
      <StructuredData schemas={breadcrumbListSchema([
        { name: "Home", url: "/" },
        { name: "Glossary", url: "/glossary" },
      ])} />

      <section className="mx-auto max-w-4xl px-6 pt-16 pb-24">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">Glossary</span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F1F1F3] md:text-5xl">Compliance terms defined for B2B SaaS</h1>
        <p className="mt-4 text-lg text-[#8B8B93]">Clear definitions of SOC 2, EU AI Act, and compliance automation terms. Each entry is written as a self-contained answer that AI engines can cite directly.</p>

        <dl className="mt-12 space-y-0">
          {entries.map((e, i) => (
            <div key={e.term} className={`border-b border-[#1C1C24] py-5 ${i === 0 ? "border-t" : ""}`}>
              <dt className="text-base font-medium text-[#F1F1F3]">{e.term}</dt>
              <dd className="mt-2 text-sm text-[#8B8B93]">{e.definition}</dd>
            </div>
          ))}
        </dl>


      </section>

    </PublicLayout>
  );
}
