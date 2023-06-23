import { Autowired, Bean } from '../../context/context';
import { BeanStub } from '../../context/beanStub';
import {
    AndFilterExpression,
    SingleValueFilterExpression,
    FilterExpression,
    FilterExpressionColumnValue,
    NotFilterExpression,
    OrFilterExpression,
    SINGLE_VALUE_FILTER_EXPRESSIONS,
    NoValueFilterExpression,
    NO_VALUE_FILTER_EXPRESSIONS,
    DoubleValueFilterExpression,
    DOUBLE_VALUE_FILTER_EXPRESSIONS,
} from './filterExpression';
import { IRowNode } from '../../interfaces/iRowNode';
import { ValueService } from '../../valueService/valueService';
import { ColumnModel } from '../../columns/columnModel';
import { IFilterExpression } from './iFilterExpression';

@Bean('filterExpressionService')
export class FilterExpressionService extends BeanStub {
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnModel') private columnModel: ColumnModel;

    private expression: FilterExpression | null = null;

    public isFilterPresent(): boolean {
        return !!this.expression;
    }

    public doesFilterPass(node: IRowNode): boolean {
        return !!this.expression?.evaluate(node);
    }

    public getExpression(): IFilterExpression | null {
        return this.expression ? this.expression.format() : null;
    }

    public setExpression(expression: IFilterExpression | null): void {
        this.expression = expression ? this.parseExpression(expression) : null;
    }

    private parseExpression(expression: IFilterExpression): FilterExpression {
        switch (expression.operator) {
            case 'and': {
                return new AndFilterExpression(this.parseExpressions(expression.expressions));
            }
            case 'or': {
                return new OrFilterExpression(this.parseExpressions(expression.expressions));
            }
            case 'not': {
                return new NotFilterExpression(this.parseExpression(expression.expression));
            }
            case 'blank': {
                return new NoValueFilterExpression(
                    NO_VALUE_FILTER_EXPRESSIONS[expression.operator](),
                    this.parseColumnValue(expression.colId),
                ) as FilterExpression;
            }
            case 'equals':
            case 'contains':
            case 'startsWith':
            case 'lessThan':
            case 'greaterThan': {
                return new SingleValueFilterExpression(
                    SINGLE_VALUE_FILTER_EXPRESSIONS[expression.operator](),
                    this.parseColumnValue(expression.colId),
                    expression.value
                ) as FilterExpression;
            }
            case 'inRange': {
                return new DoubleValueFilterExpression(
                    DOUBLE_VALUE_FILTER_EXPRESSIONS[expression.operator](),
                    this.parseColumnValue(expression.colId),
                    expression.value,
                    expression.valueTo
                ) as FilterExpression;
            }
        }
    }

    private parseExpressions(expressions: IFilterExpression[]): FilterExpression[] {
        return expressions.map((expression) => this.parseExpression(expression));
    }

    private parseColumnValue<TValue>(colId: string): FilterExpressionColumnValue<TValue> {
        return new FilterExpressionColumnValue<TValue>(colId, this.valueService, this.columnModel);
    }
}
