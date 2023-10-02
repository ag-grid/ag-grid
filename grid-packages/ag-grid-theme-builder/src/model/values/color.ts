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
    const parsed = ColorLib(css);
    return color(parsed.alpha() === 1 ? parsed.hex() : parsed.hexa());
  } catch {
    return null;
  }
};

export const colorToCss = ({ hex }: ColorValue): string => hex;

export const colorWithAlpha = ({ hex }: ColorValue, newAlpha: number): ColorValue => {
  const alpha = getAlpha(hex) * newAlpha;
  const hexAlpha = ('0' + Math.min(255, Math.max(0, Math.round(alpha * 255))).toString(16)).slice(
    -2,
  );
  return { type: 'color', hex: hex.substring(0, 7) + hexAlpha };
};

export const colorWithSelfOverlay = ({ hex }: ColorValue, times: number): ColorValue => {
  const overlaidAlpha = 1 - Math.pow(1 - getAlpha(hex), times);
  return { type: 'color', hex: hex.substring(0, 7) + alphaToHex(overlaidAlpha) };
};

const getAlpha = (hex: string): number => parseInt(hex.substring(7) || 'ff', 16) / 255;

const alphaToHex = (alpha: number): string =>
  ('0' + Math.min(255, Math.max(0, Math.round(alpha * 255))).toString(16)).slice(-2);

export const colorIsDarkish = (color: ColorValue) => parseInt(color.hex.substring(3, 5), 16) < 128;
