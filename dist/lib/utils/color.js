/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Color = /** @class */ (function () {
    /**
     * Every color component should be in the [0, 1] range.
     * Some easing functions (such as elastic easing) can overshoot the target value by some amount.
     * So, when animating colors, if the source or target color components are already near
     * or at the edge of the allowed [0, 1] range, it is possible for the intermediate color
     * component value to end up outside of that range mid-animation. For this reason the constructor
     * performs range checking/constraining.
     * @param r Red component.
     * @param g Green component.
     * @param b Blue component.
     * @param a Alpha (opacity) component.
     */
    function Color(r, g, b, a) {
        if (a === void 0) { a = 1; }
        // NaN is treated as 0.
        this.r = Math.min(1, Math.max(0, r || 0));
        this.g = Math.min(1, Math.max(0, g || 0));
        this.b = Math.min(1, Math.max(0, b || 0));
        this.a = Math.min(1, Math.max(0, a || 0));
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
    Color.fromString = function (str) {
        // hexadecimal notation
        if (str.indexOf('#') >= 0) { // there can be some leading whitespace
            return Color.fromHexString(str);
        }
        // color name
        var hex = Color.nameToHex[str];
        if (hex) {
            return Color.fromHexString(hex);
        }
        // rgb(a) notation
        if (str.indexOf('rgb') >= 0) {
            return Color.fromRgbaString(str);
        }
        throw new Error("Invalid color string: '" + str + "'");
    };
    // Using separate RegExp for the short hex notation because strings like `#abcd`
    // are matched as ['#abcd', 'ab', 'c', 'd', undefined] when the `{1,2}` quantifier is used.
    Color.fromHexString = function (str) {
        var values = str.match(Color.hexRe);
        if (values) {
            var r = parseInt(values[1], 16);
            var g = parseInt(values[2], 16);
            var b = parseInt(values[3], 16);
            var a = values[4] !== undefined ? parseInt(values[4], 16) : 255;
            return new Color(r / 255, g / 255, b / 255, a / 255);
        }
        values = str.match(Color.shortHexRe);
        if (values) {
            var r = parseInt(values[1], 16);
            var g = parseInt(values[2], 16);
            var b = parseInt(values[3], 16);
            var a = values[4] !== undefined ? parseInt(values[4], 16) : 15;
            r += r * 16;
            g += g * 16;
            b += b * 16;
            a += a * 16;
            return new Color(r / 255, g / 255, b / 255, a / 255);
        }
        throw new Error("Malformed hexadecimal color string: '" + str + "'");
    };
    Color.fromRgbaString = function (str) {
        var values = str.match(Color.rgbRe);
        if (values) {
            return new Color(+values[1] / 255, +values[2] / 255, +values[3] / 255);
        }
        values = str.match(Color.rgbaRe);
        if (values) {
            return new Color(+values[1] / 255, +values[2] / 255, +values[3] / 255, +values[4]);
        }
        throw new Error("Malformed rgb/rgba color string: '" + str + "'");
    };
    Color.fromArray = function (arr) {
        if (arr.length === 4) {
            return new Color(arr[0], arr[1], arr[2], arr[3]);
        }
        if (arr.length === 3) {
            return new Color(arr[0], arr[1], arr[2]);
        }
        throw new Error('The given array should contain 3 or 4 color components (numbers).');
    };
    Color.fromHSB = function (h, s, b, alpha) {
        if (alpha === void 0) { alpha = 1; }
        var rgb = Color.HSBtoRGB(h, s, b);
        return new Color(rgb[0], rgb[1], rgb[2], alpha);
    };
    Color.padHex = function (str) {
        // Can't use `padStart(2, '0')` here because of IE.
        return str.length === 1 ? '0' + str : str;
    };
    Color.prototype.toHexString = function () {
        var hex = '#'
            + Color.padHex(Math.round(this.r * 255).toString(16))
            + Color.padHex(Math.round(this.g * 255).toString(16))
            + Color.padHex(Math.round(this.b * 255).toString(16));
        if (this.a < 1) {
            hex += Color.padHex(Math.round(this.a * 255).toString(16));
        }
        return hex;
    };
    Color.prototype.toRgbaString = function (fractionDigits) {
        if (fractionDigits === void 0) { fractionDigits = 3; }
        var components = [
            Math.round(this.r * 255),
            Math.round(this.g * 255),
            Math.round(this.b * 255)
        ];
        var k = Math.pow(10, fractionDigits);
        if (this.a !== 1) {
            components.push(Math.round(this.a * k) / k);
            return "rgba(" + components.join(', ') + ")";
        }
        return "rgb(" + components.join(', ') + ")";
    };
    Color.prototype.toString = function () {
        if (this.a === 1) {
            return this.toHexString();
        }
        return this.toRgbaString();
    };
    Color.prototype.toHSB = function () {
        return Color.RGBtoHSB(this.r, this.g, this.b);
    };
    /**
     * Converts the given RGB triple to an array of HSB (HSV) components.
     * The hue component will be `NaN` for achromatic colors.
     */
    Color.RGBtoHSB = function (r, g, b) {
        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var S = max !== 0 ? (max - min) / max : 0;
        var H = NaN;
        // min == max, means all components are the same
        // and the color is a shade of gray with no hue (H is NaN)
        if (min !== max) {
            var delta = max - min;
            var rc = (max - r) / delta;
            var gc = (max - g) / delta;
            var bc = (max - b) / delta;
            if (r === max) {
                H = bc - gc;
            }
            else if (g === max) {
                H = 2.0 + rc - bc;
            }
            else {
                H = 4.0 + gc - rc;
            }
            H /= 6.0;
            if (H < 0) {
                H = H + 1.0;
            }
        }
        return [H * 360, S, max];
    };
    /**
     * Converts the given HSB (HSV) triple to an array of RGB components.
     */
    Color.HSBtoRGB = function (H, S, B) {
        if (isNaN(H)) {
            H = 0;
        }
        H = (((H % 360) + 360) % 360) / 360; // normalize hue to [0, 360] interval, then scale to [0, 1]
        var r = 0;
        var g = 0;
        var b = 0;
        if (S === 0) {
            r = g = b = B;
        }
        else {
            var h = (H - Math.floor(H)) * 6;
            var f = h - Math.floor(h);
            var p = B * (1 - S);
            var q = B * (1 - S * f);
            var t = B * (1 - (S * (1 - f)));
            switch (h >> 0) { // discard the floating point part of the number
                case 0:
                    r = B;
                    g = t;
                    b = p;
                    break;
                case 1:
                    r = q;
                    g = B;
                    b = p;
                    break;
                case 2:
                    r = p;
                    g = B;
                    b = t;
                    break;
                case 3:
                    r = p;
                    g = q;
                    b = B;
                    break;
                case 4:
                    r = t;
                    g = p;
                    b = B;
                    break;
                case 5:
                    r = B;
                    g = p;
                    b = q;
                    break;
            }
        }
        return [r, g, b];
    };
    Color.prototype.derive = function (hueShift, saturationFactor, brightnessFactor, opacityFactor) {
        var hsb = Color.RGBtoHSB(this.r, this.g, this.b);
        var b = hsb[2];
        if (b == 0 && brightnessFactor > 1.0) {
            b = 0.05;
        }
        var h = (((hsb[0] + hueShift) % 360) + 360) % 360;
        var s = Math.max(Math.min(hsb[1] * saturationFactor, 1.0), 0.0);
        b = Math.max(Math.min(b * brightnessFactor, 1.0), 0.0);
        var a = Math.max(Math.min(this.a * opacityFactor, 1.0), 0.0);
        var rgba = Color.HSBtoRGB(h, s, b);
        rgba.push(a);
        return Color.fromArray(rgba);
    };
    Color.prototype.brighter = function () {
        return this.derive(0, 1.0, 1.0 / 0.7, 1.0);
    };
    Color.prototype.darker = function () {
        return this.derive(0, 1.0, 0.7, 1.0);
    };
    // See https://drafts.csswg.org/css-color/#hex-notation
    Color.hexRe = /\s*#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?\s*$/;
    Color.shortHexRe = /\s*#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?\s*$/;
    Color.rgbRe = /\s*rgb\((\d+),\s*(\d+),\s*(\d+)\)\s*/;
    Color.rgbaRe = /\s*rgba\((\d+),\s*(\d+),\s*(\d+),\s*([.\d]+)\)\s*/;
    /**
     * CSS Color Module Level 4:
     * https://drafts.csswg.org/css-color/#named-colors
     */
    Color.nameToHex = Object.freeze({
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
    return Color;
}());
exports.Color = Color;
