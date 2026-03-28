(function () {
  var STREAM_BASE_URL = "https://stream.lechatnoirradio.fr";
  var STREAM_URL = STREAM_BASE_URL + "/stream.mp3";
  var NOW_PLAYING_URL = STREAM_BASE_URL + "/nowplaying.json";
  var HISTORY_CSV_URL = STREAM_BASE_URL + "/history/nowplaying.csv";
  var SITE_URL = new URL("index.html", window.location.href).href;
  var APP_ICON_180_URL = new URL("apple-touch-icon.png", window.location.href).href;
  var APP_ICON_192_URL = new URL("icon-192.png", window.location.href).href;
  var APP_ICON_512_URL = new URL("icon-512.png", window.location.href).href;
  var VOLUME_STORAGE_KEY = "lcn-player-volume";
  var VOLUME_STORAGE_MIGRATION_KEY = "lcn-player-volume-migrated-v2";
  var DISPLAY_TIME_ZONE = "Europe/Paris";
  var HISTORY_CACHE_KEY = "lcn-history-preview-v1";
  var HISTORY_CACHE_AT_KEY = "lcn-history-preview-at";
  var HISTORY_CACHE_MAX_ROWS = 240;
  var HISTORY_CACHE_MAX_AGE_MS = 15 * 60 * 1000;
  var HOME_HISTORY_REFRESH_MS = 5 * 60 * 1000;
  var HOME_HISTORY_INITIAL_DELAY_MS = 1200;

  var ICONS = {
    play:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.4c0-.87.94-1.42 1.7-.98l9.1 5.27a1.12 1.12 0 0 1 0 1.94L9.7 16.84c-.76.44-1.7-.11-1.7-.98z"></path></svg>',
    pause:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5.8A1.8 1.8 0 0 1 8.8 4h.4A1.8 1.8 0 0 1 11 5.8v12.4A1.8 1.8 0 0 1 9.2 20h-.4A1.8 1.8 0 0 1 7 18.2zm6 0A1.8 1.8 0 0 1 14.8 4h.4A1.8 1.8 0 0 1 17 5.8v12.4a1.8 1.8 0 0 1-1.8 1.8h-.4a1.8 1.8 0 0 1-1.8-1.8z"></path></svg>',
    volume:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M4 14h3.4L12 18V6L7.4 10H4z"></path><path d="M16 9.5a3.6 3.6 0 0 1 0 5"></path><path d="M18.8 6.7a7.2 7.2 0 0 1 0 10.6"></path></svg>',
    share:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M15 8a3 3 0 1 0-2.83-4"></path><path d="M6 15a3 3 0 1 0 2.84 4"></path><path d="M18 21a3 3 0 1 0 0-6"></path><path d="m8.59 13.51 6.83-3.02"></path><path d="m8.59 10.49 6.83 3.02"></path></svg>',
    news:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H19v11.5a2.5 2.5 0 0 1-2.5 2.5H7.5A2.5 2.5 0 0 1 5 15.5z"></path><path d="M5 7h10"></path><path d="M8 11h8"></path><path d="M8 14.5h6"></path></svg>',
    schedule:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="3"></rect><path d="M8 3v4"></path><path d="M16 3v4"></path><path d="M4 10h16"></path><path d="M8 14h3"></path></svg>',
    voices:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M12 15a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4z"></path><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v3"></path><path d="M8.5 21h7"></path></svg>',
    about:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="4.5" r="1.3" fill="currentColor" stroke="none"></circle><path d="M12 6.5v13"></path><path d="m8.4 19.5 3.6-6.2 3.6 6.2"></path><path d="M7.1 9.3a6.9 6.9 0 0 1 9.8 0"></path><path d="M4.3 6.6a10.8 10.8 0 0 1 15.4 0"></path></svg>',
    contact:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5z"></path><path d="m7 8 5 4 5-4"></path></svg>',
    external:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M14 5h5v5"></path><path d="M10 14 19 5"></path><path d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"></path></svg>',
    copy:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><rect x="9" y="9" width="10" height="10" rx="2"></rect><path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"></path></svg>',
    close:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m6 6 12 12"></path><path d="m18 6-12 12"></path></svg>',
    arrow:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>',
  };

  var CONTENT =
    typeof window !== "undefined" && window.LCNContentData && typeof window.LCNContentData === "object"
      ? window.LCNContentData
      : {};
  var COMMON =
    typeof window !== "undefined" && window.LCNPageCommon && typeof window.LCNPageCommon === "object"
      ? window.LCNPageCommon
      : null;
  var SCHEDULE_TIMELINE_DAYS = Array.isArray(CONTENT.SCHEDULE_TIMELINE_DAYS)
    ? CONTENT.SCHEDULE_TIMELINE_DAYS
    : [];

  var state = {
    route: getCurrentPageId(),
    currentTrack: {
      artist: "",
      album: "",
      title: "Chargement des métadonnées…",
      year: "",
    },
    historyRows: [],
    sortedHistoryRows: [],
    volume: loadSavedVolume(),
    isPlaying: false,
    connectionState: "idle",
    dockVolumeOpen: false,
    heroVolumeOpen: false,
    historyFetchAt: 0,
    isLive: false,
  };

  var refs = {
    pageRoot: document.getElementById("pageRoot"),
    dockState: document.getElementById("dockState"),
    dockTicker: document.getElementById("dockTicker"),
    dockTickerText: document.getElementById("dockTickerText"),
    dockToggle: document.getElementById("dockToggle"),
    dockVolumeButton: document.getElementById("dockVolumeButton"),
    dockVolumePopover: document.getElementById("dockVolumePopover"),
    dockVolumeRange: document.getElementById("dockVolumeRange"),
    audio: document.getElementById("radioAudio"),
  };

  function icon(name) {
    return ICONS[name] || "";
  }

  function getCurrentPageId() {
    var pageId = asString(document.body && document.body.getAttribute("data-page"));
    var allowed = {
      home: true,
      actualites: true,
      grille: true,
      voix: true,
      apropos: true,
      historique: true,
    };
    return allowed[pageId] ? pageId : "home";
  }

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

  function buildProgramBadge(slot) {
    if (!slot || !slot.badge) return "";
    return (
      '<span class="program-badge">' +
      faIcon(slot.badgeIcon, "program-badge-icon") +
      "<span>" +
      escapeHtml(slot.badge) +
      "</span>" +
      "</span>"
    );
  }

  function buildCurrentBadge(isCurrent) {
    if (!isCurrent) return "";
    return (
      '<span class="current-pill" aria-label="En ce moment, peut-être">' +
      '<span class="current-pill-dot" aria-hidden="true"></span>' +
      "<span>En ce moment, peut-être</span>" +
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

  function parseYear(rawValue) {
    var raw = String(rawValue || "");
    var match = raw.match(/(19|20)\d{2}/);
    return match ? match[0] : "";
  }

  function findFirstString(source, keys) {
    if (!source || typeof source !== "object") return "";
    for (var i = 0; i < keys.length; i += 1) {
      var value = asString(source[keys[i]]);
      if (value) return value;
    }
    return "";
  }

  function parseAlbumYearFromTitle(displayTitle) {
    var text = asString(displayTitle);
    if (!text) return { album: "", year: "" };
    var groups = text.match(/\(([^()]*)\)/g);
    if (!groups || !groups.length) return { album: "", year: "" };
    var inside = groups[groups.length - 1].replace(/[()]/g, "").trim();
    if (!inside) return { album: "", year: "" };

    var year = parseYear(inside);
    var album = inside;
    if (year) {
      album = inside
        .replace(year, "")
        .replace(/[,;/-]\s*$/, "")
        .replace(/\s{2,}/g, " ")
        .trim();
    }
    return { album: album, year: year };
  }

  function splitArtistAndTitle(rawValue) {
    var raw = asString(rawValue);
    if (!raw) return { artist: "", title: "" };
    var match = raw.match(/^(.+?)\s+[—-]\s+(.+)$/);
    if (!match) return { artist: "", title: raw };
    return {
      artist: asString(match[1]),
      title: asString(match[2]),
    };
  }

  function buildNowPlayingLabel(meta) {
    var artist = asString(meta && meta.artist);
    var album = asString(meta && meta.album);
    var title = asString(meta && meta.title);
    var parts = [];
    if (artist) parts.push(artist);
    if (album) parts.push(album);
    if (title) parts.push(title);
    return parts.length ? parts.join(" — ") : "Titre indisponible pour l'instant";
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

  function parseCsvRows(csvText, limitFromEnd) {
    var normalized = String(csvText || "")
      .replace(/\r\n?/g, "\n")
      .trim();
    if (!normalized) return [];

    var lines = normalized.split("\n");
    var parsed = [];
    var startIndex = 1;
    if (Number.isFinite(limitFromEnd) && limitFromEnd > 0) {
      startIndex = Math.max(1, lines.length - limitFromEnd);
    }
    for (var i = startIndex; i < lines.length; i += 1) {
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
    return parsed;
  }

  function buildMetaFromCsvRows(rows) {
    if (!rows || !rows.length) return null;
    var sorted = getSortedHistoryRows(rows);
    var row = sorted[0];
    if (!row) return null;
    return {
      artist: asString(row.artist),
      title: asString(row.title),
      album: asString(row.album),
      year: parseYear(row.year),
    };
  }

  function extractNowPlayingMeta(payload) {
    var roots = [];
    if (payload && typeof payload === "object") roots.push(payload);
    if (payload && payload.now_playing && typeof payload.now_playing === "object") roots.push(payload.now_playing);
    if (payload && payload.now_playing && payload.now_playing.song && typeof payload.now_playing.song === "object") {
      roots.push(payload.now_playing.song);
    }
    if (payload && payload.song && typeof payload.song === "object") roots.push(payload.song);
    if (payload && payload.track && typeof payload.track === "object") roots.push(payload.track);

    var artist = "";
    var title = "";
    var album = "";
    var year = "";

    for (var i = 0; i < roots.length; i += 1) {
      var root = roots[i];
      if (!artist) {
        artist = findFirstString(root, [
          "artist",
          "artist_name",
          "creator",
          "author",
          "performer",
          "dj",
          "host",
        ]);
      }
      if (!title) {
        title = findFirstString(root, ["title", "name", "track", "song", "now_playing"]);
      }
      if (!album) {
        album = findFirstString(root, ["album", "release", "record"]);
      }
      if (!year) {
        year = parseYear(findFirstString(root, ["year", "date", "released", "release_year"]));
      }
    }

    if (!title) {
      title = asString(payload && payload.now_playing);
    }

    if (title) {
      var split = splitArtistAndTitle(title);
      if (!artist && split.artist) artist = split.artist;
      title = split.title || title;
    }

    if (title) {
      var parsed = parseAlbumYearFromTitle(title);
      if (!album && parsed.album) album = parsed.album;
      if (!year && parsed.year) year = parsed.year;
    }

    return {
      artist: artist,
      title: title,
      album: album,
      year: year,
    };
  }

  function getCurrentDayId() {
    try {
      var weekday = new Intl.DateTimeFormat("en-US", {
        timeZone: DISPLAY_TIME_ZONE,
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

  function getScheduleDayById(dayId) {
    return SCHEDULE_TIMELINE_DAYS.find(function (day) {
      return day.id === dayId;
    }) || SCHEDULE_TIMELINE_DAYS[0];
  }

  function getCurrentScheduleSlot(day) {
    if (COMMON && typeof COMMON.findCurrentScheduleSlot === "function") {
      return COMMON.findCurrentScheduleSlot(day);
    }
    return null;
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

  function formatLocalTime(isoDate) {
    var parts = getDisplayDateParts(isoDate);
    if (!parts) return "--:--";
    return parts.hour + ":" + parts.minute;
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

  function getSortedHistoryRows(rows) {
    return (rows || [])
      .filter(function (row) {
        return row && row.tsIso;
      })
      .slice()
      .sort(function (a, b) {
        return new Date(b.tsIso) - new Date(a.tsIso);
      });
  }

  function getTrackSignature(meta) {
    return [
      asString(meta && meta.artist).toLowerCase(),
      asString(meta && meta.title).toLowerCase(),
      asString(meta && meta.album).toLowerCase(),
      parseYear(meta && meta.year).toLowerCase(),
    ]
      .filter(Boolean)
      .join("||");
  }

  function loadSavedVolume() {
    try {
      var raw = window.localStorage.getItem(VOLUME_STORAGE_KEY);
      if (raw == null || raw === "") return 1;
      var hasMigrated = window.localStorage.getItem(VOLUME_STORAGE_MIGRATION_KEY) === "1";
      var value = Number(raw);
      if (!hasMigrated && Number.isFinite(value) && value === 0) {
        window.localStorage.setItem(VOLUME_STORAGE_MIGRATION_KEY, "1");
        return 1;
      }
      if (!hasMigrated) {
        window.localStorage.setItem(VOLUME_STORAGE_MIGRATION_KEY, "1");
      }
      if (Number.isFinite(value) && value >= 0 && value <= 1) return value;
    } catch (error) {
      return 1;
    }
    return 1;
  }

  function saveVolume(value) {
    try {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, String(value));
    } catch (error) {
      return;
    }
  }

  function handleAudioToggleInteraction() {
    togglePlayback();
  }

  function bindAudioToggleButton(button) {
    if (!button || button.dataset.audioToggleBound === "true") return;
    button.dataset.audioToggleBound = "true";
    button.addEventListener("click", handleAudioToggleInteraction);
  }

  function renderHomePage() {
    var today = getScheduleDayById(getCurrentDayId());
    return (
      '<section class="page hero">' +
      '<div class="surface-panel hero-main">' +
      '<div class="hero-stage">' +
      '<div class="orbital-player">' +
      '<div id="nativeAudioSlot" class="native-audio-slot"></div>' +
      '<span class="orbital-rim"></span>' +
      '<span class="orbital-rim-alt"></span>' +
      '<span class="orbital-rim-soft"></span>' +
      '<div class="orbital-core"></div>' +
      '<button class="hero-play" type="button" aria-label="Lancer ou mettre en pause le direct" data-audio-toggle data-button-kind="hero"></button>' +
      "</div>" +
      '<div class="hero-ticker-row">' +
      '<span id="heroLiveBadge" class="live-pill live-pill-hero" hidden>' +
      '<span class="live-pill-dot" aria-hidden="true"></span>' +
      "<span>ON AIR</span>" +
      "</span>" +
      '<div class="hero-ticker-wrap">' +
      '<div id="heroTicker" class="marquee hero-marquee" aria-live="polite">' +
      '<div class="marquee-track">' +
      '<span id="heroTickerText" class="marquee-content">Chargement des métadonnées…</span>' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="hero-volume-wrap">' +
      '<button id="heroVolumeButton" class="dock-volume-button hero-volume-button" type="button" aria-label="Afficher le réglage du volume" aria-expanded="false" aria-controls="heroVolumePopover">' +
      '<span class="icon-slot" data-icon="volume"></span>' +
      "</button>" +
      '<div id="heroVolumePopover" class="dock-volume-popover hero-volume-popover" hidden>' +
      '<input id="heroVolumeRange" class="dock-volume-range" type="range" min="0" max="100" step="1" value="' +
      Math.round(state.volume * 100) +
      '" aria-label="Régler le volume du direct" />' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="hero-tools">' +
      '<div class="mini-actions">' +
      '<button id="heroShareButton" class="mini-button is-primary" type="button">' +
      faIcon("fa-solid fa-share-nodes", "mini-fa-icon") +
      "<span>Partager</span>" +
      "</button>" +
      '<button id="heroCopyStreamButton" class="mini-button" type="button">' +
      icon("copy") +
      "<span>Copier l'URL</span>" +
      "</button>" +
      '<a class="mini-link" href="' +
      escapeHtml(STREAM_URL) +
      '" target="_blank" rel="noopener">' +
      icon("external") +
      "<span>Ouvrir le flux</span>" +
      "</a>" +
      "</div>" +
      '<p id="heroVolumeHint" class="hero-volume-hint" hidden>' +
      icon("volume") +
      "<span>Pas de son ? Augmente le volume.</span>" +
      "</p>" +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="quick-panels">' +
      '<section class="surface-panel">' +
      '<div class="section-heading">' +
      '<p class="section-kicker">Derniers passages</p>' +
      '<h2 class="section-title">Récemment diffusé</h2>' +
      '<p class="section-intro">Les derniers contenus passés à l\'antenne, musique, émission ou autre forme sonore comprise.</p>' +
      "</div>" +
      '<ul id="homeRecentList" class="recent-list"></ul>' +
      '<a class="panel-link" href="historique.html" target="_blank" rel="noopener">' +
      icon("arrow") +
      "<span>Afficher l'historique de diffusion</span>" +
      "</a>" +
      "</section>" +
      '<section class="surface-panel">' +
      '<div class="section-heading">' +
      '<p class="section-kicker">Aujourd\'hui</p>' +
      '<h2 class="section-title section-title-program">' +
      '<span class="section-title-icon">' +
      faIcon(today.icon, "section-fa-icon") +
      "</span>" +
      "<span>Programme du " +
      escapeHtml(today.name.toLowerCase()) +
      "</span>" +
      "</h2>" +
      '<p class="section-intro">' +
      escapeHtml(today.summary) +
      "</p>" +
      "</div>" +
      '<div id="homeTodayFocus" class="recent-list"></div>' +
      '<a class="panel-link" href="grille.html" target="_blank" rel="noopener">' +
      icon("arrow") +
      "<span>Voir la grille complète</span>" +
      "</a>" +
      "</section>" +
      "</div>" +
      "</section>"
    );
  }

  function renderPage() {
    if (!refs.pageRoot) return;
    document.body.classList.add("route-home");
    refs.pageRoot.innerHTML = renderHomePage();
    fillIconSlots(refs.pageRoot);
    bindPageEvents();
    updateUi();
    window.requestAnimationFrame(function () {
      refreshMarquee(refs.dockTicker);
      refreshMarquee(document.getElementById("heroTicker"));
    });
  }

  function saveHistoryCache(rows) {
    try {
      var previewRows = getSortedHistoryRows(rows).slice(0, HISTORY_CACHE_MAX_ROWS);
      window.localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(previewRows));
      window.localStorage.setItem(HISTORY_CACHE_AT_KEY, String(Date.now()));
    } catch (error) {
      return;
    }
  }

  function setHistoryRows(rows) {
    state.historyRows = Array.isArray(rows) ? rows : [];
    state.sortedHistoryRows = getSortedHistoryRows(state.historyRows);
  }

  function loadHistoryCache() {
    try {
      var rawRows = window.localStorage.getItem(HISTORY_CACHE_KEY);
      var rawAt = Number(window.localStorage.getItem(HISTORY_CACHE_AT_KEY));
      if (!rawRows || !Number.isFinite(rawAt)) return false;
      if (Date.now() - rawAt > HISTORY_CACHE_MAX_AGE_MS) return false;
      var parsedRows = JSON.parse(rawRows);
      if (!Array.isArray(parsedRows) || !parsedRows.length) return false;
      setHistoryRows(
        parsedRows.map(function (row) {
          return {
            tsIso: row && row.tsIso ? row.tsIso : "",
            artist: row && row.artist ? row.artist : "",
            title: row && row.title ? row.title : "",
            album: row && row.album ? row.album : "",
            year: row && row.year ? row.year : "",
          };
        })
      );
      state.historyFetchAt = rawAt;
      return true;
    } catch (error) {
      return false;
    }
  }

  function getHistoryRowsSorted() {
    if (state.sortedHistoryRows && state.sortedHistoryRows.length) {
      return state.sortedHistoryRows;
    }
    return getSortedHistoryRows(state.historyRows);
  }

  function syncRecentHistoryFromNowPlaying(track) {
    var signature = getTrackSignature(track);
    if (!signature) return;

    var nextRows = state.historyRows.slice();
    if (nextRows.length && getTrackSignature(nextRows[0]) === signature) {
      return;
    }

    nextRows.unshift({
      tsIso: new Date().toISOString(),
      artist: asString(track.artist),
      title: asString(track.title),
      album: asString(track.album),
      year: asString(track.year),
    });

    setHistoryRows(nextRows.slice(0, HISTORY_CACHE_MAX_ROWS));
    saveHistoryCache(state.historyRows);
    renderHomeRecentList();
  }

  function shouldRefreshHomeHistory() {
    return !state.historyFetchAt || Date.now() - state.historyFetchAt >= HOME_HISTORY_REFRESH_MS;
  }

  function fillIconSlots(scope) {
    var root = scope || document;
    root.querySelectorAll(".icon-slot[data-icon]").forEach(function (node) {
      var name = node.getAttribute("data-icon");
      node.innerHTML = icon(name);
    });
  }

  function renderPlayButtons() {
    var heroOrbital = document.querySelector(".orbital-player");
    if (heroOrbital) {
      heroOrbital.classList.toggle("is-playing", state.isPlaying);
    }
    document.querySelectorAll("[data-audio-toggle]").forEach(function (button) {
      var kind = button.getAttribute("data-button-kind");
      var isPlaying = state.isPlaying;
      var label = isPlaying ? "Mettre en pause le direct" : "Lancer le direct";
      button.setAttribute("aria-label", label);
      button.classList.toggle("is-playing", isPlaying);
      if (kind === "hero") {
        button.innerHTML =
          '<span class="icon-slot">' +
          (isPlaying ? icon("pause") : icon("play")) +
          "</span>";
        return;
      }
      button.innerHTML =
        '<span class="icon-slot">' +
        (isPlaying ? icon("pause") : icon("play")) +
        "</span>";
    });
  }

  function updateRouteLinks() {
    document.querySelectorAll("[data-page-link]").forEach(function (link) {
      var route = link.getAttribute("data-page-link");
      link.classList.toggle("is-active", route === state.route);
    });
  }

  function getConnectionText() {
    if (state.connectionState === "playing") return "En écoute";
    if (state.connectionState === "loading") return "Connexion...";
    if (state.connectionState === "reconnecting") return "Reconnexion...";
    if (state.connectionState === "blocked") return "Appuyez sur lecture";
    return "Appuyez sur lecture";
  }

  function updateStatusText() {
    var text = getConnectionText();
    if (refs.dockState) refs.dockState.textContent = text;
  }

  function updateVolumeHints() {
    var heroVolumeHint = document.getElementById("heroVolumeHint");
    if (!heroVolumeHint) return;
    heroVolumeHint.hidden = !(state.isPlaying && state.volume <= 0.001);
  }

  function syncVolumeInputs() {
    if (refs.audio) refs.audio.volume = state.volume;
    if (refs.dockVolumeRange) refs.dockVolumeRange.value = String(Math.round(state.volume * 100));
    var heroRange = document.getElementById("heroVolumeRange");
    if (heroRange) heroRange.value = String(Math.round(state.volume * 100));
  }

  function updateTrackText() {
    var label = buildNowPlayingLabel(state.currentTrack);
    var dockChanged = false;
    if (refs.dockTickerText && refs.dockTickerText.textContent !== label) {
      refs.dockTickerText.textContent = label;
      dockChanged = true;
    }
    var heroTickerText = document.getElementById("heroTickerText");
    var heroChanged = false;
    if (heroTickerText && heroTickerText.textContent !== label) {
      heroTickerText.textContent = label;
      heroChanged = true;
    }
    if (dockChanged) refreshMarquee(refs.dockTicker);
    if (heroChanged) refreshMarquee(document.getElementById("heroTicker"));
    updateLiveIndicators();
    updateMediaSession();
  }

  function isLiveTrack(meta) {
    var artist = asString(meta && meta.artist);
    var title = asString(meta && meta.title);
    return /\(DIRECT\)/i.test(artist) || /^DIRECT\s*-/i.test(title);
  }

  function updateLiveIndicators() {
    var live = Boolean(state.isLive);
    var dockLiveBadge = document.getElementById("dockLiveBadge");
    var heroLiveBadge = document.getElementById("heroLiveBadge");
    if (dockLiveBadge) dockLiveBadge.hidden = !live;
    if (heroLiveBadge) heroLiveBadge.hidden = !live;
  }

  function refreshMarquee(root) {
    if (!root) return;
    var track = root.querySelector(".marquee-track");
    var content = root.querySelector(".marquee-content");
    if (!track || !content) return;
    track.classList.remove("is-animated");
    track.style.removeProperty("--marquee-distance");
    track.style.removeProperty("--marquee-duration");
    var ghost = track.querySelector(".marquee-ghost");
    if (ghost) ghost.remove();

    window.requestAnimationFrame(function () {
      var contentWidth = content.scrollWidth;
      var containerWidth = root.clientWidth;
      if (!contentWidth || !containerWidth || contentWidth <= containerWidth - 12) return;
      var clone = content.cloneNode(true);
      clone.classList.remove("marquee-content");
      clone.classList.add("marquee-ghost");
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
      var distance = contentWidth + 32;
      var duration = Math.max(12, distance / 28);
      track.style.setProperty("--marquee-distance", distance + "px");
      track.style.setProperty("--marquee-duration", duration + "s");
      track.classList.add("is-animated");
    });
  }

  function renderHomeRecentList() {
    var root = document.getElementById("homeRecentList");
    if (!root) return;
    var rows = getHistoryRowsSorted().slice(0, 5);
    if (!rows.length) {
      root.innerHTML = '<li class="history-empty">Les derniers titres apparaîtront ici dès que le CSV est chargé.</li>';
      return;
    }
    root.innerHTML = rows
      .map(function (row) {
        var title = asString(row.title) || "(sans titre)";
        var meta = getTrackMeta(row);
        return (
          '<li class="recent-item">' +
          '<span class="recent-time">' +
          escapeHtml(formatLocalTime(row.tsIso)) +
          "</span>" +
          '<strong class="recent-title">' +
          escapeHtml(title) +
          "</strong>" +
          '<span class="recent-meta">' +
          escapeHtml(meta || "Métadonnées partielles") +
          "</span>" +
          "</li>"
        );
      })
      .join("");
  }

  function getHomeTodaySlots(day) {
    var slots = (day && Array.isArray(day.slots) ? day.slots : []).filter(Boolean);
    var currentSlot = getCurrentScheduleSlot(day);
    if (!slots.length) return [];

    var startIndex = 0;
    if (currentSlot) {
      var currentIndex = slots.indexOf(currentSlot);
      if (currentIndex >= 0) startIndex = currentIndex;
    }

    return slots.slice(startIndex, startIndex + 4);
  }

  function renderTodayFocus() {
    var root = document.getElementById("homeTodayFocus");
    if (!root) return;
    var day = getScheduleDayById(getCurrentDayId());
    var currentSlot = getCurrentScheduleSlot(day);
    var rows = getHomeTodaySlots(day);
    root.innerHTML = rows
      .map(function (slot) {
        var isCurrent = currentSlot === slot;
        return (
          '<article class="' +
          getProgramItemClasses("today-focus", slot) +
          (isCurrent ? " is-current-slot" : "") +
          '">' +
          '<div class="today-focus-top">' +
          '<span class="today-focus-time' +
          (slot.meta ? " is-meta" : "") +
          '">' +
          escapeHtml(slot.time) +
          "</span>" +
          '<div class="program-badges">' +
          buildCurrentBadge(isCurrent) +
          buildProgramBadge(slot) +
          "</div>" +
          "</div>" +
          '<div class="today-focus-title-row">' +
          faIcon(slot.icon, "program-icon") +
          '<strong class="today-focus-title">' +
          escapeHtml(slot.title) +
          "</strong>" +
          "</div>" +
          '<p class="today-focus-desc">' +
          escapeHtml(slot.desc) +
          "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function updateUi() {
    renderPlayButtons();
    fillIconSlots(document);
    updateRouteLinks();
    updateStatusText();
    updateVolumeHints();
    updateMediaSessionPlaybackState();
    syncVolumeInputs();
    updateTrackText();
    renderHomeRecentList();
    renderTodayFocus();
  }

  function setVolume(nextValue) {
    var normalized = Math.max(0, Math.min(1, nextValue));
    state.volume = normalized;
    saveVolume(normalized);
    syncVolumeInputs();
  }

  function setDockVolumePopover(nextValue, shouldFocus) {
    state.dockVolumeOpen = Boolean(nextValue);
    if (state.dockVolumeOpen) setHeroVolumePopover(false);
    if (refs.dockVolumeButton) {
      refs.dockVolumeButton.setAttribute("aria-expanded", state.dockVolumeOpen ? "true" : "false");
    }
    if (refs.dockVolumePopover) {
      refs.dockVolumePopover.hidden = !state.dockVolumeOpen;
    }
    if (state.dockVolumeOpen && shouldFocus && refs.dockVolumeRange) {
      window.setTimeout(function () {
        if (typeof refs.dockVolumeRange.focus === "function") refs.dockVolumeRange.focus();
      }, 30);
    }
  }

  function setHeroVolumePopover(nextValue, shouldFocus) {
    state.heroVolumeOpen = Boolean(nextValue);
    if (state.heroVolumeOpen) setDockVolumePopover(false);
    var heroButton = document.getElementById("heroVolumeButton");
    var heroPopover = document.getElementById("heroVolumePopover");
    var heroRange = document.getElementById("heroVolumeRange");

    if (heroButton) {
      heroButton.setAttribute("aria-expanded", state.heroVolumeOpen ? "true" : "false");
    }
    if (heroPopover) {
      heroPopover.hidden = !state.heroVolumeOpen;
    }
    if (state.heroVolumeOpen && shouldFocus && heroRange) {
      window.setTimeout(function () {
        if (typeof heroRange.focus === "function") heroRange.focus();
      }, 30);
    }
  }

  function markAudioProgress() {
    state.connectionState = "playing";
    updateUi();
  }

  function handlePlayFailure(error) {
    var blockedByPolicy =
      error &&
      (error.name === "NotAllowedError" || error.name === "SecurityError");
    state.connectionState = blockedByPolicy ? "blocked" : "idle";
    updateUi();
  }

  function requestPlayback() {
    state.connectionState = "loading";
    updateUi();

    try {
      refs.audio.load();
      var playPromise = refs.audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.catch(handlePlayFailure);
      }
    } catch (error) {
      handlePlayFailure(error);
    }
  }

  function pausePlayback() {
    state.connectionState = "idle";
    refs.audio.pause();
    updateUi();
  }

  function togglePlayback() {
    if (!refs.audio) return;
    if (refs.audio.paused || refs.audio.ended) {
      requestPlayback();
      return;
    }
    pausePlayback();
  }

  function applyCurrentTrack(meta) {
    if (!meta) return;
    var nextTrack = {
      artist: asString(meta.artist),
      album: asString(meta.album),
      title: asString(meta.title) || "Titre indisponible pour l'instant",
      year: asString(meta.year),
    };
    var previousSignature = getTrackSignature(state.currentTrack);
    var nextSignature = getTrackSignature(nextTrack);
    state.currentTrack = nextTrack;
    state.isLive = isLiveTrack(nextTrack);
    if (nextSignature && nextSignature !== previousSignature) {
      syncRecentHistoryFromNowPlaying(nextTrack);
    }
    updateTrackText();
  }

  async function refreshNowPlaying() {
    try {
      var response = await fetch(NOW_PLAYING_URL + "?t=" + Date.now(), {
        cache: "no-store",
      });
      var meta = null;
      if (response.ok) {
        meta = extractNowPlayingMeta(await response.json());
      }
      if ((!meta || (!meta.title && !meta.artist)) && state.historyRows.length) {
        meta = buildMetaFromCsvRows(state.historyRows);
      }
      if (!meta || (!meta.title && !meta.artist)) {
        var csvResponse = await fetch(HISTORY_CSV_URL + "?t=" + Date.now(), {
          cache: "no-store",
        });
        if (csvResponse.ok) {
          meta = buildMetaFromCsvRows(parseCsvRows(await csvResponse.text()));
        }
      }
      applyCurrentTrack(meta || state.currentTrack);
    } catch (error) {
      if (state.historyRows.length) {
        applyCurrentTrack(buildMetaFromCsvRows(state.historyRows) || state.currentTrack);
        return;
      }
      applyCurrentTrack({
        artist: "",
        album: "",
        title: "Titre en cours indisponible pour l'instant",
        year: "",
      });
    }
  }

  async function refreshHistory() {
    try {
      var response = await fetch(HISTORY_CSV_URL + "?t=" + Date.now(), { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      var csvText = await response.text();
      setHistoryRows(parseCsvRows(csvText, HISTORY_CACHE_MAX_ROWS));
      state.historyFetchAt = Date.now();
      saveHistoryCache(state.historyRows);
      renderHomeRecentList();
      if (!state.currentTrack.title || /chargement/i.test(state.currentTrack.title)) {
        applyCurrentTrack(buildMetaFromCsvRows(state.historyRows));
      }
    } catch (error) {
      return;
    }
  }

  function scheduleInitialHistoryRefresh() {
    if (!shouldRefreshHomeHistory()) return;
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(
        function () {
          if (!document.hidden) refreshHistory();
        },
        { timeout: HOME_HISTORY_INITIAL_DELAY_MS + 600 }
      );
      return;
    }
    window.setTimeout(function () {
      if (!document.hidden) refreshHistory();
    }, HOME_HISTORY_INITIAL_DELAY_MS);
  }

  function getSharePayload() {
    var title = asString(state.currentTrack.title);
    var artist = asString(state.currentTrack.artist);
    var album = asString(state.currentTrack.album);
    if (!album && title) {
      album = parseAlbumYearFromTitle(title).album;
    }

    var lines = [];
    if (artist) lines.push("Artiste : " + artist);
    if (album) lines.push("Album : " + album);
    if (title) lines.push("Titre : " + title);
    lines.push("Flux : " + STREAM_URL);

    return {
      share: {
        title: "Le Chat Noir — Titre en cours",
        text: lines.join("\n"),
        url: SITE_URL,
      },
      clipboard: "J'écoute Le Chat Noir.\n" + lines.join("\n") + "\nSite : " + SITE_URL,
    };
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "readonly");
    field.style.position = "absolute";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();
    var ok = document.execCommand("copy");
    document.body.removeChild(field);
    if (!ok) throw new Error("copy-failed");
  }

  function flashButtonFeedback(button, nextLabel) {
    if (!button) return;
    var labelNode = button.querySelector("span:last-child");
    if (!labelNode) return;
    var previous = labelNode.textContent;
    labelNode.textContent = nextLabel;
    window.setTimeout(function () {
      labelNode.textContent = previous;
    }, 1600);
  }

  async function shareCurrentTrack(button) {
    var payload = getSharePayload();
    try {
      if (navigator.share) {
        await navigator.share(payload.share);
        flashButtonFeedback(button, "Partagé");
      } else {
        await copyToClipboard(payload.clipboard);
        flashButtonFeedback(button, "Copié");
      }
    } catch (error) {
      if (error && error.name === "AbortError") return;
    }
  }

  async function copyStreamUrl(button) {
    await copyToClipboard(STREAM_URL);
    flashButtonFeedback(button, "Copié");
  }

  function updateMediaSession() {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: asString(state.currentTrack.title) || "Le Chat Noir",
        artist: asString(state.currentTrack.artist) || "Le Chat Noir",
        album: asString(state.currentTrack.album) || "Laboratoire radiophonique indépendant",
        artwork: [
          {
            src: APP_ICON_180_URL,
            sizes: "180x180",
            type: "image/png",
          },
          {
            src: APP_ICON_192_URL,
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: APP_ICON_512_URL,
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });
      navigator.mediaSession.setActionHandler("play", togglePlayback);
      navigator.mediaSession.setActionHandler("pause", pausePlayback);
    } catch (error) {
      return;
    }
  }

  function updateMediaSessionPlaybackState() {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state.isPlaying ? "playing" : "paused";
    } catch (error) {
      return;
    }
  }

  function bindPageEvents() {
    var nativeAudioSlot = document.getElementById("nativeAudioSlot");
    if (nativeAudioSlot && refs.audio && refs.audio.parentNode !== nativeAudioSlot) {
      nativeAudioSlot.appendChild(refs.audio);
    }

    refs.pageRoot.querySelectorAll("[data-audio-toggle]").forEach(function (button) {
      bindAudioToggleButton(button);
    });

    var heroShareButton = document.getElementById("heroShareButton");
    if (heroShareButton) {
      heroShareButton.addEventListener("click", function () {
        shareCurrentTrack(heroShareButton);
      });
    }

    var heroCopyStreamButton = document.getElementById("heroCopyStreamButton");
    if (heroCopyStreamButton) {
      heroCopyStreamButton.addEventListener("click", function () {
        copyStreamUrl(heroCopyStreamButton).catch(function () {
          return;
        });
      });
    }

    var heroVolumeRange = document.getElementById("heroVolumeRange");
    var heroVolumeButton = document.getElementById("heroVolumeButton");
    if (heroVolumeButton) {
      heroVolumeButton.addEventListener("click", function () {
        setHeroVolumePopover(!state.heroVolumeOpen, !state.heroVolumeOpen);
      });
    }
    if (heroVolumeRange) {
      heroVolumeRange.addEventListener("input", function () {
        setVolume(Number(heroVolumeRange.value) / 100);
      });
    }
  }

  function bindShellEvents() {
    fillIconSlots(document);
    renderPlayButtons();
    updateRouteLinks();

    bindAudioToggleButton(refs.dockToggle);
    if (refs.dockVolumeButton) {
      refs.dockVolumeButton.addEventListener("click", function () {
        setDockVolumePopover(!state.dockVolumeOpen, !state.dockVolumeOpen);
      });
    }
    if (refs.dockVolumeRange) {
      refs.dockVolumeRange.addEventListener("input", function () {
        setVolume(Number(refs.dockVolumeRange.value) / 100);
      });
    }

    window.addEventListener("resize", function () {
      refreshMarquee(refs.dockTicker);
      refreshMarquee(document.getElementById("heroTicker"));
    });

    document.addEventListener("click", function (event) {
      if (state.dockVolumeOpen) {
        if (!event.target.closest(".dock-volume-wrap")) {
          setDockVolumePopover(false);
        }
      }
      if (state.heroVolumeOpen) {
        if (!event.target.closest(".hero-volume-wrap")) {
          setHeroVolumePopover(false);
        }
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      if (state.dockVolumeOpen) setDockVolumePopover(false);
      if (state.heroVolumeOpen) setHeroVolumePopover(false);
    });

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && shouldRefreshHomeHistory()) {
        refreshHistory();
      }
    });
  }

  function bindAudioEvents() {
    if (!refs.audio) return;
    refs.audio.controls = true;
    refs.audio.preload = "none";
    refs.audio.volume = state.volume;

    refs.audio.addEventListener("play", function () {
      state.isPlaying = true;
      state.connectionState = "playing";
      updateUi();
    });

    refs.audio.addEventListener("pause", function () {
      state.isPlaying = false;
      state.connectionState = "idle";
      updateUi();
    });

    refs.audio.addEventListener("playing", markAudioProgress);
    refs.audio.addEventListener("canplay", markAudioProgress);

    refs.audio.addEventListener("waiting", function () {
      if (refs.audio.paused) return;
      state.connectionState = "loading";
      updateUi();
    });
    refs.audio.addEventListener("stalled", function () {
      if (refs.audio.paused) return;
      state.connectionState = "loading";
      updateUi();
    });
    refs.audio.addEventListener("ended", function () {
      state.connectionState = "idle";
      updateUi();
    });
    refs.audio.addEventListener("emptied", function () {
      state.connectionState = "idle";
      updateUi();
    });
    refs.audio.addEventListener("error", function () {
      handlePlayFailure();
    });
  }

  function initialize() {
    loadHistoryCache();
    bindShellEvents();
    renderPage();
    updateUi();
    bindAudioEvents();
    setVolume(state.volume);
    scheduleInitialHistoryRefresh();
    refreshNowPlaying();
    window.setInterval(refreshNowPlaying, 12000);
    window.setInterval(function () {
      if (!document.hidden && shouldRefreshHomeHistory()) {
        refreshHistory();
      }
    }, HOME_HISTORY_REFRESH_MS);
  }

  initialize();
})();
