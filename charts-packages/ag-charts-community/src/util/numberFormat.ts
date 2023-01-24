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
    trim?: string;
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
        trim,
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
        type = 'g',
        prefix = '',
        suffix = '',
    } = options;

    const signer = signs[sign || '-'];
    let formatBody: (n: number, f: number) => string;
    if (type in floatingTypes && type in integerTypes) {
        formatBody = isNaN(precision!) ? integerTypes[type] : floatingTypes[type];
    } else if (type in floatingTypes || !type) {
        if (isNaN(precision!)) {
            precision = 6;
        }
        formatBody = floatingTypes[type || 'g'];
    } else if (type in integerTypes) {
        formatBody = integerTypes[type];
    } else if (isNaN(precision!)) {
        formatBody = (n: number) => n.toString();
    } else {
        if (isNaN(precision!)) {
            precision = 6;
        }
    }
    const w = Number(width);
    const setPadding = isNaN(w)
        ? undefined
        : (input: string) => {
              let result = input;
              const f = fill || zero || ' ';
              if (align === '>' || align === undefined) {
                  result = result.padStart(w, f);
              } else if (align === '<') {
                  result = result.padEnd(w, f);
              } else if (align === '^') {
                  const padWidth = Math.max(0, w - result.length);
                  const padLeft = Math.ceil(padWidth / 2);
                  const padRight = Math.floor(padWidth / 2);
                  result = result.padStart(padLeft + result.length, f);
                  result = result.padEnd(padRight + result.length, f);
              }
              return result;
          };

    return (n: number) => {
        const s = signer(n);
        const t = formatBody(n, precision!);
        let result = `${s}${t}`;
        if (trim) {
            result = result.replace(/\.0+$/, '');
            result = result.replace(/(\.[1-9])0+$/, '$1');
        }
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
            result = `${result}${getPrefix(n)}`;
        }
        if (type === '%') {
            result = `${result}%`;
        }
        result = `${prefix}${result}${suffix}`;
        if (setPadding) {
            result = setPadding(result);
        }
        return result;
    };
}

const absFloor = (n: number) => Math.floor(Math.abs(n));

const integerTypes: Record<string, (n: number) => string> = {
    b: (n) => absFloor(n).toString(2),
    c: (n) => String.fromCharCode(n),
    d: (n) => absFloor(n).toFixed(0),
    o: (n) => absFloor(n).toString(8),
    x: (n) => absFloor(n).toString(16),
    X: (n) => integerTypes.x(n).toUpperCase(),
    n: (n) => integerTypes.d(n),
    '%': (n) => `${absFloor(n * 100).toFixed(0)}`,
};

const floatingTypes: Record<string, (n: number, f: number) => string> = {
    e: (n, f) => Math.abs(n).toExponential(f),
    E: (n, f) => floatingTypes.e(n, f).toUpperCase(),
    f: (n, f) => Math.abs(n).toFixed(f),
    F: (n, f) => floatingTypes.f(n, f).toUpperCase(),
    g: (n, f) =>
        Math.abs(n)
            .toString()
            .replace(new RegExp(`(\\.\d{${f}}).+`), '$1'),
    G: (n, f) => floatingTypes.g(n, f).toUpperCase(),
    n: (n, f) => floatingTypes.g(n, f),
    r: (n, f) => (Math.round(Math.abs(n) / Math.pow(10, f)) * Math.pow(10, f)).toFixed(),
    s: (n, f) => {
        const a = Math.abs(n);
        const power = Math.log10(a);
        const p = Math.sign(power) * Math.floor(Math.abs(power) / 3) * 3;
        return floatingTypes.f(n / Math.pow(10, p), Math.max(0, f - (Math.floor(Math.abs(power)) % 3) - 1));
    },
    '%': (n, f) => `${Math.abs(n * 100).toFixed(f)}`,
};

function insertSeparator(numString: string, separator: string) {
    let dotIndex = numString.indexOf('.');
    if (dotIndex < 0) {
        dotIndex = numString.length;
    }
    const integerChars = numString.substring(0, dotIndex).split('');
    const floatingChars = numString.substring(dotIndex + 1).split('');

    for (let i = integerChars.length - 3; i > 0; i -= 3) {
        integerChars.splice(i, 0, separator);
    }
    for (let i = 3; i < floatingChars.length - 1; i += 4) {
        floatingChars.splice(i, 0, separator);
    }
    return `${integerChars.join('')}${floatingChars.length > 0 ? '.' : ''}${floatingChars.join('')}`;
}

function getPrefix(n: number) {
    const a = Math.abs(n);
    const power = Math.log10(a);
    const p = Math.sign(power) * Math.floor(Math.abs(power) / 3) * 3;
    return siPrefixes.has(p) ? siPrefixes.get(p) : siPrefixes.get(Math.sign(p) * 8);
}

const siPrefixes = new Map<number, string>();
siPrefixes.set(-24, 'y');
siPrefixes.set(-21, 'z');
siPrefixes.set(-18, 'a');
siPrefixes.set(-15, 'f');
siPrefixes.set(-12, 'p');
siPrefixes.set(-9, 'n');
siPrefixes.set(-6, 'µ');
siPrefixes.set(-3, 'm');
siPrefixes.set(0, '');
siPrefixes.set(3, 'k');
siPrefixes.set(6, 'M');
siPrefixes.set(9, 'G');
siPrefixes.set(12, 'T');
siPrefixes.set(15, 'P');
siPrefixes.set(18, 'E');
siPrefixes.set(21, 'Z');
siPrefixes.set(24, 'Y');

const minusSign = '\u2212';
const signs: Record<string, (n: number) => string> = {
    '+': (n) => (n >= 0 ? '+' : minusSign),
    '-': (n) => (n >= 0 ? '' : minusSign),
    ' ': (n) => (n >= 0 ? ' ' : minusSign),
};

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
            options.precision = step.toExponential().indexOf('e');
        } else if (!options.type || options.type in floatingTypes) {
            options.precision = 5;
        }
    }
    const f = format(options);
    return (n) => f(Number(n));
}
