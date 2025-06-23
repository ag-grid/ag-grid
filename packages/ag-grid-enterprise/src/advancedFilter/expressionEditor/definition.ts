import { InferCellDataType } from 'packages/ag-grid-community/src/entities/dataType';

import { BaseCellDataType, IRowNode } from 'ag-grid-community';

import { ErrorNode, ExpressionNode, InferNode, NodeParameters, OperandNode, OperatorNode, Valid } from './ast';
import { TokenCursor } from './cursor';
import { LexerTokenMatcher, MatchedToken } from './token';

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

export interface ParserContext {
    parseExpression(cursor: TokenCursor, precedence?: number): ExpressionNode;
    createNode<TType extends ExpressionNode['type']>(params: NodeParameters<TType>): InferNode<TType>;
    addError(node: ExpressionNode, message: string): void;
    getColumn(name: string):
        | {
              id: string;
              datatype: BaseCellDataType;
          }
        | undefined;
}

export interface FilterContext {
    getValueAccessor: <TDataType extends BaseCellDataType>(
        operand: OperandNode<TDataType>
    ) => (row: IRowNode) => InferCellDataType<TDataType>;
}

type BaseDefinition<TType extends string, TNode extends ExpressionNode> = {
    type: TType;
    key: string;
    tokens: LexerTokenMatcher[];
    buildFilter: (node: Valid<TNode>, parser: FilterContext) => (row: IRowNode) => boolean;
    suggest: (node: TNode, position: number, parser: ParserContext) => string[];
    render: (node: TNode) => string;
};

export type OperandDefinition<TNode extends OperandNode = OperandNode> = BaseDefinition<'operand', TNode> & {
    parse: (cursor: TokenCursor, context: ParserContext) => TNode | ErrorNode<TNode>;
};

export type OperatorDefinition<TNode extends OperatorNode = OperatorNode> = BaseDefinition<'operator', TNode> & {
    precedence: number;
} & (
        | {
              fixity: 'infix';
              associativity?: 'left' | 'right';
              parse: (left: ExpressionNode, cursor: TokenCursor, parser: ParserContext) => TNode | ErrorNode<TNode>;
          }
        | {
              fixity: 'postfix';
              parse: (left: ExpressionNode, cursor: TokenCursor, parser: ParserContext) => TNode | ErrorNode<TNode>;
          }
        | {
              fixity: 'prefix';
              parse: (cursor: TokenCursor, parser: ParserContext) => TNode | ErrorNode<TNode>;
          }
    );

export type ExpressionDefinition = OperandDefinition | OperatorDefinition;
