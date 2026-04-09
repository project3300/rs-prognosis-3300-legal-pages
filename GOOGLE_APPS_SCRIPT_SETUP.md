# Google Apps Script Signup Setup

This site can submit the `tester/` and `prerelease/` forms directly to a Google Apps Script web app.

## What It Does

- Accepts signup submissions from the public website.
- Writes each submission to a Google Sheet.
- Emails the support inbox with the submission details.
- Sends a success or failure message back to the signup page without redirecting the user away.

## Files In This Repo

- `forms-config.js`: set the deployed Apps Script URL here.
- `forms.js`: submits forms to the Apps Script endpoint and handles success and error messages.
- `google-apps-script/Code.gs`: Apps Script server code.

## Setup Steps

1. Create a Google Sheet to receive submissions.
2. Open `script.new` while signed into the Google account that owns your Workspace.
3. Replace the default script contents with the code from `google-apps-script/Code.gs`.
4. Update the configuration constants near the top of the script:
   - `SPREADSHEET_ID`
   - `SHEET_NAME`
   - `SUPPORT_EMAIL`
   - `ALLOWED_ORIGINS`
5. In Apps Script, select `Deploy` > `New deployment`.
6. Choose `Web app`.
7. Set `Execute as` to your account.
8. Set `Who has access` to `Anyone`.
9. Copy the deployed web app URL.
10. Paste that URL into `forms-config.js` as the `endpoint` value.
11. Commit and push the site so GitHub Pages serves the configured URL.

## Sheet Columns

The script writes the following columns in order:

1. Timestamp
2. Form Type
3. Email
4. Device Type
5. Interested Platform
6. Page Title
7. Page URL
8. User Agent

## Notes

- The site keeps the direct `mailto:` links as a fallback.
- If you redeploy the Apps Script and get a new URL, update `forms-config.js` and republish the site.
- If you only want to log submissions without sending emails, remove the `MailApp.sendEmail` call from the script.