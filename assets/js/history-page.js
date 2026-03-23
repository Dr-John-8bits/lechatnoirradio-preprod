(function () {
  var CSV_URL = "https://stream.lechatnoirradio.fr/history/nowplaying.csv";
  var DISPLAY_TIME_ZONE = "Europe/Paris";
  var AUTO_MS = 20000;
  var FETCH_CACHE_MS = 15000;
  var HISTORY_CACHE_KEY = "lcn-history-preview-v1";
  var HISTORY_CACHE_AT_KEY = "lcn-history-preview-at";
  var HISTORY_CACHE_MAX_ROWS = 240;
  var HISTORY_CACHE_MAX_AGE_MS = 3 * 60 * 1000;
  var DEFAULT_VISIBLE_ROWS = 10;

  var refs = {
    dayInput: document.getElementById("historyDayInput"),
    timeInput: document.getElementById("historyTimeInput"),
    searchButton: document.getElementById("historySearchButton"),
    list: document.getElementById("historyList"),
    modeLabel: document.getElementById("historyModeLabel"),
    statusText: document.getElementById("historyStatusText"),
    timezonePill: document.getElementById("historyTimezonePill"),
  };

  if (!refs.dayInput || !refs.timeInput || !refs.searchButton || !refs.list) return;

  var state = {
    rows: [],
    fetchCacheRows: null,
    fetchCacheAt: 0,
    autoTimer: null,
    statusText: "Chargement des dernières diffusions…",
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
      parsed.push({
        tsIso: cols[0] || "",
        artist: cols[2] || "",
        title: cols[3] || "",
        album: cols[4] || "",
        year: cols[5] || "",
      });
    }
    return parsed.sort(function (a, b) {
      return new Date(b.tsIso) - new Date(a.tsIso);
    });
  }

  function getDisplayDateParts(value) {
    var date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    try {
      var parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: DISPLAY_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(date);
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
      return {
        year: String(date.getFullYear()),
        month: String(date.getMonth() + 1).padStart(2, "0"),
        day: String(date.getDate()).padStart(2, "0"),
        hour: String(date.getHours()).padStart(2, "0"),
        minute: String(date.getMinutes()).padStart(2, "0"),
      };
    }
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
    var parts = getDisplayDateParts(isoDate);
    if (!parts) return "--";
    return parts.day + "/" + parts.month + "/" + parts.year;
  }

  function formatLocalTime(isoDate) {
    var parts = getDisplayDateParts(isoDate);
    if (!parts) return "--:--";
    return parts.hour + ":" + parts.minute;
  }

  function isSameLocalDay(isoDate, ymd) {
    var parts = getDisplayDateParts(isoDate);
    if (!parts) return false;
    return parts.year + "-" + parts.month + "-" + parts.day === ymd;
  }

  function getDisplayMinutes(isoDate) {
    var parts = getDisplayDateParts(isoDate);
    if (!parts) return null;
    return Number(parts.hour) * 60 + Number(parts.minute);
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
      return rows;
    } catch (error) {
      return null;
    }
  }

  function savePreviewRows(rows) {
    try {
      var previewRows = (rows || []).slice(0, HISTORY_CACHE_MAX_ROWS);
      window.localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(previewRows));
      window.localStorage.setItem(HISTORY_CACHE_AT_KEY, String(Date.now()));
    } catch (error) {
      return;
    }
  }

  function renderRows(rows, emptyText) {
    if (!rows || !rows.length) {
      refs.list.innerHTML = '<li class="history-empty">' + escapeHtml(emptyText) + "</li>";
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
          escapeHtml(formatLocalDate(row.tsIso)) +
          "</span>" +
          '<span class="history-time history-stamp">' +
          escapeHtml(formatLocalTime(row.tsIso)) +
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

  function getDisplayRows() {
    var rows = state.rows;
    var selectedDay = refs.dayInput.value || getTodayYmd();
    var selectedTime = refs.timeInput.value || "";

    if (!selectedTime && selectedDay === getTodayYmd()) {
      return {
        label: "Derniers passages du jour",
        rows: rows
          .filter(function (row) {
            return row.tsIso && isSameLocalDay(row.tsIso, selectedDay);
          })
          .slice(0, DEFAULT_VISIBLE_ROWS),
      };
    }

    var filtered = rows.filter(function (row) {
      return row.tsIso && isSameLocalDay(row.tsIso, selectedDay);
    });

    if (selectedTime) {
      var tokens = selectedTime.split(":");
      var hour = Number(tokens[0] || 0);
      var minute = Number(tokens[1] || 0);
      var referenceMinutes = hour * 60 + minute;
      filtered.sort(function (a, b) {
        var aMinutes = getDisplayMinutes(a.tsIso);
        var bMinutes = getDisplayMinutes(b.tsIso);
        return Math.abs((aMinutes == null ? 0 : aMinutes) - referenceMinutes) - Math.abs((bMinutes == null ? 0 : bMinutes) - referenceMinutes);
      });
      return {
        label: "Recherche ponctuelle : titres les plus proches de " + selectedTime,
        rows: filtered.slice(0, DEFAULT_VISIBLE_ROWS),
      };
    }

    return {
      label: "Recherche ponctuelle : " + selectedDay,
      rows: filtered.slice(0, DEFAULT_VISIBLE_ROWS),
    };
  }

  function renderView(emptyText) {
    var display = getDisplayRows();
    if (refs.modeLabel) refs.modeLabel.textContent = display.label;
    if (refs.statusText) refs.statusText.textContent = state.statusText;
    if (refs.timezonePill) refs.timezonePill.textContent = getDisplayZoneLabel();
    renderRows(display.rows, emptyText || "Aucun titre trouvé pour cette sélection.");
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

  function handleSearch() {
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
    if (refs.timezonePill) refs.timezonePill.textContent = getDisplayZoneLabel();

    var previewRows = loadPreviewRows();
    if (previewRows && previewRows.length) {
      state.rows = previewRows;
      state.statusText = "Affichage rapide depuis le cache local…";
      renderView();
    } else {
      renderRows([], "Chargement des dernières diffusions…");
    }

    refs.searchButton.addEventListener("click", handleSearch);

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

    window.requestAnimationFrame(function () {
      window.setTimeout(function () {
        refreshHistory();
      }, 60);
    });

    startAutoTimer();
  }

  initialize();
})();
