import type {
    ICombinedSimpleModel,
    ISimpleFilterModel,
    JoinOperator,
    ListOption,
    SetFilterModel,
} from '@ag-grid-community/core';

interface BaseFilterCondition {
    option: string;
    disabled?: boolean;
}

export interface NoInputFilterCondition extends BaseFilterCondition {
    numberOfInputs: 0;
}

interface FromFilterCondition<TValue> extends BaseFilterCondition {
    from?: TValue | null;
    fromPlaceholder: string;
    fromAriaLabel: string;
}

export interface SingleInputFilterCondition<TValue = string> extends FromFilterCondition<TValue> {
    numberOfInputs: 1;
}

export interface DoubleInputFilterCondition<TValue = string> extends FromFilterCondition<TValue> {
    numberOfInputs: 2;
    to?: TValue | null;
    toPlaceholder: string;
    toAriaLabel: string;
}

export type FilterCondition<TValue = string> =
    | NoInputFilterCondition
    | SingleInputFilterCondition<TValue>
    | DoubleInputFilterCondition<TValue>;

export interface SimpleFilterOperatorParams {
    operator: JoinOperator;
    disabled?: boolean;
}

export interface SimpleFilterParams<TValue = string> {
    conditions: FilterCondition<TValue>[];
    joinOperator: SimpleFilterOperatorParams;
    options: ListOption[];
    filterType: 'text' | 'number' | 'date';
}

export interface SetFilterParams<TValue = string> {
    values: TValue[];
}

interface BaseFilterState {
    id: string;
    name: string;
    expanded?: boolean;
    summary?: string;
}

export interface SimpleFilterState<TValue = string, M extends ISimpleFilterModel = ISimpleFilterModel>
    extends BaseFilterState {
    type: 'simple';
    appliedModel: M | ICombinedSimpleModel<M> | null;
    filterParams: SimpleFilterParams<TValue>;
}

export interface SetFilterState<TValue = string> extends BaseFilterState {
    type: 'set';
    appliedModel: SetFilterModel | null;
    filterParams: SetFilterParams<TValue>;
}

export type FilterState<TValue = string> = SimpleFilterState<TValue> | SetFilterState<TValue>;
