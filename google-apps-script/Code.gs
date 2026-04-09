var SHEET_NAME = 'Signups';
var SPREADSHEET_ID = 'REPLACE_WITH_GOOGLE_SHEET_ID';
var SUPPORT_EMAIL = 'support@pocketaimechanic.com';
var ALLOWED_ORIGINS = [
  'https://pocketaimechanic.com',
  'https://www.pocketaimechanic.com',
  'http://127.0.0.1:5500',
  'http://localhost:5500'
];

function doPost(e) {
  try {
    var params = normalizeParams_(e);
    validateParams_(params);
    appendSubmission_(params);
    notifySupport_(params);
    return buildResponse_(params, 'success', successMessage_(params));
  } catch (error) {
    var safeParams = normalizeParams_(e);
    return buildResponse_(safeParams, 'error', error.message || 'Submission failed. Please email support directly.');
  }
}

function normalizeParams_(e) {
  var parameter = (e && e.parameter) || {};
  return {
    formId: parameter.formId || '',
    formType: parameter.formType || 'signup',
    email: (parameter.email || '').trim(),
    deviceType: (parameter.deviceType || '').trim(),
    platform: (parameter.platform || '').trim(),
    pageTitle: (parameter.pageTitle || '').trim(),
    pageUrl: (parameter.pageUrl || '').trim(),
    siteOrigin: (parameter.siteOrigin || '').trim(),
    submittedAt: (parameter.submittedAt || '').trim(),
    userAgent: (parameter.userAgent || '').trim()
  };
}

function validateParams_(params) {
  if (!params.formId) {
    throw new Error('Missing form identifier.');
  }

  if (!params.email) {
    throw new Error('Email address is required.');
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(params.email)) {
    throw new Error('Email address is invalid.');
  }

  if (params.formType === 'tester' && !params.deviceType) {
    throw new Error('Device type is required for tester signups.');
  }
}

function appendSubmission_(params) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error('Signup sheet not found.');
  }

  sheet.appendRow([
    new Date(),
    params.formType,
    params.email,
    params.deviceType,
    params.platform,
    params.pageTitle,
    params.pageUrl,
    params.userAgent
  ]);
}

function notifySupport_(params) {
  var subject = params.formType === 'tester'
    ? 'Pocket AI Mechanic Tester Signup'
    : 'Pocket AI Mechanic Pre-release Signup';
  var lines = [
    'A new website signup was received.',
    '',
    'Form type: ' + params.formType,
    'Email: ' + params.email
  ];

  if (params.deviceType) {
    lines.push('Device type: ' + params.deviceType);
  }

  if (params.platform) {
    lines.push('Interested platform: ' + params.platform);
  }

  if (params.pageUrl) {
    lines.push('Page URL: ' + params.pageUrl);
  }

  MailApp.sendEmail({
    to: SUPPORT_EMAIL,
    subject: subject,
    body: lines.join('\n')
  });
}

function successMessage_(params) {
  if (params.formType === 'tester') {
    return 'Thanks. Your tester request was received.';
  }

  return 'Thanks. Your pre-release request was received.';
}

function buildResponse_(params, status, message) {
  var origin = allowedOrigin_(params.siteOrigin);
  var payload = JSON.stringify({
    source: 'pocket-ai-mechanic-signup',
    formId: params.formId || '',
    status: status,
    message: message
  });
  var html = [
    '<!doctype html>',
    '<html>',
    '<body>',
    '<p>' + escapeHtml_(message) + '</p>',
    '<script>',
    '(function () {',
    '  var payload = ' + payload + ';',
    '  var targetOrigin = ' + JSON.stringify(origin) + ';',
    '  if (window.top && window.top !== window) {',
    '    window.top.postMessage(payload, targetOrigin);',
    '  }',
    '})();',
    '<\/script>',
    '</body>',
    '</html>'
  ].join('');

  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function allowedOrigin_(origin) {
  if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
    return origin;
  }

  return ALLOWED_ORIGINS[0];
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}