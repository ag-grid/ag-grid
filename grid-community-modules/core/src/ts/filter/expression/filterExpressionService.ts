import { Autowired, Bean } from '../../context/context';
import { BeanStub } from '../../context/beanStub';
import { IRowNode } from '../../interfaces/iRowNode';
import { ValueService } from '../../valueService/valueService';
import { ColumnModel } from '../../columns/columnModel';
import { ExpressionParser } from './expressionParser';
import { DataTypeService } from '../../columns/dataTypeService';
import { AutocompleteListParams } from './agAutocomplete';

@Bean('filterExpressionService')
export class FilterExpressionService extends BeanStub {
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('dataTypeService') private dataTypeService: DataTypeService;

    private expression: string | null = null;
    private expressionFunction: Function | null;

    public isFilterPresent(): boolean {
        return !!this.expressionFunction;
    }

    public doesFilterPass(node: IRowNode): boolean {
        return this.expressionFunction!(this.valueService, this.columnModel, node);
    }

    public getExpression(): string | null {
        return this.expression;
    }

    public setExpression(expression: string | null): void {
        this.expression = expression;
        this.expressionFunction = this.parseExpression(this.expression);
    }

    public createExpressionParser(expression: string | null): ExpressionParser | null {
        if (!expression) { return null; }

        return new ExpressionParser({
            expression,
            columnModel: this.columnModel,
            dataTypeService: this.dataTypeService,
            columnAutocompleteTypeGenerator: searchString => this.getDefaultAutocompleteListParams(searchString)
        });
    }

    public getDefaultAutocompleteListParams(searchString: string): AutocompleteListParams {
        return {
            enabled: true,
            type: 'column',
            searchString,
            // TODO - generate column list
            entries: [
                {
                    key: 'athlete',
                    displayValue: 'Athlete'
                },
                {
                    key: 'age',
                    displayValue: 'Age'
                }
            ]
        };
    }

    public updateExpression(expression: string, position: number, updatedValuePart: string): { updatedValue: string, updatedPosition: number } {
        let i = position - 1;
        let startPosition = 0;

        while (i >= 0) {
            const char = expression[i];
            if (char === ' ' || char === '(') {
                startPosition = i + 1;
                break;
            }
            i--;
        }

        i = position;
        let endPosition = expression.length - 1;

        while (i < expression.length) {
            const char = expression[i];
            if (char === ' ' || char === ')') {
                endPosition = i - 1;
                break;
            }
            i++;
        }

        const updatedValue = expression.slice(0, startPosition) + updatedValuePart + expression.slice(endPosition + 1);
        return { updatedValue, updatedPosition: startPosition + updatedValuePart.length };
    }

    private parseExpression(expression: string | null): Function | null {
        const expressionParser = this.createExpressionParser(expression);

        if (!expressionParser) { return null; }

        expressionParser.parseExpression();
        const isValid = expressionParser.isValid();

        if (!isValid) { return null; }

        const functionBody = expressionParser.getExpression();
        console.log(functionBody);
        const func = new Function('valueService', 'columnModel', 'node', functionBody);
        return func;
    }
}
