import { escapeHtml } from "../ui-states.js";
import { SCHEDULE_TIMELINE_DAYS } from "../content-data.js";
import { getCurrentDayId, getCurrentLocalMinutes } from "../time.js";
import { getHomeTodayState } from "../schedule-match.js";

export function renderHome() {
  return `
    <section class="page-section" aria-labelledby="home-today-title">
      <div class="page-section__head">
        <h2 class="page-section__title" id="home-today-title">Aujourd'hui</h2>
        <span class="kicker">programmation indicative</span>
      </div>
      <ul class="slot-list" id="homeTodayList">
        <li><span class="slot-time mono">…</span><div><p class="slot-title">Chargement de la grille…</p></div></li>
      </ul>
      <p style="margin:14px 0 0;"><a class="ghost-link" href="#grille">voir la grille complète →</a></p>
    </section>

    <section class="page-section" aria-labelledby="home-recent-title">
      <div class="page-section__head">
        <h2 class="page-section__title" id="home-recent-title">Derniers passages</h2>
        <span class="status-line" id="homeRecentStatus">chargement…</span>
      </div>
      <ul class="track-list" id="homeRecentList">
        <li><span class="track-time">--:--</span><span class="track-main">Chargement des dernières diffusions…</span></li>
      </ul>
      <p style="margin:14px 0 0;"><a class="ghost-link" href="history.html" target="_blank" rel="noopener noreferrer">explorer tout l'historique ↗</a></p>
    </section>
  `;
}

export function renderTodaySlots(currentShow, resolver) {
  const day = SCHEDULE_TIMELINE_DAYS.find((d) => d.id === getCurrentDayId()) || SCHEDULE_TIMELINE_DAYS[0];
  const { rows, currentSlot } = getHomeTodayState(day, currentShow, resolver, getCurrentLocalMinutes());

  if (!rows.length) {
    return `<li><span class="slot-time mono">—</span><div><p class="slot-title">Grille indisponible</p></div></li>`;
  }

  return rows
    .map((slot) => {
      const isCurrent = slot === currentSlot;
      const badge = slot.badge ? `<span class="slot-badge">${escapeHtml(slot.badge)}</span>` : "";
      return `
        <li${isCurrent ? ' class="is-current"' : ""}>
          <span class="slot-time">${escapeHtml(slot.time || "")}</span>
          <div>
            <p class="slot-title">${escapeHtml(slot.title || "")}${badge}</p>
            <p class="slot-desc">${escapeHtml(slot.desc || "")}</p>
          </div>
        </li>
      `;
    })
    .join("");
}

export function renderRecentTracks(rows) {
  if (!rows || !rows.length) {
    return `<li><span class="track-time">--:--</span><span class="track-main">Rien à afficher pour le moment.</span></li>`;
  }

  return rows
    .slice(0, 8)
    .map((row) => {
      const main = [row.artist, row.title].filter(Boolean).join(" — ");
      const extra = [row.album, row.year].filter(Boolean).join(" · ");
      return `
        <li>
          <span class="track-time">${escapeHtml(row.localTime || "--:--")}</span>
          <span class="track-main">${escapeHtml(main || "Titre inconnu")}</span>
          ${extra ? `<span class="track-extra">${escapeHtml(extra)}</span>` : ""}
        </li>
      `;
    })
    .join("");
}
