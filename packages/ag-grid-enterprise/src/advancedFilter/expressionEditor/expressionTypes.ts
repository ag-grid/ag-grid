export type TokenType =
    | 'LPAREN'
    | 'RPAREN'
    | 'COMMA'
    | 'IDENTIFIER'
    | 'STRING'
    | 'NUMBER'
    | 'BOOLEAN'
    | 'OPERATOR'
    | 'COMPARATOR'
    | 'UNKNOWN';

interface BaseTokenMatcher {
    _brand: string;
    type: TokenType;
    key: string;
    priority?: number;
}

interface LabelTokenMatcher extends BaseTokenMatcher {
    _brand: 'label';
    label: string;
    aliases?: string[];
}

interface RegexTokenMatcher extends BaseTokenMatcher {
    _brand: 'regex';
    regex: RegExp;
}

export type LexerTokenMatcher = LabelTokenMatcher | RegexTokenMatcher;

export interface ExpressionToken {
    key: string;
    type: TokenType;
    value: string;
    start: number;
    end: number;
}
