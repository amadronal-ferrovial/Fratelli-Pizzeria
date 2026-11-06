import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const menuData = JSON.parse(readFileSync(new URL('../../data/menu.json', import.meta.url), 'utf8'));

const normalize = (text) => text.replace(/\s+/g, ' ').trim();
const euro = (cents) => normalize(
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100),
);
const productCard = (page, name) => page.locator('.product-card').filter({
  has: page.getByRole('heading', { name, exact: true }),
});

test.describe('Estructura y accesibilidad de la página', () => {
  test('usa español y landmarks semánticos', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page).toHaveTitle(/Fratelli/);
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('ofrece enlaces visibles a la carta y al contacto', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    await expect(nav.getByRole('link', { name: 'Carta' })).toHaveAttribute('href', '#menu');
    await expect(nav.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '#contact');
    await expect(page.locator('#menu')).toHaveCount(1);
    await expect(page.locator('#contact')).toHaveCount(1);
  });

  test('permite navegar con teclado y muestra el foco', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toHaveAttribute('href', '#main');
    const outline = await focused.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveText('Carta');
  });

  test('se adapta a pantallas pequeñas sin desplazamiento horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('US1 · Explorar la pizzería y su carta', () => {
  test('muestra el banner destacado con la identidad del restaurante', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('.hero');
    await expect(hero).toBeVisible();
    await expect(hero.getByRole('heading', { level: 1 })).toHaveText(menuData.restaurant.name);
    await expect(hero.getByRole('link', { name: /ver la carta/i })).toHaveAttribute('href', '#menu');
  });

  test('presenta las categorías de comida en orden y con navegación', async ({ page }) => {
    await page.goto('/');
    const expected = [...menuData.menu.categories]
      .sort((a, b) => a.order - b.order)
      .map((category) => category.name);
    expect(expected).toEqual([
      'Entrantes',
      'Nuestras Pastas',
      'Pizzas Medianas',
      'Pizzas Familiares',
      'Postres Caseros',
    ]);
    await expect(page.locator('.menu-category > h3')).toHaveText(expected);
    const categoryNav = page.getByRole('navigation', { name: 'Categorías de la carta' });
    await expect(categoryNav.getByRole('link')).toHaveText(expected);
    await categoryNav.getByRole('link', { name: 'Postres Caseros' }).click();
    await expect(page.getByRole('heading', { name: 'Postres Caseros' })).toBeInViewport();
  });

  test('publica cada producto con su nombre, precio y descripción verificados', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.product-card')).toHaveCount(menuData.menu.products.length);
    for (const product of menuData.menu.products) {
      const card = productCard(page, product.name);
      await expect(card).toHaveCount(1);
      const text = normalize(await card.innerText());
      for (const format of product.formats) {
        expect(text).toContain(euro(format.priceCents));
      }
      if (product.description) {
        expect(text).toContain(normalize(product.description));
      }
    }
  });

  test('omite descripciones e imágenes ausentes sin huecos rotos', async ({ page }) => {
    await page.goto('/');
    const garlicBread = productCard(page, 'PAN DE AJO');
    await expect(garlicBread).toContainText(euro(345));
    await expect(garlicBread.locator('.product-card__description')).toHaveCount(0);
    await expect(garlicBread.locator('img')).toHaveCount(0);
    const brokenImages = await page.locator('img').evaluateAll(
      (images) => images.filter((img) => !img.complete || img.naturalWidth === 0).length,
    );
    expect(brokenImages).toBe(0);
  });

  test('no muestra la carta de bebidas ni pantallas de gestión', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.product-card').first()).toBeVisible();
    await expect(page.getByText(/bebidas/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /editar|gestionar|administrar|nuevo producto/i })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /editar|gestionar|administrar|acceso personal/i })).toHaveCount(0);
    await expect(page.getByRole('textbox')).toHaveCount(0);
  });

  test('mantiene la carta legible en un móvil pequeño', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    await expect(page.locator('.product-card').first()).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const fontSize = await page.locator('.product-card__name').first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(16);
  });

  test('informa visiblemente si la carta no puede cargarse', async ({ page }) => {
    await page.route('**/data/menu.json', (route) => route.fulfill({ status: 500, body: 'error' }));
    await page.goto('/');
    await expect(page.getByRole('alert')).toContainText(/no hemos podido cargar la carta/i);
    await expect(page.locator('.product-card')).toHaveCount(0);
  });

  test('muestra el primer producto en menos de 3 segundos con caché vacía', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    const start = Date.now();
    await page.goto('/');
    await page.locator('.product-card').first().waitFor({ state: 'visible' });
    const elapsed = Date.now() - start;
    await context.close();
    test.info().annotations.push({ type: 'first-product-ms', description: String(elapsed) });
    expect(elapsed).toBeLessThan(3000);
  });
});

