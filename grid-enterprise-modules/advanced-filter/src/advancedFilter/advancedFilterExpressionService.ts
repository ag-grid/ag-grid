import {
    AutocompleteEntry,
    AutocompleteListParams,
    Autowired,
    BaseCellDataType,
    Bean,
    BeanStub,
    Column,
    ColumnAdvancedFilterModel,
    ColumnModel,
    DataTypeService,
    Events,
    JoinAdvancedFilterModel,
    PostConstruct,
    PropertyChangedEvent,
    ValueFormatterService,
    _,
} from '@ag-grid-community/core';
import { ADVANCED_FILTER_LOCALE_TEXT } from './advancedFilterLocaleText';
import { ColFilterExpressionParser } from './colFilterExpressionParser';
import {
    BooleanFilterExpressionOperators,
    DataTypeFilterExpressionOperators,
    FilterExpressionEvaluatorParams,
    FilterExpressionOperator,
    FilterExpressionOperators,
    ScalarFilterExpressionOperators,
    TextFilterExpressionOperators,
} from './filterExpressionOperators';

@Bean('advancedFilterExpressionService')
export class AdvancedFilterExpressionService extends BeanStub {
    @Autowired('valueFormatterService') private valueFormatterService: ValueFormatterService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('dataTypeService') private dataTypeService: DataTypeService;

    private includeHiddenColumns = false;
    private columnNameToIdMap: { [columnNameUpperCase: string]: { colId: string, columnName: string } } = {};
    private columnAutocompleteEntries: AutocompleteEntry[] | null = null;
    private expressionOperators: FilterExpressionOperators;
    private expressionJoinOperators: { and: string, or: string };
    private expressionEvaluatorParams: { [colId: string]: FilterExpressionEvaluatorParams<any> } = {};

