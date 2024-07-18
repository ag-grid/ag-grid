import type {
    AgColumn,
    BeanCollection,
    ColumnModel,
    ColumnNameService,
    FilterManager,
    FilterModel,
    ICombinedSimpleModel,
    ISimpleFilterModel,
    SetFilterModel,
} from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';

import type {
    FilterState,
    SetFilterParams,
    SetFilterState,
    SimpleFilterParams,
    SimpleFilterState,
} from './filterState';
import type { IFilterStateService } from './iFilterStateService';
import type { FilterTypeService } from './iFilterTypeService';
import type { SetFilterConfig } from './setFilter/setFilterConfig';
import { SetFilterService } from './setFilter/setFilterService';
import type { SimpleFilterConfig } from './simpleFilter/simpleFilterConfig';
import { SimpleFilterService } from './simpleFilter/simpleFilterService';

interface BaseFilterStateWrapper {
    column: AgColumn;
}

interface SimpleFilterStateWrapper extends BaseFilterStateWrapper {
    state: SimpleFilterState;
    filterConfig: SimpleFilterConfig;
}

interface SetFilterStateWrapper extends BaseFilterStateWrapper {
    state: SetFilterState;
    filterConfig: SetFilterConfig;
}

type FilterStateWrapper = SimpleFilterStateWrapper | SetFilterStateWrapper;

export class FilterStateService
    extends BeanStub<'filterStateChanged' | 'filterStatesChanged'>
    implements IFilterStateService
{
    private columnModel: ColumnModel;
    private columnNameService: ColumnNameService;
    private filterManager: FilterManager;

    private simpleFilterService: SimpleFilterService;
    private setFilterService: SetFilterService;

    private columnListenerDestroyFuncs: (() => void)[] = [];
    private activeFilterStates: Map<string, FilterStateWrapper> = new Map();

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.columnNameService = beans.columnNameService;
        this.filterManager = beans.filterManager!;
    }

    public postConstruct(): void {
        this.simpleFilterService = this.createManagedBean(new SimpleFilterService());
        this.setFilterService = this.createManagedBean(new SetFilterService());
        this.addManagedEventListeners({
            newColumnsLoaded: () => this.updateFilterStates(),
            modelUpdated: ({ newData }) => {
                if (newData) {
                    this.updateFilterStates();
                }
            },
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

    public updateFilterType(id: string, type: 'simple' | 'set'): void {
        this.switchFilterState(id, type, null);
    }

    public updateSimpleFilterParams(id: string, params: SimpleFilterParams): void {
        this.updateParams({
            id,
            params,
            service: this.simpleFilterService,
        });
    }

    public updateSetFilterParams(id: string, params: SetFilterParams): void {
        this.updateParams({
            id,
            params,
            service: this.setFilterService,
        });
    }

    private updateParams<P extends SimpleFilterParams | SetFilterParams, M>(params: {
        id: string;
        params: P;
        service: FilterTypeService<P, M, SimpleFilterConfig | SetFilterConfig>;
    }): void {
        const { id, service, params: filterParams } = params;
        const filterStateWrapper = this.activeFilterStates.get(id);
        if (!filterStateWrapper) {
            return;
        }
        const { filterConfig } = filterStateWrapper;
        const { state } = filterStateWrapper;
        const updatedParams = service.updateParams(state.filterParams as any, filterParams, filterConfig as any);
        const { applyOnChange } = filterConfig;
        this.updateProvidedFilterState(state, id, 'filterParams', updatedParams, applyOnChange);
        if (filterConfig.applyOnChange) {
            const model = this.applyFilter(id, service, updatedParams);
            this.updateProvidedFilterState(state, id, 'summary', service.getSummary(model), true);
            this.updateProvidedFilterState(state, id, 'appliedModel', model as any, true);
            this.dispatchLocalEvent({
                type: 'filterStateChanged',
                id,
            });
        }
    }

    private updateProvidedFilterState<K extends keyof S, S extends SetFilterState | SimpleFilterState>(
        filterState: S | undefined,
        id: string,
        key: K,
        value: S[K],
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

    private createFilterState(
        column: AgColumn,
        model: ISimpleFilterModel | ICombinedSimpleModel<ISimpleFilterModel> | SetFilterModel | null,
        expanded?: boolean
    ): FilterStateWrapper {
        let type: 'simple' | 'set';
        if (model == null) {
            type = 'set';
        } else {
            type = model.filterType === 'set' ? 'set' : 'simple';
        }
        return this.createFilterStateForType(type, column, model, expanded);
    }

    private createFilterStateForType(
        type: 'simple' | 'set',
        column: AgColumn,
        model: ISimpleFilterModel | ICombinedSimpleModel<ISimpleFilterModel> | SetFilterModel | null,
        expanded?: boolean
    ): FilterStateWrapper {
        const service = type === 'simple' ? this.simpleFilterService : this.setFilterService;
        const id = column.getColId();
        const filterConfig = service.getFilterConfig(column);
        const state: FilterState = {
            id,
            name: this.columnNameService.getDisplayNameForColumn(column, 'filterToolPanel') ?? id,
            summary: service.getSummary(model as any),
            appliedModel: model as any,
            expanded,
            type,
            filterParams: service.getParams(filterConfig as any, model as any),
        } as any;
        return { state, column, filterConfig } as any;
    }

    private switchFilterState(
        id: string,
        type: 'simple' | 'set',
        model: ISimpleFilterModel | ICombinedSimpleModel<ISimpleFilterModel> | SetFilterModel | null
    ): void {
        const oldFilterStateWrapper = this.activeFilterStates.get(id);
        if (!oldFilterStateWrapper) {
            return;
        }
        const {
            column,
            state: { expanded },
        } = oldFilterStateWrapper;
        const filterStateWrapper = this.createFilterStateForType(type, column, model, expanded);
        this.activeFilterStates.set(id, filterStateWrapper);
        this.dispatchLocalEvent({
            type: 'filterStateChanged',
            id,
        });
    }

    private applyFilter<P, M, C>(id: string, service: FilterTypeService<P, M, C>, params: P): M | null {
        const model = service.getModel(params);
        this.filterManager.setColumnFilterModel(id, model).then(() => this.filterManager.onFilterChanged());
        return model;
    }

    private applyFilters(): void {
        const model = this.getFilterModel();
        this.filterManager.setFilterModel(model, 'columnFilter');
    }

    private getFilterModel(): FilterModel {
        const model: FilterModel = {};
        this.activeFilterStates.forEach(({ column, state }) => {
            const { type, filterParams } = state;
            const singleModel = (type === 'simple' ? this.simpleFilterService : this.setFilterService).getModel(
                filterParams as any
            );
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
