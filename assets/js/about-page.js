(function () {
  var common = window.LCNPageCommon;
  var content = window.LCNContentData;
  if (!common || !content) return;

  var chips = Array.isArray(content.ABOUT_CHIPS) ? content.ABOUT_CHIPS : [];
  var modes = Array.isArray(content.CONTRIBUTION_MODES)
    ? content.CONTRIBUTION_MODES
    : [];

  var refs = {
    chips: document.getElementById("aboutChipRow"),
    switcher: document.getElementById("contribSwitcher"),
    panel: document.getElementById("contribPanel"),
  };

  if (!refs.switcher || !refs.panel) {
    common.initPageChrome(document);
    return;
  }

  var state = {
    modeId: modes[0] ? modes[0].id : "",
  };

  function getContributionMode(modeId) {
    return (
      modes.find(function (mode) {
        return mode.id === modeId;
      }) || modes[0]
    );
  }

  function renderChips() {
    if (!refs.chips) return;
    refs.chips.innerHTML = chips
      .map(function (chip) {
        return '<span class="about-chip">' + common.escapeHtml(chip) + "</span>";
      })
      .join("");
  }

  function renderContributionView() {
    var activeMode = getContributionMode(state.modeId);
    if (!activeMode) return;

    refs.switcher.innerHTML = modes
      .map(function (mode) {
        var isActive = mode.id === activeMode.id;
        return (
          '<button class="contrib-step' +
          (isActive ? " is-active" : "") +
          '" type="button" role="tab" aria-selected="' +
          (isActive ? "true" : "false") +
          '" data-contrib-mode="' +
          common.escapeHtml(mode.id) +
          '">' +
          common.escapeHtml(mode.label) +
          "</button>"
        );
      })
      .join("");

    refs.panel.innerHTML =
      '<p class="contrib-kicker">' +
      common.escapeHtml(activeMode.kicker) +
      "</p>" +
      '<h3 class="contrib-title">' +
      common.escapeHtml(activeMode.title) +
      "</h3>" +
      '<p class="contrib-text">' +
      common.escapeHtml(activeMode.text) +
      "</p>" +
      '<ul class="contact-list contrib-list">' +
      activeMode.points
        .map(function (point) {
          return "<li>" + common.escapeHtml(point) + "</li>";
        })
        .join("") +
      "</ul>" +
      '<a class="contrib-action" href="' +
      common.escapeHtml(common.buildMailtoHref(activeMode)) +
      '">' +
      common.icon("contact") +
      "<span>" +
      common.escapeHtml(activeMode.cta) +
      "</span></a>";
  }

  function initialize() {
    renderChips();
    renderContributionView();

    refs.switcher.addEventListener("click", function (event) {
      var trigger = event.target.closest(".contrib-step[data-contrib-mode]");
      if (!trigger) return;
      state.modeId = trigger.getAttribute("data-contrib-mode") || state.modeId;
      renderContributionView();
    });

    common.initPageChrome(document);
  }

  initialize();
})();
