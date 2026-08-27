import { _hasOwn } from 'ag-stack';

import type { BaseCellDataType, IRowNode, TextFormatter } from 'ag-grid-community';
import { _TEXT_FILTER_PREDICATES, _getTextFormatter, _isBlank, _trimInputForFilter } from 'ag-grid-community';

import type { ADVANCED_FILTER_LOCALE_TEXT } from './advancedFilterLocaleText';
import type { AutocompleteEntry } from './autocomplete/autocompleteParams';

export interface FilterExpressionEvaluatorParams<ConvertedTValue, TValue = ConvertedTValue> {
    includeBlanksInEquals?: boolean;
    includeBlanksInNotEqual?: boolean;
    includeBlanksInLessThan?: boolean;
    includeBlanksInGreaterThan?: boolean;
    /** The column's own comparison and validity gate, read only by the scalar operators. */
    comparator?: (operand: ConvertedTValue, value: any) => number;
    isValidDate?: (value: any) => boolean;
    /** The column's own text normalisation, matching and trimming, read only by the text operators. */
    textFormatter?: TextFormatter;
    textMatches?: (filterOption: string, value: string, filterText: string, node: IRowNode) => boolean;
    trimInput?: boolean;
    valueConverter: (value: TValue, node: IRowNode) => ConvertedTValue;
}

type FilterExpressionEvaluator<ConvertedTValue, TValue = ConvertedTValue> = (
    value: TValue | null | undefined,
    node: IRowNode,
    params: FilterExpressionEvaluatorParams<ConvertedTValue, TValue>,
    operand1?: ConvertedTValue,
    operand2?: ConvertedTValue
) => boolean;

export interface FilterExpressionOperator<ConvertedTValue, TValue = ConvertedTValue> {
    displayValue: string;
    evaluator: FilterExpressionEvaluator<ConvertedTValue, TValue>;
    numOperands: number;
}

export interface DataTypeFilterExpressionOperators<ConvertedTValue, TValue = ConvertedTValue> {
    operators: {
        [operator: string]: FilterExpressionOperator<ConvertedTValue, TValue>;
    };
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

function getEntries<ConvertedTValue, TValue = ConvertedTValue>(
    operators: { [operator: string]: FilterExpressionOperator<ConvertedTValue, TValue> },
    activeOperatorKeys?: string[]
): AutocompleteEntry[] {
    const keys = activeOperatorKeys ?? Object.keys(operators);
    const len = keys.length;
    const entries: AutocompleteEntry[] = new Array(len);
    let count = 0;
    for (let i = 0; i < len; ++i) {
        const key = keys[i];
        const operator = _hasOwn(operators, key) ? operators[key] : undefined;
        if (operator) {
            entries[count++] = { key, displayValue: operator.displayValue };
        }
    }
    if (count < len) {
        entries.length = count;
    }
    return entries;
}

/** Only reached for a condition whose column no longer resolves, which has no `filterParams` to read. */
const defaultTextFormatter: TextFormatter = _getTextFormatter({});

interface FilterExpressionOperatorsParams {
    translate: (key: keyof typeof ADVANCED_FILTER_LOCALE_TEXT, variableValues?: string[]) => string;
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

    /** The predicate is read from the key, so the two cannot name different comparisons. */
    private textOperator(
        displayValue: string,
        filterOption: keyof typeof _TEXT_FILTER_PREDICATES,
        nullsMatch: boolean
    ): FilterExpressionOperator<string, TValue> {
        const expression = _TEXT_FILTER_PREDICATES[filterOption];
        return {
            displayValue,
            evaluator: (value, node, params, operand1) =>
                this.evaluateExpression(value, node, params, operand1!, nullsMatch, expression, filterOption),
            numOperands: 1,
        };
    }

    private initOperators(): void {
        const { translate } = this.params;
        this.operators = {
            contains: this.textOperator(translate('advancedFilterContains'), 'contains', false),
            notContains: this.textOperator(translate('advancedFilterNotContains'), 'notContains', true),
            equals: this.textOperator(translate('advancedFilterTextEquals'), 'equals', false),
            notEqual: this.textOperator(translate('advancedFilterTextNotEqual'), 'notEqual', true),
            startsWith: this.textOperator(translate('advancedFilterStartsWith'), 'startsWith', false),
            endsWith: this.textOperator(translate('advancedFilterEndsWith'), 'endsWith', false),
            // The column filter's own test, so `blank` means one thing whichever filter asks a text column.
            blank: {
                displayValue: translate('advancedFilterBlank'),
                evaluator: (value) => _isBlank(value),
                numOperands: 0,
            },
            notBlank: {
                displayValue: translate('advancedFilterNotBlank'),
                evaluator: (value) => !_isBlank(value),
                numOperands: 0,
            },
        };
    }

