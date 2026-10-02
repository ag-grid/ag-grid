import type { IEventEmitter } from 'ag-stack';

import type { AgColumn } from '../entities/agColumn';
import type { ValueGetterFunc } from '../entities/colDef';
import type { FilterChangedEventSourceType } from '../events';
import type { NewFiltersToolPanelState, SelectableFilterState } from './gridState';
import type { IAfterGuiAttachedParams } from './iAfterGuiAttachedParams';
import type { FilterAction, FilterWrapperParams, IFilterDef } from './iFilter';
import type { IToolPanel, IToolPanelNewFiltersCompParams } from './iToolPanel';

export interface SelectableFilterDef {
    /**
     * Name that will be displayed in the filter card dropdown.
     * Required for custom filters
     */
    name?: string;
    /**
     * Filter to use for this column.
     * - Set to `true` to use the default filter.
     * - Set to the name of a provided filter: `agNumberColumnFilter`, `agBigIntColumnFilter`, `agTextColumnFilter`, `agDateColumnFilter`, `agMultiColumnFilter`, `agSetColumnFilter`.
     * - Set to a `ColumnFilter`
     *
     * A name no filter is registered under is warned about and the default filter is used instead.
     */
    filter: any;
    /** Params to be passed to the filter component specified in `filter`, or a function returning them. */
    filterParams?: any;
    /**
     * Function or expression. Gets the value for filtering purposes.
     * Allows for different values to be used for different filters
     * instead of using `colDef.filterValueGetter`.
     */
    filterValueGetter?: string | ValueGetterFunc;
}

export interface SelectableFilterParams {
    /**
     * List of possible filters which will show in the filter card.
     * If not provided, will default to grid-provided filters
     */
    filters?: SelectableFilterDef[];
    /**
     * The index of the filter that should be active by default, in `filters` or else in the default list.
     * Without one the first is active, except that the default list starts at its Set Filter where that is the
     * default filter. An index naming no filter selects the first.
     */
    defaultFilterIndex?: number;
    /**
     * Params which will be passed to all filters
     */
    defaultFilterParams?: FilterWrapperParams;
}

interface FilterPanelBaseState {
    column: AgColumn;
    name: string;
    isEditing: boolean;
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
    afterGuiAttached: (params?: IAfterGuiAttachedParams) => void;
    afterGuiDetached: () => void;
}

export type FilterPanelFilterState = FilterPanelSummaryState | FilterPanelDetailState;

export interface INewFiltersToolPanel extends IToolPanel {
    getState(): NewFiltersToolPanelState;
}

export interface IFilterPanelService extends IEventEmitter<'filterPanelStateChanged' | 'filterPanelStatesChanged'> {
    isActive: boolean;
    getAvailable(): { id: string; name: string }[];
    getIds(): string[];
    add(id: string): void;
    remove(id: string): void;
    getState(id: string): FilterPanelFilterState | undefined;
    expand(id: string, expanded: boolean): void;
    updateType(id: string, filterDef: SelectableFilterDef): void;
    getActions(): { actions: FilterAction[]; canApply: boolean } | undefined;
    doAction(action: FilterAction): void;
    updateParams(params: IToolPanelNewFiltersCompParams, initialState?: NewFiltersToolPanelState): void;
    getGridState(): NewFiltersToolPanelState;
    clear(): void;
}

export interface ISelectableFilterService extends IEventEmitter<'selectedFilterChanged'> {
    getFilterValueGetter(colId: string): string | ValueGetterFunc | undefined;
    /** The active choice, or `undefined` where `filterDef` is not a Selectable Filter. */
    getFilterDef(column: AgColumn, filterDef: IFilterDef): SelectableFilterDef | undefined;
    getDefs(
        column: AgColumn,
        filterDef: IFilterDef
    ): { filterDefs: SelectableFilterDef[]; activeFilterDef: SelectableFilterDef } | undefined;
    setActive(colId: string, filterDefs: SelectableFilterDef[], activeFilterDef: SelectableFilterDef): void;
    clearActive(colId: string): void;
    /** Rebuilds the column's filters around its active choice. */
    switchFilter(column: AgColumn, source: FilterChangedEventSourceType): void;
    getState(): SelectableFilterState | undefined;
    setState(state: SelectableFilterState | undefined): void;
}
