# Define a count objective

Run `npm run reliability -- add-objective --service=<service> --code=<code> --name=<name> --target=0.99 --days=7 --actor=<operator>`. All CLI commands accept `--json`.

Use an operator-approved target and window. The example is not a recommendation. Targets are immutable: a changed definition needs a new objective.

For record changes, use the operator's name in --actor and preview with --dry-run. Do not fabricate measurements, evidence or approvals. Do not send, publish or delete. Report what the command actually returned.
