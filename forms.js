(function () {
  var globalConfig = window.POCKET_AI_MECHANIC_FORMS || {};
  var pendingForms = {};
  var submitCounter = 0;
  var messageSource = "pocket-ai-mechanic-signup";

  function buildMailtoUrl(to, subject, lines) {
    var body = lines.join("\n");
    return "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  function getFieldValue(field) {
    if (field.tagName === "SELECT") {
      if (!field.options[field.selectedIndex]) {
        return "";
      }
      return field.options[field.selectedIndex].text.trim();
    }

    return field.value.trim();
  }

  function collectFieldLine(field) {
    var rawValue = getFieldValue(field);

    if (!rawValue) {
      return null;
    }

    return (field.dataset.label || field.name || "Field") + ": " + rawValue;
  }

  function getSubmitButton(form) {
    return form.querySelector('button[type="submit"]');
  }

  function ensureStatusNode(form) {
    var node = form.querySelector("[data-form-status]");

    if (!node) {
      node = document.createElement("p");
      node.className = "form-status";
      node.setAttribute("data-form-status", "");
      node.setAttribute("aria-live", "polite");
      form.appendChild(node);
    }

    return node;
  }

  function setStatus(form, tone, message) {
    var node = ensureStatusNode(form);
    node.className = "form-status form-status--" + tone;
    node.textContent = message;
    node.hidden = !message;
  }

  function setSubmitting(form, isSubmitting) {
    var button = getSubmitButton(form);

    if (!button) {
      return;
    }

    if (!button.dataset.defaultLabel) {
      button.dataset.defaultLabel = button.textContent;
    }

    button.disabled = isSubmitting;
    button.setAttribute("aria-busy", isSubmitting ? "true" : "false");
    button.textContent = isSubmitting ? (form.dataset.submittingLabel || "Submitting...") : button.dataset.defaultLabel;
  }

  function ensureHiddenField(form, name, value) {
    var field = form.querySelector('input[type="hidden"][name="' + name + '"]');

    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = name;
      form.appendChild(field);
    }

    field.value = value;
  }

  function ensureFormId(form) {
    if (!form.dataset.formId) {
      submitCounter += 1;
      form.dataset.formId = (form.dataset.formType || "signup") + "-" + submitCounter;
    }

    return form.dataset.formId;
  }

  function getEndpoint(form) {
    return form.dataset.appsScriptEndpoint || globalConfig.endpoint || "";
  }

  function createIframe(formId) {
    var iframe = document.createElement("iframe");
    iframe.name = "signup-target-" + formId;
    iframe.title = "Signup submission target";
    iframe.hidden = true;
    iframe.tabIndex = -1;
    iframe.className = "signup-target-frame";
    document.body.appendChild(iframe);
    return iframe;
  }

  function buildMailtoLines(form) {
    var intro = form.dataset.mailtoIntro || "Pocket AI Mechanic website signup";
    var lines = [intro, ""];

    Array.prototype.forEach.call(form.querySelectorAll("[data-mailto-field]"), function (field) {
      var line = collectFieldLine(field);
      if (line) {
        lines.push(line);
      }
    });

    lines.push("");
    lines.push("Submitted from: " + window.location.href);

    return lines;
  }

  function fallbackToMailto(form) {
    var to = form.dataset.mailtoTo || "support@pocketaimechanic.com";
    var subject = form.dataset.mailtoSubject || "Pocket AI Mechanic enquiry";
    window.location.href = buildMailtoUrl(to, subject, buildMailtoLines(form));
  }

  function queueTimeout(formId) {
    window.setTimeout(function () {
      var form = pendingForms[formId];

      if (!form) {
        return;
      }

      delete pendingForms[formId];
      setSubmitting(form, false);
      setStatus(
        form,
        "pending",
        "The signup request was sent, but this browser did not confirm delivery. If you do not receive a follow-up, use the direct support email link below."
      );
    }, 15000);
  }

  function submitWithAppsScript(form) {
    var endpoint = getEndpoint(form);
    var formId;
    var iframe;

    if (!endpoint) {
      return false;
    }

    formId = ensureFormId(form);
    iframe = createIframe(formId);

    ensureHiddenField(form, "formId", formId);
    ensureHiddenField(form, "formType", form.dataset.formType || "signup");
    ensureHiddenField(form, "siteOrigin", window.location.origin);
    ensureHiddenField(form, "pageUrl", window.location.href);
    ensureHiddenField(form, "pageTitle", document.title);
    ensureHiddenField(form, "submittedAt", new Date().toISOString());
    ensureHiddenField(form, "userAgent", window.navigator.userAgent || "");

    form.action = endpoint;
    form.method = "POST";
    form.target = iframe.name;

    pendingForms[formId] = form;
    setSubmitting(form, true);
    setStatus(form, "pending", form.dataset.pendingMessage || "Submitting your signup request...");
    queueTimeout(formId);
    form.submit();
    return true;
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    var form;

    if (!data || data.source !== messageSource || !data.formId) {
      return;
    }

    form = pendingForms[data.formId];

    if (!form) {
      return;
    }

    delete pendingForms[data.formId];
    setSubmitting(form, false);

    if (data.status === "success") {
      form.reset();
      setStatus(form, "success", data.message || form.dataset.successMessage || "Thanks. Your request was received.");
      return;
    }

    setStatus(
      form,
      "error",
      data.message || form.dataset.errorMessage || "The request could not be completed. Please use the direct support email link below."
    );
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-mailto-form]"), function (form) {
    ensureStatusNode(form).hidden = true;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      if (submitWithAppsScript(form)) {
        return;
      }

      fallbackToMailto(form);
      setStatus(
        form,
        "pending",
        "Your browser is opening the email fallback because the hosted signup endpoint is not configured yet."
      );
    });
  });
})();
