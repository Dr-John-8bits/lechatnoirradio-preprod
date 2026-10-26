import { escapeHtml } from "./ui-states.js";
import { getTodayYmd } from "./time.js";

const refs = {
  form: document.getElementById("newsStudioForm"),
  title: document.getElementById("newsTitleInput"),
  date: document.getElementById("newsDateInput"),
  order: document.getElementById("newsOrderInput"),
  lead: document.getElementById("newsLeadInput"),
  body: document.getElementById("newsBodyInput"),
  slug: document.getElementById("newsSlugPreview"),
  file: document.getElementById("newsFilePreview"),
  output: document.getElementById("newsMarkdownOutput"),
  copy: document.getElementById("copyMarkdownButton"),
  download: document.getElementById("downloadMarkdownButton"),
  recent: document.getElementById("newsStudioRecent"),
  lead_: document.getElementById("studioLead"),
  localActions: document.getElementById("studioLocalActions"),
  save: document.getElementById("saveNewsButton"),
  stop: document.getElementById("stopStudioButton"),
  localStatus: document.getElementById("studioLocalStatus"),
};

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function buildMarkdown() {
  const title = refs.title.value.trim();
  const publishedOn = refs.date.value.trim() || getTodayYmd();
  const order = refs.order.value.trim() || "1";
  const lead = refs.lead.value.trim();
  const body = refs.body.value.trim();
  const slug = slugify(title || "nouvelle-actualite");
  const fileName = `${publishedOn}-${slug}.md`;

  const markdown = [
    "---",
    `title: "${(title || "Titre de l’actualité").replace(/"/g, '\\"')}"`,
    `publishedOn: "${publishedOn}"`,
    `order: "${order}"`,
    "---",
    "",
    lead || "Rédige ici le chapeau de l’actualité.",
    "",
    body || "Ajoute ici le corps du billet. Tu peux utiliser du Markdown simple, y compris [des liens](https://example.com).",
    "",
  ].join("\n");

  return { slug, fileName, markdown };
}

function updatePreview() {
  const { slug, fileName, markdown } = buildMarkdown();
  refs.slug.textContent = slug || "—";
  refs.file.textContent = fileName || "—";
  refs.output.value = markdown;
}

function flashLabel(button, label, fallback) {
  button.textContent = label;
  window.setTimeout(() => {
    button.textContent = fallback;
  }, 1400);
}

refs.copy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(refs.output.value);
    flashLabel(refs.copy, "Markdown copié", "Copier le Markdown");
  } catch {
    flashLabel(refs.copy, "Copie impossible", "Copier le Markdown");
  }
});

refs.download.addEventListener("click", () => {
  const { fileName, markdown } = buildMarkdown();
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
});

async function loadRecentItems() {
  try {
    const response = await fetch("assets/data/news.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const items = (payload.items || []).slice(0, 6);
    refs.recent.innerHTML = items.length
      ? items
          .map(
            (item) => `
              <div class="news-item">
                <span class="kicker">${escapeHtml(item.dateLabel || item.publishedOn || "")}</span>
                <h3 class="news-item__title" style="font-size:15px;">${escapeHtml(item.title || "")}</h3>
                <p class="news-item__body">${escapeHtml(item.lead || "")}</p>
              </div>
            `
          )
          .join("")
      : '<p class="status-line">aucune actualité générée pour le moment</p>';
  } catch {
    refs.recent.innerHTML = '<p class="status-line is-error">aperçu indisponible (servir la page en HTTP)</p>';
  }
}

// --- Mode studio local ------------------------------------------------------
// Quand la page est servie par tools/dev-server.mjs, une petite API locale
// permet d'enregistrer le billet dans content/news, de régénérer les
// actualités et d'arrêter le serveur. Ailleurs (site publié, file://), ces
// boutons restent masqués.

const SAVE_LABEL = "Enregistrer et générer";
let pendingOverwrite = null;

function setLocalStatus(message, isError = false) {
  refs.localStatus.textContent = message;
  refs.localStatus.classList.toggle("is-error", isError);
}

function resetSaveButton() {
  pendingOverwrite = null;
  refs.save.textContent = SAVE_LABEL;
}

async function postStudio(route, payload) {
  const response = await fetch(`api/studio/${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

async function saveNews() {
  const { fileName, markdown } = buildMarkdown();
  const title = refs.title.value.trim();
  const lead = refs.lead.value.trim();
  if (!title || !lead) {
    setLocalStatus("Il faut au moins un titre et un chapeau avant d’enregistrer.", true);
    return;
  }

  const overwrite = pendingOverwrite === fileName;
  refs.save.disabled = true;
  setLocalStatus("Enregistrement et génération en cours…");

  try {
    const { status, data } = await postStudio("news", { fileName, markdown, overwrite });

    if (status === 409) {
      pendingOverwrite = fileName;
      refs.save.textContent = "Remplacer le fichier existant";
      setLocalStatus(`${data.file} existe déjà. Cliquez à nouveau pour le remplacer.`, true);
      return;
    }

    resetSaveButton();
    if (status === 200) {
      const verb = data.replaced ? "remplacé" : "enregistré";
      setLocalStatus(`${data.file} ${verb}. ${data.output} Il reste à committer et pousser.`);
      loadRecentItems();
      return;
    }
    if (data.build === "failed") {
      setLocalStatus(`${data.file} enregistré, mais la génération a échoué : ${data.output}`, true);
      return;
    }
    setLocalStatus(data.error || `Erreur ${status}.`, true);
  } catch {
    resetSaveButton();
    setLocalStatus("Le serveur local ne répond plus.", true);
  } finally {
    refs.save.disabled = false;
  }
}

async function stopStudio() {
  refs.stop.disabled = true;
  refs.save.disabled = true;
  try {
    await postStudio("shutdown");
  } catch {
    // Le serveur a pu s'arrêter avant de répondre : c'est le résultat voulu.
  }
  setLocalStatus("Studio arrêté. Vous pouvez fermer cet onglet.");
  refs.lead_.textContent = "Le studio est arrêté. Relancez-le pour rédiger un nouveau billet.";
}

async function detectLocalStudio() {
  try {
    const response = await fetch("api/studio/status", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    if (!data.studio) return;
  } catch {
    return;
  }

  refs.localActions.hidden = false;
  refs.lead_.innerHTML =
    "Rédigez ici, puis cliquez sur <strong>Enregistrer et générer</strong> : le billet rejoint " +
    '<span class="mono">content/news/</span> et les actualités sont régénérées. Il ne reste qu’à committer.';
  refs.save.addEventListener("click", saveNews);
  refs.stop.addEventListener("click", stopStudio);
}

refs.form.addEventListener("input", () => {
  if (pendingOverwrite) resetSaveButton();
});
refs.form.addEventListener("input", updatePreview);
if (!refs.date.value) refs.date.value = getTodayYmd();
updatePreview();
loadRecentItems();
detectLocalStudio();
