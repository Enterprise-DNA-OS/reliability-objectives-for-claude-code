# Record a completed policy and retention review

Run `npm run reliability -- review-service <service> --owner=<owner> --policy=<rule> --due=YYYY-MM-DD --purpose=<lawful-purpose> --retention-review=YYYY-MM-DD --actor=<operator>`. All CLI commands accept `--json`.

Read the current policy and docs/compliance.md. The operator decides the rule and review dates. Do not advance dates without a real review.

For record changes, use the operator's name in --actor and preview with --dry-run. Do not fabricate measurements, evidence or approvals. Do not send, publish or delete. Report what the command actually returned.
