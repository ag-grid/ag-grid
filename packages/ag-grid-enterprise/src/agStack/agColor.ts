// A port of the AG Charts `Color` class, limited to what the colour picker widgets and the custom theme heatmap
// mini chart use. Parsing must stay identical: the colour input validates free text with `validColorString`.
// CSS colour names are resolved by the browser, in the grid's document, rather than a lookup table.
import { _createElement } from 'ag-grid-community';

const clamp = (min: number, value: number, max: number): number => Math.min(max, Math.max(min, value));

const clampUnit = (value: number): number => clamp(0, Number.isNaN(value) ? 0 : value, 1);

const srgbFromLinear = (value: number): number => {
    const sign = value < 0 ? -1 : 1;
    const abs = Math.abs(value);
    if (abs > 0.0031308) {
        return sign * (1.055 * abs ** (1 / 2.4) - 0.055);
    }
    return 12.92 * value;
};

/** Keywords `style.color` accepts that are not colours in their own right. */
const NON_COLOR_KEYWORDS = new Set(['currentcolor', 'inherit', 'initial', 'unset', 'revert']);

/**
 * Resolves a CSS colour through the browser, by computing the `color` of a probe element inside `container`.
 * A `var()` value the browser rejects is still computed, inheriting the container's colour.
 * @returns The computed colour (`rgb()` / `rgba()` for any colour the browser knows), or `''` when invalid.
 */
export function _resolveCssColor(value: string, container: HTMLElement): string {
    const probe = _createElement({ tag: 'span' });
    probe.style.color = value;
    if (!probe.style.color && !/\bvar\(/i.test(value)) {
        return '';
    }
    // keep the probe off-screen to avoid layout impact while still letting the browser resolve the colour.
    probe.style.position = 'absolute';
    probe.style.left = '-99999px';
    probe.style.top = '-99999px';
    probe.style.visibility = 'hidden';

    container.appendChild(probe);
    const computed = getComputedStyle(probe).color;
    probe.remove();
    return computed || '';
}

/** A CSS colour name (or system colour) resolved by the browser to rgba components in [0, 1]. */
function namedColorToRgba(name: string, doc: Document): number[] | undefined {
    if (!/^[a-z]+$/i.test(name) || NON_COLOR_KEYWORDS.has(name.toLowerCase())) {
        return;
    }
    const rgba = stringToRgba(_resolveCssColor(name, doc.body));
    if (rgba?.length === 3 || rgba?.length === 4) {
        return rgba;
    }
}

// See https://drafts.csswg.org/css-color/#hex-notation
function parseHex(input: string): number[] | undefined {
    input = input.replaceAll(' ', '').slice(1);
    let parts: number[] | undefined;
    switch (input.length) {
        case 6:
        case 8:
            parts = [];
            for (let i = 0; i < input.length; i += 2) {
                parts.push(Number.parseInt(`${input[i]}${input[i + 1]}`, 16));
            }
            break;
        case 3:
        case 4:
            parts = input
                .split('')
                .map((p) => Number.parseInt(p, 16))
                .map((p) => p + p * 16);
            break;
    }
    if (parts && parts.length >= 3 && parts.every((p) => p >= 0)) {
        if (parts.length === 3) {
            parts.push(255);
        }
        return parts;
    }
}

/** Splits the contents of `fn(a b c / d)` or `fn(a, b, c, d)` into its parts. */
function splitFunctionArgs(str: string): string[] | undefined {
    const po = str.indexOf('(');
    const pc = str.indexOf(')');
    if (po === -1 || pc === -1 || pc < po) {
        return;
    }
    const contents = str.substring(po + 1, pc);
    const slash = contents.indexOf('/');
    const head = slash === -1 ? contents : contents.substring(0, slash);
    const parts = head.trim().split(/[\s,]+/);
    if (slash !== -1) {
        parts.push(contents.substring(slash + 1).trim());
    }
    return parts;
}

function stringToRgba(str: string): number[] | undefined {
    const parts = splitFunctionArgs(str);
    if (!parts) {
        return;
    }
    const rgba: number[] = [];
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        let value = Number.parseFloat(part);
        if (!Number.isFinite(value)) {
            return;
        }
        if (part.includes('%')) {
            value = clamp(0, value, 100) / 100;
        } else if (i === 3) {
            value = clamp(0, value, 1);
        } else {
            value = clamp(0, value, 255) / 255;
        }
        rgba.push(value);
    }
    return rgba;
}

