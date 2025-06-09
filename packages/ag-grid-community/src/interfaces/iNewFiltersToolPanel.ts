import type { AgColumn } from '../entities/agColumn';
import type { ValueGetterFunc } from '../entities/colDef';
import type { IEventEmitter } from './iEventEmitter';
import type { IFilterDef } from './iFilter';

export interface SelectableFilterDef {
    name: string;
    filter: any;
    filterParams?: any;
    filterValueGetter?: string | ValueGetterFunc;
}

export interface SelectableFilterParams {
    filters?: SelectableFilterDef[];
}

interface FilterPanelBaseState {
    column: AgColumn;
    name: string;
}

export interface FilterPanelSummaryState extends FilterPanelBaseState {
    expanded: false;
    summary: string;
}

export interface FilterPanelDetailState extends FilterPanelBaseState {
    expanded: true;
    activeFilterDef?: SelectableFilterDef;
    filterDefs?: SelectableFilterDef[];
    detail: HTMLElement;
}

export type FilterPanelFilterState = FilterPanelSummaryState | FilterPanelDetailState;

export interface IFilterPanelService extends IEventEmitter<'filterPanelStateChanged' | 'filterPanelStatesChanged'> {
    getFilterValueGetter(colId: string): string | ValueGetterFunc | undefined;
    isSelectableFilter(filterDef: IFilterDef): boolean;
    getSelectableFilterDef(column: AgColumn, filterDef: IFilterDef): IFilterDef;
    getAvailableFilters(): { id: string; name: string }[];
    getFilterIds(): string[];
    addFilter(id: string): void;
    removeFilter(id: string): void;
    getFilterState(id: string): FilterPanelFilterState | undefined;
    expandFilter(id: string, expanded: boolean): void;
    updateFilterType(id: string, filterDef: SelectableFilterDef): void;
}
