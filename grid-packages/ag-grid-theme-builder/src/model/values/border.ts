import {
  BorderStyle,
  BorderStyleValue,
  borderStyle,
  borderStyleToCss,
  parseCssBorderStyle,
} from './borderStyle';
import { ColorValue, colorToCss, parseCssColor } from './color';
import { DimensionValue, dimensionToCss, parseCssDimension } from './dimension';

export type BorderValue = {
  type: 'border';
  style?: BorderStyleValue;
  width?: DimensionValue;
  color?: ColorValue;
};

export const border = (
  style: BorderStyle | null,
  width: DimensionValue | null,
  color: ColorValue | null,
): BorderValue => {
  const value: BorderValue = { type: 'border' };
  if (style !== null) value.style = borderStyle(style);
  if (width !== null) value.width = width;
  if (color !== null) value.color = color;
  return value;
};

export const borderToCss = ({ style, width, color }: BorderValue) => {
  if (style?.lineStyle === 'none') return 'none';
  return [
    style ? borderStyleToCss(style) : '',
    width ? dimensionToCss(width) : '',
    color ? colorToCss(color) : '',
  ]
    .filter(Boolean)
    .join(' ');
};

export const parseCssBorder = (css: string): BorderValue | null => {
  const result: BorderValue = { type: 'border' };
  for (const word of splitCssList(css)) {
    const style = parseCssBorderStyle(word);
    if (style != null) {
      result.style = style;
      continue;
    }
    const width = parseCssDimension(word);
    if (width != null) {
      result.width = width;
      continue;
    }
    const color = parseCssColor(word);
    if (color != null) {
      result.color = color;
      continue;
    }
    return null;
  }
  return result;
};

// parse a css space-delimited list, which is harder than string.split(" ")
// because whitespace is allowed inside CSS function calls
export const splitCssList = (input: string): string[] => {
  input = input.trim();
  const parts: string[] = [];
  let nesting = 0;
  let lastPartStart = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '(') ++nesting;
    if (char === ')') --nesting;
    if (/\S/.test(char)) continue;
    if (nesting === 0) {
      parts.push(input.substring(lastPartStart, i));
      while (/\s/.test(input[i + 1])) ++i;
      lastPartStart = i + 1;
    }
  }
  parts.push(input.substring(lastPartStart, input.length));
  return parts;
};
