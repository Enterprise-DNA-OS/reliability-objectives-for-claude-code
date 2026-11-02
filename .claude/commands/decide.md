# Record the release review decision

Run `npm run reliability -- decide <service> --decision=hold --note=<reason> --actor=<operator>`. All CLI commands accept `--json`.

Use hold or proceed as explicitly instructed. Proceed requires complete, current, within-budget evidence, current policy and no overdue action. This does not deploy anything.

For record changes, use the operator's name in --actor and preview with --dry-run. Do not fabricate measurements, evidence or approvals. Do not send, publish or delete. Report what the command actually returned.
