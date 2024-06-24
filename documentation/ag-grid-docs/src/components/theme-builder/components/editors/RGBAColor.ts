import { logErrorMessageOnce, reinterpretCSSValue } from '../../model/utils';
import { int, proportionToHex2 } from './color-editor-utils';

export class RGBAColor {
    constructor(
        public r: number,
        public g: number,
        public b: number,
        public a = 1
    ) {}

    toCSSFunction(): string {
        const r = int(this.r, 255);
        const g = int(this.g, 255);
        const b = int(this.b, 255);
        return this.a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${this.a})`;
    }

    toCSSHex(): string {
        let hex = '#' + proportionToHex2(this.r) + proportionToHex2(this.g) + proportionToHex2(this.b);
        if (this.a < 1) {
            hex += proportionToHex2(this.a);
        }
        return hex;
    }

    equals(other: RGBAColor): boolean {
        return this.a === other.a && this.r === other.r && this.g === other.g && this.b === other.b;
    }

    withAlpha(a: number): RGBAColor {
        return new RGBAColor(this.r, this.g, this.b, a);
    }

    grayscale() {
        return (this.r + this.g + this.b) / 3;
    }

    static fromRGBA({ r, g, b, a }: { r: number; g: number; b: number; a: number }) {
        return new RGBAColor(r, g, b, a);
    }

    static parseCss(css: string): RGBAColor | null {
        css = css.trim().toLowerCase();
        if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/.test(css)) {
            const hex = css.slice(1);
            const r = parseInt(hex.slice(0, 2), 16) / 255;
            const g = parseInt(hex.slice(2, 4), 16) / 255;
            const b = parseInt(hex.slice(4, 6), 16) / 255;
            const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
            return new RGBAColor(r, g, b, a);
        }
        if (/^#[0-9a-f]{3}([0-9a-f]{4})?$/.test(css)) {
            const hex = css.slice(1);
            const r = parseInt(hex.slice(0, 1), 16) / 255;
            const g = parseInt(hex.slice(1, 2), 16) / 255;
            const b = parseInt(hex.slice(2, 3), 16) / 255;
            const a = hex.length === 4 ? parseInt(hex.slice(3, 4), 16) / 255 : 1;
            return new RGBAColor(r, g, b, a);
        }
        const numbers = Array.from(css.matchAll(/[\d.%-]+/g)).map(([m]) =>
            m.endsWith('%') ? parseFloat(m) / 100 : parseFloat(m)
        );
        if (numbers.find(isNaN)) return null;
        const [r, g, b, a = 1] = numbers;
        if (/^color\(srgb/.test(css)) {
            return new RGBAColor(r, g, b, a);
        }
        if (/^rgba?\(/.test(css)) {
            return new RGBAColor(r / 255, g / 255, b / 255, a);
        }
        return null;
    }

    /**
     * Given any CSS expression, including var() and color-mix(), get the browser to
     * transform it to a RGBA colour.
     */
    static reinterpretCss(value: string): RGBAColor | null {
        const srgbColor = reinterpretCSSValue(`color-mix(in srgb, transparent, ${value} 100%)`, 'color');
        if (!srgbColor) return null;
        const parsed = RGBAColor.parseCss(srgbColor);
        if (parsed) return parsed;
        logErrorMessageOnce(
            `The color ${JSON.stringify(value)} is valid CSS but converts to "${srgbColor}" which isn't an rgb color expression`
        );
        return null;
    }
}
