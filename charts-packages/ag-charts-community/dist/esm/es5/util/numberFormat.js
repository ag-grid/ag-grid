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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var _a;
var group = function (content) { return "(" + content + ")"; };
var optionalGroup = function (content) { return group(content) + "?"; };
var nonCapturingGroup = function (content) { return optionalGroup("?:" + content); };
var formatRegEx = (function () {
    var fill = '.';
    var align = '[<>=^]';
    var sign = '[+\\-( ]';
    var symbol = '[$€£¥₣₹#]';
    var zero = '0';
    var width = '\\d+';
    var comma = ',';
    var precision = '\\d+';
    var tilde = '~';
    var type = '[%a-z]';
    return new RegExp([
        '^',
        nonCapturingGroup("" + optionalGroup(fill) + group(align)),
        optionalGroup(sign),
        optionalGroup(symbol),
        optionalGroup(zero),
        optionalGroup(width),
        optionalGroup(comma),
        nonCapturingGroup("\\." + group(precision)),
        optionalGroup(tilde),
        optionalGroup(type),
        '$',
    ].join(''), 'i');
})();
var surroundedRegEx = (function () {
    var prefix = '.*?';
    var content = '.+?';
    var suffix = '.*?';
    return new RegExp(['^', group(prefix), "#\\{" + group(content) + "\\}", group(suffix), '$'].join(''));
})();
function parseFormatter(formatter) {
    var _a;
    var prefix;
    var suffix;
    var surrounded = formatter.match(surroundedRegEx);
    if (surrounded) {
        _a = __read(surrounded, 4), prefix = _a[1], formatter = _a[2], suffix = _a[3];
    }
    var match = formatter.match(formatRegEx);
    if (!match) {
        throw new Error("The number formatter is invalid: " + formatter);
    }
    var _b = __read(match, 11), fill = _b[1], align = _b[2], sign = _b[3], symbol = _b[4], zero = _b[5], width = _b[6], comma = _b[7], precision = _b[8], trim = _b[9], type = _b[10];
    return {
        fill: fill,
        align: align,
        sign: sign,
        symbol: symbol,
        zero: zero,
        width: parseInt(width),
        comma: comma,
        precision: parseInt(precision),
        trim: Boolean(trim),
        type: type,
        prefix: prefix,
        suffix: suffix,
    };
}
export function format(formatter) {
    var options = typeof formatter === 'string' ? parseFormatter(formatter) : formatter;
    var fill = options.fill, align = options.align, _a = options.sign, sign = _a === void 0 ? '-' : _a, symbol = options.symbol, zero = options.zero, width = options.width, comma = options.comma, precision = options.precision, trim = options.trim, type = options.type, _b = options.prefix, prefix = _b === void 0 ? '' : _b, _c = options.suffix, suffix = _c === void 0 ? '' : _c;
    var formatBody;
    if (!type) {
        formatBody = decimalTypes['g'];
        trim = true;
    }
    else if (type in decimalTypes && type in integerTypes) {
        formatBody = isNaN(precision) ? integerTypes[type] : decimalTypes[type];
    }
    else if (type in decimalTypes) {
        formatBody = decimalTypes[type];
    }
    else if (type in integerTypes) {
        formatBody = integerTypes[type];
    }
    else {
        throw new Error("The number formatter type is invalid: " + type);
    }
    if (isNaN(precision)) {
        precision = type ? 6 : 12;
    }
    return function (n) {
        var result = formatBody(n, precision);
        if (trim) {
            result = removeTrailingZeros(result);
        }
        result = addSign(n, result, sign);
        if (symbol && symbol !== '#') {
            result = "" + symbol + result;
        }
        if (symbol === '#' && type === 'x') {
            result = "0x" + result;
        }
        if (comma) {
            result = insertSeparator(result, comma);
        }
        if (type === 's') {
            result = "" + result + getSIPrefix(n);
        }
        if (type === '%' || type === 'p') {
            result = result + "%";
        }
        result = "" + prefix + result + suffix;
        if (!isNaN(width)) {
            result = addPadding(result, width, fill || zero, align);
        }
        return result;
    };
}
var absFloor = function (n) { return Math.floor(Math.abs(n)); };
var integerTypes = {
    b: function (n) { return absFloor(n).toString(2); },
    c: function (n) { return String.fromCharCode(n); },
    d: function (n) { return Math.round(Math.abs(n)).toFixed(0); },
    o: function (n) { return absFloor(n).toString(8); },
    x: function (n) { return absFloor(n).toString(16); },
    X: function (n) { return integerTypes.x(n).toUpperCase(); },
    n: function (n) { return integerTypes.d(n); },
    '%': function (n) { return "" + absFloor(n * 100).toFixed(0); },
};
var decimalTypes = {
    e: function (n, f) { return Math.abs(n).toExponential(f); },
    E: function (n, f) { return decimalTypes.e(n, f).toUpperCase(); },
    f: function (n, f) { return Math.abs(n).toFixed(f); },
    F: function (n, f) { return decimalTypes.f(n, f).toUpperCase(); },
    g: function (n, f) {
        if (n === 0) {
            return '0';
        }
        var a = Math.abs(n);
        var p = Math.floor(Math.log10(a));
        if (p >= -4 && p < f) {
            return a.toFixed(f - 1 - p);
        }
        return a.toExponential(f - 1);
    },
    G: function (n, f) { return decimalTypes.g(n, f).toUpperCase(); },
    n: function (n, f) { return decimalTypes.g(n, f); },
    p: function (n, f) { return decimalTypes.r(n * 100, f); },
    r: function (n, f) {
        if (n === 0) {
            return '0';
        }
        var a = Math.abs(n);
        var p = Math.floor(Math.log10(a));
        var q = p - (f - 1);
        if (q <= 0) {
            return a.toFixed(-q);
        }
        var x = Math.pow(10, q);
        return (Math.round(a / x) * x).toFixed();
    },
    s: function (n, f) {
        var p = getSIPrefixPower(n);
        return decimalTypes.r(n / Math.pow(10, p), f);
    },
    '%': function (n, f) { return decimalTypes.f(n * 100, f); },
};
function removeTrailingZeros(numString) {
    return numString.replace(/\.0+$/, '').replace(/(\.[1-9])0+$/, '$1');
}
function insertSeparator(numString, separator) {
    var dotIndex = numString.indexOf('.');
    if (dotIndex < 0) {
        dotIndex = numString.length;
    }
    var integerChars = numString.substring(0, dotIndex).split('');
    var fractionalPart = numString.substring(dotIndex);
    for (var i = integerChars.length - 3; i > 0; i -= 3) {
        integerChars.splice(i, 0, separator);
    }
    return "" + integerChars.join('') + fractionalPart;
}
function getSIPrefix(n) {
    return siPrefixes[getSIPrefixPower(n)];
}
function getSIPrefixPower(n) {
    var power = Math.log10(Math.abs(n));
    var p = Math.floor(power / 3) * 3;
    return Math.max(minSIPrefix, Math.min(maxSIPrefix, p));
}
var minSIPrefix = -24;
var maxSIPrefix = 24;
var siPrefixes = (_a = {},
    _a[minSIPrefix] = 'y',
    _a[-21] = 'z',
    _a[-18] = 'a',
    _a[-15] = 'f',
    _a[-12] = 'p',
    _a[-9] = 'n',
    _a[-6] = 'µ',
    _a[-3] = 'm',
    _a[0] = '',
    _a[3] = 'k',
    _a[6] = 'M',
    _a[9] = 'G',
    _a[12] = 'T',
    _a[15] = 'P',
    _a[18] = 'E',
    _a[21] = 'Z',
    _a[maxSIPrefix] = 'Y',
    _a);
