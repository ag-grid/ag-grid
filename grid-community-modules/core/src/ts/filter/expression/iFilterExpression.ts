export type IFilterExpression = IValueFilterExpression | IJoinFilterExpression;

export type IJoinFilterExpression = IMultiJoinFilterExpression | ISingleJoinFilterExpression;

export interface IMultiJoinFilterExpression {
    operator: 'and' | 'or';
    expressions: IFilterExpression[];
}

export interface ISingleJoinFilterExpression {
    operator: 'not';
    expression: IFilterExpression;
}

export type IValueFilterExpression =
    | INoValueFilterExpression<NumberNoValueFilterExpressionOperator>
    | ISingleValueFilterExpression<NumberSingleValueFilterExpressionOperator, number>
    | ISingleValueFilterExpression<TextSingleValueFilterExpressionOperator, string>
    | IDoubleValueFilterExpression<NumberDoubleValueFilterExpressionOperator, number>;

export type NumberNoValueFilterExpressionOperator = 'blank';

export type NumberSingleValueFilterExpressionOperator = 'equals' | 'greaterThan' | 'lessThan';

export type TextSingleValueFilterExpressionOperator = 'equals' | 'contains' | 'startsWith';

export type NumberDoubleValueFilterExpressionOperator = 'inRange';

export interface INoValueFilterExpression<TOperator> {
    operator: TOperator;
    colId: string;
}

export interface ISingleValueFilterExpression<TOperator, TValue> extends INoValueFilterExpression<TOperator> {
    value: TValue;
}

export interface IDoubleValueFilterExpression<TOperator, TValue> extends ISingleValueFilterExpression<TOperator, TValue> {
    valueTo: TValue;
}
