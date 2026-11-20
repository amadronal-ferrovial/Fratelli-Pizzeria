import { test, expect } from '@playwright/test';
import { contrastRatio, meetsAA } from '../helpers/contrast.js';
import {
  TEXT_SIZES,
  THEME_CHOICES,
  TEXT_SIZE_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from '../../scripts/appearance.js';

const themeSelect = (page) => page.locator('[data-appearance="theme"]');
const textSelect = (page) => page.locator('[data-appearance="text-size"]');

const LIGHT_BG = 'rgb(251, 246, 238)';
const DARK_BG = 'rgb(23, 18, 15)';

async function htmlAppearance(page) {
  return page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    textSize: document.documentElement.dataset.textSize,
  }));
}

async function bodyBackground(page) {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor);
}

async function waitForBackground(page, expected, timeout = 1000) {
  await page.waitForFunction(
    (color) => getComputedStyle(document.body).backgroundColor === color,
    expected,
    { timeout },
  );
}

async function setSystem(page, colorScheme) {
  await page.emulateMedia({ colorScheme });
}

test.describe('Apariencia · smoke', () => {
  test('expone atributos saneados y no produce errores de consola', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');

    const attributes = await htmlAppearance(page);
    expect(THEME_CHOICES).toContain(attributes.theme);
    expect(TEXT_SIZES).toContain(attributes.textSize);
    expect(errors).toEqual([]);
  });
});

test.describe('US1 · Tema oscuro', () => {
  test('inicial · sigue el sistema oscuro sin elección previa y sin parpadeo', async ({ page }) => {
    await setSystem(page, 'dark');
    await page.addInitScript(() => {
      window.__firstPaint = null;
      requestAnimationFrame(() => {
        window.__firstPaint = {
          theme: document.documentElement.dataset.theme,
          textSize: document.documentElement.dataset.textSize,
          background: document.body ? getComputedStyle(document.body).backgroundColor : null,
        };
      });
    });

    await page.goto('/');
    await page.waitForFunction(() => window.__firstPaint !== null);
    const firstPaint = await page.evaluate(() => window.__firstPaint);

    expect(firstPaint.theme).toBe('system');
    expect(firstPaint.background).toBe(DARK_BG);
    expect(await htmlAppearance(page)).toEqual({ theme: 'system', textSize: 'normal' });
  });

  test('inicial · sistema claro o sin preferencia muestra el aspecto claro', async ({ page }) => {
    for (const scheme of ['light', 'no-preference']) {
      await setSystem(page, scheme);
      await page.goto('/');
      expect((await htmlAppearance(page)).theme).toBe('system');
      expect(await bodyBackground(page)).toBe(LIGHT_BG);
    }
  });

  test('tema manual · Claro y Oscuro prevalecen sobre el sistema y se recuerdan', async ({ page }) => {
    await setSystem(page, 'light');
    await page.goto('/');

    await themeSelect(page).selectOption('dark');
    expect((await htmlAppearance(page)).theme).toBe('dark');
    expect(await bodyBackground(page)).toBe(DARK_BG);

    await page.reload();
    expect((await htmlAppearance(page)).theme).toBe('dark');
    expect(await themeSelect(page).inputValue()).toBe('dark');

    await setSystem(page, 'dark');
    expect((await htmlAppearance(page)).theme).toBe('dark');
    expect(await bodyBackground(page)).toBe(DARK_BG);
  });

  test('tema manual · Seguir el sistema vuelve a depender del dispositivo y se recuerda', async ({ page }) => {
    await setSystem(page, 'light');
    await page.goto('/');

    await themeSelect(page).selectOption('dark');
    await themeSelect(page).selectOption('system');
    expect((await htmlAppearance(page)).theme).toBe('system');
    expect(await bodyBackground(page)).toBe(LIGHT_BG);

    await setSystem(page, 'dark');
    await waitForBackground(page, DARK_BG);
    expect((await htmlAppearance(page)).theme).toBe('system');

    await page.reload();
    expect((await htmlAppearance(page)).theme).toBe('system');
    expect(await bodyBackground(page)).toBe(DARK_BG);
    expect(await themeSelect(page).inputValue()).toBe('system');
  });

  test('tema manual · el cambio del sistema solo se aplica con Seguir el sistema', async ({ page }) => {
    await setSystem(page, 'light');
    await page.goto('/');

    const started = Date.now();
    await setSystem(page, 'dark');
    await waitForBackground(page, DARK_BG);
    expect(Date.now() - started).toBeLessThan(1000);

    await themeSelect(page).selectOption('light');
    await setSystem(page, 'dark');
    expect(await bodyBackground(page)).toBe(LIGHT_BG);

    await themeSelect(page).selectOption('system');
    await setSystem(page, 'light');
    await waitForBackground(page, LIGHT_BG);
    expect((await htmlAppearance(page)).theme).toBe('system');
  });
});

