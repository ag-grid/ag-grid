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
import type { SimpleFilterConfig } from './simpleFilterService';
import { SimpleFilterService } from './simpleFilterService';

interface FilterStateWrapper {
    state: FilterState;
    column: AgColumn;
    filterConfig: SimpleFilterConfig;
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
            const filterState = this.createFilterState(column, null);
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
        const updatedSimpleFilterParams = this.simpleFilterService.updateSimpleFilterParams(
            state.simpleFilterParams,
            simpleFilterParams,
            filterConfig
        );
        const { applyOnChange } = filterConfig;
        this.updateProvidedFilterState(state, id, 'simpleFilterParams', updatedSimpleFilterParams, applyOnChange);
        if (filterConfig.applyOnChange) {
            const model = this.applyFilter(id, updatedSimpleFilterParams);
            this.updateProvidedFilterState(state, id, 'summary', this.simpleFilterService.getSummary(model), true);
            this.updateProvidedFilterState(state, id, 'appliedModel', model, true);
            this.dispatchLocalEvent({
                type: 'filterStateChanged',
                id,
            });
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
        const filterModel = this.filterManager.getFilterModel();
        this.activeFilterStates.clear();
        Object.entries(filterModel).forEach(([colId, model]) => {
            const column = this.columnModel.getCol(colId);
            if (!column) {
                return;
            }
            const filterState = this.createFilterState(column, model);
            this.activeFilterStates.set(filterState.state.id, filterState);
        });
        this.dispatchStatesUpdates();
    }

    private createFilterState(column: AgColumn, model: any): FilterStateWrapper {
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
        return { state, column, filterConfig };
    }

    private applyFilter(id: string, simpleFilterParams: SimpleFilterParams): any {
        const model = this.simpleFilterService.getModel(simpleFilterParams);
        this.filterManager.setColumnFilterModel(id, model).then(() => this.filterManager.onFilterChanged());
        return model;
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
