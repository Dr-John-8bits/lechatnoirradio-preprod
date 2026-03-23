(function () {
  var common = window.LCNPageCommon;
  var content = window.LCNContentData;
  if (!common || !content) return;

  var refs = {
    switcher: document.getElementById("scheduleSwitcher"),
    panel: document.getElementById("schedulePanel"),
  };

  var days = Array.isArray(content.SCHEDULE_TIMELINE_DAYS)
    ? content.SCHEDULE_TIMELINE_DAYS
    : [];

  if (!refs.switcher || !refs.panel || !days.length) {
    common.initPageChrome(document);
    return;
  }

  var state = {
    selectedDayId: common.getCurrentDayId(),
  };

  function getDayById(dayId) {
    return days.find(function (day) {
      return day.id === dayId;
    }) || days[0];
  }

  function buildProgramBadge(slot) {
    if (!slot || !slot.badge) return "";
    return (
      '<span class="program-badge">' +
      common.faIcon(slot.badgeIcon, "program-badge-icon") +
      "<span>" +
      common.escapeHtml(slot.badge) +
      "</span>" +
      "</span>"
    );
  }

  function getProgramItemClasses(baseClass, slot) {
    var classes = [baseClass];
    if (slot && slot.meta) classes.push("is-meta");
    if (slot && slot.highlight) classes.push("is-highlight");
    if (slot && slot.kind) classes.push(slot.kind);
    return classes.join(" ");
  }

  function render() {
    refs.switcher.innerHTML = days
      .map(function (day) {
        var active = day.id === state.selectedDayId ? " is-active" : "";
        return (
          '<button class="day-chip' +
          active +
          '" type="button" data-day="' +
          common.escapeHtml(day.id) +
          '">' +
          common.escapeHtml(day.shortName) +
          "</button>"
        );
      })
      .join("");

    var dayData = getDayById(state.selectedDayId);
    refs.panel.innerHTML =
      '<article class="schedule-card">' +
      '<div class="schedule-day-head">' +
      '<div class="schedule-day-copy">' +
      '<div class="schedule-day-title-row">' +
      '<span class="schedule-day-icon">' +
      common.faIcon(dayData.icon, "schedule-day-fa") +
      "</span>" +
      "<h3>" +
      common.escapeHtml(dayData.name) +
      "</h3>" +
      "</div>" +
      "<p>" +
      common.escapeHtml(dayData.summary) +
      "</p>" +
      "</div>" +
      "</div>" +
      '<div class="schedule-list">' +
      dayData.slots
        .map(function (slot) {
          return (
            '<article class="' +
            getProgramItemClasses("schedule-item", slot) +
            '">' +
            '<div class="schedule-item-top">' +
            '<span class="schedule-time' +
            (slot.meta ? " is-meta" : "") +
            '">' +
            common.escapeHtml(slot.time) +
            "</span>" +
            buildProgramBadge(slot) +
            "</div>" +
            '<div class="schedule-name-row">' +
            common.faIcon(slot.icon, "program-icon") +
            '<strong class="schedule-name">' +
            common.escapeHtml(slot.title) +
            "</strong>" +
            "</div>" +
            '<span class="schedule-desc">' +
            common.escapeHtml(slot.desc) +
            "</span>" +
            "</article>"
          );
        })
        .join("") +
      "</div>" +
      "</article>";
  }

  function initialize() {
    refs.switcher.addEventListener("click", function (event) {
      var trigger = event.target.closest(".day-chip[data-day]");
      if (!trigger) return;
      state.selectedDayId = trigger.getAttribute("data-day") || state.selectedDayId;
      render();
    });

    render();
    common.initPageChrome(document);
  }

  initialize();
})();
