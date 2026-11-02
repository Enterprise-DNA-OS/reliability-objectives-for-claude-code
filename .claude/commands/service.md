# Read one service and its history

Run `npm run reliability -- service <code-or-name>`. All CLI commands accept `--json`.

Resolve exact code first. If ambiguous, show candidates and ask the operator.

For record changes, use the operator's name in --actor and preview with --dry-run. Do not fabricate measurements, evidence or approvals. Do not send, publish or delete. Report what the command actually returned.
