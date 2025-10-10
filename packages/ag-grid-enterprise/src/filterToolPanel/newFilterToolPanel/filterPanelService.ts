import type {
    AgColumn,
    BeanCollection,
    FilterAction,
    FilterDestroyedEvent,
    FilterHandler,
    FilterHandlerDestroyedEvent,
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

    private readonly states: Map<string, StateWrapper> = new Map();
    private readonly orderedStates: string[] = [];
    private params?: IToolPanelNewFiltersCompParams;
    private initialStateApplied: boolean = false;
    private currState?: NewFiltersToolPanelState;
    private columnsLoaded = false;
    public isActive = false;

    public postConstruct(): void {
        if (!this.gos.get('enableFilterHandlers')) {
            return;
        }

        const updateFilterStates = this.updateFilterStates.bind(this);
        const updateApplyButton = () => this.dispatchStatesUpdates(undefined, true);
        const onFilterDestroyed = this.onFilterDestroyed.bind(this);
        this.addManagedEventListeners({
            newColumnsLoaded: () => {
                this.columnsLoaded = true;
                if (!this.initialStateApplied) {
                    this.applyState();
                }
                updateFilterStates();
            },
            filterChanged: updateFilterStates,
            filterDestroyed: onFilterDestroyed,
            filterHandlerDestroyed: onFilterDestroyed,
            filterOpened: updateApplyButton,
            filterClosed: updateApplyButton,
        });
        this.addManagedListeners(this.beans.colFilter!, {
            filterStateChanged: ({ column }: { column: AgColumn }) => {
                this.states.get(column.getColId())?.refresh?.();
                updateApplyButton();
            },
        });
    }

    public updateParams(params: IToolPanelNewFiltersCompParams, state?: NewFiltersToolPanelState): void {
        this.params = params;
        let dispatchedStateUpdates = false;
        if (state) {
            this.currState = state;
            if (this.columnsLoaded) {
                // Remove any filters no longer in the state
                const newIds = new Set(state.filters?.map((f) => f.colId));
                this.getIds().forEach((id) => {
                    if (!newIds.has(id)) {
                        this.remove(id);
                    }
                });

                // Clear out existing state so that new state order is maintained
                this.clearStates();
                this.applyState();
                this.updateFilterStates();
                dispatchedStateUpdates = true;
            }
        }

        if (!dispatchedStateUpdates) {
            this.dispatchStatesUpdates();
        }
        this.beans.colFilter?.setGlobalButtons(!!params.buttons?.length);
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
        const newStateWrapper = this.states.get(id);
        if (!newStateWrapper) {
            return;
        }
        const newState = newStateWrapper.state;
        this.dispatchLocalEvent({
            type: 'filterPanelStateChanged',
            id,
            state: newState,
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
        const stateWrapper = this.createFilterStateWrapper(id, expanded);
        if (stateWrapper) {
            this.states.set(id, stateWrapper);
            this.orderedStates.push(id);
        }
    }

    private createFilterStateWrapper(id: string, expanded?: boolean): StateWrapper | undefined {
        const { colModel, colFilter } = this.beans;
        const column = colModel.getColById(id);

        if (column && !column.colDef.suppressFiltersToolPanel) {
            const handler = colFilter!.getHandler(column, true);
            if (handler) {
                return this.createFilterState(column, handler, expanded);
            }
        }

        return undefined;
    }

    private updateFilterStates(): void {
        if (!this.params) {
            // Don't do anything if we haven't been initialized yet
            // as then filters may be created before initial state is applied leading to
            // incorrect order of filters.
            return;
        }
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
        const getIsEditing = () => !!this.params?.buttons && colFilter!.hasUnappliedModel(colId);
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
                    afterGuiDetached: filterComp.afterGuiDetached.bind(filterComp),
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

    private onFilterDestroyed({ column, source }: FilterDestroyedEvent | FilterHandlerDestroyedEvent) {
        if (!this.beans.colFilter?.isAlive()) {
            // if grid is being destroyed, don't recreate filters
            return;
        }
        const states = this.states;
        const id = column.getColId();
        const existingState = states.get(id);
        if (existingState) {
            const stateWrapper = this.createFilterStateWrapper(id, existingState.state.expanded);
            if (stateWrapper) {
                existingState.destroy?.();
                states.set(id, stateWrapper);
            } else {
                this.remove(id);
            }
            if (source === 'api') {
                // other sources trigger refresh through their main events (e.g. newColumnsLoaded).
                // need manual update for `api.destroyFilter()`
                this.dispatchStatesUpdates();
            }
        }
    }

    private dispatchStatesUpdates(activeId?: string, action?: true): void {
        this.dispatchLocalEvent({
            type: 'filterPanelStatesChanged',
            activeId,
            action,
        });
    }

    private applyState() {
        if (this.params && this.columnsLoaded) {
            this.initialStateApplied = true;
            this.currState?.filters?.forEach(({ colId, expanded }) => {
                this.createFilter(colId, expanded);
            });
        }
    }

    public override destroy(): void {
        this.clearStates();
        this.params = undefined;
        this.currState = undefined;
        super.destroy();
    }

    private clearStates() {
        const { states, orderedStates } = this;
        states.forEach((state) => state.destroy?.());
        states.clear();
        orderedStates.length = 0;
    }
}

function getDisplayName(beans: BeanCollection, column: AgColumn): string {
    return beans.colNames.getDisplayNameForColumn(column, 'filterToolPanel') ?? column.getColId();
}
