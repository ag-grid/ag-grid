import { tickStep } from './ticks';

interface FormatterOptions {
    prefix?: string;
    fill?: string;
    align?: string;
    sign?: string;
    symbol?: string;
    zero?: string;
    width?: number;
    comma?: string;
    precision?: number;
    trim?: boolean;
    type?: string;
    suffix?: string;
}

const group = (content: string) => `(${content})`;
const optionalGroup = (content: string) => `${group(content)}?`;
const nonCapturingGroup = (content: string) => optionalGroup(`?:${content}`);

const formatRegEx = (() => {
    const fill = '.';
    const align = '[<>=^]';
    const sign = '[+\\-( ]';
    const symbol = '[$€£¥₣₹#]';
    const zero = '0';
    const width = '\\d+';
    const comma = ',';
    const precision = '\\d+';
    const tilde = '~';
    const type = '[%a-z]';

    return new RegExp(
        [
            '^',
            nonCapturingGroup(`${optionalGroup(fill)}${group(align)}`),
            optionalGroup(sign),
            optionalGroup(symbol),
            optionalGroup(zero),
            optionalGroup(width),
            optionalGroup(comma),
            nonCapturingGroup(`\\.${group(precision)}`),
            optionalGroup(tilde),
            optionalGroup(type),
            '$',
        ].join(''),
        'i'
    );
})();

const surroundedRegEx = (() => {
    const prefix = '.*?';
    const content = '.+?';
    const suffix = '.*?';
    return new RegExp(['^', group(prefix), `#\\{${group(content)}\\}`, group(suffix), '$'].join(''));
})();

function parseFormatter(formatter: string): FormatterOptions {
    let prefix: string | undefined;
    let suffix: string | undefined;
    const surrounded = formatter.match(surroundedRegEx);
    if (surrounded) {
        [, prefix, formatter, suffix] = surrounded;
    }

    const match = formatter.match(formatRegEx);
    if (!match) {
        throw new Error(`The number formatter is invalid: ${formatter}`);
    }
    const [, fill, align, sign, symbol, zero, width, comma, precision, trim, type] = match;
    return {
        fill,
        align,
        sign,
        symbol,
        zero,
        width: parseInt(width),
        comma,
        precision: parseInt(precision),
        trim: Boolean(trim),
        type,
        prefix,
        suffix,
    };
}

export function format(formatter: string | FormatterOptions) {
    const options = typeof formatter === 'string' ? parseFormatter(formatter) : formatter;
    let {
        fill,
        align,
        sign = '-',
        symbol,
        zero,
        width,
        comma,
        precision,
        trim,
        type,
        prefix = '',
        suffix = '',
    } = options;

    let formatBody: (n: number, f: number) => string;
    if (!type) {
        formatBody = decimalTypes['g'];
        trim = true;
    } else if (type in decimalTypes && type in integerTypes) {
        formatBody = isNaN(precision!) ? integerTypes[type] : decimalTypes[type];
    } else if (type in decimalTypes) {
        formatBody = decimalTypes[type];
    } else if (type in integerTypes) {
        formatBody = integerTypes[type];
    } else {
        throw new Error(`The number formatter type is invalid: ${type}`);
    }

    if (isNaN(precision!)) {
        precision = type ? 6 : 12;
    }

    return (n: number) => {
        let result = formatBody(n, precision!);
        if (trim) {
            result = removeTrailingZeros(result);
        }
        result = addSign(n, result, sign);
        if (symbol && symbol !== '#') {
            result = `${symbol}${result}`;
        }
        if (symbol === '#' && type === 'x') {
            result = `0x${result}`;
        }
        if (comma) {
            result = insertSeparator(result, comma);
        }
        if (type === 's') {
            result = `${result}${getSIPrefix(n)}`;
        }
        if (type === '%' || type === 'p') {
            result = `${result}%`;
        }
        result = `${prefix}${result}${suffix}`;
        if (!isNaN(width!)) {
            result = addPadding(result, width!, fill || zero, align);
        }
        return result;
    };
}

const absFloor = (n: number) => Math.floor(Math.abs(n));

const integerTypes: Record<string, (n: number) => string> = {
    b: (n) => absFloor(n).toString(2),
    c: (n) => String.fromCharCode(n),
    d: (n) => Math.round(Math.abs(n)).toFixed(0),
    o: (n) => absFloor(n).toString(8),
    x: (n) => absFloor(n).toString(16),
    X: (n) => integerTypes.x(n).toUpperCase(),
    n: (n) => integerTypes.d(n),
    '%': (n) => `${absFloor(n * 100).toFixed(0)}`,
};

