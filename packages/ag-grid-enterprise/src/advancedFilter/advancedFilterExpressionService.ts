import { _getOwn, _parseBigIntOrNull, _parseDateTimeFromString, _serialiseDate, _toStringOrNull } from 'ag-stack';

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
    SetAdvancedFilterModel,
    ValueService,
} from 'ag-grid-community';
import { BeanStub, _classifyFilterOptions, _toFiniteNumber } from 'ag-grid-community';

import { ADVANCED_FILTER_LOCALE_TEXT } from './advancedFilterLocaleText';
import type { AutocompleteEntry, AutocompleteListParams } from './autocomplete/autocompleteParams';
import { COL_FILTER_EXPRESSION_END_CHAR, COL_FILTER_EXPRESSION_START_CHAR } from './colFilterExpressionParser';
import { createCustomOptionOperators, getColumnFilterOptions } from './customFilterOptions';
import type {
    DataTypeFilterExpressionOperators,
    FilterExpressionEvaluatorParams,
    FilterExpressionOperator,
    FilterExpressionOperators,
} from './filterExpressionOperators';
import {
    BooleanFilterExpressionOperators,
    OPERAND_COUNT,
    ScalarFilterExpressionOperators,
    TextFilterExpressionOperators,
} from './filterExpressionOperators';
import type { ColumnFilterModelOperands } from './filterExpressionUtils';
import {
    getBigIntFormatter,
    getBigIntParser,
    getNumberFormatter,
    getNumberParser,
    hasCustomNumberOperands,
} from './filterExpressionUtils';
import type { AdvancedFilterSetService } from './set/advancedFilterSetService';
import { addSetOperators, withSetOperators } from './set/setFilterExpressionOperators';
import { SET_LIST_CLOSE_CHAR, SET_LIST_OPEN_CHAR, joinSetPath } from './set/setOperandsParser';

/** What an unquoted operand cannot carry: a space or `)` ends it, a quote opens one, a `,` ends it in a pair. */
function needsQuotes(operand: string, inPair?: boolean): boolean {
    return (
        operand.includes(' ') ||
        operand.includes(')') ||
        operand.startsWith(`'`) ||
        operand.startsWith('"') ||
        (!!inPair && operand.includes(','))
    );
}

/** The quote a value can be wrapped in, or null when it holds both kinds: either one would end it early. */
function quoteChar(operand: string): `'` | `"` | null {
    if (!operand.includes('"')) {
        return '"';
    }
    return operand.includes(`'`) ? null : `'`;
}

/** A set value is always written quoted, so the list reads back segment for segment. */
export function quoteSetValue(value: string): string {
    const quote = quoteChar(value);
    // No quote wraps a value holding both untouched, so the one that does is doubled instead.
    return quote ? `${quote}${value}${quote}` : `"${value.replaceAll('"', '""')}"`;
}

/** The same path as an expression writes it: every segment quoted. */
export const quoteSetPath = (path: readonly string[]): string => joinSetPath(path.map(quoteSetValue));

/** The `filterParams` an Advanced Filter evaluator honours; the rest are column-filter UI concerns. */
const COPIED_FILTER_PARAMS: (keyof FilterExpressionEvaluatorParams<any>)[] = [
    'caseSensitive',
    'includeBlanksInEquals',
    'includeBlanksInNotEqual',
    'includeBlanksInLessThan',
    'includeBlanksInGreaterThan',
    'includeBlanksInRange',
    'inRangeInclusive',
];

/** A column's operators and the keys it narrows them to, classified together from its one `filterOptions`. */
interface ColumnOperators {
    readonly operators: DataTypeFilterExpressionOperators<any>;
    readonly activeOperators: string[] | undefined;
}

export class AdvancedFilterExpressionService extends BeanStub implements NamedBean {
    beanName = 'advFilterExpSvc' as const;

    private valueSvc: ValueService;
    private colModel: ColumnModel;
    private colNames: ColumnNameService;
    private dataTypeSvc?: DataTypeService;
    private advFilterSetSvc: AdvancedFilterSetService;

    /** Whether the last model written held a set value the column's values could not spell. Caller-reset. */
    public wroteUnresolvedSetValue = false;

