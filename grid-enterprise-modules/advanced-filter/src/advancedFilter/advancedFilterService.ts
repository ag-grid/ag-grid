import {
    AdvancedFilterModel,
    AutocompleteEntry,
    AutocompleteListParams,
    Autowired,
    Bean,
    BeanStub,
    ColumnModel,
    DataTypeService,
    Events,
    IAdvancedFilterService,
    IRowNode,
    PostConstruct,
    PropertyChangedEvent,
    ValueFormatterService,
    ValueService,
} from "@ag-grid-community/core";
import { FilterExpressionParser } from "./filterExpressionParser";
import { ColFilterExpressionParser } from "./colFilterExpressionParser";
import {
    BooleanFilterExpressionOperators,
    FilterExpressionEvaluatorParams,
    FilterExpressionOperators,
    ScalarFilterExpressionOperators,
    TextFilterExpressionOperators,
} from "./filterExpressionOperators";
import { AdvancedFilterHeaderComp } from "./advancedFilterHeaderComp";

interface ExpressionProxy {
    getValue(colId: string, node: IRowNode): any;

    getParams(colId: string): FilterExpressionEvaluatorParams;

    operators: FilterExpressionOperators;
}

@Bean('advancedFilterService')
export class AdvancedFilterService extends BeanStub implements IAdvancedFilterService {
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('dataTypeService') private dataTypeService: DataTypeService;
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;

    private expressionProxy: ExpressionProxy;
    private expression: string | null = null;
    private expressionFunction: Function | null;
    private columnAutocompleteEntries: AutocompleteEntry[] | null = null;
    private columnNameToIdMap: { [columnNameUpperCase: string]: { colId: string, columnName: string } } = {};
    private expressionOperators: FilterExpressionOperators;
    private expressionJoinOperators: { and: string, or: string };
    private expressionEvaluatorParams: { [colId: string]: FilterExpressionEvaluatorParams } = {};
    private includeHiddenColumns = false;
    private eAdvancedFilterHeaderComp: AdvancedFilterHeaderComp | undefined;

