import ColorLib from 'color';
import { logErrorMessage } from './utils';
import { VariableType } from './variables';

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
    logErrorMessage(`Parsing invalid hex color "${input}"`);
  }
  return { type: 'color', hex };
};

export type DimensionValue = {
  type: 'dimension';
  number: number;
  units: string;
};

export const dimension = (value: number, units: string): DimensionValue => {
  return { type: 'dimension', number: value, units };
};

export type BorderValue = {
  type: 'border';
  style?: string;
  width?: DimensionValue;
  color?: ColorValue;
};

export const border = (
  style: string | null,
  width: DimensionValue | null,
  color: ColorValue | null,
): BorderValue => {
  const value: BorderValue = { type: 'border' };
  if (style !== null) value.style = style;
  if (width !== null) value.width = width;
  if (color !== null) value.color = color;
  return value;
};

export type ValueByType = {
  dimension: DimensionValue;
  color: ColorValue;
  border: BorderValue;
};

export type Value = ValueByType[VariableType];

export type VariableValues = Record<string, Value | null | undefined>;

export const valueToCss = (value: Value): string => {
  switch (value.type) {
    case 'color':
      return value.hex;
    case 'dimension':
      return value.number + (value.units || '');
    case 'border':
      return [
        value.style ? value.style : '',
        value.width ? valueToCss(value.width) : '',
        value.color ? valueToCss(value.color) : '',
      ]
        .filter(Boolean)
        .join(' ');
  }
};

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

export const defaultValueForType = (type: VariableType): Value => {
  switch (type) {
    case 'border':
      return border('solid', dimension(1, 'px'), color('#000'));
    case 'color':
      return color('#999');
    case 'dimension':
      return dimension(1, 'px');
  }
};

export const parseCssColor = (css: string): ColorValue | null => {
  try {
    const parsed = ColorLib(css);
    return color(parsed.alpha() === 1 ? parsed.hex() : parsed.hexa());
  } catch {
    return null;
  }
};

export const parseCssDimension = (css: string): DimensionValue | null => {
  const match = css.match(/^(\d+(?:\.\d+)?)(\w+)$/);
  if (match) {
    return dimension(parseFloat(match[1]), match[2]);
  }
  return null;
};

const validBorderStyles = new Set([
  'dotted',
  'dashed',
  'solid',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
  'none',
  'hidden',
]);

export const parseCssBorderStyle = (css: string): string | null => {
  return validBorderStyles.has(css) ? css : null;
};

export const parseCssBorder = (css: string): BorderValue | null => {
  const border: BorderValue = { type: 'border' };
  for (const word of css.split(/\s+/)) {
    const style = parseCssBorderStyle(word);
    if (style != null) {
      border.style = word;
      continue;
    }
    const width = parseCssDimension(word);
    if (width != null) {
      border.width = width;
      continue;
    }
    const color = parseCssColor(word);
    if (color != null) {
      border.color = color;
      continue;
    }
    return null;
  }
  return border;
};

export const parseCssString = (type: VariableType, css: string): Value | null => {
  switch (type) {
    case 'color':
      return parseCssColor(css);
    case 'dimension':
      return parseCssDimension(css);
    case 'border':
      return parseCssBorder(css);
  }
};
