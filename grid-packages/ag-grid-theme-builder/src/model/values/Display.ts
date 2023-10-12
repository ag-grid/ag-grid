import { AbstractValue } from './AbstractValue';

export type DisplayToken = 'block' | 'none';

export class Display extends AbstractValue {
  readonly type = 'display' as const;

  constructor(readonly display: DisplayToken) {
    super();
  }

  toCss(): string {
    return this.display;
  }

  static parseCss(css: string): Display | null {
    return css === 'block' || css === 'none' ? new Display(css) : null;
  }
}