test.describe('US2 · Tamaño de texto', () => {
  const fontSize = (page, selector) => page.locator(selector).first()
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

  test('texto niveles · aplica +15 % y +30 %, se puede reducir y se recuerda sin salto', async ({ page }) => {
    await setSystem(page, 'light');
    await page.goto('/');

    const selectors = ['body', '.button--primary', '.product-card__name', '.cart__total dd'];
    const base = {};
    for (const selector of selectors) base[selector] = await fontSize(page, selector);

    await textSelect(page).selectOption('large');
    expect((await htmlAppearance(page)).textSize).toBe('large');
    for (const selector of selectors) {
      expect(await fontSize(page, selector)).toBeCloseTo(base[selector] * 1.15, 1);
    }

    await textSelect(page).selectOption('xlarge');
    for (const selector of selectors) {
      expect(await fontSize(page, selector)).toBeCloseTo(base[selector] * 1.3, 1);
    }

    await textSelect(page).selectOption('large');
    expect(await fontSize(page, 'body')).toBeCloseTo(base.body * 1.15, 1);
    await textSelect(page).selectOption('normal');
    expect(await fontSize(page, 'body')).toBeCloseTo(base.body, 1);

    await textSelect(page).selectOption('xlarge');
    await page.addInitScript(() => {
      window.__firstFontSize = null;
      requestAnimationFrame(() => {
        window.__firstFontSize = {
          textSize: document.documentElement.dataset.textSize,
          body: parseFloat(getComputedStyle(document.body).fontSize),
        };
      });
    });
    await page.reload();
    await page.waitForFunction(() => window.__firstFontSize !== null);

    const first = await page.evaluate(() => window.__firstFontSize);
    expect(first.textSize).toBe('xlarge');
    expect(first.body).toBeCloseTo(base.body * 1.3, 1);
    expect(await textSelect(page).inputValue()).toBe('xlarge');
    expect((await htmlAppearance(page)).theme).toBe('system');
  });

  test('texto 360 · no desborda, mantiene la cabecera y conserva zonas táctiles de 44 px', async ({ page }) => {
    await setSystem(page, 'light');
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');

    const header = page.getByRole('banner');
    const initialHeaderHeight = (await header.boundingBox()).height;

    await textSelect(page).selectOption('xlarge');
    await page.getByRole('button', { name: 'Añadir PROVOLETA al pedido' }).click();
    await expect(page.getByRole('link', { name: /ver tu pedido/i })).toBeVisible();

    const layout = await page.evaluate(() => {
      const rect = (selector) => {
        const el = document.querySelector(selector);
        const box = el.getBoundingClientRect();
        return { top: box.top, bottom: box.bottom, left: box.left, right: box.right, height: box.height };
      };
      const controls = [
        ...document.querySelectorAll('button, select, input[type="number"], .cart-bar'),
      ].filter((el) => el.getBoundingClientRect().height > 0);
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        offscreen: controls.filter((el) => {
          const box = el.getBoundingClientRect();
          return box.left < -1 || box.right > document.documentElement.clientWidth + 1;
        }).length,
        tooSmall: controls.filter((el) => el.getBoundingClientRect().height < 44)
          .map((el) => el.className || el.tagName),
        header: rect('.site-header'),
        categoryNav: rect('.category-nav'),
        cartBar: rect('.cart-bar'),
      };
    });

    expect(layout.overflow).toBeLessThanOrEqual(0);
    expect(layout.offscreen).toBe(0);
    expect(layout.tooSmall).toEqual([]);
    expect((await header.boundingBox()).height).toBe(initialHeaderHeight);
    expect(layout.categoryNav.top).toBeGreaterThanOrEqual(layout.header.bottom - 1);
    expect(layout.cartBar.top).toBeGreaterThan(layout.categoryNav.bottom);
  });
});

