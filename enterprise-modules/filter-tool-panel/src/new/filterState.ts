import type { ICombinedSimpleModel, JoinOperator, ListOption, TextFilterModel } from '@ag-grid-community/core';

type FilterModel = TextFilterModel | ICombinedSimpleModel<TextFilterModel>;

export type FilterCondition = (
    | {
          numberOfInputs: 0;
      }
    | {
          numberOfInputs: 1;
          from?: string | null;
      }
    | {
          numberOfInputs: 2;
          from?: string | null;
          to?: string | null;
      }
) & {
    option: string;
    disabled?: boolean;
};

export interface SimpleFilterOperatorParams {
    operator: JoinOperator;
    disabled?: boolean;
}

export interface SimpleFilterParams {
    conditions: FilterCondition[];
    joinOperator: SimpleFilterOperatorParams;
    options: ListOption[];
}

export interface FilterState<M extends FilterModel = FilterModel> {
    id: string;
    name: string;
    expanded?: boolean;
    summary?: string;
    appliedModel: M | null;
    simpleFilterParams: SimpleFilterParams;
}
