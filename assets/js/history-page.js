(function () {
  var CSV_URL = "https://stream.lechatnoirradio.fr/history/nowplaying.csv";
  var DISPLAY_TIME_ZONE = "Europe/Paris";
  var AUTO_MS = 20000;
  var FETCH_CACHE_MS = 15000;
  var HISTORY_CACHE_KEY = "lcn-history-preview-v1";
  var HISTORY_CACHE_AT_KEY = "lcn-history-preview-at";
  var HISTORY_CACHE_MAX_ROWS = 240;
  var HISTORY_CACHE_MAX_AGE_MS = 3 * 60 * 1000;
  var DEFAULT_VISIBLE_ROWS = 30;
  var LOAD_MORE_STEP = 30;

  var refs = {
    dayInput: document.getElementById("historyDayInput"),
    timeInput: document.getElementById("historyTimeInput"),
    searchButton: document.getElementById("historySearchButton"),
    list: document.getElementById("historyList"),
    moreButton: document.getElementById("historyMoreButton"),
    modeLabel: document.getElementById("historyModeLabel"),
    statusText: document.getElementById("historyStatusText"),
    timezonePill: document.getElementById("historyTimezonePill"),
  };

  if (!refs.dayInput || !refs.timeInput || !refs.searchButton || !refs.list || !refs.moreButton) return;

  var displayPartsFormatter = null;
  try {
    displayPartsFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: DISPLAY_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    displayPartsFormatter = null;
  }

  var state = {
    rows: [],
    fetchCacheRows: null,
    fetchCacheAt: 0,
    autoTimer: null,
    visibleCount: DEFAULT_VISIBLE_ROWS,
    statusText: "Chargement des dernières diffusions…",
    timezoneLabel: "UTC+01:00 / UTC+02:00 · " + DISPLAY_TIME_ZONE,
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

  function parseYear(rawValue) {
    var raw = String(rawValue || "");
    var match = raw.match(/(19|20)\d{2}/);
    return match ? match[0] : "";
  }

  function parseCsvLine(line) {
    var values = [];
    var current = "";
    var inQuotes = false;
    for (var i = 0; i < line.length; i += 1) {
      var char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (char === "," && !inQuotes) {
        values.push(current);
        current = "";
        continue;
      }
      current += char;
    }
    values.push(current);
    return values;
  }

  function getDisplayDateParts(value) {
    var date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    if (displayPartsFormatter) {
      try {
        var parts = displayPartsFormatter.formatToParts(date);
        var map = {};
        parts.forEach(function (part) {
          if (part.type !== "literal") map[part.type] = part.value;
        });
        return {
          year: map.year,
          month: map.month,
          day: map.day,
          hour: map.hour,
          minute: map.minute,
        };
      } catch (error) {
        return null;
      }
    }

    return {
      year: String(date.getFullYear()),
      month: String(date.getMonth() + 1).padStart(2, "0"),
      day: String(date.getDate()).padStart(2, "0"),
      hour: String(date.getHours()).padStart(2, "0"),
      minute: String(date.getMinutes()).padStart(2, "0"),
    };
  }

  function enrichRow(baseRow) {
    var parts = getDisplayDateParts(baseRow.tsIso);
    if (!parts) return null;
    var tsMs = Date.parse(baseRow.tsIso);
    return {
      tsIso: baseRow.tsIso,
      tsMs: Number.isFinite(tsMs) ? tsMs : 0,
      artist: baseRow.artist,
      title: baseRow.title,
      album: baseRow.album,
      year: baseRow.year,
      localYmd: parts.year + "-" + parts.month + "-" + parts.day,
      localDate: parts.day + "/" + parts.month + "/" + parts.year,
      localTime: parts.hour + ":" + parts.minute,
      localMinutes: Number(parts.hour) * 60 + Number(parts.minute),
    };
  }

  function ensureEnrichedRow(row) {
    if (!row || !row.tsIso) return null;
    if (
      row.localYmd &&
      row.localDate &&
      row.localTime &&
      typeof row.localMinutes === "number"
    ) {
      if (typeof row.tsMs !== "number") {
        row.tsMs = Date.parse(row.tsIso) || 0;
      }
      return row;
    }
    return enrichRow(row);
  }

  function parseCsvRows(csvText) {
    var normalized = String(csvText || "")
      .replace(/\r\n?/g, "\n")
      .trim();
    if (!normalized) return [];

    var lines = normalized.split("\n");
    var parsed = [];
    for (var i = 1; i < lines.length; i += 1) {
      var line = lines[i];
      if (!line) continue;
      var cols = parseCsvLine(line);
      var enriched = enrichRow({
        tsIso: cols[0] || "",
        artist: cols[2] || "",
        title: cols[3] || "",
        album: cols[4] || "",
        year: cols[5] || "",
      });
      if (enriched) parsed.push(enriched);
    }
    return parsed;
  }

  function normalizeUtcOffset(rawLabel) {
    var match = String(rawLabel || "").match(/(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?/i);
    if (!match) return "";
    return (
      "UTC" +
      match[1] +
      String(match[2] || "0").padStart(2, "0") +
      ":" +
      String(match[3] || "00").padStart(2, "0")
    );
  }

  function getDisplayZoneLabel() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: DISPLAY_TIME_ZONE,
        timeZoneName: "shortOffset",
        hour: "2-digit",
        minute: "2-digit",
      }).formatToParts(new Date());
      var zonePart = parts.find(function (part) {
        return part.type === "timeZoneName";
      });
      var offset = normalizeUtcOffset(zonePart && zonePart.value);
      if (offset) return offset + " · " + DISPLAY_TIME_ZONE;
    } catch (error) {
      return "UTC+01:00 / UTC+02:00 · " + DISPLAY_TIME_ZONE;
    }
    return "UTC+01:00 / UTC+02:00 · " + DISPLAY_TIME_ZONE;
  }

  function formatLocalDate(isoDate) {
    var enriched = enrichRow({
      tsIso: isoDate,
      artist: "",
      title: "",
      album: "",
      year: "",
    });
    return enriched ? enriched.localDate : "--";
  }

  function formatLocalTime(isoDate) {
    var enriched = enrichRow({
      tsIso: isoDate,
      artist: "",
      title: "",
      album: "",
      year: "",
    });
    return enriched ? enriched.localTime : "--:--";
  }

  function isSameLocalDay(isoDate, ymd) {
    var enriched = enrichRow({
      tsIso: isoDate,
      artist: "",
      title: "",
      album: "",
      year: "",
    });
    return Boolean(enriched && enriched.localYmd === ymd);
  }

  function getDisplayMinutes(isoDate) {
    var enriched = enrichRow({
      tsIso: isoDate,
      artist: "",
      title: "",
      album: "",
      year: "",
    });
    return enriched ? enriched.localMinutes : null;
  }

  function getTrackMeta(row) {
    var parts = [];
    var artist = asString(row.artist);
    var album = asString(row.album);
    var year = parseYear(row.year);
    if (artist) parts.push(artist);
    if (album) parts.push(album);
    if (year) parts.push(year);
    return parts.join(" · ");
  }

  function getTodayYmd() {
    var parts = getDisplayDateParts(new Date());
    if (!parts) return "";
    return parts.year + "-" + parts.month + "-" + parts.day;
  }

  function loadPreviewRows() {
    try {
      var cachedAt = Number(window.localStorage.getItem(HISTORY_CACHE_AT_KEY) || 0);
      if (!cachedAt || Date.now() - cachedAt > HISTORY_CACHE_MAX_AGE_MS) return null;
      var raw = window.localStorage.getItem(HISTORY_CACHE_KEY);
      if (!raw) return null;
      var rows = JSON.parse(raw);
      if (!Array.isArray(rows) || !rows.length) return null;
      return rows
        .map(function (row) {
          return ensureEnrichedRow(row);
        })
        .filter(Boolean);
    } catch (error) {
      return null;
    }
  }

  function savePreviewRows(rows) {
    try {
      var previewRows = (rows || [])
        .slice(0, HISTORY_CACHE_MAX_ROWS)
        .map(function (row) {
          return ensureEnrichedRow(row);
        })
        .filter(Boolean);
      window.localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(previewRows));
      window.localStorage.setItem(HISTORY_CACHE_AT_KEY, String(Date.now()));
    } catch (error) {
      return;
    }
  }

  function renderRows(rows, emptyText) {
    if (!rows || !rows.length) {
      refs.list.innerHTML = '<li class="history-empty">' + escapeHtml(emptyText) + "</li>";
      refs.moreButton.hidden = true;
      return;
    }

    refs.list.innerHTML = rows
      .map(function (row) {
        var title = asString(row.title) || "(sans titre)";
        var meta = getTrackMeta(row);
        return (
          '<li class="history-item">' +
          '<div class="history-item-head">' +
          '<span class="history-date history-stamp">' +
          escapeHtml(row.localDate || formatLocalDate(row.tsIso)) +
          "</span>" +
          '<span class="history-time history-stamp">' +
          escapeHtml(row.localTime || formatLocalTime(row.tsIso)) +
          "</span>" +
          "</div>" +
          '<div class="history-item-copy">' +
          '<strong class="history-title">' +
          escapeHtml(title) +
          "</strong>" +
          '<span class="history-meta">' +
          escapeHtml(meta || "Métadonnées partielles") +
          "</span>" +
          "</div>" +
          "</li>"
        );
      })
      .join("");
  }

  function getLatestRowsForDay(ymd, limit) {
    var rows = [];
    for (var i = state.rows.length - 1; i >= 0 && rows.length < limit; i -= 1) {
      var row = state.rows[i];
      if (row && row.localYmd === ymd) rows.push(row);
    }
    return rows;
  }

  function getDisplayRows() {
    var selectedDay = refs.dayInput.value || getTodayYmd();
    var selectedTime = refs.timeInput.value || "";

    if (!selectedTime) {
      var latestRows = getLatestRowsForDay(selectedDay, state.visibleCount);
      return {
        label: selectedDay === getTodayYmd() ? "Derniers passages du jour" : "Recherche ponctuelle : " + selectedDay,
        rows: latestRows,
        totalCount: state.rows.filter(function (row) {
          return row && row.localYmd === selectedDay;
        }).length,
      };
    }

    var filtered = state.rows.filter(function (row) {
      return row.localYmd === selectedDay;
    });

    if (selectedTime) {
      var tokens = selectedTime.split(":");
      var hour = Number(tokens[0] || 0);
      var minute = Number(tokens[1] || 0);
      var referenceMinutes = hour * 60 + minute;
      filtered.sort(function (a, b) {
        return (
          Math.abs((a.localMinutes == null ? 0 : a.localMinutes) - referenceMinutes) -
            Math.abs((b.localMinutes == null ? 0 : b.localMinutes) - referenceMinutes) ||
          b.tsMs - a.tsMs
        );
      });
      return {
        label: "Recherche ponctuelle : titres les plus proches de " + selectedTime,
        rows: filtered.slice(0, state.visibleCount),
        totalCount: filtered.length,
      };
    }
  }

  function renderView(emptyText) {
    var display = getDisplayRows();
    if (refs.modeLabel) refs.modeLabel.textContent = display.label;
    if (refs.statusText) refs.statusText.textContent = state.statusText;
    if (refs.timezonePill) refs.timezonePill.textContent = state.timezoneLabel;
    renderRows(display.rows, emptyText || "Aucun titre trouvé pour cette sélection.");
    refs.moreButton.hidden = !display.totalCount || display.rows.length >= display.totalCount;
  }

  async function fetchRows() {
    var now = Date.now();
    if (state.fetchCacheRows && now - state.fetchCacheAt < FETCH_CACHE_MS) {
      return state.fetchCacheRows;
    }
    var response = await fetch(CSV_URL + "?t=" + now, { cache: "no-store" });
    if (!response.ok) throw new Error(String(response.status));
    var rows = parseCsvRows(await response.text());
    state.fetchCacheRows = rows;
    state.fetchCacheAt = now;
    savePreviewRows(rows);
    return rows;
  }

  async function refreshHistory() {
    try {
      var rows = await fetchRows();
      state.rows = rows;
      state.statusText = "Historique de diffusion actualisé";
      renderView();
    } catch (error) {
      state.statusText = "Impossible de charger l'historique pour le moment";
      renderView("Impossible de charger les dernières diffusions.");
    }
  }

  function stopAutoTimer() {
    if (!state.autoTimer) return;
    window.clearInterval(state.autoTimer);
    state.autoTimer = null;
  }

  function startAutoTimer() {
    stopAutoTimer();
    state.autoTimer = window.setInterval(function () {
      if (!document.hidden) refreshHistory();
    }, AUTO_MS);
  }

  function scheduleInitialRefresh() {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(function () {
        refreshHistory();
      }, { timeout: 240 });
      return;
    }

    window.requestAnimationFrame(function () {
      window.setTimeout(function () {
        refreshHistory();
      }, 120);
    });
  }

  function handleSearch() {
    state.visibleCount = DEFAULT_VISIBLE_ROWS;
    if (!state.rows.length) {
      state.statusText = "Chargement des dernières diffusions…";
      renderView("Chargement des dernières diffusions…");
      refreshHistory();
      return;
    }
    renderView();
  }

  function initialize() {
    refs.dayInput.value = getTodayYmd();
    refs.timeInput.value = "";
    state.timezoneLabel = getDisplayZoneLabel();
    if (refs.timezonePill) refs.timezonePill.textContent = state.timezoneLabel;

    var previewRows = loadPreviewRows();
    if (previewRows && previewRows.length) {
      state.rows = previewRows;
      state.statusText = "Affichage rapide depuis le cache local…";
      renderView();
    } else {
      renderRows([], "Chargement des dernières diffusions…");
    }

    refs.searchButton.addEventListener("click", handleSearch);
    refs.moreButton.addEventListener("click", function () {
      state.visibleCount += LOAD_MORE_STEP;
      renderView();
    });

    refs.dayInput.addEventListener("change", function () {
      handleSearch();
    });

    refs.timeInput.addEventListener("change", function () {
      handleSearch();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopAutoTimer();
        return;
      }
      refreshHistory();
      startAutoTimer();
    });

    scheduleInitialRefresh();
    startAutoTimer();
  }

  initialize();
})();
