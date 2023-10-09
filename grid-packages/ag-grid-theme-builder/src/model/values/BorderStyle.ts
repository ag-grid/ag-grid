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

export type BorderStyleToken = (typeof allBorderStyles)[number];

export class BorderStyle {
  readonly type = 'borderStyle' as const;

  constructor(readonly lineStyle: BorderStyleToken) {}

  toCss(): string {
    return this.lineStyle;
  }

  static parseCss(css: string): BorderStyle | null {
    return isValidBorderStyle(css) ? new BorderStyle(css) : null;
  }
}

const borderStyleSet = new Set<string>(allBorderStyles);

export const isValidBorderStyle = (value: string): value is BorderStyleToken =>
  borderStyleSet.has(value);
