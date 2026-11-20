export const THEME_CHOICES = ['system', 'light', 'dark'];
export const TEXT_SIZES = ['normal', 'large', 'xlarge'];

export const THEME_STORAGE_KEY = 'fratelli.appearance.theme';
export const TEXT_SIZE_STORAGE_KEY = 'fratelli.appearance.textSize';

export const FONT_SCALES = Object.freeze({ normal: 1, large: 1.15, xlarge: 1.3 });

export const DEFAULT_PREFERENCES = Object.freeze({ theme: 'system', textSize: 'normal' });

export function normalizeTheme(value) {
  return THEME_CHOICES.includes(value) ? value : DEFAULT_PREFERENCES.theme;
}

export function normalizeTextSize(value) {
  return TEXT_SIZES.includes(value) ? value : DEFAULT_PREFERENCES.textSize;
}

export function resolveTheme(themeChoice, prefersDark) {
  const theme = normalizeTheme(themeChoice);
  if (theme !== 'system') return theme;
  return prefersDark ? 'dark' : 'light';
}

function safeGet(storage, key) {
  try {
    return storage?.getItem?.(key) ?? null;
  } catch {
    return null;
  }
}

function normalizeForKey(key, value) {
  if (key === THEME_STORAGE_KEY) return normalizeTheme(value);
  if (key === TEXT_SIZE_STORAGE_KEY) return normalizeTextSize(value);
  return null;
}

export function readPreferences(storage) {
  return {
    theme: normalizeTheme(safeGet(storage, THEME_STORAGE_KEY)),
    textSize: normalizeTextSize(safeGet(storage, TEXT_SIZE_STORAGE_KEY)),
  };
}

export function writePreference(storage, key, value) {
  const normalized = normalizeForKey(key, value);
  if (normalized === null) return false;
  try {
    storage?.setItem?.(key, normalized);
    return true;
  } catch {
    return false;
  }
}
