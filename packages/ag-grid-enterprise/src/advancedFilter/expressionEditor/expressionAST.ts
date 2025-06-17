export interface Node {
    type: string;
}

export type OperandNode = ValueNode | ColumnNode | ErrorNode;

export interface ColumnNode {
    type: 'Column';
    colName: string;
}

export type ValueNode = StringValueNode | NumberValueNode | BooleanValueNode | ObjectValueNode;

export type StringValueNode = {
    type: 'StringValue';
    value: string;
};

export type NumberValueNode = {
    type: 'NumberValue';
    value: number;
};

export type BooleanValueNode = {
    type: 'BooleanValue';
    value: boolean;
};

export type ObjectValueNode = {
    type: 'ObjectValue';
    value: object;
};

export type ASTNode = {
    | LogicalExpression
    | NotExpression
    | ComparisonExpression
    | BetweenExpression
    | InExpression
    | ExpressionGroup
    | ErrorNode;

export interface LogicalExpression {
    type: 'LogicalExpression';
    operator: 'AND' | 'OR';
    operands: ASTNode[];
}

export interface NotExpression {
    type: 'NotExpression';
    operand: ASTNode;
}

export interface ComparisonExpression {
    type: 'ComparisonExpression';
    left: OperandNode;
    operator: string;
    right: OperandNode;
}

export interface BetweenExpression {
    type: 'BetweenExpression';
    operand: OperandNode;
    min: OperandNode;
    max: OperandNode;
}

export interface InExpression {
    type: 'InExpression';
    operand: OperandNode;
    options: OperandNode[];
}

export interface ExpressionGroup {
    type: 'ExpressionGroup';
    node: ASTNode;
}

export interface ErrorNode {
    type: 'ErrorNode';
    message: string;
}
