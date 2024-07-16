import type { ICombinedSimpleModel, JoinOperator, ListOption, TextFilterModel } from '@ag-grid-community/core';

type FilterModel = TextFilterModel | ICombinedSimpleModel<TextFilterModel>;

interface BaseFilterCondition {
    option: string;
    disabled?: boolean;
}

export interface NoInputFilterCondition extends BaseFilterCondition {
    numberOfInputs: 0;
}

export interface SingleInputFilterCondition<TValue = string> extends BaseFilterCondition {
    numberOfInputs: 1;
    from?: TValue | null;
}

export interface DoubleInputFilterCondition<TValue = string> extends BaseFilterCondition {
    numberOfInputs: 2;
    from?: TValue | null;
    to?: TValue | null;
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

export interface FilterState<TValue = string, M extends FilterModel = FilterModel> {
    id: string;
    name: string;
    expanded?: boolean;
    summary?: string;
    appliedModel: M | null;
    simpleFilterParams: SimpleFilterParams<TValue>;
}