test.describe('US3 · Controles evidentes y seguros', () => {
  test('teclado · alcanza ambos controles, muestra el foco y permite cambiarlos sin ratón', async ({ page }) => {
    await setSystem(page, 'light');
    await page.goto('/');

    for (let tab = 0; tab < 5; tab += 1) await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-appearance', 'theme');

    const lightFocus = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement);
      return { style: style.outlineStyle, width: parseFloat(style.outlineWidth), color: style.outlineColor };
    });
    expect(lightFocus.style).not.toBe('none');
    expect(lightFocus.width).toBeGreaterThanOrEqual(2);
    expect(lightFocus.color).toBe('rgb(26, 95, 180)');

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    expect(await themeSelect(page).inputValue()).toBe('dark');
    expect((await htmlAppearance(page)).theme).toBe('dark');
    await expect(page.locator(':focus')).toHaveAttribute('data-appearance', 'theme');

    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-appearance', 'text-size');
    const darkFocus = await page.evaluate(() => getComputedStyle(document.activeElement).outlineColor);
    expect(darkFocus).toBe('rgb(255, 209, 102)');

    await page.keyboard.press('End');
    expect(await textSelect(page).inputValue()).toBe('xlarge');
    expect(await textSelect(page).evaluate((el) => el.options[el.selectedIndex].text)).toBe('Muy grande');
    expect((await htmlAppearance(page)).textSize).toBe('xlarge');
  });

  test('cesta red storage · cambiar apariencia conserva el pedido y no lanza peticiones', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Añadir CAMEMBERT FRITO al pedido' }).click();
    await page.getByRole('button', { name: 'Añadir PAN DE AJO al pedido' }).click();

    const cartSnapshot = () => page.evaluate(() => ({
      lines: [...document.querySelectorAll('.cart-line')].map((line) => ({
        name: line.querySelector('.cart-line__name').textContent,
        quantity: line.querySelector('.cart-line__quantity').value,
        subtotal: line.querySelector('.cart-line__subtotal').textContent,
      })),
      total: document.querySelector('[data-cart-total]').textContent,
    }));
    const before = await cartSnapshot();
    expect(before.lines).toHaveLength(2);

    const requests = [];
    page.on('request', (request) => requests.push(request.url()));
    await themeSelect(page).selectOption('dark');
    await textSelect(page).selectOption('xlarge');
    expect(requests).toEqual([]);
    expect(await cartSnapshot()).toEqual(before);
    await expect(page.getByText(/pedido de demostración confirmado/i)).toHaveCount(0);
  });

  test('storage bloqueado · los controles siguen funcionando sin mensajes de error', async ({ page }) => {
    await page.addInitScript(() => {
      Storage.prototype.getItem = () => { throw new Error('almacenamiento bloqueado'); };
      Storage.prototype.setItem = () => { throw new Error('almacenamiento bloqueado'); };
    });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/');
    await themeSelect(page).selectOption('dark');
    await textSelect(page).selectOption('large');

    expect((await htmlAppearance(page)).theme).toBe('dark');
    expect((await htmlAppearance(page)).textSize).toBe('large');
    expect(await bodyBackground(page)).toBe(DARK_BG);
    await expect(page.locator('.cart__notice--error')).toHaveCount(0);
    expect(await page.locator('body').innerText()).not.toContain('almacenamiento bloqueado');
    expect(errors).toEqual([]);
  });

  test('contraste · cumple AA en 9 combinaciones de tema y tamaño', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    const textSelectors = [
      '.site-header', '.site-nav a', '.cart-badge',
      '.appearance-control label', '.appearance-control select',
      '.hero__title', '.hero__description', '.hero .button--primary', '.hero .button--ghost',
      '.category-nav a', '.menu-category > h3',
      '.product-card__name', '.product-card__description', '.product-card__price',
      '.product-card__label', '.product-card__add', '.product-card__select', '.product-card__error',
      '.cart__panel h2', '.cart-line__name', '.cart-line__format', '.cart-line__unit',
      '.cart-line__step', '.cart-line__quantity', '.cart-line__subtotal', '.cart-line__remove',
      '.cart__total dt', '.cart__total dd', '.cart__confirm', '.cart__notice--error', '.cart__note', '.cart-bar',
      '.contact__card h3', '.contact__value', '.contact .button--primary', '.contact .button--ghost',
      '.site-footer p',
    ];
    const borderSelectors = [
      '.appearance-control select', '.product-card__select', '.cart-line__quantity',
      '.hero .button--ghost', '.contact .button--ghost', '.cart-bar',
    ];

    const readSamples = () => page.evaluate(({ textSelectors, borderSelectors }) => {
      const parse = (value) => {
        const match = value.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
        if (!match) return null;
        return {
          color: `rgb(${Number(match[1])}, ${Number(match[2])}, ${Number(match[3])})`,
          alpha: match[4] === undefined ? 1 : Number(match[4]),
        };
      };
      const backgroundOf = (element) => {
        let current = element;
        while (current) {
          const parsed = parse(getComputedStyle(current).backgroundColor);
          if (parsed && parsed.alpha > 0) return { background: parsed.color, from: current.className || current.tagName };
          current = current.parentElement;
        }
        return { background: 'rgb(255, 255, 255)', from: 'default' };
      };
      const rootStyle = getComputedStyle(document.documentElement);
      const heroWorst = rootStyle.getPropertyValue('--color-hero-end').trim();
      const visible = (element) => element && element.getClientRects().length > 0
        && getComputedStyle(element).visibility !== 'hidden';
      const firstVisible = (selector) => [...document.querySelectorAll(selector)].find(visible);

      const texts = textSelectors.map((selector) => {
        const element = firstVisible(selector);
        if (!element) return null;
        const style = getComputedStyle(element);
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = Number(style.fontWeight) || 400;
        const isLarge = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
        const inHero = Boolean(element.closest('.hero')) && style.backgroundColor === 'rgba(0, 0, 0, 0)'
          && style.backgroundImage === 'none';
        const { background, from } = inHero
          ? { background: heroWorst, from: 'hero-gradient' }
          : backgroundOf(element);
        return {
          selector,
          color: style.color,
          background,
          from,
          isLarge,
        };
      }).filter(Boolean);

      const borders = borderSelectors.map((selector) => {
        const element = firstVisible(selector);
        if (!element) return null;
        const style = getComputedStyle(element);
        const border = parse(style.borderTopColor);
        if (!border || border.alpha === 0 || parseFloat(style.borderTopWidth) === 0) return null;
        return {
          selector,
          color: border.color,
          background: element.closest('.hero') ? heroWorst : backgroundOf(element).background,
        };
      }).filter(Boolean);

      return { texts, borders };
    }, { textSelectors, borderSelectors });

    for (const theme of ['light', 'dark', 'system']) {
      await setSystem(page, 'dark');
      for (const size of TEXT_SIZES) {
        await page.goto('/');
        await themeSelect(page).selectOption(theme);
        await textSelect(page).selectOption(size);

        await page.getByRole('button', { name: /confirmar pedido de demostración/i }).click();
        await expect(page.locator('.cart__notice--error')).toBeVisible();

        await page.getByRole('button', { name: 'Añadir CAMEMBERT FRITO al pedido' }).click();
        await page.getByRole('button', { name: 'Añadir PAN DE AJO al pedido' }).click();

        const { texts, borders } = await readSamples();
        for (const sample of texts) {
          const ratio = contrastRatio(sample.color, sample.background);
          expect(meetsAA(ratio, sample.isLarge), `${theme}/${size} ${sample.selector}: ${ratio.toFixed(2)}:1`).toBe(true);
        }
        for (const sample of borders) {
          const ratio = contrastRatio(sample.color, sample.background);
          expect(ratio >= 3, `${theme}/${size} borde ${sample.selector}: ${ratio.toFixed(2)}:1`).toBe(true);
        }

        await page.getByRole('button', { name: /confirmar pedido de demostración/i }).click();
        await expect(page.locator('.cart__notice--success')).toBeVisible();
        const notices = await readSamples();
        for (const sample of notices.texts.filter((item) => item.selector === '.cart__notice--success')) {
          const ratio = contrastRatio(sample.color, sample.background);
          expect(meetsAA(ratio, false), `${theme}/${size} aviso éxito: ${ratio.toFixed(2)}:1`).toBe(true);
        }
      }
    }
  });
});
