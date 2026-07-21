import type { Part } from 'ag-grid-community';

import { RGBAColor } from './RGBAColor';
import { paramValueToCss } from './api';
import { unescapeStringLiteral } from './utils';

export type ParseThemeSuccess = {
    success: true;
    params: Record<string, unknown>;
    parts: Part<any>[];
    variableWarnings: string[];
};

export type ParseThemeFailure = {
    success: false;
    error: string;
    params: undefined;
    parts: undefined;
    variableWarnings: undefined;
};

export type ParseThemeResult = ParseThemeSuccess | ParseThemeFailure;

export type ParseThemeCodeOptions = {
    /** Whether a bare identifier followed by `:` should be treated as a param name. */
    isRecognizedParam: (key: string) => boolean;
    /**
     * Scan the identifier tokens found anywhere in the code (in source order)
     * for other declarations, e.g. grid's swappable theme parts
     * (iconSetAlpine, tabStyleMaterial, ...). Hosts without such a concept
     * can omit this - parts will always be empty.
     */
    extractParts?: (identifiers: string[]) => Part<any>[];
};

export function parseThemeCode(code: string, options: ParseThemeCodeOptions): ParseThemeResult {
    const tokens = tokenizeThemeCode(code);
    const { isRecognizedParam, extractParts } = options;
    const params: Record<string, unknown> = {};
    const variableWarnings: string[] = [];
    let i = 0;

    while (i < tokens.length) {
        const token = tokens[i];

        if (isRecognizedParam(token.value) && tokens[i + 1]?.value === ':') {
            const paramName = token.value;
            i += 2; // skip param name and colon
            const result = consumeValue();

            if (result.valid) {
                params[paramName] = result.value;
            } else {
                variableWarnings.push(
                    `Parsing error at ${paramName}: \`${result.invalidCode}\` looks like JS code, not a value`
                );
            }
        } else {
            i++;
        }
    }

    const parts = extractParts
        ? extractParts(tokens.filter((token) => token.type === 'identifier').map((token) => token.value))
        : [];

    if (Object.keys(params).length + parts.length === 0) {
        return {
            success: false,
            error:
                variableWarnings.length > 0
                    ? variableWarnings.join('\n')
                    : 'Could not find any theme parameters. Expected code like: themeQuartz.withParams({ backgroundColor: "#fff" })',
            params: undefined,
            parts: undefined,
            variableWarnings: undefined,
        };
    }

    return { success: true, params, parts, variableWarnings };

    function consumeValue(): { valid: true; value: unknown } | { valid: false; invalidCode: string } {
        const startIndex = i;
        let depth = 0;

        while (i < tokens.length) {
            const { value } = tokens[i];
            if (value === '{' || value === '[' || value === '(') {
                depth++;
            } else if (value === '}' || value === ']' || value === ')') {
                depth--;
                if (depth < 0) {
                    break;
                }
            } else if (value === ',' && depth === 0) {
                break;
            }
            i++;
        }

        try {
            return { valid: true, value: JSON.parse(tokensToJSON(startIndex, i)) };
        } catch {
            return { valid: false, invalidCode: tokensToDebugString(startIndex, i) };
        }
    }

    function tokensToJSON(start: number, end: number): string {
        let result = '';
        for (let j = start; j < end; j++) {
            const token = tokens[j];
            const nextToken = tokens[j + 1];
            result += token.whitespaceBefore;
            if (token.type === 'string' || (token.type === 'identifier' && nextToken?.value === ':')) {
                result += JSON.stringify(token.value);
            } else {
                result += token.value;
            }
        }
        return result;
    }

    function tokensToDebugString(start: number, end: number): string {
        const code = tokensToJSON(start, end).replaceAll(/\s+/g, ' ').trim();
        return code.length > 50 ? `${code.slice(0, 50)}...` : code;
    }
}

export type ParsedPreset = {
    pageBackgroundColor: string;
    params: Record<string, unknown>;
    parts: Part<any>[];
};

export type ValidateResult = {
    preset: ParsedPreset;
    warnings: string[];
};

export type PageBackgroundColors = {
    light: string;
    dark: string;
};

// Matches the light/dark preset page background colors that ship with the AG
// Grid theme builder. Hosts with their own presets can pass their own colors
// so the inferred background matches their palette instead.
const DEFAULT_PAGE_BACKGROUND_COLORS: PageBackgroundColors = {
    light: '#FAFAFA',
    dark: '#1D2634',
};

