// A port of the AG Charts `Color` class, limited to what the colour picker widgets use.
// Parsing must stay identical: the colour input validates free text with `validColorString`.

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

const NAME_TO_HEX = new Map<string, string>([
    ['aliceblue', '#F0F8FF'],
    ['antiquewhite', '#FAEBD7'],
    ['aqua', '#00FFFF'],
    ['aquamarine', '#7FFFD4'],
    ['azure', '#F0FFFF'],
    ['beige', '#F5F5DC'],
    ['bisque', '#FFE4C4'],
    ['black', '#000000'],
    ['blanchedalmond', '#FFEBCD'],
    ['blue', '#0000FF'],
    ['blueviolet', '#8A2BE2'],
    ['brown', '#A52A2A'],
    ['burlywood', '#DEB887'],
    ['cadetblue', '#5F9EA0'],
    ['chartreuse', '#7FFF00'],
    ['chocolate', '#D2691E'],
    ['coral', '#FF7F50'],
    ['cornflowerblue', '#6495ED'],
    ['cornsilk', '#FFF8DC'],
    ['crimson', '#DC143C'],
    ['cyan', '#00FFFF'],
    ['darkblue', '#00008B'],
    ['darkcyan', '#008B8B'],
    ['darkgoldenrod', '#B8860B'],
    ['darkgray', '#A9A9A9'],
    ['darkgreen', '#006400'],
    ['darkgrey', '#A9A9A9'],
    ['darkkhaki', '#BDB76B'],
    ['darkmagenta', '#8B008B'],
    ['darkolivegreen', '#556B2F'],
    ['darkorange', '#FF8C00'],
    ['darkorchid', '#9932CC'],
    ['darkred', '#8B0000'],
    ['darksalmon', '#E9967A'],
    ['darkseagreen', '#8FBC8F'],
    ['darkslateblue', '#483D8B'],
    ['darkslategray', '#2F4F4F'],
    ['darkslategrey', '#2F4F4F'],
    ['darkturquoise', '#00CED1'],
    ['darkviolet', '#9400D3'],
    ['deeppink', '#FF1493'],
    ['deepskyblue', '#00BFFF'],
    ['dimgray', '#696969'],
    ['dimgrey', '#696969'],
    ['dodgerblue', '#1E90FF'],
    ['firebrick', '#B22222'],
    ['floralwhite', '#FFFAF0'],
    ['forestgreen', '#228B22'],
    ['fuchsia', '#FF00FF'],
    ['gainsboro', '#DCDCDC'],
    ['ghostwhite', '#F8F8FF'],
    ['gold', '#FFD700'],
    ['goldenrod', '#DAA520'],
    ['gray', '#808080'],
    ['green', '#008000'],
    ['greenyellow', '#ADFF2F'],
    ['grey', '#808080'],
    ['honeydew', '#F0FFF0'],
    ['hotpink', '#FF69B4'],
    ['indianred', '#CD5C5C'],
    ['indigo', '#4B0082'],
    ['ivory', '#FFFFF0'],
    ['khaki', '#F0E68C'],
    ['lavender', '#E6E6FA'],
    ['lavenderblush', '#FFF0F5'],
    ['lawngreen', '#7CFC00'],
    ['lemonchiffon', '#FFFACD'],
    ['lightblue', '#ADD8E6'],
    ['lightcoral', '#F08080'],
    ['lightcyan', '#E0FFFF'],
    ['lightgoldenrodyellow', '#FAFAD2'],
    ['lightgray', '#D3D3D3'],
    ['lightgreen', '#90EE90'],
    ['lightgrey', '#D3D3D3'],
    ['lightpink', '#FFB6C1'],
    ['lightsalmon', '#FFA07A'],
    ['lightseagreen', '#20B2AA'],
    ['lightskyblue', '#87CEFA'],
    ['lightslategray', '#778899'],
    ['lightslategrey', '#778899'],
    ['lightsteelblue', '#B0C4DE'],
    ['lightyellow', '#FFFFE0'],
    ['lime', '#00FF00'],
    ['limegreen', '#32CD32'],
    ['linen', '#FAF0E6'],
    ['magenta', '#FF00FF'],
    ['maroon', '#800000'],
    ['mediumaquamarine', '#66CDAA'],
    ['mediumblue', '#0000CD'],
    ['mediumorchid', '#BA55D3'],
    ['mediumpurple', '#9370DB'],
    ['mediumseagreen', '#3CB371'],
    ['mediumslateblue', '#7B68EE'],
    ['mediumspringgreen', '#00FA9A'],
    ['mediumturquoise', '#48D1CC'],
    ['mediumvioletred', '#C71585'],
    ['midnightblue', '#191970'],
    ['mintcream', '#F5FFFA'],
    ['mistyrose', '#FFE4E1'],
    ['moccasin', '#FFE4B5'],
    ['navajowhite', '#FFDEAD'],
    ['navy', '#000080'],
    ['oldlace', '#FDF5E6'],
    ['olive', '#808000'],
    ['olivedrab', '#6B8E23'],
    ['orange', '#FFA500'],
    ['orangered', '#FF4500'],
    ['orchid', '#DA70D6'],
    ['palegoldenrod', '#EEE8AA'],
    ['palegreen', '#98FB98'],
    ['paleturquoise', '#AFEEEE'],
    ['palevioletred', '#DB7093'],
    ['papayawhip', '#FFEFD5'],
    ['peachpuff', '#FFDAB9'],
    ['peru', '#CD853F'],
    ['pink', '#FFC0CB'],
    ['plum', '#DDA0DD'],
    ['powderblue', '#B0E0E6'],
    ['purple', '#800080'],
    ['rebeccapurple', '#663399'],
    ['red', '#FF0000'],
    ['rosybrown', '#BC8F8F'],
    ['royalblue', '#4169E1'],
    ['saddlebrown', '#8B4513'],
    ['salmon', '#FA8072'],
    ['sandybrown', '#F4A460'],
    ['seagreen', '#2E8B57'],
    ['seashell', '#FFF5EE'],
    ['sienna', '#A0522D'],
    ['silver', '#C0C0C0'],
    ['skyblue', '#87CEEB'],
    ['slateblue', '#6A5ACD'],
    ['slategray', '#708090'],
    ['slategrey', '#708090'],
    ['snow', '#FFFAFA'],
    ['springgreen', '#00FF7F'],
    ['steelblue', '#4682B4'],
    ['tan', '#D2B48C'],
    ['teal', '#008080'],
    ['thistle', '#D8BFD8'],
    ['tomato', '#FF6347'],
    ['transparent', '#00000000'],
    ['turquoise', '#40E0D0'],
    ['violet', '#EE82EE'],
    ['wheat', '#F5DEB3'],
    ['white', '#FFFFFF'],
    ['whitesmoke', '#F5F5F5'],
    ['yellow', '#FFFF00'],
    ['yellowgreen', '#9ACD32'],
]);

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
     * Accepts #rgb, #rgba, #rrggbb, #rrggbbaa, rgb()/rgba(), hsl()/hsla(), oklch() and CSS colour names.
     * `oklab()`, `lab()`, `lch()` and `color()` are not supported.
     */
    public static validColorString(str: string): boolean {
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
        return NAME_TO_HEX.has(token);
    }

    /** Parses the formats `validColorString` accepts; throws on anything else. */
    public static fromString(str: string): AgColor {
        if (str.includes('#')) {
            return fromHexString(str);
        }
        const token = str.toLowerCase();
        const hex = NAME_TO_HEX.get(token);
        if (hex != null) {
            return fromHexString(hex);
        }
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
