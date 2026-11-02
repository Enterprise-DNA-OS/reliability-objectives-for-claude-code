# Bring across Nobl9 exports

Run `npm run reliability -- import nobl9 --file=imports/export.csv.gz --source=<batch-reference> --actor=<operator> --dry-run`. All CLI commands accept `--json`.

Read docs/replace-nobl9.md. Confirm this is the Enterprise data export, test it first, reconcile rows, then repeat without --dry-run under the operator instruction. Changed definitions or duplicates are refused, not overwritten.

For record changes, use the operator's name in --actor and preview with --dry-run. Do not fabricate measurements, evidence or approvals. Do not send, publish or delete. Report what the command actually returned.
