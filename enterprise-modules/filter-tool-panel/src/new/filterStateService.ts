import type {
    AgColumn,
    BeanCollection,
    ColumnModel,
    ColumnNameService,
    FilterManager,
    ICombinedSimpleModel,
    IFilterComp,
    JoinOperator,
    TextFilterModel,
} from '@ag-grid-community/core';
import { AgPromise, BeanStub, _missingOrEmpty } from '@ag-grid-community/core';

import type { FilterPanelTranslationService } from './filterPanelTranslationService';
import type { FilterCondition, FilterState, SimpleFilterParams } from './filterState';
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
            const filterState: FilterState = {
                id,
                name: this.columnNameService.getDisplayNameForColumn(column, 'filterToolPanel') ?? id,
                summary: this.getFilterSummary(filterComp),
                appliedModel: filterComp?.getModel() ?? null,
                expanded: true, // TODO - remove this later
                simpleFilterParams: this.getSimpleFilterParams(filterComp?.getModel()),
            };
            const listener = () => {
                this.updateProvidedFilterState(filterState, id, 'summary', this.getFilterSummary(filterComp), true);
                this.updateProvidedFilterState(filterState, id, 'appliedModel', filterComp?.getModel() ?? null, true);
                this.updateProvidedFilterState(
                    filterState,
                    id,
                    'simpleFilterParams',
                    this.getSimpleFilterParams(filterComp?.getModel()),
                    true
                );
                this.dispatchLocalEvent({
                    type: 'filterStateChanged',
                    id,
                });
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

    private getSimpleFilterParams(
        model?: TextFilterModel | ICombinedSimpleModel<TextFilterModel> | null
    ): SimpleFilterParams {
        // TODO work out params
        const maxNumConditions = 2;
        const numVisibleConditions = 1;
        let joinOperator: JoinOperator = 'AND';
        let conditions: FilterCondition[] = [];
        // TODO - find default option
        const defaultOption = 'contains';
        if (model) {
            const mapModelCondition = (modelCondition: TextFilterModel): FilterCondition => {
                const { type, filter: from } = modelCondition as TextFilterModel;
                const option = type ?? defaultOption;
                // TODO - lookup numberOfInputs based on type
                const numberOfInputs = 1;
                return {
                    numberOfInputs,
                    option,
                    from,
                };
            };
            const isCombined = (model as ICombinedSimpleModel<TextFilterModel>)?.operator;
            if (isCombined) {
                const { conditions: modelConditions, operator } = model as ICombinedSimpleModel<TextFilterModel>;
                joinOperator = operator;
                conditions = modelConditions.map((condition) => mapModelCondition(condition));
            } else {
                conditions.push(mapModelCondition(model as TextFilterModel));
            }
        }
        conditions.push({
            numberOfInputs: 1,
            option: defaultOption,
        });
        conditions.splice(maxNumConditions);
        for (let i = conditions.length; i < numVisibleConditions; i++) {
            conditions.push({
                numberOfInputs: 1,
                option: defaultOption,
                disabled: true,
            });
        }

        return {
            // TODO - do properly
            conditions,
            joinOperator: {
                operator: joinOperator,
            },
            options: (
                [
                    'contains',
                    'notContains',
                    'equals',
                    'notEqual',
                    'startsWith',
                    'endsWith',
                    'blank',
                    'notBlank',
                ] as const
            ).map((value) => ({ value, text: this.translationService.translate(value) })),
        };
    }

    public override destroy(): void {
        this.activeFilterStates.clear();
        this.destroyColumnListeners();
        super.destroy();
    }
}
