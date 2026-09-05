import { test, expect } from "@playwright/test";

const CELL = 16;

// Espera a que la app esté montada y el canvas haya terminado el fit-zoom
// (el tamaño del canvas debe quedar estable antes de calcular clics).
async function gotoReady(page) {
  await page.goto("/");
  await expect(page.locator(".status-bar")).toBeVisible();
  await expect
    .poll(
      async () => {
        const w1 = (await page.locator(".canvas-wrap canvas").boundingBox())?.width;
        await page.waitForTimeout(60);
        const w2 = (await page.locator(".canvas-wrap canvas").boundingBox())?.width;
        return w1 && w1 === w2 ? w1 : -1;
      },
      { timeout: 8000 }
    )
    .toBeGreaterThan(50);
}

async function canvasBox(page) {
  return page.locator(".canvas-wrap canvas").boundingBox();
}

// Lee el píxel del buffer del canvas en la celda (x, y) — independiente del zoom.
async function readCell(page, x, y) {
  return page.evaluate(
    ([cx, cy]) => {
      const cv = document.querySelector(".canvas-wrap canvas");
      const d = cv.getContext("2d").getImageData(cx * 16 + 8, cy * 16 + 8, 1, 1).data;
      return { r: d[0], g: d[1], b: d[2], a: d[3] };
    },
    [x, y]
  );
}

async function expectPainted(page, x, y) {
  await expect.poll(async () => (await readCell(page, x, y)).a, { timeout: 8000 }).toBeGreaterThan(200);
}

async function expectEmpty(page, x, y) {
  await expect.poll(async () => (await readCell(page, x, y)).a, { timeout: 8000 }).toBe(0);
}

// Click central en una celda (mouse -> pointer events).
async function clickCell(page, x, y, button = "left") {
  const box = await canvasBox(page);
  const cells = await page.evaluate(() => document.querySelector(".canvas-wrap canvas").getAttribute("width") / 16);
  const zoom = box.width / (cells * CELL);
  const px = box.x + (x * CELL + CELL / 2) * zoom;
  const py = box.y + (y * CELL + CELL / 2) * zoom;
  await page.mouse.click(px, py, { button });
}

async function dragCells(page, x0, y0, x1, y1) {
  const box = await canvasBox(page);
  const cells = await page.evaluate(() => document.querySelector(".canvas-wrap canvas").getAttribute("width") / 16);
  const zoom = box.width / (cells * CELL);
  const pt = (x, y) => ({ x: box.x + (x * CELL + CELL / 2) * zoom, y: box.y + (y * CELL + CELL / 2) * zoom });
  const a = pt(x0, y0);
  const b = pt(x1, y1);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 8 });
  await page.waitForTimeout(80);
  await page.mouse.up();
}

