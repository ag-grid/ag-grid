var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { Logger } from './logger';
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
     * A color string can be in one of the following formats to be valid:
     * - #rgb
     * - #rrggbb
     * - rgb(r, g, b)
     * - rgba(r, g, b, a)
     * - CSS color name such as 'white', 'orange', 'cyan', etc.
     */
    Color.validColorString = function (str) {
        if (str.indexOf('#') >= 0) {
            return !!Color.parseHex(str);
        }
        if (str.indexOf('rgb') >= 0) {
            return !!Color.stringToRgba(str);
        }
        return !!Color.nameToHex[str.toLowerCase()];
    };
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
        if (str.indexOf('#') >= 0) {
            // there can be some leading whitespace
            return Color.fromHexString(str);
        }
        // color name
        var hex = Color.nameToHex[str.toLowerCase()];
        if (hex) {
            return Color.fromHexString(hex);
        }
        // rgb(a) notation
        if (str.indexOf('rgb') >= 0) {
            return Color.fromRgbaString(str);
        }
        throw new Error("Invalid color string: '" + str + "'");
    };
    Color.tryParseFromString = function (str) {
        try {
            return Color.fromString(str);
        }
        catch (e) {
            Logger.warnOnce("invalid color string: '" + str + "'.");
            return Color.fromArray([0, 0, 0]);
        }
    };
    // See https://drafts.csswg.org/css-color/#hex-notation
    Color.parseHex = function (input) {
        input = input.replace(/ /g, '').slice(1);
        var parts;
        switch (input.length) {
            case 6:
            case 8:
                parts = [];
                for (var i = 0; i < input.length; i += 2) {
                    parts.push(parseInt("" + input[i] + input[i + 1], 16));
                }
                break;
            case 3:
            case 4:
                parts = input
                    .split('')
                    .map(function (p) { return parseInt(p, 16); })
                    .map(function (p) { return p + p * 16; });
                break;
        }
        if ((parts === null || parts === void 0 ? void 0 : parts.length) >= 3) {
            if (parts.every(function (p) { return p >= 0; })) {
                if (parts.length === 3) {
                    parts.push(255);
                }
                return parts;
            }
        }
    };
    Color.fromHexString = function (str) {
        var values = Color.parseHex(str);
        if (values) {
            var _a = __read(values, 4), r = _a[0], g = _a[1], b = _a[2], a = _a[3];
            return new Color(r / 255, g / 255, b / 255, a / 255);
        }
        throw new Error("Malformed hexadecimal color string: '" + str + "'");
    };
    Color.stringToRgba = function (str) {
        // Find positions of opening and closing parentheses.
        var _a = __read([NaN, NaN], 2), po = _a[0], pc = _a[1];
        for (var i = 0; i < str.length; i++) {
            var c = str[i];
            if (!po && c === '(') {
                po = i;
            }
            else if (c === ')') {
                pc = i;
                break;
            }
        }
        var contents = po && pc && str.substring(po + 1, pc);
        if (!contents) {
            return;
        }
        var parts = contents.split(',');
        var rgba = [];
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            var value = parseFloat(part);
            if (isNaN(value)) {
                return;
            }
            if (part.indexOf('%') >= 0) {
                // percentage r, g, or b value
                value = Math.max(0, Math.min(100, value));
                value /= 100;
            }
            else {
                if (i === 3) {
                    // alpha component
                    value = Math.max(0, Math.min(1, value));
                }
                else {
                    // absolute r, g, or b value
                    value = Math.max(0, Math.min(255, value));
                    value /= 255;
                }
            }
            rgba.push(value);
        }
        return rgba;
    };
    Color.fromRgbaString = function (str) {
        var rgba = Color.stringToRgba(str);
        if (rgba) {
            if (rgba.length === 3) {
                return new Color(rgba[0], rgba[1], rgba[2]);
            }
            else if (rgba.length === 4) {
                return new Color(rgba[0], rgba[1], rgba[2], rgba[3]);
            }
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
        var hex = '#' +
            Color.padHex(Math.round(this.r * 255).toString(16)) +
            Color.padHex(Math.round(this.g * 255).toString(16)) +
            Color.padHex(Math.round(this.b * 255).toString(16));
        if (this.a < 1) {
            hex += Color.padHex(Math.round(this.a * 255).toString(16));
        }
        return hex;
    };
    Color.prototype.toRgbaString = function (fractionDigits) {
        if (fractionDigits === void 0) { fractionDigits = 3; }
        var components = [Math.round(this.r * 255), Math.round(this.g * 255), Math.round(this.b * 255)];
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
            var t = B * (1 - S * (1 - f));
            switch (h >> 0 // discard the floating point part of the number
            ) {
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
    Color.interpolate = function (color, other) {
        var c0 = Color.tryParseFromString(color);
        var c1 = Color.tryParseFromString(other);
        return function (t) {
            var i = function (x, y) { return x * (1 - t) + y * t; };
            var c = new Color(i(c0.r, c1.r), i(c0.g, c1.g), i(c0.b, c1.b), i(c0.a, c1.a));
            return c.toString();
        };
    };
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
        transparent: '#00000000',
        turquoise: '#40E0D0',
        violet: '#EE82EE',
        wheat: '#F5DEB3',
        white: '#FFFFFF',
        whitesmoke: '#F5F5F5',
        yellow: '#FFFF00',
        yellowgreen: '#9ACD32',
    });
    return Color;
}());
export { Color };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdXRpbC9jb2xvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVsQztJQU1JOzs7Ozs7Ozs7OztPQVdHO0lBQ0gsZUFBWSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFhO1FBQWIsa0JBQUEsRUFBQSxLQUFhO1FBQ3RELHVCQUF1QjtRQUN2QixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksc0JBQWdCLEdBQXZCLFVBQXdCLEdBQVc7UUFDL0IsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN2QixPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FB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