test.describe('US2 · Preparar un pedido de demostración', () => {
  const cartSection = (page) => page.locator('#cart');
  const cartLines = (page) => cartSection(page).locator('.cart-line');
  const cartTotal = (page) => cartSection(page).locator('[data-cart-total]');
  const addButton = (page, name) => page.getByRole('button', { name: `Añadir ${name} al pedido` });

  test('añade productos, agrupa repeticiones y actualiza el total', async ({ page }) => {
    await page.goto('/');
    await expect(cartSection(page)).toContainText(/tu pedido está vacío/i);
    await addButton(page, 'CAMEMBERT FRITO').click();
    await expect(cartLines(page)).toHaveCount(1);
    await expect(cartTotal(page)).toHaveText(euro(1045));
    await addButton(page, 'CAMEMBERT FRITO').click();
    await expect(cartLines(page)).toHaveCount(1);
    await expect(page.getByRole('spinbutton', { name: 'Cantidad de CAMEMBERT FRITO' })).toHaveValue('2');
    await expect(cartTotal(page)).toHaveText(euro(2090));
    await expect(page.getByRole('status').filter({ hasText: /añadido/i })).toHaveCount(1);
  });

  test('cambia cantidades, elimina líneas y recalcula el total', async ({ page }) => {
    await page.goto('/');
    await addButton(page, 'CAMEMBERT FRITO').click();
    await addButton(page, 'PAN DE AJO').click();
    await expect(cartTotal(page)).toHaveText(euro(1045 + 345));

    await page.getByRole('button', { name: 'Añadir una unidad de PAN DE AJO' }).click();
    await expect(cartTotal(page)).toHaveText(euro(1045 + 690));

    const quantity = page.getByRole('spinbutton', { name: 'Cantidad de CAMEMBERT FRITO' });
    await quantity.fill('3');
    await quantity.press('Enter');
    await expect(cartTotal(page)).toHaveText(euro(3 * 1045 + 690));

    await page.getByRole('button', { name: 'Eliminar CAMEMBERT FRITO del pedido' }).click();
    await expect(cartLines(page)).toHaveCount(1);
    await expect(cartSection(page)).not.toContainText('CAMEMBERT FRITO');
    await expect(cartTotal(page)).toHaveText(euro(690));

    await page.getByRole('button', { name: 'Quitar una unidad de PAN DE AJO' }).click();
    await page.getByRole('button', { name: 'Quitar una unidad de PAN DE AJO' }).click();
    await expect(cartLines(page)).toHaveCount(0);
    await expect(cartSection(page)).toContainText(/tu pedido está vacío/i);
  });

  test('impide confirmar una cesta vacía', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /confirmar pedido de demostración/i }).click();
    await expect(cartSection(page)).toContainText(/añade al menos un producto/i);
    await expect(page.getByText(/pedido de demostración confirmado/i)).toHaveCount(0);
  });

  test('confirma una demostración sin enviar nada y vacía la cesta', async ({ page }) => {
    await page.goto('/');
    await addButton(page, 'MED MARGARITA').click();
    await addButton(page, 'TARTA DE QUESO').click();

    const requests = [];
    page.on('request', (request) => requests.push(request.url()));
    const confirm = page.getByRole('button', { name: /confirmar pedido de demostración/i });
    await confirm.click();

    const notification = page.getByRole('status').filter({ hasText: /pedido de demostración confirmado/i });
    await expect(notification).toBeVisible();
    await expect(notification).toContainText(/no se ha enviado/i);
    await expect(cartLines(page)).toHaveCount(0);
    await expect(cartTotal(page)).toHaveText(euro(0));
    await expect(confirm).toBeFocused();
    expect(requests).toEqual([]);
  });

  test('en móvil muestra un acceso al pedido sin descuadrar la cabecera', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    const header = page.getByRole('banner');
    const initialHeight = (await header.boundingBox()).height;
    await addButton(page, 'PROVOLETA').click();
    await expect(page.getByRole('link', { name: /ver tu pedido · 1 producto/i })).toBeVisible();
    expect((await header.boundingBox()).height).toBe(initialHeight);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('se puede usar con el teclado', async ({ page }) => {
    await page.goto('/');
    await addButton(page, 'PROVOLETA').focus();
    await page.keyboard.press('Enter');
    await expect(cartLines(page)).toHaveCount(1);
    await expect(addButton(page, 'PROVOLETA')).toBeFocused();
  });

  test.describe('con productos de varios formatos', () => {
    const fixture = {
      restaurant: menuData.restaurant,
      menu: {
        menuId: 'fixture',
        name: 'Carta de prueba',
        categories: [{ id: 'pizzas', name: 'Pizzas', order: 1 }],
        products: [
          {
            id: 'pizza-prueba',
            categoryId: 'pizzas',
            name: 'PIZZA PRUEBA',
            available: true,
            formats: [
              { id: 'mediana', name: 'Mediana', priceCents: 1000 },
              { id: 'familiar', name: 'Familiar', priceCents: 2000 },
            ],
          },
          {
            id: 'agotada',
            categoryId: 'pizzas',
            name: 'PIZZA AGOTADA',
            available: false,
            formats: [{ id: 'unico', name: 'Formato Unico', priceCents: 900 }],
          },
        ],
      },
    };

    test.beforeEach(async ({ page }) => {
      await page.route('**/data/menu.json', (route) => route.fulfill({ json: fixture }));
      await page.goto('/');
    });

    test('exige elegir formato y separa las líneas por formato', async ({ page }) => {
      await addButton(page, 'PIZZA PRUEBA').click();
      await expect(page.getByText(/elige un formato/i).last()).toBeVisible();
      await expect(cartLines(page)).toHaveCount(0);

      const format = page.getByRole('combobox', { name: 'Formato de PIZZA PRUEBA' });
      await format.selectOption({ label: `Familiar · ${euro(2000)}` });
      await addButton(page, 'PIZZA PRUEBA').click();
      await format.selectOption({ label: `Mediana · ${euro(1000)}` });
      await addButton(page, 'PIZZA PRUEBA').click();

      await expect(cartLines(page)).toHaveCount(2);
      await expect(cartLines(page).nth(0)).toContainText('Familiar');
      await expect(cartLines(page).nth(1)).toContainText('Mediana');
      await expect(cartTotal(page)).toHaveText(euro(3000));
    });

    test('no permite añadir productos no disponibles', async ({ page }) => {
      const card = productCard(page, 'PIZZA AGOTADA');
      await expect(card).toContainText('No disponible');
      await expect(card.getByRole('button')).toHaveCount(0);
    });
  });
});

