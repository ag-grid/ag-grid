import { ProvidedFilterModel } from '@ag-grid-community/core';

export type SetFilterModelValue = (string | null)[];
export interface SetFilterModel extends ProvidedFilterModel {
    values: SetFilterModelValue;
}
