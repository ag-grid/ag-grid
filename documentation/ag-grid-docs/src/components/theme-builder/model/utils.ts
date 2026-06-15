import { type ParamType } from '@components/theme-builder/api';

import type { Theme, _asThemeImpl, themeQuartz } from 'ag-grid-community';

type InferThemeParams<T> = T extends Theme<infer P> ? P : never;

export type ThemeParams = InferThemeParams<typeof themeQuartz>;
export type ThemeParam = keyof ThemeParams;

export type ThemeImpl = ReturnType<typeof _asThemeImpl>;

export const mapObjectValues = <T, U>(input: Record<string, T>, mapper: (value: T) => U): Record<string, U> =>
    Object.fromEntries(Object.entries(input).map(([key, value]) => [key, mapper(value)]));

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const titleCase = (variableName: string, prefix?: string) => {
    if (prefix && variableName.startsWith(prefix)) {
        variableName = variableName.substring(prefix.length);
    }
    return variableName
        .replaceAll('-', ' ')
        .replace(/(?:^|\W)+\w/g, (match) => match.toUpperCase())
        .replace(/(?<=[a-z])(?=[A-Z])/g, ' ');
};

export const logErrorMessage = (message: string, error?: unknown) => {
    if (error) {
        // eslint-disable-next-line no-console
        console.error(message, error);
    } else {
        // eslint-disable-next-line no-console
        console.error(message);
    }
};

const loggedMessages = new Set<string>();
export const logErrorMessageOnce = (message: string) => {
    if (loggedMessages.has(message)) {
        return;
    }
    loggedMessages.add(message);
    logErrorMessage(message);
};

export const indexBy = <T, K extends keyof T>(list: readonly T[], property: K): Record<string, T> =>
    Object.fromEntries(list.map((item) => [String(item[property]), item]));

/**
 * Unescape a single- or double-quoted JavaScript string literal, including its
 * surrounding quotes. Evaluating the literal would give the same result, but
 * eval requires the CSP script-src 'unsafe-eval', which the site does not allow.
 *
 * Throws SyntaxError on malformed escape sequences, as evaluating would.
 */
export const unescapeStringLiteral = (literal: string): string => {
    const content = literal.slice(1, -1);
    let result = '';
    let i = 0;
    const len = content.length;
    while (i < len) {
        const char = content[i];
        if (char !== '\\') {
            result += char;
            i++;
            continue;
        }
        if (i + 1 >= len) {
            throw new SyntaxError('Unterminated escape sequence');
        }
        const escaped = content[i + 1];
        i += 2;
        switch (escaped) {
            case 'n':
                result += '\n';
                break;
            case 't':
                result += '\t';
                break;
            case 'r':
                result += '\r';
                break;
            case 'b':
                result += '\b';
                break;
            case 'f':
                result += '\f';
                break;
            case 'v':
                result += '\v';
                break;
            case 'x':
                result += String.fromCharCode(parseHexEscape(content.slice(i, i + 2), 2));
                i += 2;
                break;
            case 'u':
                if (content[i] === '{') {
                    const end = content.indexOf('}', i + 1);
                    if (end === -1) {
                        throw new SyntaxError('Unterminated Unicode code point escape');
                    }
                    const codePoint = parseHexEscape(content.slice(i + 1, end), end - i - 1);
                    if (codePoint > 0x10ffff) {
                        throw new SyntaxError('Unicode code point escape out of range');
                    }
                    result += String.fromCodePoint(codePoint);
                    i = end + 1;
                } else {
                    result += String.fromCharCode(parseHexEscape(content.slice(i, i + 4), 4));
                    i += 4;
                }
                break;
            case '0':
                if (/\d/.test(content[i] ?? '')) {
                    throw new SyntaxError('Octal escape sequences are not supported');
                }
                result += '\0';
                break;
            case '\r':
                // line continuation, \r\n counts as one line terminator
                if (content[i] === '\n') {
                    i++;
                }
                break;
            case '\n':
            case '\u2028':
            case '\u2029':
                break; // line continuation
            default:
                if (/\d/.test(escaped)) {
                    throw new SyntaxError('Octal escape sequences are not supported');
                }
                result += escaped; // identity escape, e.g. \' \" \\ \a
        }
    }
    return result;
};

const parseHexEscape = (hex: string, expectedLength: number): number => {
    if (hex.length !== expectedLength || expectedLength === 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
        throw new SyntaxError('Invalid hexadecimal escape sequence');
    }
    return parseInt(hex, 16);
};

export const memoize = <R, A = void>(fn: (arg: A) => R): ((arg: A) => R) => {
    const values = new Map<A, R>();
    return (a) => {
        const key = a;
        if (!values.has(key)) {
            values.set(key, fn(a));
        }
        return values.get(key)!;
    };
};

export const stripFloatingPointErrors = (value: number) => value.toFixed(10).replace(/\.?0+$/, '');

export const paramToVariableName = (param: string) => `--ag-${kebabCase(param)}`;
const kebabCase = (str: string) => str.replace(/[A-Z]|\d+/g, (m) => `-${m}`).toLowerCase();

export const cssValueIsValid = (value: string, type: ParamType): boolean => reinterpretCSSValue(value, type) != null;

export const reinterpretCSSValue = (value: string, type: ParamType): string | null => {
    value = value.trim();
    if (value === '') {
        return '';
    }
    const reinterpretationElement = getReinterpretationElement();
    const cssProperty = cssPropertyForParamType[type];
    try {
        reinterpretationElement.style[cssProperty] = ''; // clear first otherwise setting an invalid value fails and keeps old value
        reinterpretationElement.style[cssProperty] = value;
        if (reinterpretationElement.style[cssProperty] === '') {
            return null; // invalid CSS
        }
        return getComputedStyle(reinterpretationElement)[cssProperty];
    } finally {
        reinterpretationElement.style[cssProperty as any] = '';
    }
};

let _reinterpretationElement: HTMLElement | null = null;

export const getReinterpretationElement = () => {
    if (!_reinterpretationElement) {
        _reinterpretationElement = document.createElement('span');
        document.body.appendChild(_reinterpretationElement);
    }
    return _reinterpretationElement;
};

const cssPropertyForParamType = {
    color: 'backgroundColor',
    colorScheme: 'colorScheme',
    length: 'paddingLeft',
    scale: 'lineHeight',
    border: 'borderLeft',
    borderStyle: 'borderTopStyle',
    shadow: 'boxShadow',
    image: 'backgroundImage',
    fontFamily: 'fontFamily',
    fontWeight: 'fontWeight',
    duration: 'transitionDuration',
} satisfies Record<ParamType, keyof CSSStyleDeclaration>;
