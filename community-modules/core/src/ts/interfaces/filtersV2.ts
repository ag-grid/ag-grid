/** EXPRESSION TYPES **/
export const SCALAR_COMPARISON_OPERATION_METADATA = {
    'equals': { operands: 1 },
    'not-equals': { operands: 1 },
    'less-than': { operands: 1 },
    'greater-than': { operands: 1 },
    'in-range': { operands: 2 },
};

export const TEXT_COMPARISON_OPERATION_METADATA = {
    'contains': { operands: 1 },
    'not-contains': { operands: 1 },
    'equals': { operands: 1 },
    'not-equals': { operands: 1 },
    'starts-with': { operands: 1 },
    'ends-with': { operands: 1 },
};

export type ScalarComparisonOperation = keyof typeof SCALAR_COMPARISON_OPERATION_METADATA;
export type TextComparisonOperation = keyof typeof TEXT_COMPARISON_OPERATION_METADATA;

export type Cardinality = 0 | 1 | 2 | typeof Infinity;
interface OperationExpression<T, N = string, O = TextComparisonOperation, C extends Cardinality = 1> {
    type: T;
    operation: O;
    operands: C extends 0 ? [] :
        C extends 1 ? [ N ] :
        C extends 2 ? [ N, N ] :
        N[];
}

export type OperandArray<T> = [T] | [T, T];

export type ScalarComparisonOperationExpression<T, N = string> =
    OperationExpression<T, N, Exclude<ScalarComparisonOperation, 'in-range'>, 1> |
    OperationExpression<T, N, 'in-range', 2>;

export type TextComparisonOperationExpression<T, N = string> =
    OperationExpression<T, N, TextComparisonOperation, 1>;

export type CustomExpression<T> = OperationExpression<'custom', string, T, typeof Infinity>;

export type LogicOperation = 'and' | 'or' | 'not';

export type NumberComparisonOperationExpression = ScalarComparisonOperationExpression<'number-op', number>;
export type DateComparisonOperationExpression = ScalarComparisonOperationExpression<'date-op', string>;

export type ScalarOperationExpression = NumberComparisonOperationExpression | DateComparisonOperationExpression;
export type TextOperationExpression = TextComparisonOperationExpression<'text-op'>;

export type LogicalOperationExpression<M> =
    OperationExpression<'logic', M, Exclude<LogicOperation, 'not'>, typeof Infinity> |
    OperationExpression<'logic', M, 'not', 1>;

export type InbuiltExpression = TextOperationExpression | ScalarOperationExpression;

export type ConcreteExpression = InbuiltExpression | CustomExpression<unknown>;

export type FilterExpression = ConcreteExpression | LogicalOperationExpression<ConcreteExpression>;

/** TYPE-GUARDS */

export function isScalarComparisonOperation(x: string): x is ScalarComparisonOperation {
    return Object.keys(SCALAR_COMPARISON_OPERATION_METADATA).indexOf(x) >= 0;
}

export function isTextComparisonOperation(x: string): x is TextComparisonOperation {
    return Object.keys(TEXT_COMPARISON_OPERATION_METADATA).indexOf(x) >= 0;
}

export function isTextComparisonOperationExpression(x: Partial<FilterExpression>): x is Partial<TextComparisonOperationExpression<any>> {
    return x.type === 'text-op';
}

export function isComparisonOperationExpression(x: Partial<FilterExpression>): x is Partial<ScalarComparisonOperationExpression<any>> {
    return x.type === 'number-op' || x.type === 'date-op';
}

export function isCustomExpression(x: Partial<FilterExpression>): x is Partial<CustomExpression<any>> {
    return x.type === 'custom';
}

/** UTILITIES */

export function comparisonOperationOperandCardinality(
    op: ScalarComparisonOperation | TextComparisonOperation
): Cardinality {
    if (isScalarComparisonOperation(op)) {
        return SCALAR_COMPARISON_OPERATION_METADATA[op].operands;
    }
    if (isTextComparisonOperation(op)) {
        return TEXT_COMPARISON_OPERATION_METADATA[op].operands;
    }

    return Infinity;
}

/** EXAMPLES */

const EXAMPLE_EXPRESSION_1: FilterExpression = {
    type: 'logic',
    operation: 'or',
    operands: [
        { type: 'text-op', operation: 'equals', operands: ['test'] },
        { type: 'text-op', operation: 'contains', operands: ['123'] },
        { type: 'text-op', operation: 'starts-with', operands: ['abc'] },
    ],
};

const EXAMPLE_EXPRESSION_2: FilterExpression = {
    type: 'logic',
    operation: 'not',
    operands: [
        { type: 'text-op', operation: 'contains', operands: ['c'] },
    ],
};

const EXAMPLE_EXPRESSION_3: FilterExpression = {
    type: 'text-op',
    operation: 'contains',
    operands: ['test'],
};

const EXAMPLE_EXPRESSION_4: FilterExpression = {
    type: 'custom',
    operation: 'my-custom-operation',
    operands: [],
};

/** EVALUATION MODEL **/
export interface FilterEvaluationModel<T> {
    evaluate(input: T): boolean;
    isValid(): boolean;
    isNull(): boolean;
    toFilterExpression(): FilterExpression | null;
}

export interface CustomFilterEvaluationModelBuilder {
    new (expr: CustomExpression<any> | PartialStateType<CustomExpression<any>>): FilterEvaluationModel<unknown>;
}

/** UI COMPONENTS **/

export type StateType = FilterExpression | string | number | Date;
export type PartialTuple<T> = T extends [] ? [] : 
    T extends [any] ? [T[0] | null] :
    T extends [any, any] ? [T[0] | null, T[1] | null] :
    T extends any[] ? (T[number] | null)[] :
    T;
export type PartialStateType<S> = 
    S extends string | number | Date ? S :
    { [K in keyof S]?: PartialTuple<S[K]> };

export interface StateManager<T extends StateType> {
    addUpdateListener(cb: (newState: T | null) => void): void;
    addTransientUpdateListener(cb: (newTransientState: PartialStateType<T> | T | null) => void): void;

    getTransientExpression(): PartialStateType<T> | null;
    mutateTransientExpression(change: PartialStateType<T> | null): void;
    isTransientExpressionValid(): boolean;
    isTransientExpressionNull(): boolean;

    applyExpression(): void;
    revertToAppliedExpression(): void;
}

export interface ExpressionComponentParams<F extends FilterExpression | string | number | Date = FilterExpression> {
    stateManager: StateManager<F>;
}
