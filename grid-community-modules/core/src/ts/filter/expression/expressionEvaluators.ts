export type ExpressionEvaluator<TValue> = (value: TValue | null | undefined, operand1?: TValue, operand2?: TValue) => boolean;

export interface DataTypeExpressionEvaluators<TValue> {
    [operator: string]: ExpressionEvaluator<TValue>;
};

export interface ExpressionEvaluators {
    text: DataTypeExpressionEvaluators<string>;
    number: DataTypeExpressionEvaluators<number>;
};

// TODO - add in handling for case sensitivity, nulls, etc.

export const EXPRESSION_EVALUATORS: ExpressionEvaluators = {
    text: {
        contains: (value, operand1) => {
            if (value == null) { return false; }
            return value.toLocaleLowerCase().includes(operand1!.toLocaleLowerCase());
        },
        startsWith: (value, operand1) => {
            if (value == null) { return false; }
            return value.toLocaleLowerCase().startsWith(operand1!.toLocaleLowerCase());
        },
    },
    number: {
        '<': (value, operand1) => {
            if (value == null) { return false; }
            return value < operand1!;
        },
        '>': (value, operand1) => {
            if (value == null) { return false; }
            return value > operand1!;
        }
    }
}

export const STRING_NUM_OPERANDS = {
    contains: 1,
    startsWith: 1
};

export const NUMBER_NUM_OPERANDS = {
    '<': 1,
    '>': 1
};
