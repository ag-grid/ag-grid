import { exists } from '../../utils/generic';
import { ColumnModel } from '../../columns/columnModel';
import { IRowNode } from '../../interfaces/iRowNode';
import { ValueService } from '../../valueService/valueService';
import {
    IFilterExpression,
    IMultiJoinFilterExpression,
    ISingleJoinFilterExpression,
} from './iFilterExpression';

export type FilterExpression = ValueFilterExpression | JoinFilterExpression;

export type JoinFilterExpression = AndFilterExpression | OrFilterExpression | NotFilterExpression;

export interface BaseFilterExpression {
    evaluate(node: IRowNode): boolean;
    format(): IFilterExpression;
}

export class AndFilterExpression implements BaseFilterExpression {
    constructor(private expressions: FilterExpression[]) {}

    public evaluate(node: IRowNode): boolean {
        return this.expressions.every((expression) => expression.evaluate(node));
    }

    public format(): IMultiJoinFilterExpression {
        return {
            operator: 'and',
            expressions: this.expressions.map((expression) => expression.format()),
        };
    }
}

export class OrFilterExpression implements BaseFilterExpression {
    constructor(private expressions: FilterExpression[]) {}

    public evaluate(node: IRowNode): boolean {
        return this.expressions.some((expression) => expression.evaluate(node));
    }

    public format(): IMultiJoinFilterExpression {
        return {
            operator: 'or',
            expressions: this.expressions.map((expression) => expression.format()),
        };
    }
}

export class NotFilterExpression implements BaseFilterExpression {
    constructor(private expression: FilterExpression) {}

    public evaluate(node: IRowNode): boolean {
        return !this.expression.evaluate(node);
    }

    public format(): ISingleJoinFilterExpression {
        return {
            operator: 'not',
            expression: this.expression.format(),
        };
    }
}

export type ValueFilterExpression =
    | NoValueFilterExpression<string>
    | NoValueFilterExpression<number>
    | SingleValueFilterExpression<string>
    | SingleValueFilterExpression<number>
    | DoubleValueFilterExpression<number>;

export class NoValueFilterExpression<TValue> {
    constructor(
        private operator: NoValueFilterExpressionOperator<TValue>,
        private column: FilterExpressionColumnValue<TValue>
    ) {}

    public evaluate(node: IRowNode): boolean {
        return this.operator.evaluate(this.column.getValue(node));
    }

    public format(): IFilterExpression {
        return {
            operator: this.operator.format(),
            colId: this.column.format(),
        } as IFilterExpression;
    }
}

export class SingleValueFilterExpression<TValue> implements BaseFilterExpression {
    constructor(
        private operator: SingleValueFilterExpressionOperator<TValue>,
        private column: FilterExpressionColumnValue<TValue>,
        private value: TValue
    ) {}

    public evaluate(node: IRowNode): boolean {
        return this.operator.evaluate(this.column.getValue(node), this.value);
    }

    public format(): IFilterExpression {
        return {
            operator: this.operator.format(),
            colId: this.column.format(),
            value: this.value as any,
        } as IFilterExpression;
    }
}

export class DoubleValueFilterExpression<TValue> implements BaseFilterExpression {
    constructor(
        private operator: DoubleValueFilterExpressionOperator<TValue>,
        private column: FilterExpressionColumnValue<TValue>,
        private value: TValue,
        private valueTo: TValue
    ) {}

    public evaluate(node: IRowNode): boolean {
        return this.operator.evaluate(this.column.getValue(node), this.value, this.valueTo);
    }

    public format(): IFilterExpression {
        return {
            operator: this.operator.format(),
            colId: this.column.format(),
            value: this.value as any,
            valueTo: this.valueTo as any,
        } as IFilterExpression;
    }
}

export interface NoValueFilterExpressionOperator<TValue> {
    evaluate(colValue: TValue): boolean;

    format(): string;
}

export class BlankFilterExpressionOperator<TValue> implements NoValueFilterExpressionOperator<TValue> {
    public evaluate(colValue: TValue): boolean {
        return !exists(colValue);
    }

    public format(): string {
        return 'blank';
    }
}

export interface SingleValueFilterExpressionOperator<TValue> {
    evaluate(colValue: TValue, value: TValue): boolean;

    format(): string;
}

export class EqualsFilterExpressionOperator<TValue> implements SingleValueFilterExpressionOperator<TValue> {
    public evaluate(colValue: TValue, value: TValue): boolean {
        return colValue === value;
    }

    public format(): string {
        return 'equals';
    }
}

export class GreaterThanFilterExpressionOperator implements SingleValueFilterExpressionOperator<number> {
    public evaluate(colValue: number, value: number): boolean {
        return colValue > value;
    }

    public format(): string {
        return 'greaterThan';
    }
}

export class LessThanFilterExpressionOperator implements SingleValueFilterExpressionOperator<number> {
    public evaluate(colValue: number, value: number): boolean {
        return colValue < value;
    }

    public format(): string {
        return 'lessThan';
    }
}

export class ContainsFilterExpressionOperator implements SingleValueFilterExpressionOperator<string> {
    public evaluate(colValue: string, value: string): boolean {
        return colValue.includes(value);
    }

    public format(): string {
        return 'contains';
    }
}

export class StartsWithFilterExpressionOperator implements SingleValueFilterExpressionOperator<string> {
    public evaluate(colValue: string, value: string): boolean {
        return colValue.startsWith(value);
    }

    public format(): string {
        return 'startsWith';
    }
}

export interface DoubleValueFilterExpressionOperator<TValue> {
    evaluate(colValue: TValue, value: TValue, valueTo: TValue): boolean;

    format(): string;
}

export class RangeFilterExpressionOperator implements DoubleValueFilterExpressionOperator<number> {
    public evaluate(colValue: number, value: number, valueTo: number): boolean {
        return colValue > value && colValue < valueTo;
    }

    public format(): string {
        return 'inRange';
    }
}

export class FilterExpressionColumnValue<TValue> {
    constructor(private colId: string, private valueService: ValueService, private columnModel: ColumnModel) {}
    public getValue(node: IRowNode): TValue {
        return this.valueService.getValue(this.columnModel.getGridColumn(this.colId)!, node, true);
    }

    public format(): string {
        return this.colId
    }
}

export const NO_VALUE_FILTER_EXPRESSIONS = {
    blank: () => new BlankFilterExpressionOperator(),
};

export const SINGLE_VALUE_FILTER_EXPRESSIONS = {
    equals: () => new EqualsFilterExpressionOperator(),
    contains: () => new ContainsFilterExpressionOperator(),
    startsWith: () => new StartsWithFilterExpressionOperator(),
    lessThan: () => new LessThanFilterExpressionOperator(),
    greaterThan: () => new GreaterThanFilterExpressionOperator(),
};

export const DOUBLE_VALUE_FILTER_EXPRESSIONS = {
    inRange: () => new RangeFilterExpressionOperator(),
};
