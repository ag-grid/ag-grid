import { IRowNode } from "../../interfaces/iRowNode";

export interface ExpressionEvaluatorParams {
    caseSensitive?: boolean;
    inRangeInclusive?: boolean;
    includeBlanksInEquals?: boolean;
    includeBlanksInLessThan?: boolean;
    includeBlanksInGreaterThan?: boolean;
    includeBlanksInRange?: boolean;
    convertToDate?: (value: string) => Date;
    convertToString?: (value: any, node: IRowNode) => string;
}

export type ExpressionEvaluator<TValue> = (
    value: TValue | null | undefined,
    node: IRowNode,
    params: ExpressionEvaluatorParams,
    operand1?: TValue,
    operand2?: TValue
) => boolean;

export interface ExpressionOperator<TValue> {
    displayValue: string;
    evaluator: ExpressionEvaluator<TValue>;
    numOperands: number;
}

export interface DataTypeExpressionOperator<TValue> {
    [operator: string]: ExpressionOperator<TValue>;
};

export interface ExpressionOperators {
    text: DataTypeExpressionOperator<string>;
    number: DataTypeExpressionOperator<number>;
    boolean: DataTypeExpressionOperator<boolean>;
    date: DataTypeExpressionOperator<Date>;
    dateString: DataTypeExpressionOperator<string>;
    object: DataTypeExpressionOperator<any>;
};

function evaluateTextExpression(
    value: string | null | undefined,
    params: ExpressionEvaluatorParams,
    operand: string,
    nullsMatch: boolean,
    expression: (value: string, operand: string) => boolean
): boolean {
    if (value == null) { return nullsMatch; }
    return params.caseSensitive ? expression(value, operand) : expression(value.toLocaleLowerCase(), operand.toLocaleLowerCase());
}

function evaluateScalarExpression(
    value: number | Date | null | undefined,
    operand: number | Date,
    nullsMatch: boolean,
    expression: (value: number | Date, operand: number | Date) => boolean
): boolean {
    if (value == null) { return nullsMatch; }
    return expression(value, operand);
}

function evaluateDateStringExpression(
    value: string | null | undefined,
    params: ExpressionEvaluatorParams,
    operand: string,
    nullsMatch: boolean,
    expression: (value: Date, operand: Date) => boolean
): boolean {
    if (value == null) { return nullsMatch; }
    return expression(params.convertToDate!(value), params.convertToDate!(operand));
}

function evaluateObjectExpression(
    value: any | null | undefined,
    node: IRowNode,
    params: ExpressionEvaluatorParams,
    operand: any,
    nullsMatch: boolean,
    expression: (value: string, operand: string) => boolean
): boolean {
    if (value == null) { return nullsMatch; }
    return expression(params.convertToString!(value, node), operand);
}

