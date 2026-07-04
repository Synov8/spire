import { createRequestHandler, RouterContextProvider } from "react-router";
import { cloudflareContext } from "../app/lib/cloudflare-context.server";

declare module "react-router" {
  interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

const MAINTENANCE_PAGE = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Maintenance · Spire</title>
<style>body{
margin:0;background:#030712;color:#f9fafb;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem;
}
h1{font-size:1.5rem;font-weight:700;margin:0 0 .5rem}
p{color:#9ca3af;margin:0}
.logo{font-size:1.25rem;font-weight:600;margin-bottom:2rem;letter-spacing:-.025em}
</style></head>
<body><div><div class="logo">spire</div><h1>We&rsquo;ll be back soon</h1><p>Spire is currently undergoing maintenance. Please check back in a few minutes.</p></div></body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    if (env.MAINTENANCE) {
      return new Response(MAINTENANCE_PAGE, {
        status: 503,
        headers: { "content-type": "text/html" },
      });
    }
    const context = new RouterContextProvider();
    context.set(cloudflareContext, { env, ctx });
    return requestHandler(request, context);
  },
} satisfies ExportedHandler<Env>;
