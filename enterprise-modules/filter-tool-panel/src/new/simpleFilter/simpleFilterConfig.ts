import type { ISimpleFilterModelType, JoinOperator } from '@ag-grid-community/core';

export interface SimpleFilterConfig {
    maxNumConditions: number;
    numAlwaysVisibleConditions: number;
    defaultJoinOperator: JoinOperator;
    defaultOption: ISimpleFilterModelType;
    options: readonly string[];
    readOnly?: boolean;
    filterType: 'text' | 'number' | 'date';
    applyOnChange: boolean;
}
