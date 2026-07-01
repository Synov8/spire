fix(copy): remove Composio from public-facing pages

The user said: "don't mention composio in the public pages. users
don't need to know" -- Composio is implementation detail, not a
product surface. End users (prospects, paying customers, compliance
reviewers inspecting the source) shouldn't see the broker's brand.

Across 14 user-visible files, every literal user-facing mention of
"Composio" / "Composio-OAuth" / "Composio-driven" was replaced with
honest generic vocabulary ("read-only OAuth", "automated evidence
collection", "brokered and managed on our side", etc.). Replacement
substitutions are listed in the matching CHANGELOG entry under
"Unreleased / Changed".

Internal surfaces keep Composio identifiers because they are code
identifiers and API contract names, not user copy -- the
integration-data.ts composioApp field is a routing key, the
/api/composio/connect route is a server endpoint users never reach
directly, and @composio/core / @composio/vercel are the pip deps
that power the read-only integrations. Grep across the public
surfaces confirms all user-visible copies are now Composio-free.

Typecheck exit 0. Two-step fix order: 12 files patched first via
parallel str_replace; reviewer round 1 surfaced two leftover leaks
where indentation differed (one serviceType: in
app/lib/structured-data.ts and one body line in
app/routes/dashboard.index.tsx) -- both patched via sed -i before
the final commit.
