# Operation and recovery

Use Node 20 or later. Without DATABASE_URL, PGlite persists under .data/db, or DATA_DIR. With DATABASE_URL, the adapter uses PostgreSQL and verifies remote TLS certificates. Use a database owner connection for migrations and the local operator workflow, never an anonymous public web role. Do not point this repo at a customer system without authority.

Run npm run migrate before use. New schema changes belong in new numbered migrations. Applied migrations are tracked. Do not seed a working database. The demo uses fictional rows; on PostgreSQL seed requires --demo-database as an explicit disposable-database acknowledgement.

Daily counts are UTC-day increments from a trustworthy counter export. Submit each day once. A bad count needs a reviewed correction migration with retained audit evidence; the CLI does not overwrite measurements. Native objectives are immutable. Create a new objective when the target changes and explicitly plan retirement of the old one.

All CLI mutations take one transaction and a database table lock, so another operator cannot change the evidence during a decision. Actor strings are operator attribution, not authenticated identity. Database administrators can change the audit. This is not a tamper-proof ledger. For shared use, configure distinct authorised accounts, network restrictions, encrypted storage and backups.

Export writes every business record, raw import column and audit event. It refuses to overwrite a file. There is no restore command. Back up PostgreSQL with its supported backup tools and test recovery into a separate database. For PGlite, close all connections before backing up the entire DATA_DIR. Keep exports and recovery copies encrypted and private.

The reporting queries and documents are read-only snapshots. Files may contain personal information. Keep drafts/, exports/, imports/, docs-out/ and views/ private. Setting a future retention review does not itself establish a lawful purpose. Review names, notes, raw imported columns and backups together.

TEST_DATABASE_URL is reserved for an empty disposable PostgreSQL database. npm test refuses a nonempty public schema. CI covers Node 20 and 22 on Windows and Linux, plus PostgreSQL 17. Read actual CI results before claiming a platform passed.
