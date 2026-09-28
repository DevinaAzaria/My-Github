# Adoption Guide

## When to use this starter

Use this starter when a project needs structured data collection and the first version does not justify a full database-backed application.

Typical examples:

- student research
- field validation
- science / engineering experiment intake
- competition participant intake
- interview pre-screening
- pilot-program enrollment
- internal evidence collection

## When not to use it

Do not keep Google Sheets as the long-term system of record when the project needs:

- high-volume concurrent writes
- complex joins or relationships
- strict row-level authorization
- regulated or highly sensitive data
- transactional guarantees
- advanced workflow state machines

At that point, keep the web/API contract and replace the persistence adapter.

## Google Sheet schema

Create a response tab with this baseline header:

```
record_id
submitted_at
participant_name
context
goal
observation
evidence
constraints
consent
```

The order must match `toResponseRow()` in `src/schema.js`.

## Cloud Run checklist

1. Deploy the app using a runtime service account.
2. Enable Google Sheets API in the project.
3. Share only the target spreadsheet with the runtime service account.
4. Grant **Editor** only if the application must write.
5. Set `SPREADSHEET_ID` and `RESPONSES_SHEET_ID`.
6. Set `ALLOWED_ORIGINS` to the production site.
7. Do not place credentials in source code.
8. Run a synthetic submission first.
9. Verify the exact row written to Sheets.
10. Delete synthetic data before the real pilot.

## Extracting improvements back

If an adopting project creates a generally useful capability, such as:

- better validation
- file upload abstraction
- configurable form schema
- improved anti-spam
- reusable review dashboard
- alternative database adapter

port the generic improvement back into this starter without importing project-specific data or naming.


## Troubleshooting

For the production-tested checklist covering Google Sheets API enablement, Cloud Run service accounts, spreadsheet sharing, OAuth scopes, stale revisions, and synthetic end-to-end verification, see:

[`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md)
