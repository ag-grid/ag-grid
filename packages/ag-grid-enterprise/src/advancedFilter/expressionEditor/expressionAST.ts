import { ExpressionToken } from './expressionTypes';

export type ASTNode =
    | LogicalExpression
    | ComparisonExpression
    | BetweenExpression
    | NotExpression
    | GroupExpression
    | ValueNode
    | ErrorNode;

export interface LogicalExpression {
    type: 'LogicalExpression';
    operator: 'AND' | 'OR';
    left: ASTNode;
    right: ASTNode;
}

export interface NotExpression {
    type: 'NotExpression';
    operand: ASTNode;
}

export interface ComparisonExpression {
    type: 'Comparison';
    field: string;
    operator: string;
    value: ValueNode;
}

export interface BetweenExpression {
    type: 'Between';
    field: string;
    min: ValueNode;
    max: ValueNode;
}

export interface GroupExpression {
    type: 'Group';
    expression: ASTNode;
}

export interface ValueNode {
    type: 'Value';
    value: string | number | boolean;
}

export interface ErrorNode {
    type: 'Error';
    message: string;
    token?: ExpressionToken;
}
