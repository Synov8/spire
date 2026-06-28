import { useState } from "react";

export default function IntegrationsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const connect = async (app: string) => {
    setLoading(app);
    setError("");
    try {
      const res = await fetch("/api/composio/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setError(err.error || "Failed to connect");
        return;
      }
      const data = await res.json() as { redirectUrl?: string };
      if (data.redirectUrl) window.location.href = data.redirectUrl;
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F3]">Integrations</h1>
      <p className="text-sm text-[#8B8B93]">Connect your infrastructure via Composio. OAuth is managed for you — no tokens to handle.</p>
      {error && <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">{error}</div>}

      {[
        { app: "github", label: "GitHub", desc: "Source code, PRs, deployments, access control." },
        { app: "aws", label: "AWS", desc: "Cloud infrastructure, IAM, monitoring, storage." },
        { app: "google", label: "Google Workspace", desc: "Email, docs, directory, admin audit." },
        { app: "vercel", label: "Vercel", desc: "Deployments, domains, environment variables." },
        { app: "cloudflare", label: "Cloudflare", desc: "DNS, CDN, WAF, DDoS protection." },
        { app: "clerk", label: "Clerk", desc: "Authentication, user management, MFA." },
        { app: "supabase", label: "Supabase", desc: "Database, auth, storage, realtime." },
        { app: "stripe", label: "Stripe", desc: "Payments, billing, subscriptions." },
        { app: "resend", label: "Resend", desc: "Transactional email, deliverability." },
      ].map(({ app, label, desc }) => (
        <div key={app} className="rounded-xl border border-[#1C1C24] bg-[#111116] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#F1F1F3]">{label}</h2>
              <p className="mt-1 text-sm text-[#8B8B93]">{desc}</p>
            </div>
            <button onClick={() => connect(app)} disabled={loading === app}
              className="rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-black hover:bg-[#00B894] transition-colors disabled:opacity-50">
              {loading === app ? "Connecting..." : "Connect"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
