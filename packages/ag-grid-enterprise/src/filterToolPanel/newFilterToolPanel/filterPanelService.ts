import type {
    AgColumn,
    BeanCollection,
    FilterAction,
    FilterPanelFilterState,
    FilterPanelSummaryState,
    IFilterPanelService,
    IToolPanelNewFiltersCompParams,
    NamedBean,
    NewFiltersToolPanelFilterState,
    NewFiltersToolPanelState,
    SelectableFilterDef,
} from 'ag-grid-community';
import { BeanStub, FilterComp } from 'ag-grid-community';
import type { FilterHandler } from 'ag-grid-community';

interface StateWrapper {
    state: FilterPanelFilterState;
    handler: FilterHandler;
    refresh?: () => void;
    destroy?: () => void;
}

export class FilterPanelService
    extends BeanStub<'filterPanelStateChanged' | 'filterPanelStatesChanged'>
    implements IFilterPanelService, NamedBean
{
    readonly beanName = 'filterPanelSvc' as const;

    private states: Map<string, StateWrapper> = new Map();
    private orderedStates: string[] = [];
    private params?: IToolPanelNewFiltersCompParams;
    private initialStateApplied: boolean = false;
    private initialState?: NewFiltersToolPanelState;

    public postConstruct(): void {
        const updateFilterStates = this.updateFilterStates.bind(this);
        this.addManagedEventListeners({
            newColumnsLoaded: () => {
                this.applyInitialState();
                updateFilterStates();
            },
            filterChanged: updateFilterStates,
        });
        this.addManagedListeners(this.beans.colFilter!, {
            filterStateChanged: ({ column }: { column: AgColumn }) => {
                this.states.get(column.getColId())?.refresh?.();
                this.dispatchStatesUpdates(undefined, true);
            },
        });
    }

    public getIds(): string[] {
        return Array.from(this.states.keys());
    }

    public getAvailable(): { id: string; name: string }[] {
        const beans = this.beans;
        const availableFilters: { id: string; name: string }[] = [];
        for (const column of beans.colModel.getCols()) {
            const id = column.getColId();
            if (column.isFilterAllowed() && !column.colDef.suppressFiltersToolPanel && !this.states.get(id)) {
                availableFilters.push({
                    id,
                    name: getDisplayName(beans, column),
                });
            }
        }
        return availableFilters;
    }

    public add(id: string): void {
        this.createFilter(id, true);
        this.dispatchStatesUpdates(id);
    }

    public remove(id: string): void {
        const {
            states,
            orderedStates,
            beans: { colFilter, selectableFilter },
        } = this;
        const state = states.get(id);
        if (!state) {
            return;
        }
        state.destroy?.();
        const column = state.state.column;
        states.delete(id);
        selectableFilter?.clearActive(id);
        colFilter?.destroyFilter(column);
        this.eventSvc.dispatchEvent({
            type: 'filterSwitched',
            column,
        });
        const index = orderedStates.indexOf(id);
        orderedStates.splice(index, 1);
        const newActiveId = orderedStates[index]; // undefined if no elements after
        this.dispatchStatesUpdates(newActiveId);
    }

    public getState<S extends FilterPanelFilterState>(id: string): S | undefined {
        return this.states.get(id)?.state as S;
    }

    private updateFilterState<S extends FilterPanelFilterState, K extends keyof S>(
        id: string,
        key: K,
        value: S[K],
        suppressEvents?: boolean
    ): void {
        const filterState = this.getState<S>(id);
        if (!filterState) {
            return;
        }
        filterState[key] = value;
        if (!suppressEvents) {
            this.dispatchLocalEvent({
                type: 'filterPanelStateChanged',
                id,
                state: filterState,
            });
        }
    }

    public expand(id: string, expanded: boolean): void {
        const existingFilterState = this.states.get(id);
        if (!existingFilterState) {
            return;
        }
        existingFilterState.destroy?.();
        const {
            handler,
            state: { column },
        } = existingFilterState;
        const newFilterState = this.createFilterState(column, handler, expanded);
        this.states.set(id, newFilterState);
        this.dispatchLocalEvent({
            type: 'filterPanelStateChanged',
            id,
            state: newFilterState.state,
        });
    }

    public updateType(id: string, filterDef: SelectableFilterDef): void {
        const stateWrapper = this.states.get(id);
        if (!stateWrapper) {
            return;
        }
        const state = stateWrapper.state;
        if (state.expanded === false) {
            return;
        }
        const filterDefs = state.filterDefs;
        if (!filterDefs) {
            return;
        }

        const { colFilter, selectableFilter } = this.beans;
        selectableFilter?.setActive(id, filterDefs, filterDef);
        colFilter!.filterParamsChanged(id, 'columnFilter');
        const column = state.column;
        this.eventSvc.dispatchEvent({
            type: 'filterSwitched',
            column,
        });
        const handler = colFilter!.getHandler(column, true);
        if (!handler) {
            return;
        }
        stateWrapper.handler = handler;
        state.activeFilterDef = filterDef;
        this.dispatchLocalEvent({
            type: 'filterPanelStateChanged',
            id,
            state,
        });
    }

    public getActions(): { actions: FilterAction[]; canApply: boolean } | undefined {
        const actions = this.params?.buttons;
        if (!actions?.length) {
            return undefined;
        }
        const canApply = !!this.beans.colFilter?.canApplyAll();
        return { actions, canApply };
    }

    public doAction(action: FilterAction): void {
        this.beans.colFilter?.updateAllModels(action);
    }

    public updateParams(params: IToolPanelNewFiltersCompParams, initialState?: NewFiltersToolPanelState): void {
        this.params = params;
        if (initialState) {
            this.initialState = initialState;
        }
        this.dispatchStatesUpdates();
        this.beans.colFilter?.setGlobalButtons(!!params.buttons?.length);
    }

    public getGridState(): NewFiltersToolPanelState {
        const filters: NewFiltersToolPanelFilterState[] = [];
        this.states.forEach((stateWrapper, colId) => {
            filters.push({
                colId,
                expanded: stateWrapper.state.expanded,
            });
        });
        return {
            filters,
        };
    }

    private createFilter(id: string, expanded?: boolean): void {
        const { colModel, colFilter } = this.beans;
        const column = colModel.getColById(id);

        if (column && !column.colDef.suppressFiltersToolPanel) {
            const handler = colFilter!.getHandler(column, true);
            if (handler) {
                const filterState = this.createFilterState(column, handler, expanded);
                this.states.set(column.getColId(), filterState);
                this.orderedStates.push(id);
            }
        }
    }

    private updateFilterStates(): void {
        const filterModel = this.beans.colFilter!.getModel();
        const processedIds = new Set<string>();
        for (const id of Object.keys(filterModel)) {
            const existingState = this.states.get(id);
            if (!existingState) {
                this.createFilter(id);
            } else {
                existingState.refresh?.();
            }
            processedIds.add(id);
        }
        this.states.forEach((state, id) => {
            if (!processedIds.has(id)) {
                // filters which have no model
                state.refresh?.();
            }
        });
        this.dispatchStatesUpdates();
    }

    private createFilterState(column: AgColumn, handler: FilterHandler, expanded?: boolean): StateWrapper {
        const beans = this.beans;
        const { colFilter, selectableFilter } = beans;
        const name = getDisplayName(beans, column);
        const colId = column.getColId();
        const getIsEditing = () => colFilter!.hasUnappliedModel(colId);
        const isEditing = getIsEditing();
        if (expanded) {
            const colDef = column.colDef;
            const { filterDefs, activeFilterDef } = selectableFilter?.getDefs(column, colDef) ?? {};
            const filterComp = this.createBean(new FilterComp(column, 'TOOLBAR', true));
            return {
                state: {
                    column,
                    name,
                    isEditing,
                    expanded,
                    detail: filterComp.getGui(),
                    activeFilterDef,
                    filterDefs,
                    afterGuiAttached: filterComp.afterGuiAttached.bind(filterComp),
                },
                handler,
                refresh: () => {
                    this.updateFilterState(colId, 'isEditing', getIsEditing());
                },
                destroy: () => this.destroyBean(filterComp),
            };
        } else {
            const colId = column.getColId();
            const getSummary = () =>
                handler.getModelAsString?.(colFilter!.getStateForColumn(colId).model, 'filterToolPanel') ?? '';
            return {
                state: {
                    column,
                    name,
                    isEditing,
                    expanded: false,
                    summary: getSummary(),
                },
                handler,
                refresh: () => {
                    this.updateFilterState(colId, 'isEditing', getIsEditing(), true);
                    this.updateFilterState<FilterPanelSummaryState, 'summary'>(colId, 'summary', getSummary());
                },
            };
        }
    }

    private dispatchStatesUpdates(activeId?: string, action?: true): void {
        this.dispatchLocalEvent({
            type: 'filterPanelStatesChanged',
            activeId,
            action,
        });
    }

    private applyInitialState(): void {
        if (this.initialStateApplied) {
            return;
        }
        this.initialStateApplied = true;
        this.initialState?.filters?.forEach(({ colId, expanded }) => this.createFilter(colId, expanded));
        this.initialState = undefined;
    }

    public override destroy(): void {
        const { states, orderedStates } = this;
        states.forEach((state) => state.destroy?.());
        states.clear();
        orderedStates.length = 0;
        this.params = undefined;
        this.initialState = undefined;
        super.destroy();
    }
}

function getDisplayName(beans: BeanCollection, column: AgColumn): string {
    return beans.colNames.getDisplayNameForColumn(column, 'filterToolPanel') ?? column.getColId();
}
