# Log a complete day of measurements

Run `npm run reliability -- log-count --objective=<objective> --day=YYYY-MM-DD --good=<count> --total=<count> --source=<evidence> --actor=<operator>`. All CLI commands accept `--json`.

Only full UTC days before today. Counts are daily increments, never cumulative counters. A duplicate day is refused. Never estimate missing counts.

For record changes, use the operator's name in --actor and preview with --dry-run. Do not fabricate measurements, evidence or approvals. Do not send, publish or delete. Report what the command actually returned.
