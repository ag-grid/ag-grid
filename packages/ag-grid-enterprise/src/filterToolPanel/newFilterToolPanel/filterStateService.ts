import type { AgColumn, BeanCollection } from 'ag-grid-community';
import { BeanStub, FilterComp } from 'ag-grid-community';
import type { FilterHandler } from 'ag-grid-community';

import type { FilterPanelFilterState, FilterPanelSummaryState } from './iFilterState';
import type { IFilterStateService } from './iFilterStateService';

interface StateWrapper {
    state: FilterPanelFilterState;
    handler: FilterHandler;
    refresh?: () => void;
    destroy?: () => void;
}

export class FilterStateService
    extends BeanStub<'filterStateChanged' | 'filterStatesChanged'>
    implements IFilterStateService
{
    private states: Map<string, StateWrapper> = new Map();
    private orderedStates: string[] = [];

    public postConstruct(): void {
        const updateFilterStates = this.updateFilterStates.bind(this);
        this.addManagedEventListeners({
            newColumnsLoaded: updateFilterStates,
            filterChanged: updateFilterStates,
        });
    }

    public getFilterIds(): string[] {
        return Array.from(this.states.keys());
    }

    public getAvailableFilters(): { id: string; name: string }[] {
        const beans = this.beans;
        const availableFilters: { id: string; name: string }[] = [];
        for (const column of beans.colModel.getCols()) {
            const id = column.getColId();
            if (column.getColDef().filter && !this.states.get(id)) {
                availableFilters.push({
                    id,
                    name: getDisplayName(beans, column),
                });
            }
        }
        return availableFilters;
    }

    public addFilter(id: string): void {
        this.createFilter(id);
        this.dispatchStatesUpdates(id);
    }

    public removeFilter(id: string): void {
        const { states, orderedStates, beans } = this;
        const state = states.get(id);
        if (!state) {
            return;
        }
        state.destroy?.();
        const column = state.state.column;
        states.delete(id);
        beans.colFilter!.destroyFilter(column);
        const index = orderedStates.indexOf(id);
        orderedStates.splice(index, 1);
        const newActiveId = orderedStates[index]; // undefined if no elements after
        this.dispatchStatesUpdates(newActiveId);
    }

    public getFilterState<S extends FilterPanelFilterState>(id: string): S | undefined {
        return this.states.get(id)?.state as S;
    }

    private updateFilterState<S extends FilterPanelFilterState, K extends keyof S>(
        id: string,
        key: K,
        value: S[K]
    ): void {
        const filterState = this.getFilterState<S>(id);
        if (!filterState) {
            return;
        }
        filterState[key] = value;
        this.dispatchLocalEvent({
            type: 'filterStateChanged',
            id,
            state: filterState,
        });
    }

    public expandFilter(id: string, expanded: boolean): void {
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
            type: 'filterStateChanged',
            id,
            state: newFilterState.state,
        });
    }

    public updateFilterType(id: string, type: string): void {
        const oldFilterStateWrapper = this.states.get(id);
        if (!oldFilterStateWrapper) {
            return;
        }
        type;
        // TODO
        this.dispatchLocalEvent({
            type: 'filterStateChanged',
            id,
            state: oldFilterStateWrapper.state, // TODO
        });
    }

    private createFilter(id: string): void {
        const { colModel, colFilter } = this.beans;
        const column = colModel.getColById(id);

        if (column) {
            const handler = colFilter!.getHandler(column, true);
            if (handler) {
                const filterState = this.createFilterState(column, handler);
                this.states.set(column.getColId(), filterState);
                this.orderedStates.push(id);
            }
        }
    }

    private updateFilterStates(): void {
        const filterModel = this.beans.colFilter!.getModel();
        for (const colId of Object.keys(filterModel)) {
            const existingState = this.states.get(colId);
            if (!existingState) {
                this.createFilter(colId);
            } else {
                existingState.refresh?.();
            }
        }
        this.dispatchStatesUpdates();
    }

    private createFilterState(column: AgColumn, handler: FilterHandler, expanded?: boolean): StateWrapper {
        const beans = this.beans;
        const name = getDisplayName(beans, column);
        if (expanded) {
            // TODO
            const type = 'agTextColumnFilter';
            const options = [
                {
                    value: 'agTextColumnFilter',
                    text: 'Text Filter',
                },
                {
                    value: 'agSetColumnFilter',
                    text: 'Set Filter',
                },
            ];
            const filterComp = this.createBean(new FilterComp(column, 'TOOLBAR'));
            return {
                state: {
                    column,
                    name,
                    expanded,
                    detail: filterComp.getGui(),
                    type,
                    options,
                },
                handler,
                destroy: () => this.destroyBean(filterComp),
            };
        } else {
            const getSummary = () =>
                handler.getModelAsString?.(beans.colFilter!.getModelForColumn(column), 'filterToolPanel') ?? '';
            return {
                state: {
                    column,
                    name,
                    expanded: false,
                    summary: getSummary(),
                },
                handler,
                refresh: () => {
                    this.updateFilterState<FilterPanelSummaryState, 'summary'>(
                        column.getColId(),
                        'summary',
                        getSummary()
                    );
                },
            };
        }
    }

    private dispatchStatesUpdates(activeId?: string): void {
        this.dispatchLocalEvent({
            type: 'filterStatesChanged',
            activeId,
        });
    }

    public override destroy(): void {
        const { states, orderedStates } = this;
        states.forEach((state) => state.destroy?.());
        states.clear();
        orderedStates.length = 0;
        super.destroy();
    }
}

function getDisplayName(beans: BeanCollection, column: AgColumn): string {
    return beans.colNames.getDisplayNameForColumn(column, 'filterToolPanel') ?? column.getColId();
}
