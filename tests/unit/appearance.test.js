import { jest } from '@jest/globals';
import {
  FONT_SCALES,
  TEXT_SIZE_STORAGE_KEY,
  TEXT_SIZES,
  THEME_STORAGE_KEY,
  THEME_CHOICES,
  normalizeTextSize,
  normalizeTheme,
  readPreferences,
  resolveTheme,
  writePreference,
} from '../../scripts/appearance.js';

function createStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: jest.fn((key) => (Object.hasOwn(data, key) ? data[key] : null)),
    setItem: jest.fn((key, value) => { data[key] = String(value); }),
  };
}

describe('appearance pure helpers', () => {
  test('expone los valores y claves del contrato', () => {
    expect(THEME_CHOICES).toEqual(['system', 'light', 'dark']);
    expect(TEXT_SIZES).toEqual(['normal', 'large', 'xlarge']);
    expect(THEME_STORAGE_KEY).toBe('fratelli.appearance.theme');
    expect(TEXT_SIZE_STORAGE_KEY).toBe('fratelli.appearance.textSize');
    expect(FONT_SCALES).toEqual({ normal: 1, large: 1.15, xlarge: 1.3 });
  });

  test.each([
    ['system', 'system'],
    ['light', 'light'],
    ['dark', 'dark'],
    ['DARK', 'system'],
    ['', 'system'],
    [null, 'system'],
    [undefined, 'system'],
  ])('normalizeTheme(%p) devuelve %p', (input, expected) => {
    expect(normalizeTheme(input)).toBe(expected);
  });

  test.each([
    ['normal', 'normal'],
    ['large', 'large'],
    ['xlarge', 'xlarge'],
    ['XLARGE', 'normal'],
    ['huge', 'normal'],
    [null, 'normal'],
  ])('normalizeTextSize(%p) devuelve %p', (input, expected) => {
    expect(normalizeTextSize(input)).toBe(expected);
  });

  test('resolveTheme sigue al sistema solo cuando la elección es system', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('valor-raro', true)).toBe('dark');
  });

  test('readPreferences devuelve los valores por defecto si no hay claves', () => {
    expect(readPreferences(createStorage())).toEqual({ theme: 'system', textSize: 'normal' });
  });

  test('readPreferences sanea valores inválidos guardados', () => {
    const storage = createStorage({
      [THEME_STORAGE_KEY]: 'oscuro',
      [TEXT_SIZE_STORAGE_KEY]: 'enorme',
    });
    expect(readPreferences(storage)).toEqual({ theme: 'system', textSize: 'normal' });
  });

  test('readPreferences funciona cuando el almacenamiento lanza excepciones', () => {
    const storage = {
      getItem: () => { throw new Error('bloqueado'); },
      setItem: () => { throw new Error('bloqueado'); },
    };
    expect(readPreferences(storage)).toEqual({ theme: 'system', textSize: 'normal' });
  });

  test('writePreference guarda cada preferencia en su clave y devuelve true', () => {
    const storage = createStorage();
    expect(writePreference(storage, THEME_STORAGE_KEY, 'dark')).toBe(true);
    expect(writePreference(storage, TEXT_SIZE_STORAGE_KEY, 'large')).toBe(true);
    expect(storage.data).toEqual({
      [THEME_STORAGE_KEY]: 'dark',
      [TEXT_SIZE_STORAGE_KEY]: 'large',
    });
  });

  test('writePreference normaliza el valor antes de guardarlo', () => {
    const storage = createStorage();
    writePreference(storage, THEME_STORAGE_KEY, 'DARK');
    writePreference(storage, TEXT_SIZE_STORAGE_KEY, 'huge');
    expect(storage.data[THEME_STORAGE_KEY]).toBe('system');
    expect(storage.data[TEXT_SIZE_STORAGE_KEY]).toBe('normal');
  });

  test('writePreference devuelve false y no lanza si el almacenamiento está bloqueado', () => {
    const storage = { setItem: () => { throw new Error('bloqueado'); } };
    expect(() => writePreference(storage, THEME_STORAGE_KEY, 'dark')).not.toThrow();
    expect(writePreference(storage, THEME_STORAGE_KEY, 'dark')).toBe(false);
  });

  test('writePreference ignora claves desconocidas', () => {
    const storage = createStorage();
    expect(writePreference(storage, 'otra.clave', 'dark')).toBe(false);
    expect(storage.data).toEqual({});
  });
});
