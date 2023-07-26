import { AutocompleteEntry } from "../../widgets/autocompleteParams";
import { IRowNode } from "../../interfaces/iRowNode";

export interface FilterExpressionEvaluatorParams {
    caseSensitive?: boolean;
    inRangeInclusive?: boolean;
    includeBlanksInEquals?: boolean;
    includeBlanksInLessThan?: boolean;
    includeBlanksInGreaterThan?: boolean;
    includeBlanksInRange?: boolean;
    convertToDate?: (value: string) => Date;
    convertToString?: (value: any, node: IRowNode) => string;
}

export type FilterExpressionEvaluator<TValue> = (
    value: TValue | null | undefined,
    node: IRowNode,
    params: FilterExpressionEvaluatorParams,
    operand1?: TValue,
    operand2?: TValue
) => boolean;

export interface FilterExpressionOperator<TValue> {
    displayValue: string;
    evaluator: FilterExpressionEvaluator<TValue>;
    numOperands: number;
}

export interface DataTypeFilterExpressionOperators<TValue> {
    operators: {
        [operator: string]: FilterExpressionOperator<TValue>;
    };
    getEntries(): AutocompleteEntry[];
    findOperator(displayValue: string): string | null | undefined;
};

export interface FilterExpressionOperators {
    text: DataTypeFilterExpressionOperators<string>;
    number: DataTypeFilterExpressionOperators<number>;
    boolean: DataTypeFilterExpressionOperators<boolean>;
    date: DataTypeFilterExpressionOperators<Date>;
    dateString: DataTypeFilterExpressionOperators<string>;
    object: DataTypeFilterExpressionOperators<any>;
};

function findOperator<TValue>(displayValue: string, operators: { [operator: string]: FilterExpressionOperator<TValue> }): string | null | undefined {
    let partialMatch = false;
    const operatorLowerCase = displayValue.toLocaleLowerCase();
    const partialSearchValue = operatorLowerCase + ' ';
    const parsedOperator = Object.entries(operators).find(([_key, { displayValue }]) => {
        const displayValueLowerCase = displayValue.toLocaleLowerCase();
        if (displayValueLowerCase.startsWith(partialSearchValue)) {
            partialMatch = true;
        }
        return displayValueLowerCase === operatorLowerCase;
    });
    if (parsedOperator) {
        return parsedOperator[0];
    } else if (partialMatch) {
        return null;
    } else {
        return undefined;
    }
}

function filterOperators<TValue>(operators: { [operator: string]: FilterExpressionOperator<TValue> }, activeOperators?: string[]): { [operator: string]: FilterExpressionOperator<TValue> } {
    if (activeOperators) {
        Object.keys(operators).forEach(key => {
            if (!activeOperators.includes(key)) {
                delete operators[key];
            }
        });
    }
    return operators;
}

export interface TextFilterExpressionOperatorsParams<TValue = string> {
    translate: (key: string, defaultValue: string, variableValues?: string[] | undefined) => string;
    valueParser?: (value: TValue, node: IRowNode, params: FilterExpressionEvaluatorParams) => string;
    activeOperators?: string[];
}

export class TextFilterExpressionOperators<TValue = string> implements DataTypeFilterExpressionOperators<TValue> {
    public operators: { [operator: string]: FilterExpressionOperator<TValue> };

    private valueParser: (value: TValue, node: IRowNode, params: FilterExpressionEvaluatorParams) => string

    constructor(private params: TextFilterExpressionOperatorsParams<TValue>) {
        this.valueParser = params.valueParser ?? (v => v as any);
        this.initOperators();
    }

    public getEntries(): AutocompleteEntry[] {
        return Object.entries(this.operators).map(([key, { displayValue }]) => ({ key, displayValue }));
    }

    public findOperator(displayValue: string): string | null | undefined {
        return findOperator(displayValue, this.operators);
    }