var minusSign = '\u2212';
function addSign(num, numString, signType) {
    if (signType === void 0) { signType = ''; }
    if (signType === '(') {
        return num >= 0 ? numString : "(" + numString + ")";
    }
    return "" + (num >= 0 ? (signType === '+' ? '+' : '') : minusSign) + numString;
}
function addPadding(numString, width, fill, align) {
    if (fill === void 0) { fill = ' '; }
    if (align === void 0) { align = '>'; }
    var result = numString;
    if (align === '>' || !align) {
        result = result.padStart(width, fill);
    }
    else if (align === '<') {
        result = result.padEnd(width, fill);
    }
    else if (align === '^') {
        var padWidth = Math.max(0, width - result.length);
        var padLeft = Math.ceil(padWidth / 2);
        var padRight = Math.floor(padWidth / 2);
        result = result.padStart(padLeft + result.length, fill);
        result = result.padEnd(padRight + result.length, fill);
    }
    return result;
}
export function tickFormat(ticks, formatter) {
    var options = parseFormatter(formatter || ',f');
    if (isNaN(options.precision)) {
        if (options.type === 'f' || options.type === '%') {
            options.precision = Math.max.apply(Math, __spread(ticks.map(function (x) {
                if (typeof x !== 'number' || x === 0) {
                    return 0;
                }
                var l = Math.floor(Math.log10(Math.abs(x)));
                var digits = options.type ? 6 : 12;
                var exp = x.toExponential(digits - 1).replace(/\.?[0]+e/, 'e');
                var dotIndex = exp.indexOf('.');
                if (dotIndex < 0) {
                    return l >= 0 ? 0 : -l;
                }
                var s = exp.indexOf('e') - dotIndex;
                return Math.max(0, s - l - 1);
            })));
        }
        else if (!options.type || options.type in decimalTypes) {
            options.precision = Math.max.apply(Math, __spread(ticks.map(function (x) {
                if (typeof x !== 'number') {
                    return 0;
                }
                var exp = x.toExponential((options.type ? 6 : 12) - 1).replace(/\.?[0]+e/, 'e');
                return exp.substring(0, exp.indexOf('e')).replace('.', '').length;
            })));
        }
    }
    var f = format(options);
    return function (n) { return f(Number(n)); };
}
