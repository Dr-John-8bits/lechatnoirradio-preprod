(function () {
  var common = window.LCNPageCommon;
  if (!common) return;

  var NEWS_ITEMS = Array.isArray(window.LCN_NEWS_ITEMS) ? window.LCN_NEWS_ITEMS.slice() : [];
  var INITIAL_VISIBLE_COUNT = 6;

  var refs = {
    switcher: document.getElementById("newsYearSwitcher"),
    summary: document.getElementById("newsYearSummary"),
    feed: document.getElementById("newsFeed"),
    more: document.getElementById("newsMoreButton"),
  };

  if (!refs.switcher || !refs.feed || !refs.more) {
    common.initPageChrome(document);
    return;
  }

  var state = {
    selectedYear: "",
    visibleCount: INITIAL_VISIBLE_COUNT,
  };

  function getSortedItems() {
    return NEWS_ITEMS.slice().sort(function (a, b) {
      var aKey = String(a && a.sortKey ? a.sortKey : "");
      var bKey = String(b && b.sortKey ? b.sortKey : "");
      return bKey.localeCompare(aKey);
    });
  }

  function getItemYear(item) {
    var sortKey = String(item && item.sortKey ? item.sortKey : "");
    if (/^\d{4}-/.test(sortKey)) return sortKey.slice(0, 4);
    var label = String(item && item.dateLabel ? item.dateLabel : "");
    var match = label.match(/\b(19|20)\d{2}\b/);
    return match ? match[0] : "Archives";
  }

  function getYears(items) {
    var seen = {};
    var years = [];
    items.forEach(function (item) {
      var year = getItemYear(item);
      if (seen[year]) return;
      seen[year] = true;
      years.push(year);
    });
    return years.sort(function (a, b) {
      return String(b).localeCompare(String(a));
    });
  }

  function getItemsForYear(year) {
    return getSortedItems().filter(function (item) {
      return getItemYear(item) === year;
    });
  }

  function renderSwitcher(years) {
    refs.switcher.innerHTML = years
      .map(function (year) {
        var active = year === state.selectedYear ? " is-active" : "";
        return (
          '<button class="day-chip' +
          active +
          '" type="button" data-news-year="' +
          common.escapeHtml(year) +
          '">' +
          common.escapeHtml(year) +
          "</button>"
        );
      })
      .join("");
  }

  function renderFeed() {
    var items = getItemsForYear(state.selectedYear);
    var visibleItems = items.slice(0, state.visibleCount);

    refs.feed.innerHTML = visibleItems.length
      ? visibleItems
          .map(function (item) {
            return (
              '<article class="news-card">' +
              '<p class="news-date">' +
              common.escapeHtml(item.dateLabel || item.date || "") +
              "</p>" +
              '<div class="news-copy">' +
              '<h2 class="news-title">' +
              common.escapeHtml(item.title || "") +
              "</h2>" +
              '<p class="news-lead">' +
              common.escapeHtml(item.lead || "") +
              "</p>" +
              '<p class="news-body">' +
              common.escapeHtml(item.body || "") +
              "</p>" +
              "</div>" +
              "</article>"
            );
          })
          .join("")
      : '<article class="news-card"><div class="news-copy"><h2 class="news-title">Aucune actualité pour le moment</h2><p class="news-body">Les nouvelles étapes de la station apparaîtront ici.</p></div></article>';

    if (refs.summary) {
      refs.summary.textContent =
        visibleItems.length +
        " actualité" +
        (visibleItems.length > 1 ? "s" : "") +
        " affichée" +
        (visibleItems.length > 1 ? "s" : "") +
        " sur " +
        items.length +
        " pour " +
        state.selectedYear +
        ".";
    }

    refs.more.hidden = items.length <= state.visibleCount;
  }

  function initialize() {
    var years = getYears(getSortedItems());
    state.selectedYear = years[0] || "";
    renderSwitcher(years);
    renderFeed();

    refs.switcher.addEventListener("click", function (event) {
      var trigger = event.target.closest(".day-chip[data-news-year]");
      if (!trigger) return;
      state.selectedYear = trigger.getAttribute("data-news-year") || state.selectedYear;
      state.visibleCount = INITIAL_VISIBLE_COUNT;
      renderSwitcher(years);
      renderFeed();
    });

    refs.more.addEventListener("click", function () {
      state.visibleCount += INITIAL_VISIBLE_COUNT;
      renderFeed();
    });

    common.initPageChrome(document);
  }

  initialize();
})();
