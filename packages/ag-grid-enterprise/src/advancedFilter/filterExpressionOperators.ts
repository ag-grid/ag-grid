import { _getOwn } from 'ag-stack';

import {
    _PRESET_DATE_FILTER_RANGES,
    _PRESET_DATE_FILTER_TYPES,
    _RelativeDateRangeCache,
    _hasValue,
    _isBlank,
} from 'ag-grid-community';
import type { BaseCellDataType, IRowNode, ISimpleFilterModelPresetType } from 'ag-grid-community';

import type { ADVANCED_FILTER_LOCALE_TEXT } from './advancedFilterLocaleText';
import type { AutocompleteEntry } from './autocomplete/autocompleteParams';

export interface FilterExpressionEvaluatorParams<ConvertedTValue, TValue = ConvertedTValue> {
    caseSensitive?: boolean;
    includeBlanksInEquals?: boolean;
    includeBlanksInNotEqual?: boolean;
    includeBlanksInLessThan?: boolean;
    includeBlanksInGreaterThan?: boolean;
    includeBlanksInRange?: boolean;
    inRangeInclusive?: boolean;
    /** The column's own comparison, reading the cell value itself as the column filter's does. */
    comparator?: (operand: ConvertedTValue, value: TValue) => number;
    /** Gates every comparison, as it does in the column filter; a value it rejects matches only a negation. */
    isValid?: (value: TValue) => boolean;
    valueConverter: (value: TValue, node: IRowNode) => ConvertedTValue;
}

/** The column filter maps its model per row, so author code is free to normalise the operand it is handed. */
export function freshOperand<T>(operand: T): T {
    return operand instanceof Date ? (new Date(operand.getTime()) as T) : operand;
}

type FilterExpressionEvaluator<ConvertedTValue, TValue = ConvertedTValue> = (
    value: TValue | null | undefined,
    node: IRowNode,
    params: FilterExpressionEvaluatorParams<ConvertedTValue, TValue>,
    operand1?: ConvertedTValue,
    operand2?: ConvertedTValue
) => boolean;

/**
 * What an option takes, shape and constraint in one field: `range` is two values compared as ordered bounds.
 * A two that is not ordered, or a set of values, is a further member rather than a flag that can contradict.
 */
export type OperandsKind = 'none' | 'one' | 'range' | 'list';

/** How many of `filter` / `filterTo` the option fills, for the sites that care about shape and not order. */
export const OPERAND_COUNT: Record<OperandsKind, number> = { none: 0, one: 1, range: 2, list: 0 };

export interface FilterExpressionOperator<ConvertedTValue, TValue = ConvertedTValue> {
    displayValue: string;
    evaluator: FilterExpressionEvaluator<ConvertedTValue, TValue>;
    operands: OperandsKind;
}

export interface DataTypeFilterExpressionOperators<ConvertedTValue, TValue = ConvertedTValue> {
    operators: {
        [operator: string]: FilterExpressionOperator<ConvertedTValue, TValue>;
    };
    /** What a column narrowing nothing offers, where that is less than everything it can resolve. */
    defaultOperators?: string[];
    getEntries(activeOperators?: string[]): AutocompleteEntry[];
}

export abstract class FilterExpressionOperators implements Record<
    BaseCellDataType,
    DataTypeFilterExpressionOperators<any>
> {
    dateTime: DataTypeFilterExpressionOperators<Date>;
    dateTimeString: DataTypeFilterExpressionOperators<Date, string>;
    text: DataTypeFilterExpressionOperators<string>;
    number: DataTypeFilterExpressionOperators<number>;
    bigint: DataTypeFilterExpressionOperators<bigint>;
    boolean: DataTypeFilterExpressionOperators<boolean>;
    date: DataTypeFilterExpressionOperators<Date>;
    dateString: DataTypeFilterExpressionOperators<Date, string>;
    object: DataTypeFilterExpressionOperators<string, any>;
}

// null = partial match, undefined = no match
export function findMatch<T>(
    searchValue: string,
    values: { [key: string]: T },
    getDisplayValue: (value: T) => string
): string | null | undefined {
    let partialMatch = false;
    const searchValueLowerCase = searchValue.toLocaleLowerCase();
    const partialSearchValue = searchValueLowerCase + ' ';
    const parsedValue = Object.keys(values).find((key) => {
        const value = values[key];
        const displayValueLowerCase = getDisplayValue(value).toLocaleLowerCase();
        if (displayValueLowerCase.startsWith(partialSearchValue)) {
            partialMatch = true;
        }
        return displayValueLowerCase === searchValueLowerCase;
    });
    if (parsedValue) {
        return parsedValue;
    } else if (partialMatch) {
        return null;
    } else {
        return undefined;
    }
}

