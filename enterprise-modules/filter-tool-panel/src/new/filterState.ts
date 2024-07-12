import type { ICombinedSimpleModel, JoinOperator, TextFilterModel } from '@ag-grid-community/core';

type FilterModel = TextFilterModel | ICombinedSimpleModel<TextFilterModel>;

export interface FilterState<M extends FilterModel = FilterModel> {
    id: string;
    name: string;
    expanded?: boolean;
    summary?: string;
    appliedModel: M | null;
    unappliedModel: M | null;
    simpleFilterParams: {
        options: { value: string; text: string; numberOfInputs?: 0 | 1 | 2 }[];
        defaultOption: string;
        defaultJoinOperator: JoinOperator;
        maxNumConditions: number;
        numAlwaysVisibleConditions: number;
    };
}
