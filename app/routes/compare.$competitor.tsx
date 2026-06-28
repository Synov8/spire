import { redirect, useParams } from "react-router";

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
