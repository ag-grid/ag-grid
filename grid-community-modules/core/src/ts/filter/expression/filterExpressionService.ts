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
    private expressionParser: ExpressionParser;

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

    public getAutocompleteListParams(position: number): AutocompleteListParams {
        return this.expressionParser.getAutocompleteListParams(position);
    }

    private parseExpression(expression: string | null): Function | null {
        if (!expression) { return null; }

        this.expressionParser = new ExpressionParser({
            expression,
            columnModel: this.columnModel,
            dataTypeService: this.dataTypeService,
            columnAutocompleteTypeGenerator: () => ({ enabled: true, type: 'column', entries: [
                {
                    key: 'athlete',
                    displayValue: 'Athlete'
                },
                {
                    key: 'age',
                    displayValue: 'Age'
                }
            ]})
        });
        this.expressionParser.parseExpression();
        const isValid = this.expressionParser.isValid();

        if (!isValid) { return null; }

        const functionBody = this.expressionParser.getExpression();
        console.log(functionBody);
        const func = new Function('valueService', 'columnModel', 'node', functionBody);
        return func;
    }
}