test.describe('US3 · Contactar y llegar al restaurante', () => {
  const { phone, address, mapUrl } = menuData.restaurant;

  test('muestra el teléfono y la dirección verificados', async ({ page }) => {
    expect(phone).toBe('+34 918 28 50 61');
    expect(address).toBe('Calle Quero, 83-85, 28024 Madrid, España');
    await page.goto('/');
    const contact = page.locator('#contact');
    await expect(contact.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(contact).toContainText(phone);
    await expect(contact).toContainText(address);
  });

  test('ofrece acciones de llamada y de mapa', async ({ page }) => {
    await page.goto('/');
    const contact = page.locator('#contact');
    const call = contact.getByRole('link', { name: `Llamar al ${phone}`, exact: true });
    await expect(call).toHaveAttribute('href', 'tel:+34918285061');
    const map = contact.getByRole('link', { name: /ver en el mapa/i });
    await expect(map).toHaveAttribute('href', mapUrl);
    await expect(map).toHaveAttribute('target', '_blank');
    await expect(map).toHaveAttribute('rel', /noopener/);
    expect(mapUrl).toContain('40.389442');
    expect(mapUrl).toContain('-3.760339');
  });

  test('es accesible con el teclado y el texto se puede copiar', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Navegación principal' })
      .getByRole('link', { name: 'Contacto' }).click();
    const contact = page.locator('#contact');
    await expect(contact.getByRole('heading', { level: 2 })).toBeInViewport();
    const call = contact.getByRole('link', { name: /llamar/i });
    await call.focus();
    await expect(call).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(contact.getByRole('link', { name: /ver en el mapa/i })).toBeFocused();
    const userSelect = await contact.locator('address').evaluate((el) => getComputedStyle(el).userSelect);
    expect(userSelect).not.toBe('none');
  });
});
