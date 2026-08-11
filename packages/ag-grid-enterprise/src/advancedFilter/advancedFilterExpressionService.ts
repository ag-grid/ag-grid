import { _exists, _parseBigIntOrNull, _parseDateTimeFromString, _serialiseDate, _toStringOrNull } from 'ag-stack';

import type {
    AgColumn,
    BaseCellDataType,
    BeanCollection,
    ColumnAdvancedFilterModel,
    ColumnModel,
    ColumnNameService,
    DataTypeService,
    IFilterOptionDef,
    JoinAdvancedFilterModel,
    NamedBean,
    ValueService,
} from 'ag-grid-community';
import { BeanStub, _getMissingFilterOptionKeys } from 'ag-grid-community';

import { ADVANCED_FILTER_LOCALE_TEXT } from './advancedFilterLocaleText';
import type { AutocompleteEntry, AutocompleteListParams } from './autocomplete/autocompleteParams';
import { COL_FILTER_EXPRESSION_END_CHAR, COL_FILTER_EXPRESSION_START_CHAR } from './colFilterExpressionParser';
import { createCustomOptionOperators, getColumnFilterOptions, isCustomFilterOption } from './customFilterOptions';
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
import type { ColumnFilterModelOperands } from './filterExpressionUtils';
import { getBigIntParser } from './filterExpressionUtils';

/** How many values a model carries, for an option no operator resolves. */
function getModelNumOperands(filter: unknown, filterTo: unknown): number {
    if (filterTo != null) {
        return 2;
    }
    return filter == null ? 0 : 1;
}

/** A column's operators and the keys it narrows them to, classified together from its one `filterOptions`. */
interface ColumnOperators {
    operators: DataTypeFilterExpressionOperators<any>;
    activeOperators: string[] | undefined;
}

export class AdvancedFilterExpressionService extends BeanStub implements NamedBean {
    beanName = 'advFilterExpSvc' as const;

    private valueSvc: ValueService;
    private colModel: ColumnModel;
    private colNames: ColumnNameService;
    private dataTypeSvc?: DataTypeService;

    private readonly filterOperandGetters: Record<
        BaseCellDataType,
        (model: { filter?: string | number; colId: string }) => string | null
    > = {
        number: (model) => _toStringOrNull(model.filter) ?? '',
        bigint: (model) => {
            const rawValue = _toStringOrNull(model.filter);
            const column = this.colModel.getNonPivotCol(model.colId);
            const formatter = column?.colDef.filterParams?.bigintFormatter;
            if (!formatter || rawValue == null) {
                return rawValue ?? '';
            }
            // The model already holds the canonical decimal string, so parse it back with the
            // default parser - the custom parser expects user-facing input and could double-transform.
            const parsed = _parseBigIntOrNull(rawValue);
            return (parsed == null ? null : formatter(parsed)) ?? rawValue;
        },
        date: (model) => {
            const column = this.colModel.getNonPivotCol(model.colId);
            if (!column) {
                return null;
            }
            return this.valueSvc.formatValue(
                column,
                null,
                _parseDateTimeFromString(_toStringOrNull(model.filter) ?? ''),
                undefined,
                true
            );
        },
        dateTime: (model) => this.filterOperandGetters.date(model),
        dateString: (model) => {
            const column = this.colModel.getNonPivotCol(model.colId);
            if (!column) {
                return null;
            }
            const { filter } = model;
            const dateFormatFn = this.dataTypeSvc?.getDateFormatterFunction(column);
            const dateStringStringValue =
                dateFormatFn?.(_parseDateTimeFromString(_toStringOrNull(model.filter) ?? '') ?? undefined) ?? filter;
            return this.valueSvc.formatValue(column, null, dateStringStringValue);
        },
        dateTimeString: (model) => this.filterOperandGetters.dateString(model),
        boolean: () => null,
        object: () => null,
        text: () => null,
    };