    @PostConstruct
    private postConstruct(): void {
        this.expressionOperators = this.getExpressionOperators();
        this.expressionJoinOperators = this.getExpressionJoinOperators();
        this.expressionProxy = {
            getValue: (colId, node) => {
                const column = this.columnModel.getGridColumn(colId);
                return column ? this.valueService.getValue(column, node, true) : undefined;
            },
            getParams: (colId) => this.getExpressionEvaluatorParams(colId),
            operators: this.expressionOperators
        }
        this.includeHiddenColumns = this.gridOptionsService.is('includeHiddenColumnsInAdvancedFilter');

        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, () => this.resetColumnCaches());
        this.addManagedPropertyListener('includeHiddenColumnsInAdvancedFilter', (event: PropertyChangedEvent) => {
            this.includeHiddenColumns = !!event.currentValue;
            this.resetColumnCaches();
        });
    }

    public isFilterPresent(): boolean {
        return !!this.expressionFunction;
    }

    public doesFilterPass(node: IRowNode): boolean {
        return this.expressionFunction!(this.expressionProxy, node);
    }

    public getModel(): AdvancedFilterModel | null {
        const expressionParser = this.createExpressionParser(this.expression);
        expressionParser?.parseExpression();
        return expressionParser?.getModel() ?? null;
    }

    public setModel(model: AdvancedFilterModel | null): void {
        const parseModel = (model: AdvancedFilterModel): string | null => {
            if (model.filterType === 'join') {
                const operator = model.type === 'OR' ? this.expressionJoinOperators.or : this.expressionJoinOperators.and;
                return `(${model.conditions.map(condition => parseModel(condition)).join(` ${operator} `)})`;
            } else {
                const { colId } = model;
                const columnEntries = this.getColumnAutocompleteEntries();
                const columnEntry = columnEntries.find(({ key }) => key === colId);
                let columnName;
                if (columnEntry) {
                    columnName = columnEntry.displayValue!;
                    this.columnNameToIdMap[columnName.toLocaleUpperCase()] = { colId, columnName };
                } else {
                    columnName = colId;
                }
                const operator = this.expressionOperators[model.filterType]?.operators?.[model.type]?.displayValue ?? model.type;
                const { filter: operand1, filterTo: operand2 } = model as any;
                const operands = operand1 == null ? '' : ` ${operand1}${operand2 == null ? '' : ' ' + operand2}`
                return `${columnName} ${operator}${operands}`;
            }
        };

        const expression = model ? parseModel(model) : null;

        this.setExpressionDisplayValue(expression);
    }

    public getExpressionDisplayValue(): string | null {
        return this.expression;
    }

    public setExpressionDisplayValue(expression: string | null): void {
        this.expression = expression;
        this.expressionFunction = this.parseExpression(this.expression);
    }

    public createExpressionParser(expression: string | null): FilterExpressionParser | null {
        if (!expression) { return null; }

        const translate= this.localeService.getLocaleTextFunc();
        return new FilterExpressionParser({
            expression,
            columnModel: this.columnModel,
            dataTypeService: this.dataTypeService,
            columnAutocompleteTypeGenerator: searchString => this.getDefaultAutocompleteListParams(searchString),
            colIdResolver: columnName => this.getColId(columnName),
            columnValueCreator: updateEntry => this.getColumnValue(updateEntry),
            operators: this.expressionOperators,
            joinOperators: this.expressionJoinOperators,
            translate
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

    public getColumnValue({ displayValue }: AutocompleteEntry): string {
        return `${ColFilterExpressionParser.COL_START_CHAR}${displayValue}${ColFilterExpressionParser.COL_END_CHAR}`;
    }

    public getDefaultExpression(updateEntry: AutocompleteEntry): {
        updatedValue: string, updatedPosition: number
    } {
        const updatedValue = this.getColumnValue(updateEntry) + ' ';
        return {
            updatedValue,
            updatedPosition: updatedValue.length
        };
    }

    public updateAutocompleteCache(updateEntry: AutocompleteEntry, type?: string): void {
        if (type === 'column') {
            const { key: colId, displayValue } = updateEntry;
            this.columnNameToIdMap[updateEntry.displayValue!.toLocaleUpperCase()] = { colId, columnName: displayValue! };
        }
    }

    public setupComp(eCompToInsertBefore: HTMLElement): void {
        this.eAdvancedFilterHeaderComp = this.createManagedBean(new AdvancedFilterHeaderComp());
        eCompToInsertBefore.insertAdjacentElement('beforebegin', this.eAdvancedFilterHeaderComp.getGui());
    }

    public focusComp(): boolean {
        if (this.eAdvancedFilterHeaderComp) {
            this.eAdvancedFilterHeaderComp.getFocusableElement().focus();
            return true;
        }
        return false;
    }

    private parseExpression(expression: string | null): Function | null {
        const expressionParser = this.createExpressionParser(expression);

        if (!expressionParser) { return null; }

        expressionParser.parseExpression();
        const isValid = expressionParser.isValid();

        if (!isValid) { return null; }

        const functionBody = expressionParser.getFunction();
        return new Function('expressionProxy', 'node', functionBody);
    }

    private getColumnAutocompleteEntries(): AutocompleteEntry[] {
        if (this.columnAutocompleteEntries) {
            return this.columnAutocompleteEntries;
        }
        const columns = this.columnModel.getAllPrimaryColumns() ?? [];
        const entries: AutocompleteEntry[] = [];
        columns.forEach(column => {
            if (column.getColDef().filter && (this.includeHiddenColumns || column.isVisible() || column.isRowGroupActive())) {
                entries.push({
                    key: column.getColId(),
                    displayValue: this.columnModel.getDisplayNameForColumn(column, 'filterExpression')!
                });
            }
        });
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

    private getColId(columnName: string): { colId: string, columnName: string } | null {
        const upperCaseColumnName = columnName.toLocaleUpperCase();
        const cachedColId = this.columnNameToIdMap[upperCaseColumnName];
        if (cachedColId) { return cachedColId; }

        const columnAutocompleteEntries = this.getColumnAutocompleteEntries();
        const colEntry = columnAutocompleteEntries.find(({ displayValue }) => displayValue!.toLocaleUpperCase() === upperCaseColumnName);
        if (colEntry) {
            const { key: colId, displayValue } = colEntry;
            const colValue = { colId, columnName: displayValue! };
            // cache for faster lookup
            this.columnNameToIdMap[upperCaseColumnName] = colValue;
            return colValue;
        }
        return null;
    }

    private getExpressionOperators(): FilterExpressionOperators {
        const translate = this.localeService.getLocaleTextFunc();
        return {
            text: new TextFilterExpressionOperators({ translate }),
            boolean: new BooleanFilterExpressionOperators({ translate }),
            object: new TextFilterExpressionOperators<any>({ translate, valueParser: (v, node, params) => params.convertToString!(v, node) }),
            number: new ScalarFilterExpressionOperators<number>({ translate }),
            date: new ScalarFilterExpressionOperators<Date>({ translate }),
            dateString: new ScalarFilterExpressionOperators<Date, string>({ translate, valueParser: (v, params) => params.convertToDate!(v) })
        }
    }

    private getExpressionJoinOperators(): { and: string, or: string } {
        const translate = this.localeService.getLocaleTextFunc();
        return { and: translate('filterExpressionAnd', 'AND'), or: translate('filterExpressionOr', 'OR') }
    }

    private getExpressionEvaluatorParams(colId: string): FilterExpressionEvaluatorParams {
        let params = this.expressionEvaluatorParams[colId];
        if (!params) {
            const column = this.columnModel.getGridColumn(colId);
            if (column) {
                const baseCellDataType = this.dataTypeService.getBaseDataType(column);
                if (baseCellDataType === 'dateString') {
                    params = {
                        convertToDate: this.dataTypeService.getDateParserFunction() as (value: string) => Date
                    };
                } else if (baseCellDataType === 'object') {
                    const valueFormatter = this.dataTypeService.getDataTypeDefinition(column)?.valueFormatter;
                    params = {
                        convertToString: (value, node) => this.valueFormatterService.formatValue(column, node, value, valueFormatter)
                            ?? (typeof value.toString === 'function' ? value.toString() : '')
                    };
                } else {
                    params = {};
                }
                const { filterParams } = column.getColDef();
                if (filterParams) {
                    [
                        'caseSensitive', 'includeBlanksInEquals', 'includeBlanksInLessThan', 'includeBlanksInGreaterThan'
                    ].forEach((param: keyof FilterExpressionEvaluatorParams) => {
                        const paramValue = filterParams[param];
                        if (paramValue) {
                            params[param] = paramValue
                        }
                    });
                }
            }
            this.expressionEvaluatorParams[colId] = params;
        }
        return params;
    }

    private resetColumnCaches(): void {
        this.columnAutocompleteEntries = null;
        this.columnNameToIdMap = {};
    }
}
