import { useLoaderData, useFetcher, redirect } from "react-router";
import { auth } from "~/lib/auth.server";
import { authClient } from "~/lib/auth-client";
import type { Route } from "./+types/accept-invitation.$id";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw redirect(`/login?redirect=/accept-invitation/${params.id}`);
  return { invitationId: params.id };
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { error: "Not authenticated" };
  try {
    await auth.api.acceptInvitation({ body: { invitationId: params.id }, headers: request.headers });
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to accept invitation" };
  }
}

export default function AcceptInvitation({ loaderData }: Route.ComponentProps) {
  const { invitationId } = loaderData;
  const fetcher = useFetcher();
  const result = fetcher.data as { ok?: boolean; error?: string } | null;

  if (!result && fetcher.state === "idle") {
    // Auto-accept on page load
    fetcher.submit(null, { method: "POST" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-primary">
      <div className="w-full max-w-md rounded-xl border border-border-primary bg-surface-secondary p-8 text-center">
        {fetcher.state === "loading" ? (
          <p className="text-sm text-text-secondary">Accepting invitation...</p>
        ) : result?.ok ? (
          <>
            <h1 className="text-2xl font-bold text-brand">Invitation accepted</h1>
            <p className="mt-2 text-sm text-text-secondary">You've joined the organization.</p>
            <a href="/dashboard" className="mt-6 inline-flex h-10 items-center rounded-[20px] bg-brand px-5 text-sm font-semibold text-black transition-all hover:bg-brand-dark hover:scale-[0.97] active:scale-[0.95]">Go to dashboard</a>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-text-primary">Organization invitation</h1>
            <p className="mt-2 text-sm text-text-secondary">You've been invited to join an organization on Spire.</p>
            {result?.error && <p className="mt-3 text-sm text-error">{result.error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
