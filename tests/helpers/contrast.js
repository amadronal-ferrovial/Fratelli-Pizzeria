const HEX_PATTERN = /^#([\da-f]{3}|[\da-f]{6})$/i;
const RGB_PATTERN = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i;

function parseColor(color) {
  if (typeof color !== 'string') {
    throw new TypeError(`Color no válido: ${String(color)}`);
  }
  const value = color.trim();
  if (HEX_PATTERN.test(value)) {
    const hex = value.slice(1);
    const expanded = hex.length === 3
      ? hex.split('').map((digit) => digit + digit).join('')
      : hex;
    return [0, 2, 4].map((index) => parseInt(expanded.slice(index, index + 2), 16));
  }
  const match = value.match(RGB_PATTERN);
  if (match) {
    return [Number(match[1]), Number(match[2]), Number(match[3])];
  }
  throw new TypeError(`Color no válido: ${value}`);
}

function channelLuminance(channel) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color) {
  const [red, green, blue] = parseColor(color);
  return 0.2126 * channelLuminance(red)
    + 0.7152 * channelLuminance(green)
    + 0.0722 * channelLuminance(blue);
}

export function contrastRatio(colorA, colorB) {
  const luminanceA = relativeLuminance(colorA);
  const luminanceB = relativeLuminance(colorB);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsAA(ratio, isLargeText = false) {
  return ratio >= (isLargeText ? 3 : 4.5);
}
