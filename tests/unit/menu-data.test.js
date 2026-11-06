import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../../data/menu.json', import.meta.url), 'utf8'));
const { restaurant, menu } = data;

const isNonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;
const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;

describe('data/menu.json', () => {
  test('restaurant has the required verified fields', () => {
    expect(isNonEmpty(restaurant.name)).toBe(true);
    expect(isNonEmpty(restaurant.phone)).toBe(true);
    expect(isNonEmpty(restaurant.address)).toBe(true);
    expect(restaurant.mapUrl).toMatch(/^https:\/\//);
  });

  test('menu has unique, named, ordered food categories only', () => {
    expect(isNonEmpty(menu.menuId)).toBe(true);
    expect(menu.categories.length).toBeGreaterThan(0);
    const ids = menu.categories.map((category) => category.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const category of menu.categories) {
      expect(isNonEmpty(category.name)).toBe(true);
      expect(category.name).not.toMatch(/bebida/i);
      expect(isNonNegativeInteger(category.order)).toBe(true);
    }
  });

  test('products reference categories and have valid formats', () => {
    const categoryIds = new Set(menu.categories.map((category) => category.id));
    const productIds = menu.products.map((product) => product.id);
    expect(new Set(productIds).size).toBe(productIds.length);
    for (const product of menu.products) {
      expect(categoryIds.has(product.categoryId)).toBe(true);
      expect(isNonEmpty(product.name)).toBe(true);
      expect(typeof product.available).toBe('boolean');
      if ('description' in product) expect(isNonEmpty(product.description)).toBe(true);
      if ('image' in product) {
        expect(isNonEmpty(product.image.src)).toBe(true);
        expect(isNonEmpty(product.image.alt)).toBe(true);
      }
      expect(product.formats.length).toBeGreaterThan(0);
      const formatIds = product.formats.map((format) => format.id);
      expect(new Set(formatIds).size).toBe(formatIds.length);
      for (const format of product.formats) {
        expect(isNonEmpty(format.name)).toBe(true);
        expect(isNonNegativeInteger(format.priceCents)).toBe(true);
      }
    }
  });
});
