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

@Bean('filterExpressionService')
export class FilterExpressionService extends BeanStub {
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('dataTypeService') private dataTypeService: DataTypeService;

    private expression: string | null = null;
    private expressionFunction: Function | null;
    private columnAutocompleteEntries: AutocompleteEntry[] | null = null;
    private columnNameToIdMap: { [columnName: string]: string } = {};

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, () => {
            this.columnAutocompleteEntries = null;
            this.columnNameToIdMap = {};
        })
    }

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

    public updateExpression(expression: string, position: number, updateEntry: AutocompleteEntry, type?: string): {
        updatedValue: string, updatedPosition: number
    } {
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

        const updatedValuePart = this.parseUpdatedExpressionPart(updateEntry, type);
        const updatedValue = expression.slice(0, startPosition) + updatedValuePart + expression.slice(endPosition + 1);
        return { updatedValue, updatedPosition: startPosition + updatedValuePart.length };
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
            this.columnNameToIdMap[updateEntry.displayValue] = updateEntry.key;
        }
    }

    private parseUpdatedExpressionPart(updateEntry: AutocompleteEntry, type?: string): string {
        const { displayValue, key } = updateEntry;
        if (type === 'column') {
            // cache for faster lookup
            this.columnNameToIdMap[displayValue] = key;
            return displayValue.includes(' ') ? `${ColExpressionParser.COL_START_CHAR}${displayValue}${ColExpressionParser.COL_END_CHAR}` : displayValue;
        }
        return displayValue ?? key;
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
        return new Function('valueService', 'columnModel', 'node', functionBody);
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
        const cachedColId = this.columnNameToIdMap[columnName];
        if (cachedColId) { return cachedColId; }

        const columnAutocompleteEntries = this.getColumnAutocompleteEntries();
        const colEntry = columnAutocompleteEntries.find(({ displayValue }) => displayValue === columnName);
        if (colEntry) {
            const colId = colEntry.key;
            // cache for faster lookup
            this.columnNameToIdMap[columnName] = colId;
            return colId;
        }
        return null;
    }
}
