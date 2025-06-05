import type { IEventEmitter } from 'ag-grid-community';

import type { FilterPanelFilterState } from './iFilterState';

export type FilterStateEvent = 'filterStateChanged';

export interface IFilterStateService extends IEventEmitter<FilterStateEvent> {
    getAvailableFilters(): { id: string; name: string }[];
    getFilterIds(): string[];
    addFilter(id: string): void;
    removeFilter(id: string): void;
    getFilterState(id: string): FilterPanelFilterState | undefined;
    expandFilter(id: string, expanded: boolean): void;
    updateFilterType(id: string, type: string): void;
}