function parseHueDegrees(part: string): number | undefined {
    const value = Number.parseFloat(part);
    if (!Number.isFinite(value)) {
        return;
    }
    if (part.includes('turn')) {
        return value * 360;
    }
    if (part.includes('grad')) {
        return value * 0.9;
    }
    if (part.includes('rad')) {
        return (value * 180) / Math.PI;
    }
    return value;
}

/** Saturation and lightness: a bare number shares the percentage range (`50` is `50%`). */
function parsePercentage(part: string): number | undefined {
    const value = Number.parseFloat(part);
    if (!Number.isFinite(value)) {
        return;
    }
    return clamp(0, value / 100, 1);
}

/** Alpha or OKLCH lightness: a bare number is already in [0, 1]; a percentage divides by 100. */
function parseUnitInterval(part: string): number | undefined {
    const value = Number.parseFloat(part);
    if (!Number.isFinite(value)) {
        return;
    }
    return clamp(0, part.includes('%') ? value / 100 : value, 1);
}

/** OKLCH chroma is unbounded and non-negative; 100% maps to 0.4. */
function parseOklchChroma(part: string): number | undefined {
    const value = Number.parseFloat(part);
    if (!Number.isFinite(value)) {
        return;
    }
    return Math.max(0, part.includes('%') ? (value / 100) * 0.4 : value);
}

/** Parses hsl()/oklch() arguments: three components plus an optional alpha. */
function stringToThreeComponents(
    str: string,
    parsers: [
        (part: string) => number | undefined,
        (part: string) => number | undefined,
        (part: string) => number | undefined,
    ]
): number[] | undefined {
    const parts = splitFunctionArgs(str);
    if (!parts || parts.length < 3 || parts.length > 4) {
        return;
    }
    const values: number[] = [];
    for (let i = 0; i < 3; i++) {
        const value = parsers[i](parts[i]);
        if (value === undefined) {
            return;
        }
        values.push(value);
    }
    if (parts.length === 4) {
        const a = parseUnitInterval(parts[3]);
        if (a === undefined) {
            return;
        }
        values.push(a);
    }
    return values;
}

const stringToHsla = (str: string) => stringToThreeComponents(str, [parseHueDegrees, parsePercentage, parsePercentage]);

const stringToOklcha = (str: string) =>
    stringToThreeComponents(str, [parseUnitInterval, parseOklchChroma, parseHueDegrees]);

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h = ((h % 360) + 360) % 360;
    if (s === 0) {
        return [l, l, l];
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hueToRgb = (t: number): number => {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    };
    return [hueToRgb(h / 360 + 1 / 3), hueToRgb(h / 360), hueToRgb(h / 360 - 1 / 3)];
}

function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
    const a = c * Math.cos((h * Math.PI) / 180);
    const b = c * Math.sin((h * Math.PI) / 180);
    const lms0 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const lms1 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const lms2 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [
        srgbFromLinear(4.0767416621 * lms0 - 3.3077115913 * lms1 + 0.2309699292 * lms2),
        srgbFromLinear(-1.2684380046 * lms0 + 2.6097574011 * lms1 - 0.3413193965 * lms2),
        srgbFromLinear(-0.0041960863 * lms0 - 0.7034186147 * lms1 + 1.707614701 * lms2),
    ];
}

function hsbToRgb(h: number, s: number, v: number): [number, number, number] {
    h = (((h % 360) + 360) % 360) / 360;
    if (s === 0) {
        return [v, v, v];
    }
    const sector = (h - Math.floor(h)) * 6;
    const f = sector - Math.floor(sector);
    const p = v * (1 - s);
    const q = v * (1 - s * f);
    const t = v * (1 - s * (1 - f));
    switch (Math.trunc(sector)) {
        case 0:
            return [v, t, p];
        case 1:
            return [q, v, p];
        case 2:
            return [p, v, t];
        case 3:
            return [p, q, v];
        case 4:
            return [t, p, v];
        case 5:
            return [v, p, q];
    }
    return [0, 0, 0];
}

const padHex = (value: number): string => {
    const str = Math.round(value * 255).toString(16);
    return str.length === 1 ? '0' + str : str;
};

export class AgColor {
    public readonly r: number;
    public readonly g: number;
    public readonly b: number;
    public readonly a: number;

    /** Components are clamped to [0, 1]; NaN becomes 0. */
    constructor(r: number, g: number, b: number, a = 1) {
        this.r = clampUnit(r);
        this.g = clampUnit(g);
        this.b = clampUnit(b);
        this.a = clampUnit(a);
    }

