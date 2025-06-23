export type TokenType =
    | 'GROUP_START'
    | 'GROUP_END'
    | 'ARRAY_START'
    | 'ARRAY_END'
    | 'ARRAY_SEPARATOR'
    | 'IDENTIFIER'
    | 'STRING'
    | 'NUMBER'
    | 'BOOLEAN'
    | 'OPERATOR'
    | 'COMPARATOR'
    | 'FUNCTION'
    | 'STRUCTURAL'
    | 'UNKNOWN';

export type TokenMatch = {
    type: TokenType;
    key: string;
};

interface BaseTokenMatcher {
    type: string;
    token: TokenType;
    key: string;
    priority?: number;
}

interface StringTokenMatcher extends BaseTokenMatcher {
    type: 'string';
    label: string;
    aliases?: string[];
}

interface RegexTokenMatcher extends BaseTokenMatcher {
    type: 'regex';
    regex: RegExp;
}

export type LexerTokenMatcher = StringTokenMatcher | RegexTokenMatcher;

export interface Range {
    start: number;
    end: number;
}

export interface Token {
    value: string;
    range: Range;
    matches: TokenMatch[];
}

export interface MatchedToken {
    type: TokenType;
    key: string;
    value: string;
    range: Range;
}
