import { logErrorMessageOnce } from '../../model/utils';
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
        if (!reinterpretationElement) {
            reinterpretationElement = document.createElement('span');
            document.body.appendChild(reinterpretationElement);
        }
        reinterpretationElement.style.backgroundColor = '';
        reinterpretationElement.style.backgroundColor = `color-mix(in srgb, transparent, ${value} 100%)`;
        if (!reinterpretationElement.style.backgroundColor) return null;
        const srgbColor = getComputedStyle(reinterpretationElement).backgroundColor;
        const parsed = RGBAColor.parseCss(srgbColor);
        if (parsed) return parsed;
        const valueJSON = JSON.stringify(value);
        logErrorMessageOnce(
            `The color ${valueJSON} is valid CSS but converts to "${srgbColor}" which isn't an rgb color expression`
        );
        return null;
    }
}

let reinterpretationElement: HTMLElement | null = null;
