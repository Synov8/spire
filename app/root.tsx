import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import "./app.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        {/*
          CWV (spec §11): preload the Inter stylesheet with `crossOrigin` (the
          Google Fonts server reads it back with CORS) + `fetchpriority="high"`
          so the browser starts the fetch in parallel with the HTML parse. The
          actual `<link rel="stylesheet">` below still goes through the normal
          render-blocking path; the preload hints to the browser that fonts are a
          critical resource for LCP on /, /pricing, /trust-center, etc.
        */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          crossOrigin="anonymous"
          fetchPriority="high"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error?: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07080A] p-8">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-bold text-[#F1F1F3]">Something went wrong</h1>
        <p className="mt-2 text-[#6A6D6E]">An unexpected error occurred.</p>
        {error && (
          <>
            <p className="mt-4 rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/[0.04] px-4 py-3 text-left text-sm font-mono text-[#EF4444] break-all">
              {error.message}
            </p>
            <details className="mt-2 text-left">
              <summary className="cursor-pointer text-xs text-[#5C5C66] hover:text-[#8B8B93]">Stack trace</summary>
              <pre className="mt-1 overflow-x-auto rounded-lg border border-[#1A1D1E] bg-[#07080A] p-3 text-[10px] font-mono text-[#6A6D6E] leading-relaxed max-h-48 overflow-y-auto">
                {error.stack}
              </pre>
            </details>
          </>
        )}
      </div>
    </div>
  );
}
