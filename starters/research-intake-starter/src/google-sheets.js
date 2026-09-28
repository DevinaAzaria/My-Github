const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RESPONSES_SHEET_ID = Number(process.env.RESPONSES_SHEET_ID || 0);

async function metadata(path) {
  const res = await fetch(
    "http://metadata.google.internal/computeMetadata/v1/" + path,
    { headers: { "Metadata-Flavor": "Google" } }
  );

  if (!res.ok) {
    throw new Error("Google metadata server unavailable.");
  }

  return res.json();
}

async function accessToken() {
  if (process.env.GOOGLE_ACCESS_TOKEN) {
    return process.env.GOOGLE_ACCESS_TOKEN;
  }

  const scope = encodeURIComponent(
    "https://www.googleapis.com/auth/spreadsheets"
  );

  const token = await metadata(
    "instance/service-accounts/default/token?scopes=" + scope
  );

  if (!token || !token.access_token) {
    throw new Error("Google access token unavailable.");
  }

  return token.access_token;
}

function cell(value) {
  if (typeof value === "number") {
    return { userEnteredValue: { numberValue: value } };
  }

  if (typeof value === "boolean") {
    return { userEnteredValue: { boolValue: value } };
  }

  return {
    userEnteredValue: {
      stringValue: value == null ? "" : String(value)
    }
  };
}

async function appendResponse(values) {
  if (!SPREADSHEET_ID) {
    throw new Error("SPREADSHEET_ID is not configured.");
  }

  const token = await accessToken();

  const url =
    "https://sheets.googleapis.com/v4/spreadsheets/" +
    SPREADSHEET_ID +
    ":batchUpdate";

  const body = {
    requests: [
      {
        appendCells: {
          sheetId: RESPONSES_SHEET_ID,
          rows: [{ values: values.map(cell) }],
          fields: "userEnteredValue"
        }
      }
    ]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(
      "Google Sheets write failed:",
      res.status,
      text.slice(0, 1200)
    );
    throw new Error("Response could not be stored.");
  }

  return res.json();
}

module.exports = { appendResponse };
