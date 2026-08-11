import type { BaseCellDataType, EvaluatorFilterParams, IRowNode } from 'ag-grid-community';
import { _TEXT_FILTER_PREDICATES, _getBuiltInOptionNumberOfInputs, _isBlank } from 'ag-grid-community';

import type { ADVANCED_FILTER_LOCALE_TEXT } from './advancedFilterLocaleText';
import type { AutocompleteEntry } from './autocomplete/autocompleteParams';

/** The column filter's own evaluation params, so one `filterParams` governs both filters. */
export interface FilterExpressionEvaluatorParams<
    ConvertedTValue,
    TValue = ConvertedTValue,
> extends EvaluatorFilterParams {
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
    findOperator(displayValue: string): string | null | undefined;
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
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    for (let i = 0; i < len; ++i) {
        const key = keys[i];
        const operator = hasOwnProperty.call(operators, key) ? operators[key] : undefined;
        if (operator) {
            entries[count++] = { key, displayValue: operator.displayValue };
        }
    }
    if (count < len) {
        entries.length = count;
    }
    return entries;
}

/** Arity comes from the shared table rather than each definition, so an option cannot disagree with the
 * column filter about how many values it takes. */
function defineOperators<C, T>(definitions: {
    [operator: string]: Omit<FilterExpressionOperator<C, T>, 'numOperands'>;
}): { [operator: string]: FilterExpressionOperator<C, T> } {
    const operators: { [operator: string]: FilterExpressionOperator<C, T> } = {};
    const keys = Object.keys(definitions);
    for (let i = 0, len = keys.length; i < len; ++i) {
        const key = keys[i];
        operators[key] = { ...definitions[key], numOperands: _getBuiltInOptionNumberOfInputs(key) };
    }
    return operators;
}

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

    public findOperator(displayValue: string): string | null | undefined {
        return findMatch(displayValue, this.operators, ({ displayValue }) => displayValue);
    }

    private initOperators(): void {
        const { translate } = this.params;
        this.operators = defineOperators({
            contains: {
                displayValue: translate('advancedFilterContains'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateExpression(value, node, params, operand1!, false, _TEXT_FILTER_PREDICATES.contains),
            },
            notContains: {
                displayValue: translate('advancedFilterNotContains'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateExpression(value, node, params, operand1!, true, _TEXT_FILTER_PREDICATES.notContains),
            },
            equals: {
                displayValue: translate('advancedFilterTextEquals'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateExpression(value, node, params, operand1!, false, _TEXT_FILTER_PREDICATES.equals),
            },
            notEqual: {
                displayValue: translate('advancedFilterTextNotEqual'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateExpression(value, node, params, operand1!, true, _TEXT_FILTER_PREDICATES.notEqual),
            },
            startsWith: {
                displayValue: translate('advancedFilterStartsWith'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateExpression(value, node, params, operand1!, false, _TEXT_FILTER_PREDICATES.startsWith),
            },
            endsWith: {
                displayValue: translate('advancedFilterEndsWith'),
                evaluator: (value, node, params, operand1) =>
                    this.evaluateExpression(value, node, params, operand1!, false, _TEXT_FILTER_PREDICATES.endsWith),
            },
            // The column filter's own test, so `blank` means one thing whichever filter asks.
            blank: {
                displayValue: translate('advancedFilterBlank'),
                evaluator: (value) => _isBlank(value),
            },
            notBlank: {
                displayValue: translate('advancedFilterNotBlank'),
                evaluator: (value) => !_isBlank(value),
            },
        });
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

    public findOperator(displayValue: string): string | null | undefined {
        return findMatch(displayValue, this.operators, ({ displayValue }) => displayValue);
    }

    private initOperators(): void {
        const { translate, equals } = this.params;
        this.operators = defineOperators({
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
            },
            blank: {
                displayValue: translate('advancedFilterBlank'),
                evaluator: (value) => value == null,
            },
            notBlank: {
                displayValue: translate('advancedFilterNotBlank'),
                evaluator: (value) => value != null,
            },
        });
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
        if (value == null) {
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

export class BooleanFilterExpressionOperators implements DataTypeFilterExpressionOperators<boolean> {
    public operators: { [operator: string]: FilterExpressionOperator<boolean> };

    constructor(private readonly params: FilterExpressionOperatorsParams) {
        this.initOperators();
    }

    public getEntries(activeOperators?: string[]): AutocompleteEntry[] {
        return getEntries(this.operators, activeOperators);
    }

    public findOperator(displayValue: string): string | null | undefined {
        return findMatch(displayValue, this.operators, ({ displayValue }) => displayValue);
    }

    private initOperators(): void {
        const { translate } = this.params;
        this.operators = defineOperators({
            true: {
                displayValue: translate('advancedFilterTrue'),
                evaluator: (value) => !!value,
            },
            false: {
                displayValue: translate('advancedFilterFalse'),
                evaluator: (value) => value === false,
            },
            blank: {
                displayValue: translate('advancedFilterBlank'),
                evaluator: (value) => value == null,
            },
            notBlank: {
                displayValue: translate('advancedFilterNotBlank'),
                evaluator: (value) => value != null,
            },
        });
    }
}
