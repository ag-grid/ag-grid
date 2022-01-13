export type ComparatorResult = -1 | 0 | 1;

export interface Comparator<O, CV = O> {
    compare(operand: O | null, cellValue: CV | null): ComparatorResult;
}

export interface FilterExpressionSerialiser<M, E> {
    toEvaluationModel(input: E | null): M | null;
    toExpression(input: M | null): E | null;
}

export function toComparatorResult(input: number): ComparatorResult {
    return input === 0 ? 0 :
        Math.sign(input) < 0 ? -1 : 1;
}
