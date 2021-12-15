export interface Comparator<T> {
    compare(a: T | null, b: T | null): number;
}

export interface FilterExpressionSerialiser<M, E> {
    toEvaluationModel(input: E | null): M | null;
    toExpression(input: M | null): E | null;
}
