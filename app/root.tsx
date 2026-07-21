import { useState, useCallback } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import "./app.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
          crossOrigin="anonymous"
          fetchPriority="high"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
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
  const isDev = import.meta.env.DEV;
  const [copied, setCopied] = useState(false);
  const copyStack = useCallback(() => {
    if (!error?.stack) return;
    navigator.clipboard.writeText(error.stack).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {});
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07080A] p-8">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-bold text-[#F1F1F3]">Something went wrong</h1>
        <p className="mt-2 text-[#6A6D6E]">An unexpected error occurred.</p>
        {isDev && error && (
          <>
            <p className="mt-4 rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/[0.04] px-4 py-3 text-left text-sm font-mono text-[#EF4444] break-all">
              {error.message}
            </p>
            <details className="mt-2 text-left">
              <summary className="inline-flex cursor-pointer items-center gap-2 text-xs text-[#5C5C66] hover:text-[#8B8B93]">
                Stack trace
                <button type="button" onClick={(e) => { e.stopPropagation(); copyStack(); }} className="rounded border border-[#1A1D1E] px-1 py-0.5 hover:border-[#00D4AA] hover:text-[#00D4AA] transition-colors">
                  {copied ? (
                    <svg className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3.5 8.5l3 3 6-7"/></svg>
                  ) : (
                    <svg className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="10" height="10" rx="1"/><path d="M5 3V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1"/></svg>
                  )}
                </button>
              </summary>
              <pre className="mt-1 overflow-x-auto rounded-lg border border-[#1A1D1E] bg-[#07080A] p-3 text-[10px] font-mono text-[#6A6D6E] leading-relaxed max-h-48 overflow-y-auto">
                {error.stack}
              </pre>
            </details>
          </>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <a href="/" className="rounded-lg bg-[#00D4AA] px-5 py-2.5 text-sm font-medium text-black hover:bg-[#00B894] transition-colors">Go home</a>
          <a href="/dashboard" className="rounded-lg border border-[#1A1D1E] px-5 py-2.5 text-sm font-medium text-[#8B8B93] hover:border-[#00D4AA] hover:text-[#00D4AA] transition-colors">Dashboard</a>
        </div>
      </div>
    </div>
  );
}
