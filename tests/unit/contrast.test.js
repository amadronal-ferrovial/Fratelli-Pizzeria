import { contrastRatio, meetsAA } from '../helpers/contrast.js';

describe('WCAG contrast helpers', () => {
  test('calcula el ratio conocido de texto principal sobre fondo claro', () => {
    expect(contrastRatio('#1f1a17', '#fbf6ee')).toBeCloseTo(16.02, 1);
  });

  test('calcula el ratio mínimo del borde de control oscuro', () => {
    expect(contrastRatio('#7d675b', '#241c18')).toBeCloseTo(3.16, 1);
  });

  test('acepta notación hexadecimal corta', () => {
    expect(contrastRatio('#fff', '#000')).toBe(21);
  });

  test('acepta colores rgb calculados por el navegador', () => {
    expect(contrastRatio('rgb(251, 246, 238)', '#1f1a17')).toBeCloseTo(16.02, 1);
  });

  test('un color contra sí mismo tiene ratio 1', () => {
    expect(contrastRatio('#a3120f', '#a3120f')).toBe(1);
  });

  test('aplica 4.5:1 a texto normal y 3:1 a texto grande o bordes', () => {
    expect(meetsAA(4.49, false)).toBe(false);
    expect(meetsAA(4.5, false)).toBe(true);
    expect(meetsAA(2.99, true)).toBe(false);
    expect(meetsAA(3, true)).toBe(true);
  });
});
