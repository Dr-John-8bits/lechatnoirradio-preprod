import { test, expect } from "@playwright/test";
import { mockRadio, collectPageErrors } from "./helpers.mjs";

test("la home affiche les blocs obligatoires sans overflow horizontal", async ({ page }) => {
  const errors = collectPageErrors(page);
  await mockRadio(page);
  await page.goto("/");

  await expect(page.locator("#homeTodayList li").first()).toBeVisible();
  await expect(page.locator("#home-recent-title")).toBeVisible();
  await expect(page.locator("#homeRecentList li").first()).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test("les auditeurs s'affichent avec sobriété (desktop)", async ({ page, isMobile }) => {
  test.skip(isMobile, "le compteur est masqué sur mobile par design");
  await mockRadio(page);
  await page.goto("/");
  await expect(page.locator("#listenersNote")).toHaveText("3 à l'écoute");
});

test("zéro auditeur → le compteur se masque au lieu d'afficher 0", async ({ page, isMobile }) => {
  test.skip(isMobile, "compteur desktop uniquement");
  await mockRadio(page, { listeners: { current: 0 } });
  await page.goto("/");
  await expect(page.locator("#currentShowText")).toHaveText("La table du chat");
  await expect(page.locator("#listenersNote")).toBeHidden();
});

test("les derniers passages viennent du CSV avec heures de Paris", async ({ page }) => {
  await mockRadio(page);
  await page.goto("/");
  const firstRow = page.locator("#homeRecentList li").first();
  await expect(firstRow).toContainText("la souterraine — élématique");
  await expect(firstRow.locator(".track-time")).toHaveText("13:03");
});

test("la grille du jour signale le show réel via current-show", async ({ page }) => {
  await mockRadio(page, { currentShow: { show: "Show Inconnu De La Grille", kind: "editorial_event" } });
  await page.goto("/#grille");
  await expect(page.locator("#pageView")).toContainText("// en ce moment : Show Inconnu De La Grille");
});
