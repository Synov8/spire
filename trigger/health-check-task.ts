import { task } from "@trigger.dev/sdk";

export const healthCheck = task({
  id: "health-check",
  run: async (payload: { nonce: string }) => {
    return { ok: true, nonce: payload.nonce };
  },
});
