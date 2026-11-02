# Bring your Nobl9 history

Checked 2 November 2026 against [Nobl9 data export](https://docs.nobl9.com/features/data-export/). This importer targets the documented Enterprise data export, not the separate configurable CSV from the SLO list. Verify entitlement before planning a switch from Teams.

1. In Nobl9, configure the documented data export to a storage bucket you control. Existing exports arrive as gzip-compressed CSV. Download the agreed files through your own authorised access. This tool never provisions a bucket, reads credentials or connects to Nobl9.
2. Save the export under ignored imports/. Run the command below with --dry-run. A plain CSV file works too.
3. Reconcile row count, new objectives, unchanged rows and source identity. Run import-health and inspect exported original columns after a real import. Repeat the command without --dry-run when the operator accepts the mapping.
4. Record your owners and policies with review-service. Imported services intentionally begin without an approved owner or policy. Keep the existing monitoring and incident routing in place until replacement connections are separately built and tested.

`npm run reliability -- import nobl9 --file=imports/export.csv.gz --source=november-cutover --actor="Your name" --dry-run`

## What maps

The documented organization, project and service identify the service. Organization, project, slo_name and objective_name identify an objective. target, method, comparison value, operator, time-window type and length, and composite flag form an immutable source definition. timestamp, measurement and time-window bounds identify a measurement. Every original column remains in the original record. The fictional fixtures/nobl9.csv uses these documented headers; it is not an exported customer account.

The latest remaining_budget value is displayed as a percentage by multiplying its fraction by 100. Negative remaining budget remains negative. The source observation and window-end timestamps must both be within the last 24 hours for decision use. This is a configurable business-policy threshold, not a Nobl9 promise. Composite objectives are retained but excluded from readiness. Other measurement types remain available in the full export; they are not silently converted into daily counts.

## Reconciliation and failures

Re-importing identical rows is safe. A changed existing row or definition stops and rolls back the whole file. Split history at a genuine definition change and agree an explicit migration before continuing. Unknown measurements, malformed CSV, non-finite values, invalid dates and future observations fail the batch. Run one file per command, using the same source account identity. Source names are provenance labels, not credentials.

## What needs separate work

This import does not bring across user permissions, live collectors, alert routes, dashboards, secrets or decision history. It does not recalculate Nobl9 time-slice or composite algorithms. Owners with the SLO-list CSV need an agreed mapping, since its columns vary. The owned daily-count method covers whole UTC days and requires fresh daily increments from your monitoring exports. Connectors and paging need their own build and acceptance checks.

A supported, available data export can be imported in one command. Full operational cutover depends on those connections and a period of reconciled results. Enterprise DNA maps your account export and builds the required connections as part of your version.
