import { _getOwn, _parseBigIntOrNull, _parseDateTimeFromString, _serialiseDate, _toStringOrNull } from 'ag-stack';

import type {
    AgColumn,
    BaseCellDataType,
    BeanCollection,
    ColumnAdvancedFilterModel,
    ColumnModel,
    ColumnNameService,
    DataTypeService,
    IBigIntFilterParams,
    IDateFilterParams,
    IFilterOptionDef,
    ITextFilterParams,
    JoinAdvancedFilterModel,
    NamedBean,
    NumberFilterParams,
    ResolvedFilter,
    SetAdvancedFilterModel,
    TextMatcherParams,
    ValueService,
} from 'ag-grid-community';
import {
    BeanStub,
    _addGridCommonParams,
    _bindFilterCallback,
    _classifyFilterOptions,
    _filterCallbackParams,
    _getDefaultSimpleFilter,
    _isGridSuppliedFilterParam,
    _resolveFilter,
    _toFiniteNumber,
} from 'ag-grid-community';

import { resolveChildFilters, resolveFilterParams, resolveMultiFilterChildren } from '../multiFilter/multiFilterUtil';
import { ADVANCED_FILTER_LOCALE_TEXT } from './advancedFilterLocaleText';
import type { AutocompleteEntry, AutocompleteListParams } from './autocomplete/autocompleteParams';
import { COL_FILTER_EXPRESSION_END_CHAR, COL_FILTER_EXPRESSION_START_CHAR } from './colFilterExpressionParser';
import { createCustomOptionOperators, getAuthoredFilterOptions } from './customFilterOptions';
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
import type { ColumnFilterModelOperands, FilterOperandParser } from './filterExpressionUtils';
import type { AdvancedFilterSetService } from './set/advancedFilterSetService';
import { addSetOperators, withSetOperators } from './set/setFilterExpressionOperators';
import { SET_LIST_CLOSE_CHAR, SET_LIST_OPEN_CHAR, writeSetPath } from './set/setOperandsParser';

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

/** The same path as an expression writes it: every segment quoted. */
export const quoteSetPath = (path: readonly string[]): string => writeSetPath(path.map(quoteSetValue));

const DATE_FILTER = 'agDateColumnFilter';

/** `Number` reads blank text as zero, which is not a number anyone wrote. */
const parseNumberOrNull = (value: string | null): number | null => (value?.trim() ? Number(value) : null);

/** A column's operators and the keys it narrows them to, classified together from its one `filterOptions`. */
interface ColumnOperators {
    readonly operators: DataTypeFilterExpressionOperators<any>;
    readonly activeOperators: string[] | undefined;
    /** OPTIMIZATION: the names an expression is matched against, built on the first parse rather than per keystroke. */
    names?: OperatorNames;
    /** OPTIMIZATION: whether its Text Filter trims an operand, read on the first parse rather than per keystroke. */
    trimInput?: boolean;
}

export interface OperatorName {
    readonly key: string;
    readonly displayValue: string;
    readonly lowerCaseDisplayValue: string;
}

/** The names offered, in the order offered, and where fewer are offered than resolve, every name. */
export interface OperatorNames {
    readonly offered: OperatorName[];
    readonly all: OperatorName[] | undefined;
}