    private initOperators(): void {
        const { translate, activeOperators } = this.params;
        this.operators = filterOperators({
            contains: {
                displayValue: translate('filterExpressionContains', 'contains'),
                evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1!, false, (v, o) => v.includes(o)),
                numOperands: 1
            },
            notContains: {
                displayValue: translate('filterExpressionNotContains', 'does not contain'),
                evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1!, true, (v, o) => !v.includes(o)),
                numOperands: 1
            },
            equals: {
                displayValue: translate('filterExpressionEquals', 'equals'),
                evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1!, false, (v, o) => v === o),
                numOperands: 1
            },
            notEqual: {
                displayValue: translate('filterExpressionNotEqual', 'does not equal'),
                evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1!, true, (v, o) => v != o),
                numOperands: 1
            },
            startsWith: {
                displayValue: translate('filterExpressionStartsWith', 'starts with'),
                evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1!, false, (v, o) => v.startsWith(o)),
                numOperands: 1
            },
            endsWith: {
                displayValue: translate('filterExpressionEndsWith', 'ends with'),
                evaluator: (value, node, params, operand1) => this.evaluateExpression(value, node, params, operand1!, false, (v, o) => v.endsWith(o)),
                numOperands: 1
            },
            blank: {
                displayValue: translate('filterExpressionBlank', 'is blank'),
                evaluator: (value) => value == null || (typeof value === 'string' && value.trim().length === 0),
                numOperands: 0
            },
            notBlank: {
                displayValue: translate('filterExpressionNotBlank', 'is not blank'),
                evaluator: (value) => value != null && (typeof value !== 'string' || value.trim().length > 0),
                numOperands: 0
            },
        }, activeOperators);
    }

    private evaluateExpression(
        value: TValue | null | undefined,
        node: IRowNode,
        params: FilterExpressionEvaluatorParams,
        operand: TValue,
        nullsMatch: boolean,
        expression: (value: string, operand: string) => boolean
    ): boolean {
        if (value == null) { return nullsMatch; }
        return params.caseSensitive
            ? expression(this.valueParser(value, node, params), this.valueParser(operand, node, params))
            : expression(this.valueParser(value, node, params).toLocaleLowerCase(), this.valueParser(operand, node, params).toLocaleLowerCase());
    }
}

export interface ScalarFilterExpressionOperatorsParams<ParsedTValue extends number | Date, TValue = ParsedTValue> {
    translate: (key: string, defaultValue: string, variableValues?: string[] | undefined) => string;
    valueParser?: (value: TValue, params: FilterExpressionEvaluatorParams) => ParsedTValue
    activeOperators?: string[];
}

export class ScalarFilterExpressionOperators<ParsedTValue extends number | Date, TValue = ParsedTValue> implements DataTypeFilterExpressionOperators<TValue> {
    public operators: { [operator: string]: FilterExpressionOperator<TValue> };

    private valueParser: (value: TValue, params: FilterExpressionEvaluatorParams) => ParsedTValue

    constructor(private params: ScalarFilterExpressionOperatorsParams<ParsedTValue, TValue>) {
        this.valueParser = params.valueParser ?? (v => v as any);
        this.initOperators();
    }

    public getEntries(): AutocompleteEntry[] {
        return Object.entries(this.operators).map(([key, { displayValue }]) => ({ key, displayValue }));
    }

    public findOperator(displayValue: string): string | null | undefined {
        return findOperator(displayValue, this.operators);
    }