    private readonly operandModelValueGetters: Record<
        BaseCellDataType,
        (op: string, cln: AgColumn, dt: BaseCellDataType) => number | string | null
    > = {
        number: (operand) => (_exists(operand) ? Number(operand) : null),
        bigint: (operand, column) => {
            const parsed = getBigIntParser(column)(operand);
            return parsed == null ? null : String(parsed);
        },
        date: (operand, column, baseCellDataType) =>
            _serialiseDate(
                this.valueSvc.parseValue(column, null, operand, undefined) as Date,
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

    private columnNameToIdMap: { [columnNameUpperCase: string]: { colId: string; columnName: string } } =
        Object.create(null);
    private expressionOperators: FilterExpressionOperators;
    private expressionJoinOperators: { AND: string; OR: string };
    private expressionEvaluatorParams: { [colId: string]: FilterExpressionEvaluatorParams<any> } = Object.create(null);
    private columnAutocompleteEntries: AutocompleteEntry[] | null = null;
    /** Per data type, then per column identity, so a cache hit costs no key to build. */
    private columnExpressionOperators: { [dataType: string]: Map<AgColumn, ColumnOperators> } = Object.create(null);

    public postConstruct(): void {
        this.expressionJoinOperators = this.generateExpressionJoinOperators();
        this.expressionOperators = this.generateExpressionOperators();

        // Everything an entry is built from: which columns exist, whether each is offered, and its display name.
        const resetColumnCaches = this.resetColumnCaches.bind(this);
        this.addManagedEventListeners({
            newColumnsLoaded: resetColumnCaches,
            columnVisible: resetColumnCaches,
            columnRowGroupChanged: resetColumnCaches,
            columnPivotModeChanged: resetColumnCaches,
            columnPivotChanged: resetColumnCaches,
            columnHeaderNameChanged: resetColumnCaches,
        });
        // No listener for `includeHiddenColumnsInAdvancedFilter`, which these caches also depend on:
        // `AdvancedFilterService` listens for it and resets them through `updateValidity`.
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
        const column = this.colModel.getNonPivotColById(model.colId);
        return this.getExpressionOperator(model.filterType, model.type, column)?.displayValue ?? model.type;
    }

    public getOperandModelValue(
        operand: string,
        baseCellDataType: BaseCellDataType,
        column: AgColumn
    ): string | number | null {
        return this.operandModelValueGetters[baseCellDataType](operand, column, baseCellDataType);
    }

    /**
     * Whether a stored operand is itself valid input for its data type, i.e. whether feeding the model
     * value back into the expression or the builder editor yields the same value again.
     *
     * True for most types: text and number model values are their input form, and dates store the iso
     * string the editor expects. It is false only for `bigint`, where the model holds the canonical
     * decimal while input goes through the column's `bigintParser` - so a parser reading a non-decimal
     * syntax would reinterpret that decimal as a different number. Those operands have to be presented
     * through `getOperandDisplayValue` (the `bigintFormatter`) or kept as the text the user typed.
     */
    public isOperandModelValueEditable(baseCellDataType: BaseCellDataType): boolean {
        return baseCellDataType !== 'bigint';
    }

    /** The whole operand region: one value, or the comma-separated bracketed pair an option taking two writes. */
    public getOperandDisplayValue(model: ColumnAdvancedFilterModel, skipFormatting?: boolean): string {
        const { filter, filterTo } = model as ColumnFilterModelOperands;
        const column = this.colModel.getNonPivotColById(model.colId);
        // An option nothing resolves says nothing about its arity, so the model's own values decide it.
        const numOperands =
            this.getExpressionOperator(model.filterType, model.type, column)?.numOperands ??
            getModelNumOperands(filter, filterTo);

        // A value left in the model by whatever set it is not this option's, which takes none.
        if (numOperands === 0) {
            return '';
        }

        const from = this.formatOperand(model, filter, skipFormatting);
        const to = numOperands > 1 ? this.formatOperand(model, filterTo, skipFormatting) : '';
        if (!from && !to) {
            return '';
        }
        // A leading gap keeps its place, or the value reads as the first operand; a trailing one just stops short.
        if (!to) {
            return skipFormatting ? from : ` ${from}`;
        }
        return skipFormatting ? `${from}, ${to}` : ` (${from}, ${to})`;
    }

    /** One operand of a model, quoted for the expression unless the caller shows it on its own. */
    public formatOperand(
        model: ColumnAdvancedFilterModel,
        value: string | number | undefined,
        skipFormatting?: boolean
    ): string {
        const { filterType, colId } = model;
        if (value == null) {
            return '';
        }
        let operand = this.filterOperandGetters[filterType]({ filter: value, colId });
        if (filterType !== 'number' && filterType !== 'bigint') {
            operand ??= _toStringOrNull(value) ?? '';
            if (!skipFormatting) {
                // Quote with the char the value does not contain so a value holding one quote kind
                // still round-trips (the parser accepts either quote); a value with both fails safe.
                const quote = operand.includes('"') && !operand.includes(`'`) ? `'` : `"`;
                operand = `${quote}${operand}${quote}`;
            }
        }
        return operand!;
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
        const cached = this.columnAutocompleteEntries;
        if (cached) {
            return cached;
        }
        const columns = this.colModel.colDefList;
        const entries: AutocompleteEntry[] = [];
        const includeHiddenColumns = this.gos.get('includeHiddenColumnsInAdvancedFilter');
        for (const column of columns) {
            if (column.colDef.filter && (includeHiddenColumns || column.isVisible() || column.isRowGroupActive())) {
                entries.push({
                    key: column.colId,
                    displayValue: this.colNames.getDisplayNameForColumn(column, 'advancedFilter')!,
                });
            }
        }
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
        this.columnAutocompleteEntries = entries;
        return entries;
    }

    public getOperatorAutocompleteEntries(column: AgColumn, baseCellDataType: BaseCellDataType): AutocompleteEntry[] {
        const { operators, activeOperators } = this.getColumnOperators(baseCellDataType, column)!;
        return operators.getEntries(activeOperators);
    }

    public getJoinOperatorAutocompleteEntries(): AutocompleteEntry[] {
        // eslint-disable-next-line no-restricted-properties
        return Object.entries(this.expressionJoinOperators).map(([key, displayValue]) => ({ key, displayValue }));
    }

    public getDefaultAutocompleteListParams(searchString: string): AutocompleteListParams {
        return this.generateAutocompleteListParams(this.getColumnAutocompleteEntries(), 'column', searchString);
    }

    /** A data type's built-ins with the column's own options over them, so a `displayKey` is per column. */
    public getDataTypeExpressionOperator(
        baseCellDataType?: BaseCellDataType,
        column?: AgColumn | null
    ): DataTypeFilterExpressionOperators<any> | undefined {
        return column
            ? this.getColumnOperators(baseCellDataType, column)?.operators
            : this.expressionOperators[baseCellDataType!];
    }

    private getColumnOperators(
        baseCellDataType: BaseCellDataType | undefined,
        column: AgColumn
    ): ColumnOperators | undefined {
        const dataTypeOperators = this.expressionOperators[baseCellDataType!];
        if (!dataTypeOperators) {
            return undefined;
        }
        const byDataType = this.columnExpressionOperators;
        let forDataType = byDataType[baseCellDataType!];
        if (!forDataType) {
            forDataType = new Map();
            byDataType[baseCellDataType!] = forDataType;
        }
        let columnOperators = forDataType.get(column);
        if (!columnOperators) {
            const filterOptions = getColumnFilterOptions(column);
            const { keys, customOptions } = this.classifyColumnOptions(filterOptions);
            columnOperators = {
                operators: customOptions.length
                    ? createCustomOptionOperators(dataTypeOperators, customOptions, this.getLocaleTextFunc())
                    : dataTypeOperators,
                activeOperators: filterOptions ? keys : undefined,
            };
            forDataType.set(column, columnOperators);
        }
        return columnOperators;
    }

    public getExpressionOperator(
        baseCellDataType?: BaseCellDataType,
        operator?: string,
        column?: AgColumn | null
    ): FilterExpressionOperator<any> | undefined {
        const operators = this.getDataTypeExpressionOperator(baseCellDataType, column)?.operators;
        return operators && Object.prototype.hasOwnProperty.call(operators, operator!)
            ? operators[operator!]
            : undefined;
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

        const column = this.colModel.getNonPivotColById(colId);
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
                if (column.colDef.filterValueGetter) {
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
        const { filterParams } = column.colDef;
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
        const column = this.colModel.getNonPivotColById(colId);
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
            bigint: new ScalarFilterExpressionOperators<bigint>({ translate, equals: (v, o) => v === o }),
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

    /**
     * The keys the column offers, one per key, and the options carrying their own predicate. A malformed one is
     * reported here: a column filtered only through the Advanced Filter builds no `OptionsFactory` to report it.
     */
    private classifyColumnOptions(filterOptions: (string | IFilterOptionDef)[] | undefined): {
        keys: string[];
        customOptions: IFilterOptionDef[];
    } {
        const keys: string[] = [];
        const customOptions: IFilterOptionDef[] = [];
        const seenKeys = new Set<string>();
        for (let i = 0, len = filterOptions?.length ?? 0; i < len; ++i) {
            const option = filterOptions![i];
            let key: string;
            if (typeof option === 'string') {
                key = option;
            } else if (option == null) {
                continue;
            } else if (isCustomFilterOption(option)) {
                key = option.displayKey;
                customOptions.push(option);
            } else {
                this.warn(72, { keys: _getMissingFilterOptionKeys(option) });
                continue;
            }
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                keys.push(key);
            }
        }
        return { keys, customOptions };
    }

    public resetColumnCaches(): void {
        this.columnAutocompleteEntries = null;
        this.columnNameToIdMap = Object.create(null);
        this.expressionEvaluatorParams = Object.create(null);
        this.columnExpressionOperators = Object.create(null);
    }
}
