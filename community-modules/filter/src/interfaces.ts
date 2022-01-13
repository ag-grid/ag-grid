import { IFilterParams } from "@ag-grid-community/core";

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

export const SET_OPERATION_METADATA = {
    'in': { operands: Infinity },
};

export type ScalarComparisonOperation = keyof typeof SCALAR_COMPARISON_OPERATION_METADATA;
export type TextComparisonOperation = keyof typeof TEXT_COMPARISON_OPERATION_METADATA;
export type SetOperation = keyof typeof SET_OPERATION_METADATA;

export type Cardinality = 0 | 1 | 2 | typeof Infinity | null;
interface OperationExpression<T, N = string, O = TextComparisonOperation, C extends Cardinality = 1> {
    type: T;
    operation: O;
    operands: C extends 0 ? [] :
        C extends 1 ? [ N ] :
        C extends 2 ? [ N, N ] :
        C extends null ? null :
        N[];
}

export type OperandArray<T> = [T] | [T, T];

export type ScalarComparisonOperationExpression<T, N = string> =
    OperationExpression<T, N, Exclude<ScalarComparisonOperation, 'in-range'>, 1> |
    OperationExpression<T, N, 'in-range', 2>;

export type TextComparisonOperationExpression<T, N = string> =
    OperationExpression<T, N, TextComparisonOperation, 1>;

export type LogicOperation = 'and' | 'or' | 'not';

export type NumberComparisonOperationExpression = ScalarComparisonOperationExpression<'number-op', number>;
export type DateComparisonOperationExpression = ScalarComparisonOperationExpression<'date-op', string>;

export type ScalarOperationExpression = NumberComparisonOperationExpression | DateComparisonOperationExpression;
export type TextOperationExpression = TextComparisonOperationExpression<'text-op'>;
export type SetOperationExpression = OperationExpression<'set-op', string | number | null, SetOperation, typeof Infinity | null>;

export type LogicalOperationExpression<M> =
    OperationExpression<'logic', M, Exclude<LogicOperation, 'not'>, typeof Infinity> |
    OperationExpression<'logic', M, 'not', 1>;

export type InbuiltExpression = TextOperationExpression | ScalarOperationExpression | SetOperationExpression;

export type ConcreteExpression = InbuiltExpression;

export type FilterExpression = ConcreteExpression | LogicalOperationExpression<ConcreteExpression>;

/** TYPE-GUARDS */

export function isScalarComparisonOperation(x: string): x is ScalarComparisonOperation {
    return Object.keys(SCALAR_COMPARISON_OPERATION_METADATA).indexOf(x) >= 0;
}

export function isTextComparisonOperation(x: string): x is TextComparisonOperation {
    return Object.keys(TEXT_COMPARISON_OPERATION_METADATA).indexOf(x) >= 0;
}

export function isSetOperation(x: string): x is SetOperation {
    return Object.keys(SET_OPERATION_METADATA).indexOf(x) >= 0;
}

export function isTextComparisonOperationExpression(x: Partial<FilterExpression>): x is Partial<TextComparisonOperationExpression<any>> {
    return x.type === 'text-op';
}

export function isComparisonOperationExpression(x: Partial<FilterExpression>): x is Partial<ScalarComparisonOperationExpression<any>> {
    return x.type === 'number-op' || x.type === 'date-op';
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
    type: 'set-op',
    operation: 'in',
    operands: ['abc', 'ABC', '123', 'xzy', '123', 123],
};

const EXAMPLE_EXPRESSION_5: FilterExpression = {
    type: 'set-op',
    operation: 'in',
    operands: [],
};

const EXAMPLE_EXPRESSION_6: FilterExpression = {
    type: 'set-op',
    operation: 'in',
    operands: null,
};

/** EVALUATION MODEL **/
export interface FilterEvaluationModel<T> {
    evaluate(input: T | null): boolean;
    isValid(): boolean;
    isNull(): boolean;
    toFilterExpression(): FilterExpression | null;
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
    addUpdateListener(source: any, cb: (newState: T | null) => void): () => void;
    addTransientUpdateListener(source: any, cb: (newTransientState: PartialStateType<T> | T | null) => void): () => void;

    getTransientExpression(): PartialStateType<T> | null;
    mutateTransientExpression(source: any, change: PartialStateType<T> | null): void;
    isTransientExpressionValid(): boolean;
    isTransientExpressionNull(): boolean;

    applyExpression(source: any): void;
    revertToAppliedExpression(source: any): void;
}

export interface ExpressionComponentParams<F extends FilterExpression | string | number | Date = FilterExpression> {
    stateManager: StateManager<F>;
    filterParams: Omit<IFilterParams, 'filterChangedCallback' | 'filterModifiedCallback'>;
}
