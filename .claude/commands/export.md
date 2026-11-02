# Export records and audit history

Run `npm run reliability -- export --file=exports/reliability.json`. All CLI commands accept `--json`.

Creates a new private snapshot. Never overwrite an existing export. This is not a restore command.

For record changes, use the operator's name in --actor and preview with --dry-run. Do not fabricate measurements, evidence or approvals. Do not send, publish or delete. Report what the command actually returned.
