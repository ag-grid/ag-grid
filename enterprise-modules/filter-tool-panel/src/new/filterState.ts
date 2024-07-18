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
    model: {
        conditions: FilterCondition<TValue>[];
        joinOperator: SimpleFilterOperatorParams;
    };
    options: ListOption[];
    filterType: 'text' | 'number' | 'date';
}

export interface SetFilterItem {
    key: string | null;
    text: string;
    disabled?: boolean;
}

export interface SetFilterParams {
    model: {
        selectedItemKeys: Set<string | null>;
    };
    isSelectAll: boolean;
    miniFilter?: string;
    allItems: SetFilterItem[];
    displayedItems: SetFilterItem[];
    areItemsEqual: (item1: SetFilterItem, item2: SetFilterItem) => boolean;
    isTree?: boolean;
    cellHeight?: number;
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

export interface SetFilterState extends BaseFilterState {
    type: 'set';
    appliedModel: SetFilterModel | null;
    filterParams: SetFilterParams;
}

export type FilterState<TValue = string> = SimpleFilterState<TValue> | SetFilterState;
