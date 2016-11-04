export declare enum TokenType {
    Character = 0,
    Identifier = 1,
    Keyword = 2,
    String = 3,
    Operator = 4,
    Number = 5,
    Error = 6,
}
export declare class Lexer {
    tokenize(text: string): Token[];
}
export declare class Token {
    index: number;
    type: TokenType;
    numValue: number;
    strValue: string;
    constructor(index: number, type: TokenType, numValue: number, strValue: string);
    isCharacter(code: number): boolean;
    isNumber(): boolean;
    isString(): boolean;
    isOperator(operater: string): boolean;
    isIdentifier(): boolean;
    isKeyword(): boolean;
    isKeywordLet(): boolean;
    isKeywordNull(): boolean;
    isKeywordUndefined(): boolean;
    isKeywordTrue(): boolean;
    isKeywordFalse(): boolean;
    isKeywordThis(): boolean;
    isError(): boolean;
    toNumber(): number;
    toString(): string;
}
export declare var EOF: Token;
export declare function isIdentifier(input: string): boolean;
export declare function isQuote(code: number): boolean;