    private readonly filterOperandGetters: Record<
        BaseCellDataType,
        (model: { filter?: string | number; colId: string }) => string | null
    > = {
        // Written in the column's own syntax exactly where `getNumberParser` reads that syntax back.
        number: (model) => {
            const column = this.colModel.getNonPivotCol(model.colId);
            return this.applyOperandFormatter(
                model.filter,
                getNumberFormatter(column, this.gos),
                _toFiniteNumber,
                getNumberParser(column, this.gos)
            );
        },
        bigint: (model) => {
            const column = this.colModel.getNonPivotCol(model.colId);
            return this.applyOperandFormatter(
                model.filter,
                getBigIntFormatter(column, this.gos),
                _parseBigIntOrNull,
                getBigIntParser(column, this.gos)
            );
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
        number: (operand, column) =>
            operand != null && operand !== '' ? getNumberParser(column, this.gos)(operand) : null,
        bigint: (operand, column) => {
            const parsed = getBigIntParser(column, this.gos)(operand);
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
        this.advFilterSetSvc = beans.advFilterSetSvc as AdvancedFilterSetService;
    }

    private columnNameToIdMap: { [columnNameUpperCase: string]: { colId: string; columnName: string } } =
        Object.create(null);
    private columnAutocompleteEntries: AutocompleteEntry[] | null = null;
    private expressionOperators: FilterExpressionOperators;
    private expressionJoinOperators: { AND: string; OR: string };
    private expressionEvaluatorParams: { [colId: string]: FilterExpressionEvaluatorParams<any> } = Object.create(null);
    /** Keyed by data type as well as column: a model's `filterType` need not be the column's current one. */
    private columnExpressionOperators = new WeakMap<AgColumn, { [dataType: string]: ColumnOperators }>();

    public postConstruct(): void {
        this.expressionJoinOperators = this.generateExpressionJoinOperators();
        this.expressionOperators = this.generateExpressionOperators();
        // Each of these changes a column's name, visibility or definition without a `newColumnsLoaded`.
        const resetColumnCaches = this.resetColumnCaches.bind(this);
        this.addManagedEventListeners({
            newColumnsLoaded: resetColumnCaches,
            columnVisible: resetColumnCaches,
            columnRowGroupChanged: resetColumnCaches,
            columnPivotModeChanged: resetColumnCaches,
            columnPivotChanged: resetColumnCaches,
            columnHeaderNameChanged: resetColumnCaches,
        });
    }

    public parseJoinOperator(model: JoinAdvancedFilterModel): string {
        const { type } = model;
        return this.expressionJoinOperators[type] ?? type;
    }

    public getColumnDisplayValue(colId: string): string | undefined {
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

    /**
     * A stored operand as the column writes it for display. The model value is canonical, so text the
     * default parser cannot read is already the user's own input and is shown as they typed it.
     * `readBack` is how the expression reads the display again, and only a format that survives that
     * is used: the expression is what the operand is parsed back out of, so one that does not round-trip
     * would quietly rewrite the stored value.
     */
    private applyOperandFormatter<V>(
        filter: string | number | undefined,
        formatter: ((value: V) => string | null) | null | undefined,
        parse: (rawValue: string) => V | null,
        readBack: (rawValue: string) => V | null
    ): string {
        const rawValue = _toStringOrNull(filter);
        // Blank is no operand at all, and must not be presented as whatever the formatter makes of zero.
        if (rawValue == null || rawValue.trim() === '') {
            return '';
        }
        if (!formatter) {
            return rawValue;
        }
        const parsed = parse(rawValue);
        const formatted = parsed == null ? null : formatter(parsed);
        // Blank reads back as the value it came from and still leaves the expression without an operand.
        if (formatted == null || formatted.trim() === '') {
            return rawValue;
        }
        const reread = readBack(formatted);
        return reread != null && String(reread) === String(parsed) ? formatted : rawValue;
    }

    public getOperatorDisplayValue(model: ColumnAdvancedFilterModel): string | undefined {
        return this.getModelOperator(model)?.displayValue ?? model.type;
    }

    private getModelOperator(model: ColumnAdvancedFilterModel): FilterExpressionOperator<any> | undefined {
        const filterType = model.filterType;
        // `set` is an option a column adds, not a data type, so its operators live with the column's own.
        const { column, baseCellDataType } = this.getColumnDetails(model.colId);
        return this.getExpressionOperator(filterType === 'set' ? baseCellDataType : filterType, model.type, column);
    }

    public getOperandModelValue(
        operand: string,
        baseCellDataType: BaseCellDataType,
        column: AgColumn
    ): string | number | null {
        return this.operandModelValueGetters[baseCellDataType](operand, column, baseCellDataType);
    }

    /**
     * Whether feeding the model value back into the expression or the builder editor yields the same value.
     * False where the column's own parser reads a syntax the model value is not written in: always for
     * `bigint`, whose model holds the canonical decimal, and for a `number` column naming a `numberParser`.
     */
    public isOperandModelValueEditable(
        baseCellDataType: BaseCellDataType,
        column: AgColumn | null | undefined
    ): boolean {
        if (baseCellDataType === 'number') {
            return !hasCustomNumberOperands(column);
        }
        return baseCellDataType !== 'bigint';
    }

    /** The whole operand region: one value, or the comma-separated bracketed pair an option taking two writes. */
    private getOperandDisplayValue(model: ColumnAdvancedFilterModel): string {
        if (model.filterType === 'set') {
            return this.getSetOperandDisplayValue(model);
        }
        const { filter, filterTo } = model as ColumnFilterModelOperands;
        const operator = this.getModelOperator(model);
        const numOperands = operator ? OPERAND_COUNT[operator.operands] : undefined;
        // A slot the option does not take is not its value, and writing it spells an expression nothing parses.
        if (numOperands === 0) {
            return '';
        }
        if (numOperands !== 2) {
            return filter == null ? '' : ` ${this.formatOperand(model, filter)}`;
        }
        return ` (${this.formatOperand(model, filter, false, true)}, ${this.formatOperand(model, filterTo, false, true)})`;
    }

    /**
     * The value list a set option writes: `["a", "b" › "c"]`, a value being a path where the column's Set
     * Filter is a tree list. A key the current values no longer hold is written as it is stored, so a
     * model the data cannot explain still round-trips.
     */
    private getSetOperandDisplayValue(model: SetAdvancedFilterModel): string {
        const values = model.values;
        // As the data-type branch does for a slot it has no value for: an unfinished condition writes
        // nothing rather than an empty list, which is text no parser reads back.
        if (!values?.length) {
            return '';
        }
        const column = this.colModel.getNonPivotColById(model.colId);
        // Keys with no text of their own share one, and that text already names every one of them.
        const written = new Set<string>();
        for (let i = 0, len = values.length; i < len; ++i) {
            const key = values[i];
            let path = column && this.advFilterSetSvc.getPath(column, key);
            if (!path) {
                // Recorded so a caller can tell text written from loaded values from text that fell back.
                this.wroteUnresolvedSetValue = true;
                // A blank's own label, since the empty string is a value of its own and would not read back.
                path = [key ?? (column ? this.advFilterSetSvc.getBlankLabel(column) : undefined) ?? ''];
            }
            written.add(quoteSetPath(path));
        }
        return ` ${SET_LIST_OPEN_CHAR}${Array.from(written).join(', ')}${SET_LIST_CLOSE_CHAR}`;
    }

    /** One operand of a model, quoted for the expression unless the caller shows it on its own. */
    public formatOperand(
        model: ColumnAdvancedFilterModel,
        value: string | number | undefined,
        skipFormatting?: boolean,
        inPair?: boolean
    ): string {
        if (value == null) {
            return '';
        }
        const { filterType, colId } = model;
        const canonical = _toStringOrNull(value) ?? '';
        let operand = _getOwn(this.filterOperandGetters, filterType)?.({ filter: value, colId }) ?? canonical;
        const isNumeric = filterType === 'number' || filterType === 'bigint';
        // A numeric operand is written bare, so quotes are added only for a format that could not be read
        // back without them. Text is always quoted, empty included.
        if (!skipFormatting && (!isNumeric || needsQuotes(operand, inPair))) {
            const quote = quoteChar(operand);
            if (quote) {
                operand = `${quote}${operand}${quote}`;
            } else if (isNumeric) {
                // No quote can wrap this format, so it cannot be read back: write the canonical number instead.
                operand = canonical;
            } else {
                operand = `"${operand}"`; // text is the value itself, so there is nothing to fall back to
            }
        }
        return operand;
    }

    public parseColumnFilterModel(model: ColumnAdvancedFilterModel): string {
        const columnName = this.getColumnDisplayValue(model.colId) ?? '';
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

    /** The options the column offers: those of the data type that `filterParams.filterOptions` names, or all. */
    public getOperatorAutocompleteEntries(
        column: AgColumn | null | undefined,
        baseCellDataType?: BaseCellDataType
    ): AutocompleteEntry[] {
        const columnOperators = this.getColumnOperators(baseCellDataType, column);
        return columnOperators ? columnOperators.operators.getEntries(columnOperators.activeOperators) : [];
    }

    public getJoinOperatorAutocompleteEntries(): AutocompleteEntry[] {
        // eslint-disable-next-line no-restricted-properties
        return Object.entries(this.expressionJoinOperators).map(([key, displayValue]) => ({ key, displayValue }));
    }

    public getDefaultAutocompleteListParams(searchString: string): AutocompleteListParams {
        return this.generateAutocompleteListParams(this.getColumnAutocompleteEntries(), 'column', searchString);
    }

    public getExpressionOperator(
        baseCellDataType?: BaseCellDataType,
        operator?: string,
        column?: AgColumn | null
    ): FilterExpressionOperator<any> | undefined {
        // A model `type` such as `toString` must not resolve to an inherited member.
        return _getOwn(this.getColumnOperators(baseCellDataType, column)?.operators.operators, operator!);
    }

    /** Offered, not merely resolvable: only a pill being retargeted asks, an expression reads against all. */
    public isOperatorOffered(
        baseCellDataType: BaseCellDataType | undefined,
        operator: string | undefined,
        column: AgColumn | null | undefined
    ): boolean {
        const columnOperators = this.getColumnOperators(baseCellDataType, column);
        if (!operator || !_getOwn(columnOperators?.operators.operators, operator)) {
            return false;
        }
        const activeOperators = columnOperators!.activeOperators;
        return !activeOperators || activeOperators.includes(operator);
    }

    /** A data type's built-ins with the column's own options over them, plus the keys it narrows suggestions to. */
    public getColumnOperators(
        baseCellDataType: BaseCellDataType | undefined,
        column: AgColumn | null | undefined
    ): ColumnOperators | undefined {
        const dataTypeOperators = this.expressionOperators[baseCellDataType!];
        if (!dataTypeOperators) {
            return undefined;
        }
        if (!column) {
            return { operators: dataTypeOperators, activeOperators: dataTypeOperators.defaultOperators };
        }
        const byColumn = this.columnExpressionOperators;
        let byDataType = byColumn.get(column);
        if (!byDataType) {
            byDataType = Object.create(null) as { [dataType: string]: ColumnOperators };
            byColumn.set(column, byDataType);
        }
        let columnOperators = byDataType[baseCellDataType!];
        if (!columnOperators) {
            columnOperators = this.createColumnOperators(dataTypeOperators, column);
            byDataType[baseCellDataType!] = columnOperators;
        }
        return columnOperators;
    }

    private createColumnOperators(
        dataTypeOperators: DataTypeFilterExpressionOperators<any>,
        column: AgColumn
    ): ColumnOperators {
        const isSetColumn = this.advFilterSetSvc.isSetFilterColumn(column);
        let operators = isSetColumn
            ? addSetOperators(dataTypeOperators, (key) => this.translate(key))
            : dataTypeOperators;
        // Only the data type's own table carries `defaultOperators`; a derived one does not.
        let activeOperators = dataTypeOperators.defaultOperators;
        // The set options come from the filter, not the data type, so a data type holding some of its own
        // back — a date column and its relative options — must not take these with them.
        if (isSetColumn && activeOperators) {
            activeOperators = withSetOperators(activeOperators);
        }
        const filterOptions = getColumnFilterOptions(column);
        if (filterOptions) {
            // Reported here too: a column filtered only through the Advanced Filter never builds an `OptionsFactory`.
            const { offered, customOptions } = _classifyFilterOptions(filterOptions, (keys) => this.warn(72, { keys }));
            if (customOptions.size) {
                operators = createCustomOptionOperators(operators, customOptions, this.getLocaleTextFunc());
            }
            const operatorsByKey = operators.operators;
            const offeredOperators: string[] = [];
            for (const key of offered.keys()) {
                if (_getOwn(operatorsByKey, key)) {
                    offeredOperators.push(key);
                }
            }
            if (offeredOperators.length) {
                // A list the column author wrote is the whole of what it offers, set options included.
                activeOperators = offeredOperators;
            }
        }
        return { operators, activeOperators };
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
            case 'bigint':
                // `10n === 10` is false, so a cell holding `'10'` or `10` has to be parsed before it compares.
                params = { valueConverter: (v: any) => _parseBigIntOrNull(v) };
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
            for (let i = 0, len = COPIED_FILTER_PARAMS.length; i < len; ++i) {
                const param = COPIED_FILTER_PARAMS[i];
                const paramValue = filterParams[param];
                if (paramValue) {
                    params[param] = paramValue;
                }
            }
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
        const baseParams = { translate };
        const dateOperatorsParams = {
            ...baseParams,
            equals: (v: Date, o: Date) => v.getTime() === o.getTime(),
            relativeDates: true,
        };

        return {
            text: new TextFilterExpressionOperators(baseParams),
            boolean: new BooleanFilterExpressionOperators(baseParams),
            object: new TextFilterExpressionOperators<any>(baseParams),
            number: new ScalarFilterExpressionOperators<number>({ ...baseParams, equals: (v, o) => v === o }),
            bigint: new ScalarFilterExpressionOperators<bigint>({ ...baseParams, equals: (v, o) => v === o }),
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

    public resetColumnCaches(): void {
        this.columnAutocompleteEntries = null;
        this.columnNameToIdMap = Object.create(null);
        this.expressionEvaluatorParams = Object.create(null);
        this.columnExpressionOperators = new WeakMap();
    }
}
