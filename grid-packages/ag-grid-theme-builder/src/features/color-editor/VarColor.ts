export class VarColor {
  constructor(
    public variable: string,
    public alpha: number,
  ) {}

  static parseCss(css: string): VarColor | null {
    css = css.trim().toLowerCase();
    const simpleVar = parseVarExpression(css);
    if (simpleVar) {
      return new VarColor(simpleVar, 1);
    }
    const mixMatch = css.match(
      /^color-mix\(\s*in\s+srgb\s*,\s*transparent\s*,(.+)\s([\d.]+)%\s*\)/,
    );
    if (mixMatch) {
      const [, varMatch, bPercent] = mixMatch;
      const alpha = parseFloat(bPercent) / 100;
      if (isNaN(alpha)) return null;
      const variable = parseVarExpression(varMatch);
      if (!variable) return null;
      return new VarColor(variable, alpha);
    }
    return null;
  }

  toCSSFunction() {
    return `color-mix(in srgb, transparent, var(${this.variable}) ${this.alpha * 100}%)`;
  }
}

const parseVarExpression = (css: string): string | null =>
  css.trim().match(/^var\(\s*(--[\w-]+)\s*\)/)?.[1] ?? null;
