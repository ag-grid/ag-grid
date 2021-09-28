import { ProvidedFilterModel } from '@ag-grid-community/core';
export declare type SetFilterModelValue = (string | null)[];
export interface SetFilterModel extends ProvidedFilterModel {
    filterType?: 'set';
    values: SetFilterModelValue;
}
