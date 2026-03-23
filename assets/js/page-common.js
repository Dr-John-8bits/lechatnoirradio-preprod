(function () {
  var CONTACT_EMAIL = "radio@lechatnoirradio.fr";

  var ICONS = {
    news:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H19v11.5a2.5 2.5 0 0 1-2.5 2.5H7.5A2.5 2.5 0 0 1 5 15.5z"></path><path d="M5 7h10"></path><path d="M8 11h8"></path><path d="M8 14.5h6"></path></svg>',
    schedule:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="3"></rect><path d="M8 3v4"></path><path d="M16 3v4"></path><path d="M4 10h16"></path><path d="M8 14h3"></path></svg>',
    voices:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M12 15a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4z"></path><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v3"></path><path d="M8.5 21h7"></path></svg>',
    about:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="4.5" r="1.3" fill="currentColor" stroke="none"></circle><path d="M12 6.5v13"></path><path d="m8.4 19.5 3.6-6.2 3.6 6.2"></path><path d="M7.1 9.3a6.9 6.9 0 0 1 9.8 0"></path><path d="M4.3 6.6a10.8 10.8 0 0 1 15.4 0"></path></svg>',
    external:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M14 5h5v5"></path><path d="M10 14 19 5"></path><path d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"></path></svg>',
    contact:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5z"></path><path d="m7 8 5 4 5-4"></path></svg>',
  };

  function asString(value) {
    if (typeof value !== "string") return "";
    return value.trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function faIcon(className, extraClassName) {
    var raw = asString(className);
    if (!raw) return "";
    var classes = raw;
    if (extraClassName) classes += " " + extraClassName;
    return '<i class="' + escapeHtml(classes) + '" aria-hidden="true"></i>';
  }

  function icon(name) {
    return ICONS[name] || "";
  }

  function fillIconSlots(scope) {
    var root = scope || document;
    root.querySelectorAll(".icon-slot[data-icon]").forEach(function (node) {
      var name = node.getAttribute("data-icon");
      node.innerHTML = icon(name);
    });
  }

  function markActiveNav() {
    var pageId = asString(document.body && document.body.getAttribute("data-page"));
    document.querySelectorAll("[data-page-link]").forEach(function (link) {
      var route = link.getAttribute("data-page-link");
      link.classList.toggle("is-active", route === pageId);
    });
  }

  function buildMailtoHref(action) {
    return (
      "mailto:" +
      CONTACT_EMAIL +
      "?subject=" +
      encodeURIComponent(action.subject) +
      "&body=" +
      encodeURIComponent(action.body)
    );
  }

  function renderShowActionLabel(show) {
    if (show && Array.isArray(show.actionLabelLines) && show.actionLabelLines.length) {
      return (
        '<span class="show-action-label">' +
        show.actionLabelLines
          .map(function (line) {
            return "<span>" + escapeHtml(line) + "</span>";
          })
          .join("") +
        "</span>"
      );
    }
    return "<span>" + escapeHtml(show && show.actionLabel ? show.actionLabel : "") + "</span>";
  }

  function getCurrentDayId() {
    try {
      var weekday = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Paris",
        weekday: "short",
      })
        .format(new Date())
        .slice(0, 3)
        .toLowerCase();
      var weekdayMap = {
        sun: "sun",
        mon: "mon",
        tue: "tue",
        wed: "wed",
        thu: "thu",
        fri: "fri",
        sat: "sat",
      };
      return weekdayMap[weekday] || "mon";
    } catch (error) {
      var map = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      return map[new Date().getDay()] || "mon";
    }
  }

  function initPageChrome(scope) {
    fillIconSlots(scope || document);
    markActiveNav();
  }

  window.LCNPageCommon = {
    asString: asString,
    escapeHtml: escapeHtml,
    faIcon: faIcon,
    icon: icon,
    fillIconSlots: fillIconSlots,
    markActiveNav: markActiveNav,
    buildMailtoHref: buildMailtoHref,
    renderShowActionLabel: renderShowActionLabel,
    getCurrentDayId: getCurrentDayId,
    initPageChrome: initPageChrome,
  };
})();
