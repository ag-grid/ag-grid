import type {
    AgColumn,
    BeanCollection,
    ColumnModel,
    ColumnNameService,
    FilterManager,
    IFilterComp,
} from '@ag-grid-community/core';
import { AgPromise, BeanStub, _missingOrEmpty } from '@ag-grid-community/core';

import type { FilterPanelTranslationService } from './filterPanelTranslationService';
import type { FilterState } from './filterState';
import type { IFilterStateService } from './iFilterStateService';

export class FilterStateService
    extends BeanStub<'filterStateChanged' | 'filterStatesChanged'>
    implements IFilterStateService
{
    private columnModel: ColumnModel;
    private columnNameService: ColumnNameService;
    private filterManager: FilterManager;
    private translationService: FilterPanelTranslationService;

    private columnListenerDestroyFuncs: (() => void)[] = [];
    private activeFilterStates: Map<string, FilterState> = new Map();

    public wireBeans(beans: BeanCollection): void {
        this.columnModel = beans.columnModel;
        this.columnNameService = beans.columnNameService;
        this.filterManager = beans.filterManager!;
        this.translationService = beans.filterPanelTranslationService as FilterPanelTranslationService;
    }

    public postConstruct(): void {
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
        (column
            ? this.createFilterState(column).then((filterState) => {
                  if (filterState) {
                      this.activeFilterStates.set(column.getColId(), filterState);
                  }
              })
            : AgPromise.resolve()
        ).then(() => {
            this.dispatchStatesUpdates();
        });
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
        return this.activeFilterStates.get(id);
    }

    public updateFilterState<K extends keyof FilterState>(id: string, key: K, value: FilterState[K]): void {
        const filterState = this.activeFilterStates.get(id);
        this.updateProvidedFilterState(filterState, id, key, value);
    }

    private updateProvidedFilterState<K extends keyof FilterState>(
        filterState: FilterState | undefined,
        id: string,
        key: K,
        value: FilterState[K]
    ): void {
        if (filterState) {
            filterState[key] = value;
        }
        this.dispatchLocalEvent({
            type: 'filterStateChanged',
            id,
        });
    }

    private updateFilterStates(): void {
        this.destroyColumnListeners();
        // TODO - maintain inactive states, expansion etc.
        const columns = this.columnModel
            .getAllCols()
            .filter((col) => col.getColDef().filter && this.filterManager.isFilterActive(col));
        AgPromise.all(columns.map((column) => this.createFilterState(column))).then((filterStates) => {
            this.activeFilterStates.clear();
            filterStates?.forEach((filterState) => {
                if (filterState) {
                    this.activeFilterStates.set(filterState.id, filterState);
                }
            });
            this.dispatchStatesUpdates();
        });
    }

    private createFilterState(column: AgColumn): AgPromise<FilterState> {
        const promise = this.filterManager.getOrCreateFilterWrapper(column)?.filterPromise ?? AgPromise.resolve();
        return promise.then((filterComp) => {
            const id = column.getColId();
            const filterState = {
                id,
                name: this.columnNameService.getDisplayNameForColumn(column, 'filterToolPanel') ?? id,
                summary: this.getFilterSummary(filterComp),
                detail: filterComp?.getGui(),
            };
            const listener = () => {
                this.updateProvidedFilterState(filterState, id, 'summary', this.getFilterSummary(filterComp));
            };
            column.addEventListener('filterChanged', listener);
            this.columnListenerDestroyFuncs.push(() => column.removeEventListener('filterChanged', listener));
            return filterState;
        });
    }

    private dispatchStatesUpdates(): void {
        this.dispatchLocalEvent({
            type: 'filterStatesChanged',
        });
    }

    private getFilterSummary(filterComp?: IFilterComp | null): string | undefined {
        const summary = filterComp?.getModelAsString?.(filterComp.getModel());
        return _missingOrEmpty(summary) ? this.translationService.translate('filterSummaryInactive') : summary;
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
