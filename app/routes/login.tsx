import { useState } from "react";
import { Link, redirect } from "react-router";
import { authClient } from "~/lib/auth-client";
import { auth } from "~/lib/auth.server";
import type { Route } from "./+types/login";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session) throw redirect("/dashboard");
  return null;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-surface-primary">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="text-lg font-bold tracking-tight text-text-primary">Spire</Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6 rounded-xl border border-border-primary bg-surface-secondary p-8">
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-text-primary">Sign in to Spire</h1>
            <p className="mt-1 text-sm text-text-secondary">Enter your email to receive a magic link</p>
          </div>
          {sent ? (
            <div className="rounded-xl bg-brand-subtle p-4 text-center text-sm text-brand">
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
                <label className="mb-1 block text-xs uppercase tracking-wider text-text-secondary">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-border-primary bg-surface-primary px-3 py-2.5 text-sm text-text-primary placeholder-text-text-tertiary focus:border-brand focus:outline-none transition-colors" />
              </div>
              {error && <p className="text-sm text-error">{error}</p>}
              <button type="submit"
                className="w-full rounded-[20px] bg-brand px-4 py-2.5 text-sm font-medium text-black hover:bg-brand-dark transition-colors">
                Send magic link
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