export function validateAndConvertToPreset(
    { params, parts, variableWarnings }: ParseThemeSuccess,
    pageBackgroundColors: PageBackgroundColors = DEFAULT_PAGE_BACKGROUND_COLORS
): ValidateResult {
    const warnings: string[] = [...variableWarnings];
    const validParams: Record<string, unknown> = {};
    const silentLogger = {
        error: () => {},
        warn: () => {},
        preInitErr: () => {},
    };

    for (const [name, value] of Object.entries(params)) {
        let isValid: boolean;
        try {
            isValid = paramValueToCss(name, value, silentLogger) !== false;
        } catch {
            isValid = false;
        }
        if (!isValid) {
            warnings.push(`Invalid value for ${name}: ${JSON.stringify(value)}`);
            continue;
        }
        validParams[name] = value;
    }

    return {
        preset: {
            pageBackgroundColor: inferPageBackgroundColor(validParams),
            params: validParams,
            parts,
        },
        warnings,
    };

    /**
     * Work out a page background color to show the theme on - a light color for
     * light themes, dark for dark themes.
     */
    function inferPageBackgroundColor(params: Record<string, unknown>): string {
        if (!IS_BROWSER) {
            return pageBackgroundColors.light;
        }

        return (
            inferContrastyBackgroundColor(params.backgroundColor, true) ??
            inferContrastyBackgroundColor(params.chromeBackgroundColor, true) ??
            inferContrastyBackgroundColor(params.foregroundColor, false) ??
            inferContrastyBackgroundColor(params.textColor, false) ??
            inferContrastyBackgroundColor(params.cellTextColor, false) ??
            pageBackgroundColors.light
        );
    }

    function inferContrastyBackgroundColor(value: unknown, isBgParam: boolean): string | null {
        if (typeof value !== 'string') {
            return null;
        }
        const color = RGBAColor.reinterpretCss(value);
        if (!color) {
            return null;
        }
        const needsDarkBg = isBgParam ? color.grayscale() < 0.5 : color.grayscale() > 0.5;
        return needsDarkBg ? pageBackgroundColors.dark : pageBackgroundColors.light;
    }
}

type TokenBase = { whitespaceBefore: string };
type Token =
    | (TokenBase & { type: 'identifier'; value: string })
    | (TokenBase & { type: 'string'; value: string })
    | (TokenBase & { type: 'number'; value: string })
    | (TokenBase & { type: 'punctuation'; value: string });

function tokenizeThemeCode(code: string): Token[] {
    const tokens: Token[] = [];
    const matches = Array.from(code.matchAll(TOKEN_PATTERN));
    let i = 0;

    while (i < matches.length) {
        // Accumulate whitespace and discard comments
        let whitespaceBefore = '';
        while (i < matches.length) {
            const match = matches[i][0];
            if (/^\/[/*]/.test(match)) {
                i++; // discard comments
            } else if (/^\s/.test(match)) {
                whitespaceBefore += match;
                i++;
            } else {
                break;
            }
        }

        if (i >= matches.length) {
            break;
        }

        const match = matches[i][0];
        let type: Token['type'];
        let value: string;
        if ((match[0] === '"' || match[0] === "'") && match.length > 1) {
            type = 'string';
            try {
                value = unescapeStringLiteral(match);
            } catch {
                type = 'punctuation';
                value = match;
            }
        } else if (/^-?\d/.test(match)) {
            type = 'number';
            value = match;
        } else if (/^[a-zA-Z_$]/.test(match)) {
            type = 'identifier';
            value = match;
        } else {
            type = 'punctuation';
            value = match;
        }
        tokens.push({ type, value, whitespaceBefore });
        i++;
    }

    return tokens;
}

const TOKEN_PATTERN = combineRegexes([
    /\s+/, // whitespace
    /\/\/[^\n]*/, // line comments
    /\/\*[\s\S]*?\*\//, // block comments
    /"(?:[^"\\]|\\.)*"/, // double-quoted strings
    /'(?:[^'\\]|\\.)*'/, // single-quoted strings
    /-?\d+\.?\d*(?:e[+-]?\d+)?/, // numbers
    /[a-zA-Z_$][a-zA-Z0-9_$]*/, // identifiers
    /./, // any other single char
]);

function combineRegexes(patterns: RegExp[]): RegExp {
    return new RegExp(patterns.map((p) => p.source).join('|'), 'g');
}

const IS_BROWSER = typeof document === 'object';