const toOperatorNames = (entries: AutocompleteEntry[]): OperatorName[] =>
    entries.map(({ key, displayValue = '' }) => ({
        key,
        displayValue,
        lowerCaseDisplayValue: displayValue.toLocaleLowerCase(),
    }));

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
            const params = this.getCustomNumberParams(column);
            return this.applyOperandFormatter(
                model.filter,
                _bindFilterCallback(params?.numberFormatter, this.gos, column, 'advancedFilter'),
                _toFiniteNumber,
                this.bindNumberParser(column, params)
            );
        },
        bigint: (model) => {
            const column = this.colModel.getNonPivotCol(model.colId);
            const params: IBigIntFilterParams | undefined = this.getOwnFilterParams(
                column,
                'agBigIntColumnFilter',
                undefined
            );
            return this.applyOperandFormatter(
                model.filter,
                _bindFilterCallback(params?.bigintFormatter, this.gos, column, 'advancedFilter'),
                _parseBigIntOrNull,
                this.bindBigIntParser(column, params)
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
        number: (operand, column) => (operand != null && operand !== '' ? this.getNumberParser(column)(operand) : null),
        bigint: (operand, column) => {
            const parsed = this.getBigIntParser(column)(operand);
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
     * `bigint`, whose model holds the canonical decimal, and for a `number` column naming a parser and a formatter.
     */
    public isOperandModelValueEditable(
        baseCellDataType: BaseCellDataType,
        column: AgColumn | null | undefined
    ): boolean {
        if (baseCellDataType === 'number') {
            return this.getCustomNumberParams(column) == null;
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
     * The value list a set option writes: `["a", "b > c"]`, a value being a whole path where the column's
     * Set Filter is a tree list. A key resolving to no current value is written as it is stored, so a
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
            const path = column ? this.advFilterSetSvc.getPath(column, key) : undefined;
            if (column && path) {
                written.add(this.advFilterSetSvc.writePath(column, path));
                continue;
            }
            // Recorded so a caller can tell text written from loaded values from text that fell back.
            this.wroteUnresolvedSetValue = true;
            // A blank's own label, since the empty string is a value of its own and would not read back.
            written.add(quoteSetValue(key ?? (column ? this.advFilterSetSvc.getBlankLabel(column) : undefined) ?? ''));
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
            } else if (aValue > bValue) {
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

    public getOperatorNames(
        baseCellDataType: BaseCellDataType | undefined,
        column: AgColumn | null | undefined
    ): OperatorNames | undefined {
        const columnOperators = this.getColumnOperators(baseCellDataType, column);
        if (!columnOperators) {
            return undefined;
        }
        let names = columnOperators.names;
        if (!names) {
            const { operators, activeOperators } = columnOperators;
            names = {
                offered: toOperatorNames(operators.getEntries(activeOperators)),
                all: activeOperators ? toOperatorNames(operators.getEntries()) : undefined,
            };
            columnOperators.names = names;
        }
        return names;
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
        const isSetColumn = this.advFilterSetSvc.offersSetOperators(column);
        let operators = isSetColumn
            ? addSetOperators(dataTypeOperators, (key) => this.translate(key))
            : dataTypeOperators;
        // The shared table's: `addSetOperators` returns a table carrying no `defaultOperators` of its own.
        let activeOperators = dataTypeOperators.defaultOperators;
        // The set options come from the filter, not the data type, so a data type holding some of its own
        // back — a date column and its relative options — must not take these with them.
        if (isSetColumn && activeOperators) {
            activeOperators = withSetOperators(activeOperators);
        }
        const filterOptions = this.getColumnFilterOptions(column, _resolveFilter(this.beans, column));
        if (filterOptions) {
            // Reported here too: a column filtered only through the Advanced Filter never builds an `OptionsFactory`.
            const { offered, customOptions } = _classifyFilterOptions(
                filterOptions,
                (keys) => this.warn(72, { keys }),
                null // the Advanced Filter is the reader the excluded keys exist for
            );
            if (customOptions.size) {
                const gos = this.gos;
                operators = createCustomOptionOperators(operators, customOptions, this.getLocaleTextFunc(), () =>
                    _filterCallbackParams(gos, column, 'advancedFilter')
                );
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

    /** The options a column narrows itself to, or `undefined` where it narrows nothing of its own. */
    public getColumnFilterOptions(
        column: AgColumn,
        resolved: ResolvedFilter
    ): (string | IFilterOptionDef)[] | undefined {
        const beans = this.beans;
        const ownParams = resolveFilterParams(beans, column, resolved.def);
        if (resolved.key === 'agMultiColumnFilter') {
            // A Multi Filter writes `filterOptions` on a child, so its own level is read only after them.
            const children = resolveChildFilters(beans, column, resolved, ownParams);
            for (let i = 0, len = children.length; i < len; ++i) {
                const childOptions = getAuthoredFilterOptions(resolveFilterParams(beans, column, children[i].def));
                if (childOptions) {
                    return childOptions;
                }
            }
        }
        return getAuthoredFilterOptions(ownParams);
    }

    /** Read unpaired, unlike the number equivalent, so hex and the like can be typed with a parser alone. */
    public getBigIntParser(column: AgColumn | null | undefined): FilterOperandParser<bigint> {
        return this.bindBigIntParser(column, this.getOwnFilterParams(column, 'agBigIntColumnFilter', undefined));
    }

    private bindBigIntParser(
        column: AgColumn | null | undefined,
        params: IBigIntFilterParams | undefined
    ): FilterOperandParser<bigint> {
        return _bindFilterCallback(params?.bigintParser, this.gos, column, 'advancedFilter') ?? _parseBigIntOrNull;
    }

    /** Plain-number reading stays the default: only a column that reads *and* writes its own syntax departs from it. */
    public getNumberParser(column: AgColumn | null | undefined): FilterOperandParser<number> {
        return this.bindNumberParser(column, this.getCustomNumberParams(column));
    }

    private bindNumberParser(
        column: AgColumn | null | undefined,
        params: NumberFilterParams | undefined
    ): FilterOperandParser<number> {
        return _bindFilterCallback(params?.numberParser, this.gos, column, 'advancedFilter') ?? parseNumberOrNull;
    }

    /** Needs a parser and a formatter, as a parser alone would reinterpret the plain number the grid stored. */
    private getCustomNumberParams(column: AgColumn | null | undefined): NumberFilterParams | undefined {
        const filterParams: NumberFilterParams | undefined = this.getOwnFilterParams(
            column,
            'agNumberColumnFilter',
            undefined
        );
        return filterParams?.numberParser != null && filterParams.numberFormatter != null ? filterParams : undefined;
    }

    /** The params of the column's filter, or of a Multi Filter's `childFilter` child, which is where they live there. */
    private getOwnFilterParams(
        column: AgColumn | null | undefined,
        childFilter: string,
        columnFilter: ResolvedFilter | undefined
    ): any {
        if (!column) {
            return undefined;
        }
        const beans = this.beans;
        const resolved = columnFilter ?? _resolveFilter(beans, column);
        const children = resolveMultiFilterChildren(beans, column, resolved);
        const owner = children ? children.find((child) => child.key === childFilter) : resolved;
        return owner && resolveFilterParams(beans, column, owner.def);
    }

    /** Whether an operand typed for the column is trimmed, as its Text Filter trims its own input. */
    public isOperandTrimmed(column: AgColumn | null | undefined, baseCellDataType: BaseCellDataType): boolean {
        const columnOperators = column ? this.getColumnOperators(baseCellDataType, column) : undefined;
        if (!columnOperators) {
            return false;
        }
        let trimInput = columnOperators.trimInput;
        if (trimInput === undefined) {
            trimInput = !!this.getTextFilterParams(column, baseCellDataType, undefined)?.trimInput;
            columnOperators.trimInput = trimInput;
        }
        return trimInput;
    }

    /** The params the column's Text Filter compares with: for a Multi Filter, its Text Filter child's alone. */
    public getTextFilterParams(
        column: AgColumn | null | undefined,
        baseCellDataType: BaseCellDataType | undefined,
        columnFilter: ResolvedFilter | undefined
    ): ITextFilterParams | undefined {
        // An unresolved data type reads as text, as its converter does.
        if (!column || (baseCellDataType != null && baseCellDataType !== 'text' && baseCellDataType !== 'object')) {
            return undefined;
        }
        const resolved = columnFilter ?? _resolveFilter(this.beans, column);
        const key = resolved.key;
        // Named as readily as supplied, so any other component's params are its own.
        return resolved.def.filter == null || key === 'agTextColumnFilter' || key === 'agMultiColumnFilter'
            ? this.getOwnFilterParams(column, 'agTextColumnFilter', resolved)
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

        const dataTypeSvc = this.dataTypeSvc;
        const baseCellDataType = dataTypeSvc?.getBaseDataType(column);
        // Only a converter that parses can stand in for a validity gate, so it is recorded where it is chosen.
        let converterParses = false;
        switch (baseCellDataType) {
            case 'dateTimeString':
            case 'dateString':
                params = {
                    valueConverter: dataTypeSvc?.getDateParserFunction(column) ?? ((v: any) => v),
                };
                converterParses = true;
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
        // The comparing child owns these, the Multi Filter's never standing in; resolved once, as each read
        // calls any `filterParams` function the column has.
        const resolved = _resolveFilter(this.beans, column);
        const key = resolved.key;
        const hasSetFilter = this.advFilterSetSvc.hasSetFilter(resolved);
        const defaultFilter = _getDefaultSimpleFilter(baseCellDataType);
        const source = this.getOwnFilterParams(column, defaultFilter, resolved);
        if (source) {
            for (let i = 0, len = COPIED_FILTER_PARAMS.length; i < len; ++i) {
                const param = COPIED_FILTER_PARAMS[i];
                const paramValue = source[param];
                if (paramValue) {
                    params[param] = paramValue;
                }
            }
        }
        this.addTextFilterParams(params, column, baseCellDataType, resolved);
        // `filter: true` builds the Set Filter under enterprise, whose author-written `isValidDate` still gates.
        const dateFilterParams: IDateFilterParams | undefined =
            defaultFilter === DATE_FILTER && (key === DATE_FILTER || hasSetFilter || key === 'agMultiColumnFilter')
                ? source
                : undefined;
        if (dateFilterParams) {
            // What the grid supplies restates the parse `valueConverter` does, and a comparator skips that
            // conversion, so only where none is in play is the grid's own gate already covered.
            const { comparator, isValidDate } = dateFilterParams;
            // A Set Filter's `comparator` orders its list over two cell values, which is not a date comparison.
            const ownComparator =
                comparator && !_isGridSuppliedFilterParam(comparator) && !hasSetFilter ? comparator : undefined;
            const coveredByConversion = converterParses && !ownComparator;
            params.comparator = ownComparator;
            params.isValid = coveredByConversion && _isGridSuppliedFilterParam(isValidDate) ? undefined : isValidDate;
        }
        this.expressionEvaluatorParams[colId] = params;

        return params;
    }

    private addTextFilterParams(
        params: FilterExpressionEvaluatorParams<any, any>,
        column: AgColumn,
        baseCellDataType: BaseCellDataType | undefined,
        resolved: ResolvedFilter
    ): void {
        const textParams = this.getTextFilterParams(column, baseCellDataType, resolved);
        if (!textParams) {
            return;
        }
        const { textFormatter, textMatcher } = textParams;
        const gos = this.gos;
        const boundFormatter = _bindFilterCallback(textFormatter, gos, column, 'advancedFilter');
        params.textFormatter = boundFormatter;
        if (!textMatcher) {
            return;
        }
        // Built per row rather than captured: `context` is a grid option, so a held copy would go stale.
        params.textMatcher = (filterOption, value, filterText, node) =>
            textMatcher(
                _addGridCommonParams<TextMatcherParams>(gos, {
                    colDef: column.colDef,
                    column,
                    node,
                    data: node.data,
                    filterOption,
                    value,
                    filterText,
                    textFormatter: boundFormatter,
                    source: 'advancedFilter',
                })
            );
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
