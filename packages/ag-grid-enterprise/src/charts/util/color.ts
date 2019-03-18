/**
 * Every color component should be in the [0, 1] range.
 * Some easing functions (such as elastic easing) can overshoot the target value by some amount.
 * So, when animating colors, if the source or target color components are already near
 * or at the edge of the allowed [0, 1] range, it is possible for the intermediate color
 * component value to end up outside of that range mid-animation. The range checking/constraining
 * should thus be handled by the code responsible for the animation.
 */
export class Color {

    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;

    constructor(r: number, g: number, b: number, a: number = 1) {
        if (r < 0 || r > 1 || isNaN(r) || !isFinite(r)) {
            new Error(`The red component (${r}) should be in the [0, 1] range.`);
        }
        if (g < 0 || g > 1 || isNaN(g) || !isFinite(g)) {
            new Error(`The green component (${g}) should be in the [0, 1] range.`);
        }
        if (b < 0 || b > 1 || isNaN(b) || !isFinite(b)) {
            new Error(`The blue component (${b}) should be in the [0, 1] range.`);
        }
        if (a < 0 || a > 1 || isNaN(a) || !isFinite(a)) {
            new Error(`The alpha component (${a}) should be in the [0, 1] range.`);
        }
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    /**
     * The given string can be in one of the following formats:
     * - #rgb
     * - #rrggbb
     * - rgb(r, g, b)
     * - rgba(r, g, b, a)
     * - CSS color name such as 'white', 'orange', 'cyan', etc.
     * @param str
     */
    // static fromString(str: string): Color {
    //     // const hex = Color.nameToHex[str];
    //     // if (hex) {
    //     //     return Color.nameToHex[str]
    //     // }
    // }

    // See https://drafts.csswg.org/css-color/#hex-notation
    static hexRe34 = /\s*#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?\s*/;
    static hexRe68 = /\s*#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?\s*/;

    static fromHexString(str: string): Color {
        const n = str && str.length;

        if (n && str[0] === '#' && (n === 4 || n === 5 || n === 7 || n === 9)) {
            if (n === 4 || n === 5) {
                const values = str.match(Color.hexRe34);
                console.log(values);
            } else if (n === 7 || n === 9) {
                const values = str.match(Color.hexRe68);
                console.log(values);
            }
        }
        return new Color(1,1,1); // TODO: remove this
        throw new Error('Malformed hexadecimal color string.');
    }

    static fromArray(arr: number[]): Color {
        if (arr.length > 3) {
            return new Color(arr[0], arr[1], arr[2], arr[3]);
        }
        if (arr.length > 2) {
            return new Color(arr[0], arr[1], arr[2]);
        }
        throw new Error('The given array should contain at least 3 numbers.');
    }

    toHexString(): string {
        return '#'
            + Math.round(this.r * 255).toString(16)
            + Math.round(this.g * 255).toString(16)
            + Math.round(this.b * 255).toString(16);
    }

    toRgbaString(): string {
        const components: number[] = [
            Math.round(this.r * 255),
            Math.round(this.g * 255),
            Math.round(this.b * 255)
        ];

        if (this.a !== 1) {
            components.push(this.a);
            return `rgba(${components.join(', ')})`;
        }

        return `rgb(${components.join(', ')})`;
    }

    toString(): string {
        if (this.a === 1) {
            return this.toHexString();
        }
        return this.toRgbaString();
    }

    /**
     * CSS Color Module Level 4:
     * https://drafts.csswg.org/css-color/#named-colors
     */
    static nameToHex: { [key: string]: string } = Object.freeze({
        aliceblue: '#F0F8FF',
        antiquewhite: '#FAEBD7',
        aqua: '#00FFFF',
        aquamarine: '#7FFFD4',
        azure: '#F0FFFF',
        beige: '#F5F5DC',
        bisque: '#FFE4C4',
        black: '#000000',
        blanchedalmond: '#FFEBCD',
        blue: '#0000FF',
        blueviolet: '#8A2BE2',
        brown: '#A52A2A',
        burlywood: '#DEB887',
        cadetblue: '#5F9EA0',
        chartreuse: '#7FFF00',
        chocolate: '#D2691E',
        coral: '#FF7F50',
        cornflowerblue: '#6495ED',
        cornsilk: '#FFF8DC',
        crimson: '#DC143C',
        cyan: '#00FFFF',
        darkblue: '#00008B',
        darkcyan: '#008B8B',
        darkgoldenrod: '#B8860B',
        darkgray: '#A9A9A9',
        darkgreen: '#006400',
        darkgrey: '#A9A9A9',
        darkkhaki: '#BDB76B',
        darkmagenta: '#8B008B',
        darkolivegreen: '#556B2F',
        darkorange: '#FF8C00',
        darkorchid: '#9932CC',
        darkred: '#8B0000',
        darksalmon: '#E9967A',
        darkseagreen: '#8FBC8F',
        darkslateblue: '#483D8B',
        darkslategray: '#2F4F4F',
        darkslategrey: '#2F4F4F',
        darkturquoise: '#00CED1',
        darkviolet: '#9400D3',
        deeppink: '#FF1493',
        deepskyblue: '#00BFFF',
        dimgray: '#696969',
        dimgrey: '#696969',
        dodgerblue: '#1E90FF',
        firebrick: '#B22222',
        floralwhite: '#FFFAF0',
        forestgreen: '#228B22',
        fuchsia: '#FF00FF',
        gainsboro: '#DCDCDC',
        ghostwhite: '#F8F8FF',
        gold: '#FFD700',
        goldenrod: '#DAA520',
        gray: '#808080',
        green: '#008000',
        greenyellow: '#ADFF2F',
        grey: '#808080',
        honeydew: '#F0FFF0',
        hotpink: '#FF69B4',
        indianred: '#CD5C5C',
        indigo: '#4B0082',
        ivory: '#FFFFF0',
        khaki: '#F0E68C',
        lavender: '#E6E6FA',
        lavenderblush: '#FFF0F5',
        lawngreen: '#7CFC00',
        lemonchiffon: '#FFFACD',
        lightblue: '#ADD8E6',
        lightcoral: '#F08080',
        lightcyan: '#E0FFFF',
        lightgoldenrodyellow: '#FAFAD2',
        lightgray: '#D3D3D3',
        lightgreen: '#90EE90',
        lightgrey: '#D3D3D3',
        lightpink: '#FFB6C1',
        lightsalmon: '#FFA07A',
        lightseagreen: '#20B2AA',
        lightskyblue: '#87CEFA',
        lightslategray: '#778899',
        lightslategrey: '#778899',
        lightsteelblue: '#B0C4DE',
        lightyellow: '#FFFFE0',
        lime: '#00FF00',
        limegreen: '#32CD32',
        linen: '#FAF0E6',
        magenta: '#FF00FF',
        maroon: '#800000',
        mediumaquamarine: '#66CDAA',
        mediumblue: '#0000CD',
        mediumorchid: '#BA55D3',
        mediumpurple: '#9370DB',
        mediumseagreen: '#3CB371',
        mediumslateblue: '#7B68EE',
        mediumspringgreen: '#00FA9A',
        mediumturquoise: '#48D1CC',
        mediumvioletred: '#C71585',
        midnightblue: '#191970',
        mintcream: '#F5FFFA',
        mistyrose: '#FFE4E1',
        moccasin: '#FFE4B5',
        navajowhite: '#FFDEAD',
        navy: '#000080',
        oldlace: '#FDF5E6',
        olive: '#808000',
        olivedrab: '#6B8E23',
        orange: '#FFA500',
        orangered: '#FF4500',
        orchid: '#DA70D6',
        palegoldenrod: '#EEE8AA',
        palegreen: '#98FB98',
        paleturquoise: '#AFEEEE',
        palevioletred: '#DB7093',
        papayawhip: '#FFEFD5',
        peachpuff: '#FFDAB9',
        peru: '#CD853F',
        pink: '#FFC0CB',
        plum: '#DDA0DD',
        powderblue: '#B0E0E6',
        purple: '#800080',
        rebeccapurple: '#663399',
        red: '#FF0000',
        rosybrown: '#BC8F8F',
        royalblue: '#4169E1',
        saddlebrown: '#8B4513',
        salmon: '#FA8072',
        sandybrown: '#F4A460',
        seagreen: '#2E8B57',
        seashell: '#FFF5EE',
        sienna: '#A0522D',
        silver: '#C0C0C0',
        skyblue: '#87CEEB',
        slateblue: '#6A5ACD',
        slategray: '#708090',
        slategrey: '#708090',
        snow: '#FFFAFA',
        springgreen: '#00FF7F',
        steelblue: '#4682B4',
        tan: '#D2B48C',
        teal: '#008080',
        thistle: '#D8BFD8',
        tomato: '#FF6347',
        turquoise: '#40E0D0',
        violet: '#EE82EE',
        wheat: '#F5DEB3',
        white: '#FFFFFF',
        whitesmoke: '#F5F5F5',
        yellow: '#FFFF00',
        yellowgreen: '#9ACD32'
    });
}
