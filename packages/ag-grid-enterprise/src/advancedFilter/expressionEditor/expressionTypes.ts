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

interface BaseMatcher {
    _brand: string;
    type: TokenType;
    key: string; // optional normalized identifier
    priority?: number; // controls match order
}

interface LabelMatcher extends BaseMatcher {
    _brand: 'label';
    label: string;
    aliases?: string[];
}

interface RegexMatcher extends BaseMatcher {
    _brand: 'regex';
    regex: RegExp;
}

export type LexerMatcher = LabelMatcher | RegexMatcher;

export interface ExpressionToken {
    key: string;
    type: TokenType;
    value: string;
    start: number;
    end: number;
}
