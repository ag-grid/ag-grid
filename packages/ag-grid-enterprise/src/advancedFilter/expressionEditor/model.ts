import { IRowNode } from 'ag-grid-community';

import { TokenCursor } from './cursor';
import { ParserContext } from './parser';
import { RenderToken } from './renderer';
import { TokenMatcher } from './tokenizer';
import { TokenRange } from './typeHelpers';

// Roughly taken from the MDN documentation on javascript precedence
// prettier-ignore
export const ParserPrecedence = {
    GROUPING: 18,       // (x)
    ACCESS: 17,         // x.y
    CALL: 17,           // x(y)
    POSTFIX: 15,        // x++, x-- (Not currently used)
    PREFIX: 14,         // !x
    EXPONENT: 13,       // x ** y
    MULTIPLICATIVE: 12, // x * y, x / y, x % y
    ADDITIVE: 11,       // x + y, x - y,
    RELATIONAL: 9,      // x < y, x <= y, x > y, x >= y, x in y
    EQUALITY: 8,        // x === y, x !== y
    LOGICAL_AND: 4,     // x && y
    LOGICAL_OR: 3,      // x || y, x ?? y
    MISC: 2,            // x ? y : z
} as const

export type ExpressionDataTypeMap = {
    text: string;
    number: number;
    date: Date;
    boolean: boolean;
    object: object;
};

export type ExpressionDataType = keyof ExpressionDataTypeMap;
export type InferReturnType<TKey extends ExpressionDataType> = ExpressionDataTypeMap[TKey];

export type ModelNode<TDataType extends ExpressionDataType = ExpressionDataType> = {
    key: string;
    dataType: TDataType;
};
export type InferNodeDataType<TNode extends ModelNode> = InferReturnType<TNode['dataType']>;

export type ParseError = {
    message: string;
    range: TokenRange;
};

export interface ParsedExpression<TNode extends ModelNode = ModelNode> {
    model?: TNode;
    tokens: RenderToken[];
    errors: ParseError[];
}

export type ExpressionSuggestion = {
    label: string;
};

interface InfixParselet<TNode extends ModelNode> {
    fixity: 'infix';
    associativity?: 'left' | 'right';
    parseFromCursor: (left: ParsedExpression, cursor: TokenCursor, parser: ParserContext) => ParsedExpression<TNode>;
}

interface PostfixParselet<TNode extends ModelNode> {
    fixity: 'postfix';
    parseFromCursor: (left: ParsedExpression, cursor: TokenCursor, parser: ParserContext) => ParsedExpression<TNode>;
}

interface PrefixParselet<TNode extends ModelNode> {
    fixity: 'prefix';
    parseFromCursor: (cursor: TokenCursor, parser: ParserContext) => ParsedExpression<TNode>;
}

type OperatorParselet<TNode extends ModelNode> = {
    type: 'operator';
    precedence: number;
} & (InfixParselet<TNode> | PostfixParselet<TNode> | PrefixParselet<TNode>);

interface LeafParselet<TNode extends ModelNode> {
    type: 'value';
    parseFromCursor: (cursor: TokenCursor, context: ParserContext) => ParsedExpression<TNode>;
}

export type ParserDefinition<TNode extends ModelNode> = OperatorParselet<TNode> | LeafParselet<TNode>;

export type ExpressionDefinition<TNode extends ModelNode = ModelNode> = {
    key: string;
    tokenMatchers: TokenMatcher[];
    getEvaluator: (node: TNode, context: ParserContext) => (row: IRowNode) => InferNodeDataType<TNode>;
    getSuggestions: (node: TNode, context: ParserContext) => Promise<ExpressionSuggestion[]>;
    parseFromModel: (node: ModelNode, context: ParserContext) => TNode | ParseError;
    toFormattedTokens: (node: TNode, context: ParserContext, start: number) => RenderToken[];
} & (OperatorParselet<TNode> | LeafParselet<TNode>);
