import { AbstractValue } from './AbstractValue';
import { BorderStyle } from './BorderStyle';
import { Color } from './Color';
import { Dimension } from './Dimension';

export class Border extends AbstractValue {
  readonly type = 'border' as const;
  constructor(
    readonly style: BorderStyle | null,
    readonly width: Dimension | null,
    readonly color: Color | null,
  ) {
    super();
  }

  toCss(): string {
    if (this.style?.lineStyle === 'none') return 'none';
    return [this.style?.toCss(), this.width?.toCss(), this.color?.toCss()]
      .filter(Boolean)
      .join(' ');
  }

  describe(): string {
    if (this.style?.lineStyle === 'none') return 'none';
    return [this.style?.describe(), this.width?.describe(), this.color?.describe()]
      .filter(Boolean)
      .join(' ');
  }

  static parseCss(css: string): Border | null {
    let style: BorderStyle | null = null;
    let width: Dimension | null = null;
    let color: Color | null = null;
    for (const word of css.trim().split(/\s+/g)) {
      const parsedStyle = BorderStyle.parseCss(word);
      if (parsedStyle != null) {
        style = parsedStyle;
        continue;
      }
      const parsedWidth = Dimension.parseCss(word);
      if (parsedWidth != null) {
        width = parsedWidth;
        continue;
      }
      const parsedColor = Color.parseCss(word);
      if (parsedColor != null) {
        color = parsedColor;
        continue;
      }
      return null;
    }
    return new Border(style, width, color);
  }
}
