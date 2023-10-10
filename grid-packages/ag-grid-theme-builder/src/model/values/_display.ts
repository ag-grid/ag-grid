export type Display = 'block' | 'none';

export class DisplayValue {
  readonly type = 'display' as const;

  constructor(readonly display: Display) {}

  toCss(): string {
    return this.display;
  }

  static parseCss(css: string): DisplayValue | null {
    return css === 'block' || css === 'none' ? new DisplayValue(css) : null;
  }
}
