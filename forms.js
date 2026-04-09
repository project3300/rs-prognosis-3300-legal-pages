(function () {
  function buildMailtoUrl(to, subject, lines) {
    var body = lines.join("\n");
    return "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  function collectFieldLine(field) {
    var rawValue = "";

    if (field.tagName === "SELECT") {
      rawValue = field.options[field.selectedIndex] ? field.options[field.selectedIndex].text.trim() : "";
    } else {
      rawValue = field.value.trim();
    }

    if (!rawValue) {
      return null;
    }

    return (field.dataset.label || field.name || "Field") + ": " + rawValue;
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-mailto-form]"), function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      var to = form.dataset.mailtoTo || "support@pocketaimechanic.com";
      var subject = form.dataset.mailtoSubject || "Pocket AI Mechanic enquiry";
      var intro = form.dataset.mailtoIntro || "Pocket AI Mechanic website signup";
      var lines = [intro, ""];

      Array.prototype.forEach.call(form.querySelectorAll("[data-mailto-field]"), function (field) {
        var line = collectFieldLine(field);
        if (line) {
          lines.push(line);
        }
      });

      window.location.href = buildMailtoUrl(to, subject, lines);
    });
  });
})();
