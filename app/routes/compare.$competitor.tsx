import { redirect, useParams, type MetaArgs } from "react-router";

export function meta({ params }: MetaArgs) {
  const name = params.competitor?.replace("-", " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  return [{ title: `Spire vs ${name} | Comparison` }, { name: "description", content: `How Spire compares to ${name} for SOC 2 and EU AI Act compliance.` }];
}

const slugMap: Record<string, string> = {
  vanta: "spire-vs-vanta-comparison",
  drata: "spire-vs-drata-comparison",
  secureframe: "spire-vs-secureframe-comparison",
  sprinto: "spire-vs-sprinto-comparison",
  manual: "spire-vs-manual-soc2-comparison",
};

export function loader({ params }: { params: { competitor: string } }) {
  const slug = slugMap[params.competitor as keyof typeof slugMap];
  if (!slug) return null;
  return redirect(`/blog/${slug}`, { status: 301 });
}

export default function CompareRedirect() {
  const { competitor } = useParams();
  const slug = slugMap[competitor as keyof typeof slugMap];
  if (!slug) return <div className="flex min-h-screen items-center justify-center bg-[#0A0A0C]"><p className="text-[#8B8B93]">Comparison not found.</p></div>;
  return null;
}
