import type {
    AgColumn,
    BeanCollection,
    ColumnModel,
    ColumnNameService,
    FilterManager,
    FilterModel,
} from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';

import type { FilterState, SimpleFilterParams } from './filterState';
import type { IFilterStateService } from './iFilterStateService';
import type { FilterConfig } from './simpleFilterService';
import { SimpleFilterService } from './simpleFilterService';

interface FilterStateWrapper {
    state: FilterState;
    column: AgColumn;
    filterConfig: FilterConfig;
}

export class FilterStateService
    extends BeanStub<'filterStateChanged' | 'filterStatesChanged'>
    implements IFilterStateService
{
    private columnModel: ColumnModel;
    private columnNameService: ColumnNameService;
    private filterManager: FilterManager;

    private simpleFilterService: SimpleFilterService;

    private columnListenerDestroyFuncs: (() => void)[] = [];
    private activeFilterStates: Map<string, FilterStateWrapper> = new Map();

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.columnNameService = beans.columnNameService;
        this.filterManager = beans.filterManager!;
    }

    public postConstruct(): void {
        this.simpleFilterService = this.createManagedBean(new SimpleFilterService());
        this.addManagedEventListeners({
            newColumnsLoaded: () => this.updateFilterStates(),
        });
    }

    public getFilterIds(): string[] {
        return Array.from(this.activeFilterStates.keys());
    }

    public getAvailableFilters(): { id: string; name: string }[] {
        return this.columnModel
            .getAllCols()
            .filter((col) => col.getColDef().filter && !this.activeFilterStates.get(col.getColId()))
            .map((col) => {
                return {
                    id: col.getColId(),
                    name: this.columnNameService.getDisplayNameForColumn(col, 'filterToolPanel') ?? col.getColId(),
                };
            });
    }

    public addFilter(id: string): void {
        const column = this.columnModel.getCol(id);
        if (column) {
            const filterState = this.createFilterState(column);
            this.activeFilterStates.set(column.getColId(), filterState);
        }
        this.dispatchStatesUpdates();
    }

    public removeFilter(id: string): void {
        this.activeFilterStates.delete(id);
        const column = this.columnModel.getCol(id);
        if (!column) {
            return;
        }
        this.filterManager.destroyFilter(column);
        this.dispatchStatesUpdates();
    }

    public getFilterState(id: string): FilterState | undefined {
        return this.activeFilterStates.get(id)?.state;
    }

    public updateFilterState<K extends keyof FilterState>(id: string, key: K, value: FilterState[K]): void {
        const filterState = this.activeFilterStates.get(id)?.state;
        this.updateProvidedFilterState(filterState, id, key, value);
    }

    public updateSimpleFilterParams(id: string, simpleFilterParams: SimpleFilterParams): void {
        const filterStateWrapper = this.activeFilterStates.get(id);
        if (!filterStateWrapper) {
            return;
        }
        const { state, filterConfig } = filterStateWrapper;
        this.updateProvidedFilterState(
            state,
            id,
            'simpleFilterParams',
            this.simpleFilterService.updateSimpleFilterParams(
                state.simpleFilterParams,
                simpleFilterParams,
                filterConfig
            )
        );
        if (filterConfig.applyOnChange) {
            this.applyFilters();
        }
    }

    private updateProvidedFilterState<K extends keyof FilterState>(
        filterState: FilterState | undefined,
        id: string,
        key: K,
        value: FilterState[K],
        suppressEvent?: boolean
    ): void {
        if (filterState) {
            filterState[key] = value;
        }
        if (!suppressEvent) {
            this.dispatchLocalEvent({
                type: 'filterStateChanged',
                id,
            });
        }
    }

    private updateFilterStates(): void {
        this.destroyColumnListeners();
        // TODO - maintain inactive states, expansion etc.
        const columns = this.columnModel
            .getAllCols()
            .filter((col) => col.getColDef().filter && this.filterManager.isFilterActive(col));
        this.activeFilterStates.clear();
        columns.forEach((column) => {
            const filterState = this.createFilterState(column);
            this.activeFilterStates.set(filterState.state.id, filterState);
        });
        this.dispatchStatesUpdates();
    }

    private createFilterState(column: AgColumn): FilterStateWrapper {
        const model = this.filterManager.getColumnFilterModel(column);
        const id = column.getColId();
        const filterConfig = this.simpleFilterService.getFilterConfig(column);
        const state: FilterState = {
            id,
            name: this.columnNameService.getDisplayNameForColumn(column, 'filterToolPanel') ?? id,
            summary: this.simpleFilterService.getSummary(model),
            appliedModel: model,
            expanded: true, // TODO - remove this later
            simpleFilterParams: this.simpleFilterService.getSimpleFilterParams(filterConfig, model),
        };
        const listener = () => {
            const filterModel = this.filterManager.getColumnFilterModel(column);
            this.updateProvidedFilterState(
                state,
                id,
                'summary',
                this.simpleFilterService.getSummary(filterModel),
                true
            );
            this.updateProvidedFilterState(state, id, 'appliedModel', filterModel, true);
            this.updateProvidedFilterState(
                state,
                id,
                'simpleFilterParams',
                this.simpleFilterService.getSimpleFilterParams(filterConfig, filterModel),
                true
            );
            this.dispatchLocalEvent({
                type: 'filterStateChanged',
                id,
            });
        };
        column.addEventListener('filterChanged', listener);
        this.columnListenerDestroyFuncs.push(() => column.removeEventListener('filterChanged', listener));
        return { state, column, filterConfig };
    }

    private applyFilters(): void {
        const model = this.getFilterModel();
        this.filterManager.setFilterModel(model, 'columnFilter');
    }

    private getFilterModel(): FilterModel {
        const model: FilterModel = {};
        this.activeFilterStates.forEach(({ column, state: { simpleFilterParams } }) => {
            const singleModel = this.simpleFilterService.getModel(simpleFilterParams);
            if (singleModel != null) {
                model[column.getColId()] = singleModel;
            }
        });
        return model;
    }

    private dispatchStatesUpdates(): void {
        this.dispatchLocalEvent({
            type: 'filterStatesChanged',
        });
    }

    private destroyColumnListeners(): void {
        this.columnListenerDestroyFuncs.forEach((func) => func());
        this.columnListenerDestroyFuncs.length = 0;
    }

    public override destroy(): void {
        this.activeFilterStates.clear();
        this.destroyColumnListeners();
        super.destroy();
    }
}
