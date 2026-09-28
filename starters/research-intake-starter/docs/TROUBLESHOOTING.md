# Troubleshooting & Production Lessons

This file records operational lessons that were proven while adapting the starter pattern in a real Cloud Run + Google Sheets deployment.

The goal is to preserve **how the problem was solved**, not just the final code.

## Google Sheets write returns 403

A web form can load correctly and the API endpoint can be reached while the final write to Google Sheets still fails with HTTP 403.

Treat this as an infrastructure/authentication checklist, not a form bug.

### 1. Confirm Google Sheets API is enabled

In Google Cloud Console:

```
APIs & Services
→ Library
→ Google Sheets API
→ Enable
```

Important: make sure the active Google Cloud project is the **same project that runs the Cloud Run service**.

A spreadsheet being accessible in the browser does not mean the Google Sheets API is enabled for the runtime project.

---

### 2. Confirm the exact Cloud Run runtime service account

In Google Cloud Console:

```
Cloud Run
→ your service
→ Security / Revision settings
→ Service account
```

Do not guess the service account from the project number.

Copy the exact runtime identity shown by Cloud Run.

Typical format:

```
PROJECT_NUMBER-compute@developer.gserviceaccount.com
```

or a custom service account such as:

```
app-runtime@PROJECT_ID.iam.gserviceaccount.com
```

---

### 3. Share only the target spreadsheet with the runtime service account

Open the destination Google Sheet:

```
Share
→ add the Cloud Run service-account email
→ Editor
```

Prefer sharing only the specific spreadsheet required by the application.

Do not make the spreadsheet public and do not share an entire Drive folder unless the application truly needs broader access.

---

### 4. Request an access token with the Sheets OAuth scope

On Cloud Run, use the metadata server and explicitly request:

```
https://www.googleapis.com/auth/spreadsheets
```

Example:

```js
const scope = encodeURIComponent(
  "https://www.googleapis.com/auth/spreadsheets"
);

const res = await fetch(
  "http://metadata.google.internal/computeMetadata/v1/" +
  "instance/service-accounts/default/token?scopes=" +
  scope,
  {
    headers: {
      "Metadata-Flavor": "Google"
    }
  }
);

const token = await res.json();
```

Then call the Sheets API with:

```http
Authorization: Bearer ACCESS_TOKEN
```

Do not hard-code service-account keys into source code.

---

### 5. Confirm the new Cloud Run revision is actually deployed

If the repository deploys automatically from GitHub, a successful commit does not always mean the new revision is already serving traffic.

After changing authentication code:

1. wait for Cloud Build / deployment to finish;
2. confirm the newest Cloud Run revision is active;
3. then test again.

A stale revision can make a fixed codebase look broken.

---

### 6. Run one synthetic submission

Before accepting real data:

1. submit clearly fake/test data;
2. confirm the web UI shows success;
3. confirm the generated record ID;
4. open the destination spreadsheet;
5. verify the exact row and column mapping;
6. delete the synthetic row afterward.

This is the minimum end-to-end proof:

```
Browser
→ HTTP endpoint
→ server-side validation
→ Cloud Run identity
→ OAuth token
→ Google Sheets API
→ target spreadsheet
```

---

## 403 diagnosis matrix

| Symptom | Likely cause | Check |
|---|---|---|
| Sheets API returns 403 and API is disabled | API not enabled in runtime project | Google Cloud → APIs & Services |
| API enabled but still 403 | Spreadsheet not shared to runtime identity | Google Sheet sharing permissions |
| Sheet shared but still 403 | Wrong Cloud Run service account | Cloud Run revision/service identity |
| Identity and share are correct but write still fails | OAuth token scope may be insufficient | Explicit `spreadsheets` scope |
| Code fix committed but behavior unchanged | Old Cloud Run revision still serving | Build/deploy/revision status |
| 404 from Sheets API | Wrong spreadsheet ID or inaccessible resource | Environment variables + permissions |
| 400 from Sheets API | Bad sheet ID, range, or request body | Schema / numeric tab ID / request payload |

---

## Sheet ID vs spreadsheet ID

These are different:

- **Spreadsheet ID** = identifies the whole Google Sheets file.
- **Sheet ID** = numeric ID of one tab inside that spreadsheet.

Example environment configuration:

```env
SPREADSHEET_ID=replace-with-spreadsheet-file-id
RESPONSES_SHEET_ID=123456789
```

Do not use the visible tab name where the API expects numeric `sheetId`.

---

## Minimal Cloud Run production checklist

Before declaring the integration ready:

- [ ] Google Sheets API enabled in the correct GCP project
- [ ] correct Cloud Run runtime service account identified
- [ ] target spreadsheet shared to that exact service account
- [ ] service account has only the permission needed
- [ ] access token requests `https://www.googleapis.com/auth/spreadsheets`
- [ ] spreadsheet ID stored in configuration, not source-specific fork logic
- [ ] numeric target sheet/tab ID verified
- [ ] production revision deployed
- [ ] synthetic submission succeeds
- [ ] synthetic row mapping verified
- [ ] synthetic data deleted
- [ ] no credentials or personal data committed to GitHub

---

## Proven production lesson

The first KERSAA deployment of this pattern encountered a Sheets write failure even though:

- the public intake page loaded correctly;
- the POST API endpoint was working;
- the destination spreadsheet existed.

The working resolution path was to verify all four infrastructure layers together:

1. Google Sheets API enabled;
2. Cloud Run runtime service account identified;
3. destination spreadsheet shared to that exact service account as writer/editor;
4. metadata-server token requested with the explicit Sheets OAuth scope.

After the deployment containing those settings became active, the synthetic intake successfully wrote to both expected spreadsheet tables.

The synthetic records were then deleted so the pilot registry returned to a clean state.

### Lesson

**A working web form does not prove a working data pipeline.**

Always test the complete path through identity, API enablement, OAuth scope, destination permission, and final persisted row.
