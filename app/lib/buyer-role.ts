/**
 * 1st-party buyer-role personalization for `/home` (spec §11).
 *
 * What this module ships:
 *   • `BuyerRole` type + canonical 4-role set (`BUYER_ROLES`).
 *   • `parseRoleFromUrl(url)` — primary signal is the explicit
 *     `?role=` URL param. Anything else falls back to `"unknown"`.
 *   • `readRoleFromCookie(request)` — RR loader call site. Reads
 *     the `spire_role` cookie from the inbound `Request`. Never
 *     touches `document` or `localStorage`. SSR-safe.
 *   • `storeRoleCookie(role)` — client-only. Writes the cookie
 *     plus a localStorage backup so subsequent reloads see the
 *     same role even with cookies blocked.
 *
 * Privacy stance (spec §10.1):
 *   The role cookie is a 1st-party key that is set ONLY by us
 *   (via `storeRoleCookie`) and read ONLY by us (via
 *   `readRoleFromCookie`). It travels in the HTTP `Cookie` header
 *   on every request to our own subdomain — that is exactly how
 *   the SSR loader resolves the CTA microcopy variant. It is never
 *   transmitted to a third party, never used as a stable identifier,
 *   never logged by us, and never used for audience identification.
 *   The CTA change is pure UI personalization — no telemetry, no
 *   analytics, no tracking.
 *
 * Honesty rule (spec §10.1):
 *   The role is inferred ONLY from the explicit `?role=` URL
 *   param on landing pages from email campaigns. We do NOT
 *   silently classify visitors from referrers. The default role
 *   for an unannotated visit is `"unknown"`.
 */

export type BuyerRole = "cto" | "security" | "revops" | "unknown";

export const BUYER_ROLES: ReadonlyArray<BuyerRole> = [
  "cto",
  "security",
  "revops",
  "unknown",
] as const;

const ROLE_COOKIE = "spire_role";
const ROLE_STORAGE_KEY = "spire_role";
/** 30-day cookie lifetime in seconds. */
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const ROLE_VALUE_SET: ReadonlySet<string> = new Set(BUYER_ROLES);

/**
 * Derive a role from the inbound request URL. Only the explicit
 * `?role=cto|security|revops` param sets a non-`unknown` role —
 * that is a strong, intentional, opt-in signal that survives a
 * redirect or a cookie clear. Everything else falls back to
 * `"unknown"`.
 */
export function parseRoleFromUrl(url: URL | string): BuyerRole {
  const search = typeof url === "string" ? url : url.search;
  if (!search) return "unknown";
  const params = new URLSearchParams(search);
  const candidate = params.get("role")?.trim().toLowerCase();
  if (candidate && ROLE_VALUE_SET.has(candidate)) {
    return candidate as BuyerRole;
  }
  return "unknown";
}

/**
 * Resolve the role from an inbound server request. Reads the
 * `spire_role` cookie value if present + valid; otherwise
 * returns `"unknown"`.
 *
 * Safe to call from any RR loader — never touches `document` or
 * `localStorage`.
 */
export function readRoleFromCookie(request: Request): BuyerRole {
  const header = request.headers.get("Cookie");
  if (!header) return "unknown";
  const match = header.match(/(?:^|;\s*)spire_role=([^;]+)/);
  const raw = match?.[1];
  if (!raw) return "unknown";
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    /* fall through with the raw value */
  }
  return ROLE_VALUE_SET.has(value) ? (value as BuyerRole) : "unknown";
}

/**
 * Write the role cookie + localStorage backup. Client-only.
 * Returns the new effective role so a caller can update React
 * state without an extra read.
 */
export function storeRoleCookie(role: BuyerRole): BuyerRole {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return role;
  }
  const safeValue = ROLE_VALUE_SET.has(role) ? role : "unknown";
  const expires = new Date(
    Date.now() + COOKIE_MAX_AGE_SECONDS * 1000,
  ).toUTCString();
  // SameSite=Lax is correct for top-level navigation. No Secure
  // flag because dev runs on http://localhost; production is HTTPS
  // but the browser will tighten anyway.
  document.cookie = `${ROLE_COOKIE}=${encodeURIComponent(safeValue)}; path=/; expires=${expires}; SameSite=Lax`;
  try {
    window.localStorage.setItem(ROLE_STORAGE_KEY, safeValue);
  } catch {
    /* private-mode / quota storage — fall back silently to cookie. */
  }
  return safeValue;
}