    private initOperators(): void {
        const { translate, activeOperators } = this.params;
        this.operators = filterOperators({
            equals: {
                displayValue: translate('filterExpression', '='),
                evaluator: (value, _node, params, operand1) => this.evaluateSingleOperandExpression(value, params, operand1!, !!params.includeBlanksInEquals, (v, o) => v === o),
                numOperands: 1
            },
            notEqual: {
                displayValue: translate('filterExpressionNotEqual', '!='),
                evaluator: (value, _node, params, operand1) => this.evaluateSingleOperandExpression(value, params, operand1!, !!params.includeBlanksInEquals, (v, o) => v != o),
                numOperands: 1
            },
            greaterThan: {
                displayValue: translate('filterExpressionGreaterThan', '>'),
                evaluator: (value, _node, params, operand1) => this.evaluateSingleOperandExpression(value, params, operand1!, !!params.includeBlanksInGreaterThan, (v, o) => v > o),
                numOperands: 1
            },
            greaterThanOrEqual: {
                displayValue: translate('filterExpressionGreaterThanOrEqual', '>='),
                evaluator: (value, _node, params, operand1) => this.evaluateSingleOperandExpression(value, params, operand1!, !!params.includeBlanksInGreaterThan, (v, o) => v >= o),
                numOperands: 1
            },
            lessThan: {
                displayValue: translate('filterExpressionLessThan', '<'),
                evaluator: (value, _node, params, operand1) => this.evaluateSingleOperandExpression(value, params, operand1!, !!params.includeBlanksInLessThan, (v, o) => v < o),
                numOperands: 1
            },
            lessThanOrEqual: {
                displayValue: translate('filterExpressionLessThanOrEqual', '<='),
                evaluator: (value, _node, params, operand1) => this.evaluateSingleOperandExpression(value, params, operand1!, !!params.includeBlanksInLessThan, (v, o) => v <= o),
                numOperands: 1
            },
            inRange: {
                displayValue: translate('filterExpressionInRange', 'in range'),
                evaluator: (value, _node, params, operand1, operand2) => this.evaluateDoubleOperandExpression(
                    value,
                    params,
                    operand1!,
                    operand2!,
                    !!params.includeBlanksInRange,
                    (v, o1, o2) => params.inRangeInclusive ? v >= o1 && v <= o2 : v > o1 && v < o2
                ),
                numOperands: 2
            },
            blank: {
                displayValue: translate('filterExpressionBlank', 'is blank'),
                evaluator: (value) => value == null,
                numOperands: 0
            },
            notBlank: {
                displayValue: translate('filterExpressionNotBlank', 'is not blank'),
                evaluator: (value) => value != null,
                numOperands: 0
            }
        }, activeOperators);
    }

    private evaluateSingleOperandExpression(
        value: TValue | null | undefined,
        params: FilterExpressionEvaluatorParams,
        operand: TValue,
        nullsMatch: boolean,
        expression: (value: ParsedTValue, operand: ParsedTValue) => boolean
    ): boolean {
        if (value == null) { return nullsMatch; }
        return expression(this.valueParser(value, params), this.valueParser(operand, params));
    }

    private evaluateDoubleOperandExpression(
        value: TValue | null | undefined,
        params: FilterExpressionEvaluatorParams,
        operand1: TValue,
        operand2: TValue,
        nullsMatch: boolean,
        expression: (value: ParsedTValue, operand1: ParsedTValue, operand2: ParsedTValue) => boolean
    ): boolean {
        if (value == null) { return nullsMatch; }
        return expression(this.valueParser(value, params), this.valueParser(operand1, params), this.valueParser(operand2, params));
    }
}

export interface BooleanFilterExpressionOperatorsParams {
    translate: (key: string, defaultValue: string, variableValues?: string[] | undefined) => string;
    activeOperators?: string[];
}

export class BooleanFilterExpressionOperators implements DataTypeFilterExpressionOperators<boolean> {
    public operators: { [operator: string]: FilterExpressionOperator<boolean> };

    constructor(private params: BooleanFilterExpressionOperatorsParams) {
        this.initOperators();
    }

    public getEntries(): AutocompleteEntry[] {
        return Object.entries(this.operators).map(([key, { displayValue }]) => ({ key, displayValue }));
    }

    public findOperator(displayValue: string): string | null | undefined {
        return findOperator(displayValue, this.operators);
    }

    private initOperators(): void {
        const { translate,activeOperators } = this.params;
        this.operators = filterOperators({
            true: {
                displayValue: translate('filterExpressionTrue', 'is true'),
                evaluator: (value) => !!value,
                numOperands: 0
            },
            false: {
                displayValue: translate('filterExpressionFalse', 'is false'),
                evaluator: (value) => value === false,
                numOperands: 0
            },
        }, activeOperators);
    }
}
