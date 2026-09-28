# Research Intake Starter

Reusable Node.js starter for collecting structured research, pilot, field-study, or program-intake data through a branded multi-step web form and writing submissions to Google Sheets.

## Metadata

- **Purpose:** Research / intake data collection
- **Type:** Starter Kit
- **Status:** Reusable v0.1
- **Best for:** survey intake, field study, pilot study, competition research, school research, internal program intake
- **Stack:** Node.js 20+, native HTTP, Google Sheets API, Cloud Run compatible
- **Provenance:** generic pattern extracted from the production KERSAA KLS Intake implementation
- **No production data included:** yes

Suggested GitHub topics when split into its own repository:

`starter-kit`, `research`, `data-collection`, `forms`, `google-sheets`, `cloud-run`, `nodejs`

## What it includes

- Multi-step responsive web form
- Required-field validation
- Honeypot spam trap
- Basic in-memory rate limiting
- Server-side validation
- Stable record-ID generation
- Google Sheets append through service-account identity
- Explicit Sheets OAuth scope for Cloud Run
- Success confirmation with generated IDs
- Environment-based configuration
- No framework dependency

## Architecture

```
Participant / Respondent
        ↓
Multi-step web form
        ↓
POST /api/intake
        ↓
Server-side validation
        ↓
Google Sheets API
        ↓
Research spreadsheet
```

## Quick start

1. Copy this starter into a new project.
2. Create a Google Sheet with the columns you need.
3. Record the target spreadsheet ID and sheet/tab numeric ID.
4. Configure environment variables from `.env.example`.
5. Adjust `src/schema.js` for your research questions.
6. Adjust `src/form-page.js` for the user-facing form.
7. Run locally with `npm start`.
8. Deploy to Cloud Run or another Node.js platform.
9. If using Cloud Run, share the target Google Sheet with the runtime service account as **Editor**.
10. Ensure **Google Sheets API** is enabled in the Google Cloud project.

## Core reuse rule

Keep the engine generic. Put domain-specific questions and row mapping in the project that adopts this starter.

Do not copy:

- production spreadsheet IDs
- service-account emails
- credentials
- private participant data
- KERSAA-specific business rules

## Local test

```bash
npm start
```

Open:

```
http://localhost:8080/intake
```

For local Google Sheets writes, supply an access token through `GOOGLE_ACCESS_TOKEN` or replace the auth adapter with your preferred local credential flow. Cloud Run uses the metadata server automatically.

## Environment

See `.env.example`.

## Adopted pattern

The first production pattern that informed this starter was:

**KERSAA KLS Intake Web v1**

The starter deliberately removes KLS learner semantics and production identifiers so it can be reused by Devina for unrelated research or engineering projects.
