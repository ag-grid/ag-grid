import type { AgColumn } from '../entities/agColumn';
import type { ValueGetterFunc } from '../entities/colDef';
import type { NewFiltersToolPanelState } from './gridState';
import type { IEventEmitter } from './iEventEmitter';
import type { FilterAction, FilterWrapperParams, IFilterDef } from './iFilter';
import type { IToolPanel, IToolPanelNewFiltersCompParams } from './iToolPanel';

export interface SelectableFilterDef {
    /** Required for custom filters */
    name?: string;
    filter: any;
    filterParams?: any;
    filterValueGetter?: string | ValueGetterFunc;
}

export interface SelectableFilterParams {
    filters?: SelectableFilterDef[];
    defaultFilterParams?: FilterWrapperParams;
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

export interface INewFiltersToolPanel extends IToolPanel {
    getState(): NewFiltersToolPanelState;
}

export interface IFilterPanelService extends IEventEmitter<'filterPanelStateChanged' | 'filterPanelStatesChanged'> {
    getAvailable(): { id: string; name: string }[];
    getIds(): string[];
    add(id: string): void;
    remove(id: string): void;
    getState(id: string): FilterPanelFilterState | undefined;
    expand(id: string, expanded: boolean): void;
    updateType(id: string, filterDef: SelectableFilterDef): void;
    getActions(): { actions: FilterAction[]; canApply: boolean } | undefined;
    doAction(action: FilterAction): void;
    updateParams(params: IToolPanelNewFiltersCompParams): void;
}

export interface ISelectableFilterService {
    getFilterValueGetter(colId: string): string | ValueGetterFunc | undefined;
    isSelectable(filterDef: IFilterDef): boolean;
    getFilterDef(column: AgColumn, filterDef: IFilterDef): IFilterDef;
    getDefs(
        column: AgColumn,
        filterDef: IFilterDef
    ): { filterDefs: SelectableFilterDef[]; activeFilterDef: SelectableFilterDef } | undefined;
    setActive(colId: string, filterDefs: SelectableFilterDef[], activeFilterDef: SelectableFilterDef): void;
    clearActive(colId: string): void;
}
