import type {
    AgColumn,
    BaseCellDataType,
    BeanCollection,
    ColumnAdvancedFilterModel,
    ColumnModel,
    ColumnNameService,
    DataTypeService,
    JoinAdvancedFilterModel,
    NamedBean,
    ValueService,
} from 'ag-grid-community';
import { BeanStub, _exists, _parseDateTimeFromString, _serialiseDate, _toStringOrNull } from 'ag-grid-community';

import { ADVANCED_FILTER_LOCALE_TEXT } from './advancedFilterLocaleText';
import type { AutocompleteEntry, AutocompleteListParams } from './autocomplete/autocompleteParams';
import { COL_FILTER_EXPRESSION_END_CHAR, COL_FILTER_EXPRESSION_START_CHAR } from './colFilterExpressionParser';
import type {
    DataTypeFilterExpressionOperators,
    FilterExpressionEvaluatorParams,
    FilterExpressionOperator,
    FilterExpressionOperators,
} from './filterExpressionOperators';
import {
    BooleanFilterExpressionOperators,
    ScalarFilterExpressionOperators,
    TextFilterExpressionOperators,
} from './filterExpressionOperators';

export class AdvancedFilterExpressionService extends BeanStub implements NamedBean {
    beanName = 'advFilterExpSvc' as const;

    private valueSvc: ValueService;
    private colModel: ColumnModel;
    private colNames: ColumnNameService;
    private dataTypeSvc?: DataTypeService;

    private filterOperandGetters: Record<BaseCellDataType, (model: any) => string | null> = {
        number: (model) => _toStringOrNull(model.filter) ?? '',
        date: (model) => {
            const column = this.colModel.getColDefCol(model.colId);
            if (!column) {
                return null;
            }
            return this.valueSvc.formatValue(column, null, _parseDateTimeFromString(model.filter));
        },
        dateTime: (model) => this.filterOperandGetters.date(model),
        dateString: (model) => {
            const column = this.colModel.getColDefCol(model.colId);
            if (!column) {
                return null;
            }
            const { filter } = model;
            const dateFormatFn = this.dataTypeSvc?.getDateFormatterFunction(column);
            const dateStringStringValue = dateFormatFn?.(_parseDateTimeFromString(filter) ?? undefined) ?? filter;
            return this.valueSvc.formatValue(column, null, dateStringStringValue);
        },
        dateTimeString: (model) => this.filterOperandGetters.dateString(model),
        boolean: () => null,
        object: () => null,
        text: () => null,
    };

    private operandModelValueGetters: Record<
        BaseCellDataType,
        (op: string, cln: AgColumn, dt: BaseCellDataType) => number | string | null
    > = {
        number: (operand) => (_exists(operand) ? Number(operand) : null),
        date: (operand, column, baseCellDataType) =>
            _serialiseDate(
                this.valueSvc.parseValue(column, null, operand, undefined),
                !!this.dataTypeSvc?.getDateIncludesTimeFlag(baseCellDataType)
            ),
        dateTime: (...args) => this.operandModelValueGetters.date(...args),
        dateString: (operand, column, baseCellDataType) => {
            const parsedDateString = this.valueSvc.parseValue(column, null, operand, undefined);
            if (this.dataTypeSvc) {
                return _serialiseDate(
                    this.dataTypeSvc.getDateParserFunction(column)(parsedDateString) ?? null,
                    this.dataTypeSvc.getDateIncludesTimeFlag(baseCellDataType)
                );
            }
            return parsedDateString;
        },
        dateTimeString: (...args) => this.operandModelValueGetters.dateString(...args),
        boolean: (operand) => operand,
        object: (operand) => operand,
        text: (operand) => operand,
    };

    public wireBeans(beans: BeanCollection): void {
        this.valueSvc = beans.valueSvc;
        this.colModel = beans.colModel;
        this.colNames = beans.colNames;
        this.dataTypeSvc = beans.dataTypeSvc;
    }

    private columnNameToIdMap: { [columnNameUpperCase: string]: { colId: string; columnName: string } } = {};
    private columnAutocompleteEntries: AutocompleteEntry[] | null = null;
    private expressionOperators: FilterExpressionOperators;
    private expressionJoinOperators: { AND: string; OR: string };
    private expressionEvaluatorParams: { [colId: string]: FilterExpressionEvaluatorParams<any> } = {};

    public postConstruct(): void {
        this.expressionJoinOperators = this.generateExpressionJoinOperators();
        this.expressionOperators = this.generateExpressionOperators();
    }

    public parseJoinOperator(model: JoinAdvancedFilterModel): string {
        const { type } = model;
        return this.expressionJoinOperators[type] ?? type;
    }

