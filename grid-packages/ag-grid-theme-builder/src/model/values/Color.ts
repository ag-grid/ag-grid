import ColorLib from 'color';
import { clamp } from 'model/utils';
import { AbstractValue } from './AbstractValue';

export class Color extends AbstractValue {
  readonly type = 'color' as const;

  constructor(
    readonly r: number,
    readonly g: number,
    readonly b: number,
    readonly a: number,
  ) {
    super();
    this.r = clamp(r, 0, 1);
    this.g = clamp(g, 0, 1);
    this.b = clamp(b, 0, 1);
    this.a = clamp(a, 0, 1);
  }

  toCss(): string {
    const r = Math.round(this.r * 255);
    const g = Math.round(this.g * 255);
    const b = Math.round(this.b * 255);
    const a = Math.floor(this.a * 100) / 100;
    return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  describe(): string {
    return this.a === 0 ? 'transparent' : this.toCss();
  }

  isTransparent() {
    return this.a === 0;
  }

  static parseCss(css: string): Color | null {
    try {
      const match = css.match(
        /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:[\s/]+([\d.]+))?\)$/,
      );
      if (match) {
        const r = parseFloat(match[1]);
        const g = parseFloat(match[2]);
        const b = parseFloat(match[3]);
        const a = parseFloat(match[4] || '1');
        if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
          return null;
        }
        return new Color(r, g, b, a);
      }
      const parsed = ColorLib(css);
      return new Color(
        parsed.red() / 255,
        parsed.green() / 255,
        parsed.blue() / 255,
        parsed.alpha(),
      );
    } catch {
      return null;
    }
  }
}
