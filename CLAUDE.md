# Reliability Objectives for Claude Code

For service owners and software teams. This database holds reliability objectives, measurement evidence, policy reviews and human decisions. Read the CLI before answering.

## Routing

- /services: Read the service register. Read .claude/commands/services.md.
- /objectives: Read the reliability objectives. Read .claude/commands/objectives.md.
- /error-budgets: Review the error budgets. Read .claude/commands/error-budgets.md.
- /coverage: Check measurement coverage. Read .claude/commands/coverage.md.
- /import-health: Check imported evidence. Read .claude/commands/import-health.md.
- /release-readiness: Prepare the release review. Read .claude/commands/release-readiness.md.
- /attention: Find reliability work needing attention. Read .claude/commands/attention.md.
- /actions: Read reliability follow-up. Read .claude/commands/actions.md.
- /owner-load: Balance reliability follow-up. Read .claude/commands/owner-load.md.
- /compliance: Check policy and record handling. Read .claude/commands/compliance.md.
- /decisions: Read recorded decisions. Read .claude/commands/decisions.md.
- /activity: Read the change history. Read .claude/commands/activity.md.
- /weekly-review: Run the Monday reliability review. Read .claude/commands/weekly-review.md.
- /service: Read one service and its history. Read .claude/commands/service.md.
- /export: Export records and audit history. Read .claude/commands/export.md.
- /draft-review: Draft a service reliability review. Read .claude/commands/draft-review.md.
- /draft-policy: Draft an error-budget policy. Read .claude/commands/draft-policy.md.
- /add-service: Register a service. Read .claude/commands/add-service.md.
- /add-objective: Define a count objective. Read .claude/commands/add-objective.md.
- /log-count: Log a complete day of measurements. Read .claude/commands/log-count.md.
- /add-action: Assign reliability follow-up. Read .claude/commands/add-action.md.
- /close-action: Close completed reliability work. Read .claude/commands/close-action.md.
- /review-service: Record a completed policy and retention review. Read .claude/commands/review-service.md.
- /decide: Record the release review decision. Read .claude/commands/decide.md.
- /import: Bring across Nobl9 exports. Read .claude/commands/import.md.
- /help: Read the command list. Read .claude/commands/help.md.
- /customise: write and test a numbered migration and the associated command changes.
- /new-view: add a read-only report.
- /docs and /view: render branded documents and evidence snapshots.

## Rules

Use npm run reliability -- help to list commands. Every CLI command supports --json. Every mutation requires --actor and supports --dry-run. Resolve ambiguity with the operator. Counts are daily increments for complete UTC days, never cumulative counters. Imported snapshots retain their source and remain separate from native calculations. Never invent missing data or approve a release. A recorded proceed decision does not execute a deployment.

Never send, publish or delete without explicit operator instructions. No send or deployment capability ships here. Drafts, exports and production imports stay private. Never seed a working database. Shared seed requires --demo-database and tests require an empty disposable TEST_DATABASE_URL. Read docs/compliance.md before interpreting record checks and docs/operations.md before shared use.

All changes on main. Run npm test after functional changes. The same .claude/commands library is used by Claude Code, Codex, OpenCode and Cursor. The database is the source of truth, not prior chat.
