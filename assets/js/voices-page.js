(function () {
  var common = window.LCNPageCommon;
  var content = window.LCNContentData;
  if (!common || !content) return;

  var refs = {
    producers: document.getElementById("producersGrid"),
    shows: document.getElementById("showsGrid"),
  };

  var producers = Array.isArray(content.PRODUCERS) ? content.PRODUCERS : [];
  var shows = Array.isArray(content.SHOWS) ? content.SHOWS : [];

  function renderProducers() {
    if (!refs.producers) return;
    refs.producers.innerHTML = producers
      .map(function (producer) {
        return (
          '<article class="producer-card">' +
          '<div class="producer-photo-wrap">' +
          '<img class="producer-photo" src="' +
          common.escapeHtml(producer.image) +
          '" alt="' +
          common.escapeHtml("Portrait de " + producer.name) +
          '" loading="lazy" />' +
          "</div>" +
          "<div>" +
          '<p class="producer-role">' +
          common.escapeHtml(producer.role) +
          "</p>" +
          '<h3 class="producer-name">' +
          common.escapeHtml(producer.name) +
          "</h3>" +
          '<p class="producer-bio">' +
          common.escapeHtml(producer.bio) +
          "</p>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderShows() {
    if (!refs.shows) return;
    refs.shows.innerHTML = shows
      .map(function (show) {
        return (
          '<article class="show-card">' +
          '<img class="show-cover" src="' +
          common.escapeHtml(show.image) +
          '" alt="' +
          common.escapeHtml("Visuel " + show.title) +
          '" loading="lazy" />' +
          '<div class="show-body">' +
          '<p class="show-meta">' +
          common.escapeHtml(show.meta) +
          "</p>" +
          '<h3 class="show-title">' +
          common.escapeHtml(show.title) +
          "</h3>" +
          '<p class="card-text">' +
          common.escapeHtml(show.text) +
          "</p>" +
          '<a class="ghost-button show-action" href="' +
          common.escapeHtml(show.href) +
          '" target="_blank" rel="noopener">' +
          common.icon("external") +
          common.renderShowActionLabel(show) +
          "</a>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  function initialize() {
    renderProducers();
    renderShows();
    common.initPageChrome(document);
  }

  initialize();
})();
