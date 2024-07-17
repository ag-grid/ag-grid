import type { IEventEmitter } from '@ag-grid-community/core';

import type { FilterState, SetFilterParams, SimpleFilterParams } from './filterState';

export type FilterStateEvent = 'filterStateChanged';

export interface IFilterStateService extends IEventEmitter<FilterStateEvent> {
    getAvailableFilters(): { id: string; name: string }[];
    getFilterIds(): string[];
    addFilter(id: string): void;
    removeFilter(id: string): void;
    getFilterState(id: string): FilterState | undefined;
    updateFilterState<K extends keyof FilterState>(id: string, key: K, value: FilterState[K]): void;
    updateSimpleFilterParams(id: string, simpleFilterParams: SimpleFilterParams): void;
    updateSetFilterParams(id: string, setFilterParams: SetFilterParams): void;
}