export const EXPRESSION_OPERATORS: ExpressionOperators = {
    text: {
        contains: {
            displayValue: 'contains',
            evaluator: (value, _node, params, operand1) => evaluateTextExpression(value, params, operand1!, false, (v, o) => v.includes(o)),
            numOperands: 1
        },
        notContains: {
            displayValue: 'does not contain',
            evaluator: (value, _node, params, operand1) => evaluateTextExpression(value, params, operand1!, true, (v, o) => !v.includes(o)),
            numOperands: 1
        },
        equals: {
            displayValue: 'equals',
            evaluator: (value, _node, params, operand1) => evaluateTextExpression(value, params, operand1!, false, (v, o) => v === o),
            numOperands: 1
        },
        notEqual: {
            displayValue: 'does not equal',
            evaluator: (value, _node, params, operand1) => evaluateTextExpression(value, params, operand1!, true, (v, o) => v != o),
            numOperands: 1
        },
        startsWith: {
            displayValue: 'starts with',
            evaluator: (value, _node, params, operand1) => evaluateTextExpression(value, params, operand1!, false, (v, o) => v.startsWith(o)),
            numOperands: 1
        },
        endsWith: {
            displayValue: 'ends with',
            evaluator: (value, _node, params, operand1) => evaluateTextExpression(value, params, operand1!, false, (v, o) => v.endsWith(o)),
            numOperands: 1
        },
        blank: {
            displayValue: 'is blank',
            evaluator: (value) => value == null || (typeof value === 'string' && value.trim().length === 0),
            numOperands: 0
        },
        notBlank: {
            displayValue: 'is not blank',
            evaluator: (value) => value != null && (typeof value !== 'string' || value.trim().length > 0),
            numOperands: 0
        },
    },
    number: {
        equals: {
            displayValue: '=',
            evaluator: (value, _node, params, operand1) => evaluateScalarExpression(value, operand1!, !!params.includeBlanksInEquals, (v, o) => v === o),
            numOperands: 1
        },
        notEqual: {
            displayValue: '!=',
            evaluator: (value, _node, params, operand1) => evaluateScalarExpression(value, operand1!, !!params.includeBlanksInEquals, (v, o) => v != o),
            numOperands: 1
        },
        greaterThan: {
            displayValue: '>',
            evaluator: (value, _node, params, operand1) => evaluateScalarExpression(value, operand1!, !!params.includeBlanksInGreaterThan, (v, o) => v > o),
            numOperands: 1
        },
        greaterThanOrEqual: {
            displayValue: '>=',
            evaluator: (value, _node, params, operand1) => evaluateScalarExpression(value, operand1!, !!params.includeBlanksInGreaterThan, (v, o) => v >= o),
            numOperands: 1
        },
        lessThan: {
            displayValue: '<',
            evaluator: (value, _node, params, operand1) => evaluateScalarExpression(value, operand1!, !!params.includeBlanksInLessThan, (v, o) => v < o),
            numOperands: 1
        },
        lessThanOrEqual: {
            displayValue: '<=',
            evaluator: (value, _node, params, operand1) => evaluateScalarExpression(value, operand1!, !!params.includeBlanksInLessThan, (v, o) => v <= o),
            numOperands: 1
        },
        inRange: {
            displayValue: 'in range',
            evaluator: (value, _node, params, operand1, operand2) => {
                if (value == null) { return !!params.includeBlanksInRange; }
                return params.inRangeInclusive
                    ? value >= operand1! && value <= operand2!
                    : value > operand1! && value < operand2!;
            },
            numOperands: 2
        },
        blank: {
            displayValue: 'is blank',
            evaluator: (value) => value == null,
            numOperands: 0
        },
        notBlank: {
            displayValue: 'is not blank',
            evaluator: (value) => value != null,
            numOperands: 0
        },
    },
    boolean: {
        true: {
            displayValue: 'is true',
            evaluator: (value) => !!value,
            numOperands: 0
        },
        false: {
            displayValue: 'is false',
            evaluator: (value) => value === false,
            numOperands: 0
        },
    },
    date: {
        equals: {
            displayValue: '=',
            evaluator: (value, _node, params, operand1) => evaluateScalarExpression(value, operand1!, !!params.includeBlanksInEquals, (v, o) => v === o),
            numOperands: 1
        },
        notEqual: {
            displayValue: '!=',
            evaluator: (value, _node, params, operand1) => evaluateScalarExpression(value, operand1!, !!params.includeBlanksInEquals, (v, o) => v != o),
            numOperands: 1
        },
        greaterThan: {
            displayValue: '>',
            evaluator: (value, _node, params, operand1) => evaluateScalarExpression(value, operand1!, !!params.includeBlanksInGreaterThan, (v, o) => v > o),
            numOperands: 1
        },
        lessThan: {
            displayValue: '<',
            evaluator: (value, _node, params, operand1) => evaluateScalarExpression(value, operand1!, !!params.includeBlanksInLessThan, (v, o) => v < o),
            numOperands: 1
        },
        inRange: {
            displayValue: 'in range',
            evaluator: (value, _node, params, operand1, operand2) => {
                if (value == null) { return !!params.includeBlanksInRange; }
                return params.inRangeInclusive
                    ? value >= operand1! && value <= operand2!
                    : value > operand1! && value < operand2!;
            },
            numOperands: 2
        },
        blank: {
            displayValue: 'is blank',
            evaluator: (value) => value == null,
            numOperands: 0
        },
        notBlank: {
            displayValue: 'is not blank',
            evaluator: (value) => value != null,
            numOperands: 0
        },
    },
    dateString: {
        equals: {
            displayValue: '=',
            evaluator: (value, _node, params, operand1) => evaluateDateStringExpression(value, params, operand1!, !!params.includeBlanksInEquals, (v, o) => v === o),
            numOperands: 1
        },
        notEqual: {
            displayValue: '!=',
            evaluator: (value, _node, params, operand1) => evaluateDateStringExpression(value, params, operand1!, !!params.includeBlanksInEquals, (v, o) => v != o),
            numOperands: 1
        },
        greaterThan: {
            displayValue: '>',
            evaluator: (value, _node, params, operand1) => evaluateDateStringExpression(value, params, operand1!, !!params.includeBlanksInGreaterThan, (v, o) => v > o),
            numOperands: 1
        },
        lessThan: {
            displayValue: '<',
            evaluator: (value, _node, params, operand1) => evaluateDateStringExpression(value, params, operand1!, !!params.includeBlanksInLessThan, (v, o) => v < o),
            numOperands: 1
        },
        inRange: {
            displayValue: 'in range',
            evaluator: (value, _node, params, operand1, operand2) => {
                if (value == null) { return !!params.includeBlanksInRange; }
                return params.inRangeInclusive
                    ? value >= operand1! && value <= operand2!
                    : value > operand1! && value < operand2!;
            },
            numOperands: 2
        },
        blank: {
            displayValue: 'is blank',
            evaluator: (value) => value == null,
            numOperands: 0
        },
        notBlank: {
            displayValue: 'is not blank',
            evaluator: (value) => value != null,
            numOperands: 0
        },
    },
    object: {
        contains: {
            displayValue: 'contains',
            evaluator: (value, node, params, operand1) => evaluateObjectExpression(value, node, params, operand1!, false, (v, o) => v.includes(o)),
            numOperands: 1
        },
        notContains: {
            displayValue: 'does not contain',
            evaluator: (value, node, params, operand1) => evaluateObjectExpression(value, node, params, operand1!, true, (v, o) => !v.includes(o)),
            numOperands: 1
        },
        equals: {
            displayValue: 'equals',
            evaluator: (value, node, params, operand1) => evaluateObjectExpression(value, node, params, operand1!, false, (v, o) => v === o),
            numOperands: 1
        },
        notEqual: {
            displayValue: 'does not equal',
            evaluator: (value, node, params, operand1) => evaluateObjectExpression(value, node, params, operand1!, true, (v, o) => v != o),
            numOperands: 1
        },
        startsWith: {
            displayValue: 'starts with',
            evaluator: (value, node, params, operand1) => evaluateObjectExpression(value, node, params, operand1!, false, (v, o) => v.startsWith(o)),
            numOperands: 1
        },
        endsWith: {
            displayValue: 'ends with',
            evaluator: (value, node, params, operand1) => evaluateObjectExpression(value, node, params, operand1!, false, (v, o) => v.endsWith(o)),
            numOperands: 1
        },
        blank: {
            displayValue: 'is blank',
            evaluator: (value, node, params) => value == null || params.convertToString!(value, node).trim().length === 0,
            numOperands: 0
        },
        notBlank: {
            displayValue: 'is not blank',
            evaluator: (value, node, params) => value != null && params.convertToString!(value, node).trim().length > 0,
            numOperands: 0
        },
    },
}
