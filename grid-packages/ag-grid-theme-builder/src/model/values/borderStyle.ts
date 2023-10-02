export const allBorderStyles = [
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
] as const;

export type BorderStyle = (typeof allBorderStyles)[number];

export type BorderStyleValue = {
  type: 'borderStyle';
  lineStyle: BorderStyle;
};

export const borderStyle = (lineStyle: BorderStyle): BorderStyleValue => ({
  type: 'borderStyle',
  lineStyle,
});

const borderStyleSet = new Set<string>(allBorderStyles);

export const isValidBorderStyle = (value: string): value is BorderStyle =>
  borderStyleSet.has(value);

export const parseCssBorderStyle = (css: string): BorderStyleValue | null => {
  return isValidBorderStyle(css) ? borderStyle(css) : null;
};

export const borderStyleToCss = ({ lineStyle }: BorderStyleValue): string => lineStyle;
