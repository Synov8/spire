import { useState } from "react";
import { Link } from "react-router";
import { authClient } from "~/lib/auth-client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0C]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="text-lg font-bold tracking-tight text-[#F1F1F3]">Spire</Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6 rounded-xl border border-[#1C1C24] bg-[#111116] p-8">
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-[#F1F1F3]">Sign in to Spire</h1>
            <p className="mt-1 text-sm text-[#8B8B93]">Enter your email to receive a magic link</p>
          </div>
          {sent ? (
            <div className="rounded-xl bg-[#00D4AA]/10 p-4 text-center text-sm text-[#00D4AA]">
              Magic link sent to <strong className="font-semibold">{email}</strong>.<br />
              Check your inbox (or server console in dev).
            </div>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              const { error: err } = await authClient.signIn.magicLink({ email, callbackURL: "/" });
              if (err) setError(err.message || "Failed to send link");
              else setSent(true);
            }} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-[#8B8B93]">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-[#1C1C24] bg-[#0A0A0C] px-3 py-2.5 text-sm text-[#F1F1F3] placeholder-[#5C5C66] focus:border-[#00D4AA] focus:outline-none transition-colors" />
              </div>
              {error && <p className="text-sm text-[#EF4444]">{error}</p>}
              <button type="submit"
                className="w-full rounded-lg bg-[#00D4AA] px-4 py-2.5 text-sm font-medium text-black hover:bg-[#00B894] transition-colors">
                Send magic link
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
