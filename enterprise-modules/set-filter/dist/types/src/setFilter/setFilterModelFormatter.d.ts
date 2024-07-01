import type { SetFilterModel } from '@ag-grid-community/core';
import type { SetFilter } from './setFilter';
export declare class SetFilterModelFormatter {
    getModelAsString<V>(model: SetFilterModel | null | undefined, setFilter: SetFilter<V>): string;
}