export function getEntries<ConvertedTValue, TValue = ConvertedTValue>(
    operators: { [operator: string]: FilterExpressionOperator<ConvertedTValue, TValue> },
    activeOperatorKeys?: string[]
): AutocompleteEntry[] {
    const keys = activeOperatorKeys ?? Object.keys(operators);
    const len = keys.length;
    const entries: AutocompleteEntry[] = new Array(len);
    let count = 0;
    for (let i = 0; i < len; ++i) {
        const key = keys[i];
        const operator = _getOwn(operators, key);
        if (operator) {
            entries[count++] = { key, displayValue: operator.displayValue };
        }
    }
    if (count < len) {
        entries.length = count;
    }
    return entries;
}

type AdvancedFilterTranslate = (key: keyof typeof ADVANCED_FILTER_LOCALE_TEXT, variableValues?: string[]) => string;

interface FilterExpressionOperatorsParams {
    translate: AdvancedFilterTranslate;
}

export class TextFilterExpressionOperators<TValue = string> implements DataTypeFilterExpressionOperators<
    string,
    TValue
> {
    public operators: { [operator: string]: FilterExpressionOperator<string, TValue> };

    constructor(private readonly params: FilterExpressionOperatorsParams) {
        this.initOperators();
    }

    public getEntries(activeOperators?: string[]): AutocompleteEntry[] {
        return getEntries(this.operators, activeOperators);
    }

    private initOperators(): void {
        const { translate } = this.params;
        this.operators = {
            contains: {
                displayValue: translate('advancedFilterContains'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateExpression(value, node, params, operand1!, false, (v, o) => v.includes(o)),
                operands: 'one',
            },
            notContains: {
                displayValue: translate('advancedFilterNotContains'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateExpression(value, node, params, operand1!, true, (v, o) => !v.includes(o)),
                operands: 'one',
            },
            equals: {
                displayValue: translate('advancedFilterTextEquals'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateExpression(value, node, params, operand1!, false, (v, o) => v === o),
                operands: 'one',
            },
            notEqual: {
                displayValue: translate('advancedFilterTextNotEqual'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateExpression(value, node, params, operand1!, true, (v, o) => v != o),
                operands: 'one',
            },
            startsWith: {
                displayValue: translate('advancedFilterStartsWith'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateExpression(value, node, params, operand1!, false, (v, o) => v.startsWith(o)),
                operands: 'one',
            },
            endsWith: {
                displayValue: translate('advancedFilterEndsWith'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateExpression(value, node, params, operand1!, false, (v, o) => v.endsWith(o)),
                operands: 'one',
            },
            blank: {
                displayValue: translate('advancedFilterBlank'),
                evaluator: _isBlank,
                operands: 'none',
            },
            notBlank: {
                displayValue: translate('advancedFilterNotBlank'),
                evaluator: _hasValue,
                operands: 'none',
            },
        };
    }

    private evaluateExpression(
        value: TValue | null | undefined,
        node: IRowNode,
        params: FilterExpressionEvaluatorParams<string, TValue>,
        operand: string,
        nullsMatch: boolean,
        expression: (value: string, operand: string) => boolean
    ): boolean {
        if (value == null) {
            return nullsMatch;
        }
        return params.caseSensitive
            ? expression(params.valueConverter(value, node), operand)
            : expression(params.valueConverter(value, node).toLocaleLowerCase(), operand.toLocaleLowerCase());
    }
}

interface ScalarFilterExpressionOperatorsParams<ConvertedTValue> extends FilterExpressionOperatorsParams {
    equals: (value: ConvertedTValue, operand: ConvertedTValue) => boolean;
    relativeDates?: boolean;
}

/** Where the cell sits against the operand, as `comparator` reports it: the column filter's own mapping. */
const isEqualTo = (result: number) => result === 0;
const isNotEqualTo = (result: number) => result !== 0;
const isAbove = (result: number) => result > 0;
const isAtLeast = (result: number) => result >= 0;
const isBelow = (result: number) => result < 0;
const isAtMost = (result: number) => result <= 0;

export class ScalarFilterExpressionOperators<
    ConvertedTValue extends number | Date | bigint,
    TValue = ConvertedTValue,
> implements DataTypeFilterExpressionOperators<ConvertedTValue, TValue> {
    public operators: { [operator: string]: FilterExpressionOperator<ConvertedTValue, TValue> };
    public defaultOperators: string[] | undefined;

    constructor(private readonly params: ScalarFilterExpressionOperatorsParams<ConvertedTValue>) {
        this.initOperators();
    }

    public getEntries(activeOperators?: string[]): AutocompleteEntry[] {
        return getEntries(this.operators, activeOperators);
    }

    private initOperators(): void {
        const { translate, equals, relativeDates } = this.params;
        this.operators = {
            equals: {
                displayValue: translate('advancedFilterEquals'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateSingleOperandExpression(
                        value,
                        node,
                        params,
                        operand1!,
                        !!params.includeBlanksInEquals,
                        equals,
                        isEqualTo
                    ),
                operands: 'one',
            },
            notEqual: {
                displayValue: translate('advancedFilterNotEqual'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateSingleOperandExpression(
                        value,
                        node,
                        params,
                        operand1!,
                        !!params.includeBlanksInNotEqual,
                        (v, o) => !equals(v, o),
                        isNotEqualTo,
                        true
                    ),
                operands: 'one',
            },
            greaterThan: {
                displayValue: translate('advancedFilterGreaterThan'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateSingleOperandExpression(
                        value,
                        node,
                        params,
                        operand1!,
                        !!params.includeBlanksInGreaterThan,
                        (v, o) => v > o,
                        isAbove
                    ),
                operands: 'one',
            },
            greaterThanOrEqual: {
                displayValue: translate('advancedFilterGreaterThanOrEqual'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateSingleOperandExpression(
                        value,
                        node,
                        params,
                        operand1!,
                        !!params.includeBlanksInGreaterThan,
                        (v, o) => v >= o,
                        isAtLeast
                    ),
                operands: 'one',
            },
            lessThan: {
                displayValue: translate('advancedFilterLessThan'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateSingleOperandExpression(
                        value,
                        node,
                        params,
                        operand1!,
                        !!params.includeBlanksInLessThan,
                        (v, o) => v < o,
                        isBelow
                    ),
                operands: 'one',
            },
            lessThanOrEqual: {
                displayValue: translate('advancedFilterLessThanOrEqual'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateSingleOperandExpression(
                        value,
                        node,
                        params,
                        operand1!,
                        !!params.includeBlanksInLessThan,
                        (v, o) => v <= o,
                        isAtMost
                    ),
                operands: 'one',
            },
            inRange: {
                displayValue: translate('advancedFilterInRange'),
                evaluator: (value, node, params, operand1, operand2) =>
                    this.evaluateRangeExpression(value, node, params, operand1!, operand2!),
                operands: 'range',
            },
            blank: {
                displayValue: translate('advancedFilterBlank'),
                evaluator: _isBlank,
                operands: 'none',
            },
            notBlank: {
                displayValue: translate('advancedFilterNotBlank'),
                evaluator: _hasValue,
                operands: 'none',
            },
        };
        if (relativeDates) {
            // Captured before the relative options join them: a date column offers one only where it asks for it.
            this.defaultOperators = Object.keys(this.operators);
            addRelativeDateOperators(this.operators, translate);
        }
    }

    /** Exclusive unless `inRangeInclusive`, as the column filter's own range comparison is. */
    private evaluateRangeExpression(
        value: TValue | null | undefined,
        node: IRowNode,
        params: FilterExpressionEvaluatorParams<ConvertedTValue, TValue>,
        from: ConvertedTValue,
        to: ConvertedTValue
    ): boolean {
        if (value == null || _isBlank(value)) {
            return !!params.includeBlanksInRange;
        }
        const { comparator, isValid } = params;
        if (isValid && !isValid(value)) {
            return false;
        }
        if (comparator) {
            // The upper bound only where the lower one admits the row: the comparator is the column's own code.
            const fromResult = comparator(freshOperand(from), value);
            return params.inRangeInclusive
                ? fromResult >= 0 && comparator(freshOperand(to), value) <= 0
                : fromResult > 0 && comparator(freshOperand(to), value) < 0;
        }
        const convertedValue = params.valueConverter(value, node);
        if (convertedValue == null) {
            return false;
        }
        return params.inRangeInclusive
            ? convertedValue >= from && convertedValue <= to
            : convertedValue > from && convertedValue < to;
    }

    private evaluateSingleOperandExpression(
        value: TValue | null | undefined,
        node: IRowNode,
        params: FilterExpressionEvaluatorParams<ConvertedTValue, TValue>,
        operand: ConvertedTValue,
        nullsMatch: boolean,
        expression: (value: ConvertedTValue, operand: ConvertedTValue) => boolean,
        sign: (result: number) => boolean,
        isNegated?: boolean
    ): boolean {
        // A scalar has no use for a blank string, so it counts as absent — as it does in the column filter.
        // The `== null` half is what narrows `value`; `_isBlank` alone would not.
        if (value == null || _isBlank(value)) {
            return nullsMatch;
        }
        const { comparator, isValid } = params;
        if (isValid && !isValid(value)) {
            return !!isNegated;
        }
        // The column's own comparison reads the cell value, never a converted one: that is the whole reason
        // a column with data the data type cannot read supplies one.
        if (comparator) {
            return sign(comparator(freshOperand(operand), value));
        }
        const convertedValue = params.valueConverter(value, node);
        // A value the data type cannot read is nothing to compare against, as the column filter's own validity
        // gate decides: it matches no comparison, and so matches every negation of one.
        if (convertedValue == null) {
            return !!isNegated;
        }
        return expression(convertedValue, operand);
    }
}

/** The Advanced Filter reads an option as a phrase, so it names each one itself rather than as the column filter does. */
const PRESET_DATE_OPERATOR_LOCALE_KEYS: Record<ISimpleFilterModelPresetType, keyof typeof ADVANCED_FILTER_LOCALE_TEXT> =
    {
        yesterday: 'advancedFilterYesterday',
        today: 'advancedFilterToday',
        tomorrow: 'advancedFilterTomorrow',
        last7Days: 'advancedFilterLast7Days',
        lastWeek: 'advancedFilterLastWeek',
        thisWeek: 'advancedFilterThisWeek',
        nextWeek: 'advancedFilterNextWeek',
        last30Days: 'advancedFilterLast30Days',
        lastMonth: 'advancedFilterLastMonth',
        thisMonth: 'advancedFilterThisMonth',
        nextMonth: 'advancedFilterNextMonth',
        last90Days: 'advancedFilterLast90Days',
        lastQuarter: 'advancedFilterLastQuarter',
        thisQuarter: 'advancedFilterThisQuarter',
        nextQuarter: 'advancedFilterNextQuarter',
        lastYear: 'advancedFilterLastYear',
        thisYear: 'advancedFilterThisYear',
        yearToDate: 'advancedFilterYearToDate',
        nextYear: 'advancedFilterNextYear',
        last6Months: 'advancedFilterLast6Months',
        last12Months: 'advancedFilterLast12Months',
        last24Months: 'advancedFilterLast24Months',
    };

/** One cache per data type table, since a relative range depends on nothing but the clock. */
function addRelativeDateOperators(
    operators: { [operator: string]: FilterExpressionOperator<any> },
    translate: AdvancedFilterTranslate
): void {
    const cache = new _RelativeDateRangeCache();
    for (let i = 0, len = _PRESET_DATE_FILTER_TYPES.length; i < len; ++i) {
        const key = _PRESET_DATE_FILTER_TYPES[i];
        const rangeFn = _PRESET_DATE_FILTER_RANGES[key];
        operators[key] = {
            displayValue: translate(PRESET_DATE_OPERATOR_LOCALE_KEYS[key]),
            evaluator: (value, node, params) => {
                // A range has nothing to match a blank against, as the column filter has nothing either.
                if (value == null || _isBlank(value)) {
                    return false;
                }
                const { comparator, isValid } = params;
                if (isValid && !isValid(value)) {
                    return false;
                }
                if (comparator) {
                    // A fresh pair each row, as the column filter builds one per comparison.
                    const { fromTime, toTime } = cache.getRange(key, rangeFn);
                    return comparator(new Date(fromTime), value) >= 0 && comparator(new Date(toTime), value) < 0;
                }
                const convertedValue = params.valueConverter(value, node);
                if (convertedValue == null) {
                    return false;
                }
                const { fromTime, toTime } = cache.getRange(key, rangeFn);
                const time = +convertedValue;
                return time >= fromTime && time < toTime;
            },
            operands: 'none',
        };
    }
}

export class BooleanFilterExpressionOperators implements DataTypeFilterExpressionOperators<boolean> {
    public operators: { [operator: string]: FilterExpressionOperator<boolean> };

    constructor(private readonly params: FilterExpressionOperatorsParams) {
        this.initOperators();
    }

    public getEntries(activeOperators?: string[]): AutocompleteEntry[] {
        return getEntries(this.operators, activeOperators);
    }

    private initOperators(): void {
        const { translate } = this.params;
        this.operators = {
            true: {
                displayValue: translate('advancedFilterTrue'),
                evaluator: (value) => !!value,
                operands: 'none',
            },
            false: {
                displayValue: translate('advancedFilterFalse'),
                evaluator: (value) => value === false,
                operands: 'none',
            },
            blank: {
                displayValue: translate('advancedFilterBlank'),
                evaluator: _isBlank,
                operands: 'none',
            },
            notBlank: {
                displayValue: translate('advancedFilterNotBlank'),
                evaluator: _hasValue,
                operands: 'none',
            },
        };
    }
}
