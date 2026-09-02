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
    valueConverter: (value: TValue, node: IRowNode) => ConvertedTValue;
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
export type OperandsKind = 'none' | 'one' | 'range';

/** How many of `filter` / `filterTo` the option fills, for the sites that care about shape and not order. */
export const OPERAND_COUNT: Record<OperandsKind, number> = { none: 0, one: 1, range: 2 };

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
                        equals
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
                        (v, o) => v > o
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
                        (v, o) => v >= o
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
                        (v, o) => v < o
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
                        (v, o) => v <= o
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
        isNegated?: boolean
    ): boolean {
        // A scalar has no use for a blank string, so it counts as absent — as it does in the column filter.
        // The `== null` half is what narrows `value`; `_isBlank` alone would not.
        if (value == null || _isBlank(value)) {
            return nullsMatch;
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

/** One cache per data type, since a relative range depends on nothing but the clock. */
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
                const convertedValue = value == null || _isBlank(value) ? null : params.valueConverter(value, node);
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
