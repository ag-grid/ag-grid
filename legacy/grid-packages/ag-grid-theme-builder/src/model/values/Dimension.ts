import { AbstractValue } from './AbstractValue';

export class Dimension extends AbstractValue {
  readonly type = 'dimension' as const;

  constructor(
    readonly number: number,
    readonly units: string,
  ) {
    super();
  }

  toCss(): string {
    return this.number + (this.units || '');
  }

  static parseCss(css: string): Dimension | null {
    css = css.toLowerCase();
    const [, numberString, unit] = css.match(numberWithUnits) || [];
    const number = parseFloat(numberString);
    if (isNaN(number)) return null;
    if (!unit && number !== 0) return null;
    return new Dimension(number, unit);
  }
}

const numberWithUnits = /^([\d.]+)(\w*|%)$/;
