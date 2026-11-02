# Reliability Objectives for Claude Code

Know which services have spent their error budget, which measurements are missing and which recovery actions are overdue. Keep the evidence and the owner's decision in a database you own.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free, MIT. Install and run the demo. | Your objectives, export mapping, policies and connections. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |

[Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=nobl9) · [Instead of Nobl9](https://enterprisedna.co/omni/instead-of/nobl9?utm_source=github&utm_medium=readme&utm_campaign=nobl9)

## Start with the Monday review

Requires Node 20 or later.

```bash
npm install
npm run demo
npm run reliability -- weekly-review
npm run docs
npm run view
```

Open the folder in Claude Code, Codex, OpenCode or Cursor. AGENTS.md and CLAUDE.md route every runtime through the same commands. PGlite runs locally. DATABASE_URL selects PostgreSQL; DATA_DIR selects another local store. Never seed a working database.

The fictional demo includes an exhausted checkout budget, a healthy portal and a warehouse sync missing three days of measurements. Its dates are relative to today. Re-seeding is idempotent for existing records.

## The weekly rituals

/error-budgets compares targets with evidence. /coverage finds missing days. /release-readiness identifies the decisions blocked by evidence, policy or overdue work. /weekly-review brings those together. /add-action and /close-action record recovery work. /decide records the human's hold or proceed decision with its evidence snapshot. It never deploys software.

26 CLI commands and 30 slash-command recipes. Every CLI command accepts --json. Every record change requires --actor and supports --dry-run. Exact codes, partial ids and case-insensitive names work. Ambiguous matches list candidates and exit 1.

## Counts, snapshots and honest gaps

Native objectives use complete UTC days ending yesterday. Error allowance is total requests multiplied by one minus the target. Remaining percentage is the unused allowance divided by the allowance. A negative result means the budget was exceeded. Every day in the chosen window must be present, and total traffic must be positive, before the evidence supports proceed.

Imported Nobl9 remaining-budget snapshots retain the vendor's calculation and original columns. They are separate from native counts. Stale and missing snapshots, and composite objectives, cannot support proceed. A service also needs a named owner, current policy review and no overdue action. These are explicit local policies, not legal requirements.

## Ten questions you can answer today

These are demonstrated questions for the owned system, not unsupported claims about what Nobl9 cannot do.

1. Which objective has exhausted its allowance for failed requests? Run error-budgets.
2. Which apparently healthy result is missing measurement days? Run coverage.
3. Which service cannot support a release decision today? Run release-readiness.
4. Which recovery action is overdue, and who owns it? Run attention.
5. Which owner carries the most open recovery work? Run owner-load.
6. Which service has no current written reliability policy? Run compliance.
7. Which imported results are stale or composite? Run import-health.
8. What evidence supported the last proceed decision? Run service with its code.
9. Which decision notes need a retention-purpose review? Run compliance.
10. Who changed a policy, and what did it say before? Run activity.

## Bring your history

```bash
npm run reliability -- import nobl9 --file=fixtures/nobl9.csv --source=demo --actor="Your name" --dry-run
```

The fixture is fictional. Replace it with an authorised Enterprise data-export CSV or CSV.gz. Run once with --dry-run, reconcile the counts, then repeat without that flag. The importer preserves every original column, refuses changed duplicate measurements and rolls back an invalid batch. Verify export entitlement before planning a Teams migration. [Switching guide](docs/replace-nobl9.md).

## Documents and views

Edit brand.json once. npm run docs renders one service reliability review and one error-budget policy draft per service. npm run view renders the week, measurement coverage and follow-up snapshots. /draft-review and /draft-policy write private HTML to drafts/. No message is sent.

/compliance checks owner, policy-review and retention-purpose records against the sourced rules in [compliance.md](docs/compliance.md). It prompts a human review, not a compliance certificate.

## Your first hour: ten things to ask for

1. Put our business name on the review.
2. Show the exhausted demo objective.
3. Explain the three missing measurement days.
4. Import a supported export without saving it.
5. Assign our service owners.
6. Record our approved error-budget rule.
7. Add our daily count export as evidence.
8. Draft the next reliability review.
9. Add a report grouped by our service team.
10. Add a business-impact field with a tested migration.

/customise writes a migration and tests the change. /new-view adds a read-only report. Targets and measured history are never silently rewritten.

## Verification and limits

Run npm test. It uses a temporary database, migrates and seeds twice, exercises every command, and checks budget arithmetic, missing days, zero traffic, failed decisions, import rollback, duplicate handling, definition drift, gzip, original columns, audit, export and escaped HTML. CI is configured for Windows and Linux with Node 20 and 22 and for PostgreSQL 17. A configured workflow is not proof that it ran.

This base is for owned reviews and decisions. Live monitoring collection, alert delivery, time-slice recomputation and composite calculation require separate work. Keep operational monitoring in place until its replacement is tested. Read [why no front end](docs/why-no-front-end.md) and [operations and recovery](docs/operations.md). The audit records operator-supplied names; administrators can alter the database. Exports are portable snapshots, not an implemented restore process.

## Price context and your version

Nobl9 Teams lists US$14,950 per year. Professional and Enterprise are quoted privately. This is the vendor's list price, not a verified customer invoice. [Pricing](https://www.nobl9.com/pricing), checked 2 November 2026. [Selection evidence and scores](docs/research.md).

Enterprise DNA maps your export, builds your fields, rules, monitoring connections and shared screens, and operates your version through Omni by Enterprise DNA. One setup fee, then a retainer. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=nobl9).

MIT. Not affiliated with Nobl9 or Anthropic. Hosting and agent usage have their own costs.
