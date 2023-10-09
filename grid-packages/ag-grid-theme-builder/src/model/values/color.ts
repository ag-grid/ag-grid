import ColorLib from 'color';
import { logErrorMessage } from 'model/utils';

export type ColorValue = {
  type: 'color';
  hex: string;
};

export const color = (input: string): ColorValue => {
  let hex = input.toLowerCase();
  if (hex[0] !== '#') hex = `#${hex}`;
  if (hex.length === 4 || hex.length === 5) {
    // #rgb or #rgba
    hex =
      '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3] + (hex[4] || '') + (hex[4] || '');
  }
  if (!/^#[0-9A-F]{6}([0-9A-F]{2})?$/i.test(hex)) {
    logErrorMessage(`color initialized with hex value "${input}"`);
  }
  return { type: 'color', hex };
};

export const parseCssColor = (css: string): ColorValue | null => {
  try {
    const match = css.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:[\s/]+([\d.]+))?\)$/);
    if (match) {
      const r = parseFloat(match[1]);
      const g = parseFloat(match[2]);
      const b = parseFloat(match[3]);
      const a = parseFloat(match[4] || '1');
      if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
        return null;
      }
      const rgbHex = '#' + float1ToHex255(r) + float1ToHex255(g) + float1ToHex255(b);
      return a === 1 ? color(rgbHex) : color(rgbHex + float1ToHex255(a));
    }
    const parsed = ColorLib(css);
    return color(parsed.alpha() === 1 ? parsed.hex() : parsed.hexa());
  } catch {
    return null;
  }
};

export const colorToCss = ({ hex }: ColorValue): string => hex;

const float1ToHex255 = (alpha: number): string =>
  ('0' + Math.min(255, Math.max(0, Math.round(alpha * 255))).toString(16)).slice(-2);

export const colorIsDarkish = (color: ColorValue) => parseInt(color.hex.substring(3, 5), 16) < 128;
