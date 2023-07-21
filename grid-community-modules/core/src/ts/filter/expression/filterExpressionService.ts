import { Autowired, Bean, PostConstruct } from '../../context/context';
import { BeanStub } from '../../context/beanStub';
import { IRowNode } from '../../interfaces/iRowNode';
import { ValueService } from '../../valueService/valueService';
import { ColumnModel } from '../../columns/columnModel';
import { ExpressionParser } from './expressionParser';
import { DataTypeService } from '../../columns/dataTypeService';
import { AutocompleteEntry, AutocompleteListParams } from './autocompleteParams';
import { Events } from '../../eventKeys';
import { ColExpressionParser } from './colExpressionParser';
import { ExpressionEvaluators, EXPRESSION_EVALUATORS } from './expressionEvaluators';

interface ExpressionProxy {
    getValue(colId: string, node: IRowNode): any;

    evaluators: ExpressionEvaluators
}

@Bean('filterExpressionService')
export class FilterExpressionService extends BeanStub {
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('dataTypeService') private dataTypeService: DataTypeService;

    private expressionProxy: ExpressionProxy;
    private expression: string | null = null;
    private expressionFunction: Function | null;
    private columnAutocompleteEntries: AutocompleteEntry[] | null = null;
    private columnNameToIdMap: { [columnName: string]: string } = {};

    @PostConstruct
    private postConstruct(): void {
        this.expressionProxy = {
            getValue: (colId, node) => {
                const column = this.columnModel.getGridColumn(colId);
                return column ? this.valueService.getValue(column, node, true) : undefined;
            },
            evaluators: EXPRESSION_EVALUATORS
        }

        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, () => {
            this.columnAutocompleteEntries = null;
            this.columnNameToIdMap = {};
        })
    }

    public isFilterPresent(): boolean {
        return !!this.expressionFunction;
    }

    public doesFilterPass(node: IRowNode): boolean {
        return this.expressionFunction!(this.expressionProxy, node);
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
            columnAutocompleteTypeGenerator: searchString => this.getDefaultAutocompleteListParams(searchString),
            colIdResolver: columnName => this.getColId(columnName),
            columnValueCreator: updateEntry => this.getColumnValue(updateEntry)
        });
    }

    public getDefaultAutocompleteListParams(searchString: string): AutocompleteListParams {
        return {
            enabled: true,
            type: 'column',
            searchString,
            entries: this.getColumnAutocompleteEntries()
        };
    }

    public getColumnValue(updateEntry: AutocompleteEntry): string {
        const { displayValue } = updateEntry;
        return displayValue.includes(' ')
            ? `${ColExpressionParser.COL_START_CHAR}${displayValue}${ColExpressionParser.COL_END_CHAR}`
            : displayValue;
    }

    public getDefaultExpression(updateEntry: AutocompleteEntry): {
        updatedValue: string, updatedPosition: number
    } {
        const updatedValue = this.getColumnValue(updateEntry);
        return {
            updatedValue,
            updatedPosition: updatedValue.length
        };
    }

    public updateAutocompleteCache(updateEntry: AutocompleteEntry, type?: string): void {
        if (type === 'column') {
            this.columnNameToIdMap[updateEntry.displayValue.toUpperCase()] = updateEntry.key;
        }
    }

    private parseExpression(expression: string | null): Function | null {
        const expressionParser = this.createExpressionParser(expression);

        if (!expressionParser) { return null; }

        expressionParser.parseExpression();
        const isValid = expressionParser.isValid();

        if (!isValid) { return null; }

        const functionBody = expressionParser.getExpression();
        // TODO - remove
        console.log(functionBody);
        return new Function('expressionProxy', 'node', functionBody);
    }

    private getColumnAutocompleteEntries(): AutocompleteEntry[] {
        if (this.columnAutocompleteEntries) {
            return this.columnAutocompleteEntries;
        }
        const columns = this.columnModel.getAllGridColumns();
        const entries = columns.map(column => ({
            key: column.getColId(),
            displayValue: this.columnModel.getDisplayNameForColumn(column, 'filterExpression')
        }));
        entries.sort((a, b) => {
            const aValue = a.displayValue ?? '';
            const bValue = b.displayValue ?? '';
            if (aValue < bValue) {
                return -1
            } else if (bValue > aValue) {
                return 1;
            }
            return 0;
        })
        return entries;
    }

    private getColId(columnName: string): string | null {
        const upperCaseColumnName = columnName.toUpperCase();
        const cachedColId = this.columnNameToIdMap[upperCaseColumnName];
        if (cachedColId) { return cachedColId; }

        const columnAutocompleteEntries = this.getColumnAutocompleteEntries();
        const colEntry = columnAutocompleteEntries.find(({ displayValue }) => displayValue.toUpperCase() === upperCaseColumnName);
        if (colEntry) {
            const colId = colEntry.key;
            // cache for faster lookup
            this.columnNameToIdMap[upperCaseColumnName] = colId;
            return colId;
        }
        return null;
    }
}