    @PostConstruct
    private postConstruct(): void {
        this.expressionJoinOperators = this.generateExpressionJoinOperators();
        this.expressionOperators = this.generateExpressionOperators();
        this.includeHiddenColumns = this.gridOptionsService.is('includeHiddenColumnsInAdvancedFilter');

        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, () => this.resetColumnCaches());
        this.addManagedPropertyListener('includeHiddenColumnsInAdvancedFilter', (event: PropertyChangedEvent) => {
            this.includeHiddenColumns = !!event.currentValue;
            this.resetColumnCaches();
        });
    }

    public parseJoinOperator(model: JoinAdvancedFilterModel): string {
        const { type } = model;
        return this.expressionJoinOperators[type.toLowerCase() as 'and' | 'or'] ?? type;
    }

    public parseColumnName(model: ColumnAdvancedFilterModel): string {
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
        return columnName;
    }

    public parseOperator(model: ColumnAdvancedFilterModel): string {
        return this.getExpressionOperator(model.filterType, model.type)?.displayValue ?? model.type;
    }

    public parseOperand(model: ColumnAdvancedFilterModel, skipFormatting?: boolean): string {
        const { colId, filter } = model as any;
        const column = this.columnModel.getPrimaryColumn(colId);
        let operand = '';
        if (filter != null) {
            let operand1;
            if (model.filterType === 'number') {
                operand1 = _.toStringOrNull(filter) ?? '';
            } else {
                operand1 = column ? this.valueFormatterService.formatValue(column, null, filter) : filter;
                operand1 = operand1 ?? _.toStringOrNull(filter) ?? '';
                if (!skipFormatting) {
                    operand1 = `"${operand1}"`;
                }
            }
            operand = skipFormatting ? operand1 : ` ${operand1}`;
        }
        return operand;
    }

    public parseColumnFilterModel(model: ColumnAdvancedFilterModel): string {
        const columnName = this.parseColumnName(model);
        const operator = this.parseOperator(model) ?? '';
        let operands = this.parseOperand(model);
        return `[${columnName}] ${operator}${operands}`;
    }

    public updateAutocompleteCache(updateEntry: AutocompleteEntry, type?: string): void {
        if (type === 'column') {
            const { key: colId, displayValue } = updateEntry;
            this.columnNameToIdMap[updateEntry.displayValue!.toLocaleUpperCase()] = { colId, columnName: displayValue! };
        }
    }

    public translate(key: keyof typeof ADVANCED_FILTER_LOCALE_TEXT, variableValues?: string[]): string {
        let defaultValue = ADVANCED_FILTER_LOCALE_TEXT[key];
        if (typeof defaultValue === 'function') {
            defaultValue = defaultValue(variableValues!);
        }
        return this.localeService.getLocaleTextFunc()(key, defaultValue, variableValues);
    }

    public generateAutocompleteListParams(entries: AutocompleteEntry[], type: string, searchString: string): AutocompleteListParams {
        return {
            enabled: true,
            type,
            searchString,
            entries
        }
    }

    public getColumnAutocompleteEntries(): AutocompleteEntry[] {
        if (this.columnAutocompleteEntries) {
            return this.columnAutocompleteEntries;
        }
        const columns = this.columnModel.getAllPrimaryColumns() ?? [];
        const entries: AutocompleteEntry[] = [];
        columns.forEach(column => {
            if (column.getColDef().filter && (this.includeHiddenColumns || column.isVisible() || column.isRowGroupActive())) {
                entries.push({
                    key: column.getColId(),
                    displayValue: this.columnModel.getDisplayNameForColumn(column, 'advancedFilter')!
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

    public getOperatorAutocompleteEntries(column: Column, baseCellDataType: BaseCellDataType): AutocompleteEntry[] {
        const activeOperators = this.getActiveOperators(column);
        return this.getDataTypeExpressionOperator(baseCellDataType)!.getEntries(activeOperators);
    }

    public getJoinOperatorAutocompleteEntries(): AutocompleteEntry[] {
        return Object.entries(this.expressionJoinOperators).map(([key, displayValue]) => ({key, displayValue}));
    }

    public getDefaultAutocompleteListParams(searchString: string): AutocompleteListParams {
        return this.generateAutocompleteListParams(this.getColumnAutocompleteEntries(), 'column', searchString);
    }

    public getDataTypeExpressionOperator(baseCellDataType?: BaseCellDataType): DataTypeFilterExpressionOperators<any> | undefined {
        return this.expressionOperators[baseCellDataType!];
    }

    public getExpressionOperator(baseCellDataType?: BaseCellDataType, operator?: string): FilterExpressionOperator<any> | undefined {
        return this.getDataTypeExpressionOperator(baseCellDataType)?.operators?.[operator!];
    }

    public getExpressionJoinOperators(): { and: string, or: string } {
        return this.expressionJoinOperators;
    }

    public getColId(columnName: string): { colId: string, columnName: string } | null {
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

    public getExpressionEvaluatorParams<ConvertedTValue, TValue = ConvertedTValue>(colId: string): FilterExpressionEvaluatorParams<ConvertedTValue, TValue> {
        let params = this.expressionEvaluatorParams[colId];
        if (params) { return params; }

        const column = this.columnModel.getPrimaryColumn(colId);
        if (!column) { return { valueConverter: (v: any) => v }; }

        const baseCellDataType = this.dataTypeService.getBaseDataType(column);
        switch (baseCellDataType) {
            case 'dateString':
                params = {
                    valueConverter: this.dataTypeService.getDateParserFunction()
                };
                break;
            case 'object':
                params = {
                    valueConverter: (value, node) => this.valueFormatterService.formatValue(column, node, value)
                        ?? (typeof value.toString === 'function' ? value.toString() : '')
                };
                break;
            case 'text': 
            case undefined: 
                params = { valueConverter: (v: any) => _.toStringOrNull(v) };
                break;
            default:
                params = { valueConverter: (v: any) => v };
                break;
        }
        const { filterParams } = column.getColDef();
        if (filterParams) {
            [
                'caseSensitive', 'includeBlanksInEquals', 'includeBlanksInLessThan', 'includeBlanksInGreaterThan'
            ].forEach((param: keyof FilterExpressionEvaluatorParams<ConvertedTValue, TValue>) => {
                const paramValue = filterParams[param];
                if (paramValue) {
                    params[param] = paramValue
                }
            });
        }
        this.expressionEvaluatorParams[colId] = params;

        return params;
    }

    public getColumnDetails(colId: string): { column: Column, baseCellDataType: BaseCellDataType } | null {
        const column = this.columnModel.getPrimaryColumn(colId);
        if (!column) { return null; }
        const baseCellDataType = this.dataTypeService.getBaseDataType(column);
        if (!baseCellDataType) { return null; }
        return { column, baseCellDataType };
    }

    public generateExpressionOperators(): FilterExpressionOperators {
        const translate = (key: keyof typeof ADVANCED_FILTER_LOCALE_TEXT, variableValues?: string[]) => this.translate(key, variableValues);
        return {
            text: new TextFilterExpressionOperators({ translate }),
            boolean: new BooleanFilterExpressionOperators({ translate }),
            object: new TextFilterExpressionOperators<any>({ translate }),
            number: new ScalarFilterExpressionOperators<number>({ translate, equals: (v, o) => v === o }),
            date: new ScalarFilterExpressionOperators<Date>({ translate, equals: (v: Date, o: Date) => v.getTime() === o.getTime() }),
            dateString: new ScalarFilterExpressionOperators<Date, string>({ translate, equals: (v: Date, o: Date) => v.getTime() === o.getTime() })
        }
    }

    public getColumnValue({ displayValue }: AutocompleteEntry): string {
        return `${ColFilterExpressionParser.COL_START_CHAR}${displayValue}${ColFilterExpressionParser.COL_END_CHAR}`;
    }

    private generateExpressionJoinOperators(): { and: string, or: string } {
        return {
            and: this.translate('advancedFilterAnd'),
            or: this.translate('advancedFilterOr')
        };
    }

    private getActiveOperators(column: Column): string[] | undefined {
        const filterOptions = column.getColDef().filterParams?.filterOptions;
        if (!filterOptions) { return undefined; }
        const isValid = filterOptions.every((filterOption: any) => typeof filterOption === 'string');
        return isValid ? filterOptions : undefined;
    }

    private resetColumnCaches(): void {
        this.columnAutocompleteEntries = null;
        this.columnNameToIdMap = {};
    }
}
