(function () {
  var common = window.LCNPageCommon;
  var content = window.LCNContentData;
  if (!common || !content) return;

  var chips = Array.isArray(content.ABOUT_CHIPS) ? content.ABOUT_CHIPS : [];

  var refs = {
    chips: document.getElementById("aboutChipRow"),
    panel: document.getElementById("contribPanel"),
  };

  if (!refs.panel) {
    common.initPageChrome(document);
    return;
  }

  function renderChips() {
    if (!refs.chips) return;
    refs.chips.innerHTML = chips
      .map(function (chip) {
        return '<span class="about-chip">' + common.escapeHtml(chip) + "</span>";
      })
      .join("");
  }

  function renderContactView() {
    refs.panel.innerHTML =
      '<div class="contact-cta-wrap">' +
      '<a class="contrib-action contact-cta" href="' +
      common.escapeHtml(
        common.buildMailtoHref({
          subject: "Le Chat Noir - Contact",
          body: "Bonjour,\n\n",
        })
      ) +
      '">' +
      '<span class="contact-cta-halo" aria-hidden="true"></span>' +
      '<span class="contact-cta-content">' +
      common.icon("contact") +
      "<span>Nous écrire</span>" +
      "</span>" +
      "</a>" +
      "</div>";
  }

  function initialize() {
    renderChips();
    renderContactView();
    common.initPageChrome(document);
  }

  initialize();
})();