    /** The column filter's own order: trim the filter text, normalise both sides through one formatter, then
     * match. A supplied `textMatcher` replaces the comparison itself, exactly as it does in the column filter. */
    private evaluateExpression(
        value: TValue | null | undefined,
        node: IRowNode,
        params: FilterExpressionEvaluatorParams<string, TValue>,
        operand: string,
        nullsMatch: boolean,
        expression: (value: string, operand: string) => boolean,
        filterOption: string
    ): boolean {
        if (value == null) {
            return nullsMatch;
        }
        const format = params.textFormatter ?? defaultTextFormatter;
        const filterText = format(params.trimInput ? _trimInputForFilter(operand) : operand) ?? '';
        const formattedValue = format(params.valueConverter(value, node)) ?? '';
        const textMatches = params.textMatches;
        return textMatches
            ? textMatches(filterOption, formattedValue, filterText, node)
            : expression(formattedValue, filterText);
    }
}

/** The sign tests a comparison result is read through, named so a flame graph says which one ran. */
const isZero = (compareResult: number): boolean => compareResult === 0;
const isNotZero = (compareResult: number): boolean => compareResult !== 0;
const isAfter = (compareResult: number): boolean => compareResult > 0;
const isAtOrAfter = (compareResult: number): boolean => compareResult >= 0;
const isBefore = (compareResult: number): boolean => compareResult < 0;
const isAtOrBefore = (compareResult: number): boolean => compareResult <= 0;

interface ScalarFilterExpressionOperatorsParams<ConvertedTValue> extends FilterExpressionOperatorsParams {
    /** The data type's own comparison, in the sign convention a column `comparator` uses. */
    compare: (operand: ConvertedTValue, value: ConvertedTValue) => number;
    /** What the comparison can read, mirroring each column filter handler's own gate. */
    isValid: (value: any) => boolean;
}

export class ScalarFilterExpressionOperators<
    ConvertedTValue extends number | Date | bigint,
    TValue = ConvertedTValue,
> implements DataTypeFilterExpressionOperators<ConvertedTValue, TValue> {
    public operators: { [operator: string]: FilterExpressionOperator<ConvertedTValue, TValue> };

    constructor(private readonly params: ScalarFilterExpressionOperatorsParams<ConvertedTValue>) {
        this.initOperators();
    }

    public getEntries(activeOperators?: string[]): AutocompleteEntry[] {
        return getEntries(this.operators, activeOperators);
    }

    private initOperators(): void {
        const translate = this.params.translate;
        this.operators = {
            equals: {
                displayValue: translate('advancedFilterEquals'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateComparison(value, node, params, operand1!, !!params.includeBlanksInEquals, isZero),
                numOperands: 1,
            },
            notEqual: {
                displayValue: translate('advancedFilterNotEqual'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateComparison(
                        value,
                        node,
                        params,
                        operand1!,
                        !!params.includeBlanksInNotEqual,
                        isNotZero,
                        true
                    ),
                numOperands: 1,
            },
            greaterThan: {
                displayValue: translate('advancedFilterGreaterThan'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateComparison(
                        value,
                        node,
                        params,
                        operand1!,
                        !!params.includeBlanksInGreaterThan,
                        isAfter
                    ),
                numOperands: 1,
            },
            greaterThanOrEqual: {
                displayValue: translate('advancedFilterGreaterThanOrEqual'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateComparison(
                        value,
                        node,
                        params,
                        operand1!,
                        !!params.includeBlanksInGreaterThan,
                        isAtOrAfter
                    ),
                numOperands: 1,
            },
            lessThan: {
                displayValue: translate('advancedFilterLessThan'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateComparison(value, node, params, operand1!, !!params.includeBlanksInLessThan, isBefore),
                numOperands: 1,
            },
            lessThanOrEqual: {
                displayValue: translate('advancedFilterLessThanOrEqual'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateComparison(
                        value,
                        node,
                        params,
                        operand1!,
                        !!params.includeBlanksInLessThan,
                        isAtOrBefore
                    ),
                numOperands: 1,
            },
            blank: {
                displayValue: translate('advancedFilterBlank'),
                evaluator: (value) => _isBlank(value),
                numOperands: 0,
            },
            notBlank: {
                displayValue: translate('advancedFilterNotBlank'),
                evaluator: (value) => !_isBlank(value),
                numOperands: 0,
            },
        };
    }

    /**
     * The column filter's own order: the validity gate, then the comparison, then the sign of its result.
     * A value the comparison cannot read matches nothing, and so matches every negation of a comparison.
     */
    private evaluateComparison(
        value: TValue | null | undefined,
        node: IRowNode,
        params: FilterExpressionEvaluatorParams<ConvertedTValue, TValue>,
        operand: ConvertedTValue,
        nullsMatch: boolean,
        passes: (compareResult: number) => boolean,
        isNegated?: boolean
    ): boolean {
        if (value == null) {
            return nullsMatch;
        }
        // Handed the value the column filter hands it, unconverted: a string date column's `isValidDate`
        // reads the string itself, and one written for that column must not be given something else.
        const isValidDate = params.isValidDate;
        if (isValidDate && !isValidDate(value)) {
            return !!isNegated;
        }
        const comparator = params.comparator;
        if (comparator) {
            return passes(comparator(operand, value));
        }
        const convertedValue = params.valueConverter(value, node);
        // The data type's own gate, on the value its comparison is about to read rather than on the raw one.
        if (convertedValue == null || !this.params.isValid(convertedValue)) {
            return !!isNegated;
        }
        return passes(this.params.compare(operand, convertedValue));
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
                numOperands: 0,
            },
            false: {
                displayValue: translate('advancedFilterFalse'),
                evaluator: (value) => value === false,
                numOperands: 0,
            },
            blank: {
                displayValue: translate('advancedFilterBlank'),
                evaluator: (value) => _isBlank(value),
                numOperands: 0,
            },
            notBlank: {
                displayValue: translate('advancedFilterNotBlank'),
                evaluator: (value) => !_isBlank(value),
                numOperands: 0,
            },
        };
    }
}