test.describe("Pixel Sprite Editor", () => {
  test("dibuja y deshace/rehace", async ({ page }) => {
    await gotoReady(page);
    await clickCell(page, 0, 0);
    await expectPainted(page, 0, 0);

    await page.keyboard.press("Control+z");
    await expectEmpty(page, 0, 0);

    await page.keyboard.press("Control+Shift+z");
    await expectPainted(page, 0, 0);
  });

  test("simetría vertical espeja", async ({ page }) => {
    await gotoReady(page);
    await page.keyboard.press("m");
    await clickCell(page, 2, 0);
    await expectPainted(page, 2, 0);
    await expectPainted(page, 13, 0);
  });

  test("arrastrar pinta una línea con el pincel", async ({ page }) => {
    await gotoReady(page);
    await dragCells(page, 0, 0, 3, 0);
    await expectPainted(page, 0, 0);
    await expectPainted(page, 3, 0);
  });

  test("onion skin y duración por frame", async ({ page }) => {
    await gotoReady(page);
    await page.getByRole("button", { name: "Nuevo frame" }).click();
    await page.getByRole("button", { name: "Nuevo frame" }).click(); // 3 frames

    const inputs = page.locator(".frame-duration input");
    await inputs.nth(1).fill("250");
    await expect(inputs.nth(1)).toHaveValue("250");

    // salir del input para que los atajos globales funcionen
    await page.getByRole("heading", { name: "Pixel Sprite Editor" }).click();

    await page.keyboard.press("o");
    await expect(page.getByRole("switch", { name: "Activar onion skin" })).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Control+Shift+o");
    await expect(page.getByRole("button", { name: "Prev + Next" })).toHaveAttribute("aria-pressed", "true");
  });

  test("frames navegan con las flechas", async ({ page }) => {
    await gotoReady(page);
    await page.getByRole("button", { name: "Nuevo frame" }).click();
    // agregar frame ya nos deja en el 2/2
    await expect(page.locator(".status-bar")).toContainText("frame 2/2");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".status-bar")).toContainText("frame 1/2");
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator(".status-bar")).toContainText("frame 2/2");
  });

  test("tema oscuro persiste al recargar", async ({ page }) => {
    await gotoReady(page);
    await page.keyboard.press("d");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.keyboard.press("d");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("preset pico-8 cambia la paleta y Ctrl+Z lo deshace", async ({ page }) => {
    await gotoReady(page);
    await page.selectOption('select[aria-label="Cargar paleta preset"]', "pico-8");
    const swatch = page.locator(".swatch-wrap").first();
    await expect(swatch).toHaveCSS("background-color", "rgb(0, 0, 0)");
    await page.keyboard.press("Control+z");
    await expect(swatch).not.toHaveCSS("background-color", "rgb(0, 0, 0)");
  });

  test("snap y simetría desde la toolbar", async ({ page }) => {
    await gotoReady(page);
    await page.keyboard.press("Alt+s");
    await expect(page.getByRole("button", { name: "Alternar snap a grilla" })).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("m");
    await expect(page.getByRole("button", { name: "Alternar simetría vertical" })).toHaveAttribute("aria-pressed", "true");
  });

  test("rotar 90° mueve el contenido", async ({ page }) => {
    await gotoReady(page);
    await clickCell(page, 0, 0);
    await expectPainted(page, 0, 0);
    await page.getByTitle("Rotar 90° →").click();
    await expectPainted(page, 15, 0);
    await expectEmpty(page, 0, 0);
  });

  test("importa un sprite pegado y ajusta el lienzo", async ({ page }) => {
    await gotoReady(page);
    await page.getByRole("button", { name: "Mostrar Exportar / Importar" }).click();
    await page.locator("textarea").fill('["K..","..."]');
    await page.getByRole("button", { name: "⬆ Cargar en capa activa" }).click();
    const width = await page.evaluate(() => document.querySelector(".canvas-wrap canvas").getAttribute("width"));
    expect(Number(width)).toBe(3 * CELL);
    await expectPainted(page, 0, 0);
  });

  test("importa una imagen PNG", async ({ page }) => {
    await gotoReady(page);
    await page.getByRole("button", { name: "Mostrar Exportar / Importar" }).click();
    await page.locator('input[type="file"]').first().setInputFiles("e2e/fixtures/sample.png");
    await expect.poll(async () => (await readCell(page, 0, 0)).r, { timeout: 5000 }).toBeGreaterThan(120);
  });

  test("exporta GIF y PNG como descargas", async ({ page }) => {
    await gotoReady(page);
    await clickCell(page, 0, 0);
    await expectPainted(page, 0, 0);
    await page.getByRole("button", { name: "Mostrar Exportar / Importar" }).click();
    const [gif] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Exportar GIF animado" }).click(),
    ]);
    expect(gif.suggestedFilename()).toMatch(/\.gif$/);
    const [png] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /PNG frame/ }).click(),
    ]);
    expect(png.suggestedFilename()).toMatch(/\.png$/);
  });

  test("compartir URL embebe el proyecto y lo recarga", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "http://localhost:4173" });
    await gotoReady(page);
    await clickCell(page, 3, 4);
    await expectPainted(page, 3, 4);
    await page.getByRole("button", { name: "Mostrar Exportar / Importar" }).click();
    await page.getByRole("button", { name: "Copiar URL del proyecto" }).click();
    const url = await page.evaluate(() => navigator.clipboard.readText());
    expect(url).toContain("?project=");

    const page2 = await context.newPage();
    await page2.goto(url);
    await expect(page2.locator(".status-bar")).toBeVisible();
    await expectPainted(page2, 3, 4);
  });

  test("el proyecto se autoguarda al recargar", async ({ page }) => {
    await gotoReady(page);
    await clickCell(page, 5, 5);
    await expectPainted(page, 5, 5);
    await page.reload();
    await expectPainted(page, 5, 5);
  });

  test("guarda y recarga un proyecto JSON", async ({ page }) => {
    await gotoReady(page);
    await clickCell(page, 2, 2);
    await expectPainted(page, 2, 2);
    await page.getByRole("button", { name: "Mostrar Exportar / Importar" }).click();
    const [dl] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "💾 Guardar JSON" }).click(),
    ]);
    const path = await dl.path();

    // proyecto nuevo en una pestaña limpia
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expectEmpty(page, 2, 2);

    await page.getByRole("button", { name: "Mostrar Exportar / Importar" }).click();
    await page.locator('input[type="file"]').nth(1).setInputFiles(path);
    await expectPainted(page, 2, 2);
  });
});