    public getColumnDisplayValue(model: ColumnAdvancedFilterModel): string | undefined {
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

    public getOperatorDisplayValue(model: ColumnAdvancedFilterModel): string | undefined {
        return this.getExpressionOperator(model.filterType, model.type)?.displayValue ?? model.type;
    }

    public getOperandModelValue(
        operand: string,
        baseCellDataType: BaseCellDataType,
        column: AgColumn
    ): string | number | null {
        return this.operandModelValueGetters[baseCellDataType](operand, column, baseCellDataType);
    }

    public getOperandDisplayValue(model: ColumnAdvancedFilterModel, skipFormatting?: boolean): string {
        const { filter } = model as any;

        if (filter == null) {
            return '';
        }
        let operand1 = this.filterOperandGetters[model.filterType](model);
        if (model.filterType !== 'number') {
            operand1 ??= _toStringOrNull(filter) ?? '';
            if (!skipFormatting) {
                operand1 = `"${operand1}"`;
            }
        }
        return skipFormatting ? operand1! : ` ${operand1}`;
    }

    public parseColumnFilterModel(model: ColumnAdvancedFilterModel): string {
        const columnName = this.getColumnDisplayValue(model) ?? '';
        const operator = this.getOperatorDisplayValue(model) ?? '';
        const operands = this.getOperandDisplayValue(model);
        return `[${columnName}] ${operator}${operands}`;
    }

    public updateAutocompleteCache(updateEntry: AutocompleteEntry, type?: string): void {
        if (type === 'column') {
            const { key: colId, displayValue } = updateEntry;
            this.columnNameToIdMap[updateEntry.displayValue!.toLocaleUpperCase()] = {
                colId,
                columnName: displayValue!,
            };
        }
    }

    public translate(key: keyof typeof ADVANCED_FILTER_LOCALE_TEXT, variableValues?: string[]): string {
        let defaultValue = ADVANCED_FILTER_LOCALE_TEXT[key];
        if (typeof defaultValue === 'function') {
            defaultValue = defaultValue(variableValues!);
        }
        return this.getLocaleTextFunc()(key, defaultValue, variableValues);
    }

    public generateAutocompleteListParams(
        entries: AutocompleteEntry[],
        type: string,
        searchString: string
    ): AutocompleteListParams {
        return {
            enabled: true,
            type,
            searchString,
            entries,
        };
    }

    public getColumnAutocompleteEntries(): AutocompleteEntry[] {
        if (this.columnAutocompleteEntries) {
            return this.columnAutocompleteEntries;
        }
        const columns = this.colModel.getColDefCols() ?? [];
        const entries: AutocompleteEntry[] = [];
        const includeHiddenColumns = this.gos.get('includeHiddenColumnsInAdvancedFilter');
        columns.forEach((column) => {
            if (
                column.getColDef().filter &&
                (includeHiddenColumns || column.isVisible() || column.isRowGroupActive())
            ) {
                entries.push({
                    key: column.getColId(),
                    displayValue: this.colNames.getDisplayNameForColumn(column, 'advancedFilter')!,
                });
            }
        });
        entries.sort((a, b) => {
            const aValue = a.displayValue ?? '';
            const bValue = b.displayValue ?? '';
            if (aValue < bValue) {
                return -1;
            } else if (bValue > aValue) {
                return 1;
            }
            return 0;
        });
        return entries;
    }

    public getOperatorAutocompleteEntries(column: AgColumn, baseCellDataType: BaseCellDataType): AutocompleteEntry[] {
        const activeOperators = this.getActiveOperators(column);
        return this.getDataTypeExpressionOperator(baseCellDataType)!.getEntries(activeOperators);
    }

    public getJoinOperatorAutocompleteEntries(): AutocompleteEntry[] {
        // eslint-disable-next-line no-restricted-properties
        return Object.entries(this.expressionJoinOperators).map(([key, displayValue]) => ({ key, displayValue }));
    }

    public getDefaultAutocompleteListParams(searchString: string): AutocompleteListParams {
        return this.generateAutocompleteListParams(this.getColumnAutocompleteEntries(), 'column', searchString);
    }

    public getDataTypeExpressionOperator(
        baseCellDataType?: BaseCellDataType
    ): DataTypeFilterExpressionOperators<any> | undefined {
        return this.expressionOperators[baseCellDataType!];
    }

    public getExpressionOperator(
        baseCellDataType?: BaseCellDataType,
        operator?: string
    ): FilterExpressionOperator<any> | undefined {
        return this.getDataTypeExpressionOperator(baseCellDataType)?.operators?.[operator!];
    }

    public getExpressionJoinOperators(): { AND: string; OR: string } {
        return this.expressionJoinOperators;
    }

    public getColId(columnName: string): { colId: string; columnName: string } | null {
        const upperCaseColumnName = columnName.toLocaleUpperCase();
        const cachedColId = this.columnNameToIdMap[upperCaseColumnName];
        if (cachedColId) {
            return cachedColId;
        }

        const columnAutocompleteEntries = this.getColumnAutocompleteEntries();
        const colEntry = columnAutocompleteEntries.find(
            ({ displayValue }) => displayValue!.toLocaleUpperCase() === upperCaseColumnName
        );
        if (colEntry) {
            const { key: colId, displayValue } = colEntry;
            const colValue = { colId, columnName: displayValue! };
            // cache for faster lookup
            this.columnNameToIdMap[upperCaseColumnName] = colValue;
            return colValue;
        }
        return null;
    }

    public getExpressionEvaluatorParams<ConvertedTValue, TValue = ConvertedTValue>(
        colId: string
    ): FilterExpressionEvaluatorParams<ConvertedTValue, TValue> {
        let params = this.expressionEvaluatorParams[colId];
        if (params) {
            return params;
        }

        const column = this.colModel.getColDefCol(colId);
        if (!column) {
            return { valueConverter: (v: any) => v };
        }

        const baseCellDataType = this.dataTypeSvc?.getBaseDataType(column);
        switch (baseCellDataType) {
            case 'dateTimeString':
            case 'dateString':
                params = {
                    valueConverter: this.dataTypeSvc?.getDateParserFunction(column) ?? ((v: any) => v),
                };
                break;
            case 'object':
                // If there's a filter value getter, assume the value is already a string. Otherwise we need to format it.
                if (column.getColDef().filterValueGetter) {
                    params = { valueConverter: (v: any) => v };
                } else {
                    params = {
                        valueConverter: (value, node) =>
                            this.valueSvc.formatValue(column, node, value) ??
                            (typeof value.toString === 'function' ? value.toString() : ''),
                    };
                }
                break;
            case 'text':
            case undefined:
                params = { valueConverter: (v: any) => _toStringOrNull(v) };
                break;
            default:
                params = { valueConverter: (v: any) => v };
                break;
        }
        const { filterParams } = column.getColDef();
        if (filterParams) {
            ['caseSensitive', 'includeBlanksInEquals', 'includeBlanksInLessThan', 'includeBlanksInGreaterThan'].forEach(
                (param: keyof FilterExpressionEvaluatorParams<ConvertedTValue, TValue>) => {
                    const paramValue = filterParams[param];
                    if (paramValue) {
                        params[param] = paramValue;
                    }
                }
            );
        }
        this.expressionEvaluatorParams[colId] = params;

        return params;
    }

    public getColumnDetails(colId: string): { column?: AgColumn; baseCellDataType: BaseCellDataType } {
        const column = this.colModel.getColDefCol(colId) ?? undefined;
        const baseCellDataType = (column ? this.dataTypeSvc?.getBaseDataType(column) : undefined) ?? 'text';
        return { column, baseCellDataType };
    }

    public generateExpressionOperators(): FilterExpressionOperators {
        const translate = (key: keyof typeof ADVANCED_FILTER_LOCALE_TEXT, variableValues?: string[]) =>
            this.translate(key, variableValues);
        const dateOperatorsParams = {
            translate,
            equals: (v: Date, o: Date) => v.getTime() === o.getTime(),
        };

        return {
            text: new TextFilterExpressionOperators({ translate }),
            boolean: new BooleanFilterExpressionOperators({ translate }),
            object: new TextFilterExpressionOperators<any>({ translate }),
            number: new ScalarFilterExpressionOperators<number>({ translate, equals: (v, o) => v === o }),
            date: new ScalarFilterExpressionOperators<Date>(dateOperatorsParams),
            dateString: new ScalarFilterExpressionOperators<Date, string>(dateOperatorsParams),
            dateTime: new ScalarFilterExpressionOperators<Date>(dateOperatorsParams),
            dateTimeString: new ScalarFilterExpressionOperators<Date, string>(dateOperatorsParams),
        };
    }

    public getColumnValue({ displayValue }: AutocompleteEntry): string {
        return `${COL_FILTER_EXPRESSION_START_CHAR}${displayValue}${COL_FILTER_EXPRESSION_END_CHAR}`;
    }

    private generateExpressionJoinOperators(): { AND: string; OR: string } {
        return {
            AND: this.translate('advancedFilterAnd'),
            OR: this.translate('advancedFilterOr'),
        };
    }

    private getActiveOperators(column: AgColumn): string[] | undefined {
        const filterOptions = column.getColDef().filterParams?.filterOptions;
        if (!filterOptions) {
            return undefined;
        }
        const isValid = filterOptions.every((filterOption: any) => typeof filterOption === 'string');
        return isValid ? filterOptions : undefined;
    }

    public resetColumnCaches(): void {
        this.columnAutocompleteEntries = null;
        this.columnNameToIdMap = {};
        this.expressionEvaluatorParams = {};
    }
}
