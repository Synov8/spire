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

export function ErrorBoundary() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07080A]">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#F1F1F3]">Something went wrong</h1>
        <p className="mt-2 text-[#6A6D6E]">An unexpected error occurred.</p>
      </div>
    </div>
  );
}
