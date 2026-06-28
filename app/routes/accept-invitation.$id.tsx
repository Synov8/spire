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
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0C]">
      <div className="w-full max-w-md rounded-xl border border-[#1C1C24] bg-[#111116] p-8 text-center">
        {fetcher.state === "loading" ? (
          <p className="text-sm text-[#8B8B93]">Accepting invitation...</p>
        ) : result?.ok ? (
          <>
            <h1 className="text-2xl font-bold text-[#00D4AA]">Invitation accepted</h1>
            <p className="mt-2 text-sm text-[#8B8B93]">You've joined the organization.</p>
            <a href="/dashboard" className="mt-6 inline-block rounded-lg bg-[#00D4AA] px-6 py-2 text-sm font-medium text-black hover:bg-[#00B894]">Go to dashboard</a>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-[#F1F1F3]">Organization invitation</h1>
            <p className="mt-2 text-sm text-[#8B8B93]">You've been invited to join an organization on Spire.</p>
            {result?.error && <p className="mt-3 text-sm text-[#EF4444]">{result.error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
