import { FilterExpression, ExpressionComponentParams } from "../interfaces";

export interface ExpressionComponent<F extends FilterExpression = FilterExpression> {
    setParameters(params: ExpressionComponentParams<F>): void;
}

export interface OperandComponent<T extends string | number | Date> {
    setParameters(params: ExpressionComponentParams<T>): void;
}

export interface OperandInputElementSerialiser<E> {
    toExpression(input: string | null): E | null;
    toInputString(input: E | null): string | null;
}
