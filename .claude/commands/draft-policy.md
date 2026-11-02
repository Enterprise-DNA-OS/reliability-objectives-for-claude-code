# Draft an error-budget policy

Run `npm run reliability -- draft-policy <service>`. All CLI commands accept `--json`.

Read the service first. Renders its actual recorded policy for human approval. Never invent the policy or approve it yourself.

For record changes, use the operator's name in --actor and preview with --dry-run. Do not fabricate measurements, evidence or approvals. Do not send, publish or delete. Report what the command actually returned.
