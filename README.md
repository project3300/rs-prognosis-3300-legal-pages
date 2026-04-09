# Pocket AI Mechanic Legal Pages

Static legal pages for Facebook Login requirements.

## Pages
- `privacy-policy.html`
- `data-deletion.html`

Publish with GitHub Pages from this repository root.

## Signup Forms

The `tester/` and `prerelease/` pages are wired for a Google Apps Script web app.

1. Deploy the Apps Script in `google-apps-script/Code.gs` as a web app.
2. Paste the deployment URL into `forms-config.js`.
3. Push the site again so GitHub Pages serves the configured endpoint.

Until `forms-config.js` is configured, the signup pages fall back to `mailto:` links.

Detailed setup steps are in `GOOGLE_APPS_SCRIPT_SETUP.md`.