const decimalTypes: Record<string, (n: number, f: number) => string> = {
    e: (n, f) => Math.abs(n).toExponential(f),
    E: (n, f) => decimalTypes.e(n, f).toUpperCase(),
    f: (n, f) => Math.abs(n).toFixed(f),
    F: (n, f) => decimalTypes.f(n, f).toUpperCase(),
    g: (n, f) => {
        if (n === 0) {
            return '0';
        }
        const a = Math.abs(n);
        const p = Math.floor(Math.log10(a));
        if (p >= -4 && p < f) {
            return a.toFixed(f - 1 - p);
        }
        return a.toExponential(f - 1);
    },
    G: (n, f) => decimalTypes.g(n, f).toUpperCase(),
    n: (n, f) => decimalTypes.g(n, f),
    p: (n, f) => decimalTypes.r(n * 100, f),
    r: (n, f) => {
        if (n === 0) {
            return '0';
        }
        const a = Math.abs(n);
        const p = Math.floor(Math.log10(a));
        const q = p - (f - 1);
        if (q <= 0) {
            return a.toFixed(-q);
        }
        const x = Math.pow(10, q);
        return (Math.round(a / x) * x).toFixed();
    },
    s: (n, f) => {
        const p = getSIPrefixPower(n);
        return decimalTypes.r(n / Math.pow(10, p), f);
    },
    '%': (n, f) => decimalTypes.f(n * 100, f),
};

function removeTrailingZeros(numString: string) {
    return numString.replace(/\.0+$/, '').replace(/(\.[1-9])0+$/, '$1');
}

function insertSeparator(numString: string, separator: string) {
    let dotIndex = numString.indexOf('.');
    if (dotIndex < 0) {
        dotIndex = numString.length;
    }
    const integerChars = numString.substring(0, dotIndex).split('');
    const fractionalPart = numString.substring(dotIndex);

    for (let i = integerChars.length - 3; i > 0; i -= 3) {
        integerChars.splice(i, 0, separator);
    }
    return `${integerChars.join('')}${fractionalPart}`;
}

function getSIPrefix(n: number) {
    return siPrefixes[getSIPrefixPower(n)];
}

function getSIPrefixPower(n: number) {
    const power = Math.log10(Math.abs(n));
    const p = Math.floor(power / 3) * 3;
    return Math.max(minSIPrefix, Math.min(maxSIPrefix, p));
}

const minSIPrefix = -24;
const maxSIPrefix = 24;
const siPrefixes: Record<number, string> = {
    [minSIPrefix]: 'y',
    [-21]: 'z',
    [-18]: 'a',
    [-15]: 'f',
    [-12]: 'p',
    [-9]: 'n',
    [-6]: 'µ',
    [-3]: 'm',
    [0]: '',
    [3]: 'k',
    [6]: 'M',
    [9]: 'G',
    [12]: 'T',
    [15]: 'P',
    [18]: 'E',
    [21]: 'Z',
    [maxSIPrefix]: 'Y',
};

const minusSign = '\u2212';

function addSign(num: number, numString: string, signType = '') {
    if (signType === '(') {
        return num >= 0 ? numString : `(${numString})`;
    }
    return `${num >= 0 ? (signType === '+' ? '+' : '') : minusSign}${numString}`;
}

function addPadding(numString: string, width: number, fill = ' ', align = '>') {
    let result = numString;
    if (align === '>' || !align) {
        result = result.padStart(width, fill);
    } else if (align === '<') {
        result = result.padEnd(width, fill);
    } else if (align === '^') {
        const padWidth = Math.max(0, width - result.length);
        const padLeft = Math.ceil(padWidth / 2);
        const padRight = Math.floor(padWidth / 2);
        result = result.padStart(padLeft + result.length, fill);
        result = result.padEnd(padRight + result.length, fill);
    }
    return result;
}

export function tickFormat(
    start: number,
    stop: number,
    count: number,
    formatter?: string
): (n: number | { valueOf(): number }) => string {
    const step = tickStep(start, stop, count);
    const options = parseFormatter(formatter || ',f');
    if (isNaN(options.precision!)) {
        if (options.type === 's') {
            options.precision = Math.max(
                ...[start, stop, step, start + step, stop - step].map((x) => {
                    const exp = x.toExponential(12).replace(/\.?[0]+e/, 'e');
                    return exp.substring(0, exp.indexOf('e')).replace('.', '').length;
                })
            );
        } else if (!options.type || options.type in decimalTypes) {
            options.precision = Math.max(
                ...[start, stop, step, start + step, stop - step].map((x) => {
                    if (x === 0) {
                        return 0;
                    }
                    const l = Math.floor(Math.log10(Math.abs(x)));
                    const exp = x.toExponential(12).replace(/\.?[0]+e/, 'e');
                    const dotIndex = exp.indexOf('.');
                    if (dotIndex < 0) {
                        return l >= 0 ? 0 : -l;
                    }
                    const s = exp.indexOf('e') - dotIndex;
                    return Math.max(0, s - l - 1);
                })
            );
        }
    }
    const f = format(options);
    return (n) => f(Number(n));
}
