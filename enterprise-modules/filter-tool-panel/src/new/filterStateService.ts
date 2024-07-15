import type {
    AgColumn,
    BeanCollection,
    ColumnModel,
    ColumnNameService,
    FilterManager,
    ICombinedSimpleModel,
    IFilterComp,
    ISimpleFilterModelType,
    JoinOperator,
    TextFilterModel,
} from '@ag-grid-community/core';
import { AgPromise, BeanStub, _missingOrEmpty, _warnOnce } from '@ag-grid-community/core';

import type { FilterPanelTranslationService } from './filterPanelTranslationService';
import type { FilterCondition, FilterState, SimpleFilterParams } from './filterState';
import type { IFilterStateService } from './iFilterStateService';

interface FilterConfig {
    maxNumConditions: number;
    numAlwaysVisibleConditions: number;
    defaultJoinOperator: JoinOperator;
    defaultOption: ISimpleFilterModelType;
    options: string[];
}

interface FilterStateWrapper {
    state: FilterState;
    column: AgColumn;
    filterComp?: any;
    filterConfig: FilterConfig;
}

export class FilterStateService
    extends BeanStub<'filterStateChanged' | 'filterStatesChanged'>
    implements IFilterStateService
{
    private columnModel: ColumnModel;
    private columnNameService: ColumnNameService;
    private filterManager: FilterManager;
    private translationService: FilterPanelTranslationService;

    private columnListenerDestroyFuncs: (() => void)[] = [];
    private activeFilterStates: Map<string, FilterStateWrapper> = new Map();

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
            this.processSimpleFilterParams(state.simpleFilterParams, simpleFilterParams, filterConfig)
        );
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
                    this.activeFilterStates.set(filterState.state.id, filterState);
                }
            });
            this.dispatchStatesUpdates();
        });
    }

    private createFilterState(column: AgColumn): AgPromise<FilterStateWrapper> {
        const promise = this.filterManager.getOrCreateFilterWrapper(column)?.filterPromise ?? AgPromise.resolve();
        return promise.then((filterComp) => {
            const id = column.getColId();
            const filterConfig = this.getFilterConfig(column);
            const state: FilterState = {
                id,
                name: this.columnNameService.getDisplayNameForColumn(column, 'filterToolPanel') ?? id,
                summary: this.getFilterSummary(filterComp),
                appliedModel: filterComp?.getModel() ?? null,
                expanded: true, // TODO - remove this later
                simpleFilterParams: this.getSimpleFilterParams(filterConfig, filterComp?.getModel()),
            };
            const listener = () => {
                this.updateProvidedFilterState(state, id, 'summary', this.getFilterSummary(filterComp), true);
                this.updateProvidedFilterState(state, id, 'appliedModel', filterComp?.getModel() ?? null, true);
                this.updateProvidedFilterState(
                    state,
                    id,
                    'simpleFilterParams',
                    this.getSimpleFilterParams(filterConfig, filterComp?.getModel()),
                    true
                );
                this.dispatchLocalEvent({
                    type: 'filterStateChanged',
                    id,
                });
            };
            column.addEventListener('filterChanged', listener);
            this.columnListenerDestroyFuncs.push(() => column.removeEventListener('filterChanged', listener));
            return { state, column, filterComp, filterConfig };
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
        filterConfig: FilterConfig,
        model?: TextFilterModel | ICombinedSimpleModel<TextFilterModel> | null
    ): SimpleFilterParams {
        const { maxNumConditions, numAlwaysVisibleConditions, defaultJoinOperator, defaultOption, options } =
            filterConfig;
        let joinOperator: JoinOperator = defaultJoinOperator;
        let conditions: FilterCondition[] = [];
        if (model) {
            const mapModelCondition = (modelCondition: TextFilterModel): FilterCondition => {
                const { type, filter: from } = modelCondition as TextFilterModel;
                const option = type ?? defaultOption;
                return {
                    numberOfInputs: this.getNumberOfInputs(option),
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
        for (let i = conditions.length; i < numAlwaysVisibleConditions; i++) {
            conditions.push({
                numberOfInputs: 1,
                option: defaultOption,
                disabled: true,
            });
        }

        return {
            conditions,
            joinOperator: {
                operator: joinOperator,
            },
            options: options.map((value: ISimpleFilterModelType) => ({
                value,
                text: this.translationService.translate(value),
            })),
        };
    }

    private processSimpleFilterParams(
        oldSimpleFilterParams: SimpleFilterParams | undefined,
        newSimpleFilterParams: SimpleFilterParams,
        filterConfig: FilterConfig
    ): SimpleFilterParams {
        if (!oldSimpleFilterParams) {
            return newSimpleFilterParams;
        }
        const { conditions } = newSimpleFilterParams;
        const { conditions: oldConditions } = oldSimpleFilterParams;
        const { maxNumConditions, numAlwaysVisibleConditions } = filterConfig;
        let lastCompleteCondition = -1;
        conditions.forEach((condition, index) => {
            if (
                condition.numberOfInputs === 0 ||
                (!_missingOrEmpty(condition.from) && (condition.numberOfInputs === 1 || !_missingOrEmpty(condition.to)))
            ) {
                lastCompleteCondition = index;
            }
        });
        const disableFrom = lastCompleteCondition + 2;
        const removeFrom = Math.max(disableFrom, numAlwaysVisibleConditions);

        const processedConditions: FilterCondition[] = [];

        conditions.forEach((newCondition, index) => {
            if (index >= removeFrom) {
                return;
            }
            const oldCondition = oldConditions[index];
            const disabled = index >= disableFrom;
            if (
                (oldCondition === newCondition || oldCondition.option === newCondition.option) &&
                disabled === oldCondition.disabled
            ) {
                processedConditions.push(newCondition);
                return;
            }
            processedConditions.push({
                ...newCondition,
                numberOfInputs: this.getNumberOfInputs(newCondition.option as ISimpleFilterModelType),
                disabled,
            } as const);
        });
        if (processedConditions.length === lastCompleteCondition + 1 && processedConditions.length < maxNumConditions) {
            // TODO - find default option
            const defaultOption = 'contains';
            processedConditions.push({
                option: defaultOption,
                // TODO - lookup numberOfInputs based on type
                numberOfInputs: 1,
            });
        }
        return {
            ...newSimpleFilterParams,
            conditions: processedConditions,
        };
    }

    private getFilterConfig(column: AgColumn): FilterConfig {
        const params = column.getColDef().filterParams ?? {};
        let maxNumConditions = params.maxNumConditions ?? 2;
        if (maxNumConditions < 1) {
            _warnOnce('"filterParams.maxNumConditions" must be greater than or equal to zero.');
            maxNumConditions = 1;
        }
        let numAlwaysVisibleConditions = params.numAlwaysVisibleConditions ?? 1;
        if (numAlwaysVisibleConditions < 1) {
            _warnOnce('"filterParams.numAlwaysVisibleConditions" must be greater than or equal to zero.');
            numAlwaysVisibleConditions = 1;
        }
        if (numAlwaysVisibleConditions > maxNumConditions) {
            _warnOnce(
                '"filterParams.numAlwaysVisibleConditions" cannot be greater than "filterParams.maxNumConditions".'
            );
            numAlwaysVisibleConditions = maxNumConditions;
        }
        const options = [
            'contains',
            'notContains',
            'equals',
            'notEqual',
            'startsWith',
            'endsWith',
            'blank',
            'notBlank',
        ];
        let { defaultJoinOperator, defaultOption } = params;
        defaultJoinOperator =
            defaultJoinOperator === 'AND' || defaultJoinOperator === 'OR' ? defaultJoinOperator : 'AND';
        if (!defaultOption) {
            defaultOption = options[0];
        }
        return {
            maxNumConditions,
            numAlwaysVisibleConditions,
            options,
            defaultJoinOperator,
            defaultOption,
        };
    }

    private getNumberOfInputs(type?: ISimpleFilterModelType | null): 0 | 1 | 2 {
        const zeroInputTypes: ISimpleFilterModelType[] = ['empty', 'notBlank', 'blank'];

        if (type && zeroInputTypes.indexOf(type) >= 0) {
            return 0;
        } else if (type === 'inRange') {
            return 2;
        }

        return 1;
    }

    public override destroy(): void {
        this.activeFilterStates.clear();
        this.destroyColumnListeners();
        super.destroy();
    }
}