    /**
     * Accepts #rgb, #rgba, #rrggbb, #rrggbbaa, rgb()/rgba(), hsl()/hsla(), oklch(), CSS colour names and
     * system colours. `currentcolor` and the CSS-wide keywords are rejected.
     * `oklab()`, `lab()`, `lch()` and `color()` are not supported.
     * @param doc - The document colour names resolve in: the one the grid is rendered in.
     */
    public static validColorString(str: string, doc: Document): boolean {
        if (str.includes('#')) {
            return !!parseHex(str);
        }
        const token = str.toLowerCase();
        if (token.includes('hsl')) {
            return !!stringToHsla(str);
        }
        if (token.includes('oklch')) {
            return !!stringToOklcha(str);
        }
        if (token.includes('rgb')) {
            const rgba = stringToRgba(str);
            return rgba != null && (rgba.length === 3 || rgba.length === 4);
        }
        return !!namedColorToRgba(str, doc);
    }

    /** Parses the formats `validColorString` accepts; throws on anything else. */
    public static fromString(str: string, doc: Document): AgColor {
        if (str.includes('#')) {
            return fromHexString(str);
        }
        const token = str.toLowerCase();
        if (token.includes('hsl')) {
            const hsla = stringToHsla(str);
            if (hsla) {
                const [h, s, l, a = 1] = hsla;
                const [r, g, b] = hslToRgb(h, s, l);
                return new AgColor(r, g, b, a);
            }
            throw new Error(`Malformed hsl/hsla color string: '${str}'`);
        }
        if (token.includes('oklch')) {
            const oklcha = stringToOklcha(str);
            if (oklcha) {
                const [l, c, h, a = 1] = oklcha;
                const [r, g, b] = oklchToRgb(l, c, h);
                return new AgColor(r, g, b, a);
            }
            throw new Error(`Malformed oklch color string: '${str}'`);
        }
        if (token.includes('rgb')) {
            const rgba = stringToRgba(str);
            if (rgba && (rgba.length === 3 || rgba.length === 4)) {
                const [r, g, b, a = 1] = rgba;
                return new AgColor(r, g, b, a);
            }
            throw new Error(`Malformed rgb/rgba color string: '${str}'`);
        }
        const named = namedColorToRgba(str, doc);
        if (named) {
            const [r, g, b, a = 1] = named;
            return new AgColor(r, g, b, a);
        }
        throw new Error(`Invalid color string: '${str}'`);
    }

    /** Hue in degrees; saturation, brightness and alpha in [0, 1]. */
    public static fromHSB(h: number, s: number, b: number, alpha = 1): AgColor {
        const [red, green, blue] = hsbToRgb(h, s, b);
        return new AgColor(red, green, blue, alpha);
    }

    /** `#rrggbb`, plus an alpha pair when not opaque. */
    public toHexString(): string {
        const hex = '#' + padHex(this.r) + padHex(this.g) + padHex(this.b);
        return this.a < 1 ? hex + padHex(this.a) : hex;
    }

    /** `rgb(r, g, b)` when opaque, else `rgba(r, g, b, a)` with alpha to 3 decimals. */
    public toRgbaString(): string {
        const components = [Math.round(this.r * 255), Math.round(this.g * 255), Math.round(this.b * 255)];
        if (this.a !== 1) {
            components.push(Math.round(this.a * 1000) / 1000);
            return `rgba(${components.join(', ')})`;
        }
        return `rgb(${components.join(', ')})`;
    }

    /** [hue in degrees, saturation, brightness]. */
    public toHSB(): [number, number, number] {
        const { r, g, b } = this;
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const s = max === 0 ? 0 : (max - min) / max;
        let h = 0;
        if (min !== max) {
            const delta = max - min;
            const rc = (max - r) / delta;
            const gc = (max - g) / delta;
            const bc = (max - b) / delta;
            if (r === max) {
                h = bc - gc;
            } else if (g === max) {
                h = 2 + rc - bc;
            } else {
                h = 4 + gc - rc;
            }
            h /= 6;
            if (h < 0) {
                h += 1;
            }
        }
        return [h * 360, s, max];
    }
}

function fromHexString(str: string): AgColor {
    const values = parseHex(str);
    if (values) {
        const [r, g, b, a] = values;
        return new AgColor(r / 255, g / 255, b / 255, a / 255);
    }
    throw new Error(`Malformed hexadecimal color string: '${str}'`);
}
