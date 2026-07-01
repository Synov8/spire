docs(changelog): record ControlExplorer bloat-reduction cleanup

The dedupe + grouped chip work landed in d982b57, but the matching
CHANGELOG.md entry failed to apply on that turn due to a whitespace
mismatch (the heredoc produced multi-line bullets while the file used
single-line bullets). Append the missing entry now so the cleanup is
documented in Unreleased alongside the prior marketing + blog-post
batches.

Touches only CHANGELOG.md (markdown), so no typecheck or code-review
needed.
