import type {
    AgColumn,
    BeanCollection,
    FilterPanelFilterState,
    FilterPanelSummaryState,
    IFilterDef,
    IFilterPanelService,
    NamedBean,
    SelectableFilterDef,
    SelectableFilterParams,
    ValueGetterFunc,
} from 'ag-grid-community';
import {
    BeanStub,
    FilterComp,
    _addGridCommonParams,
    _getDefaultSimpleFilter,
    _getFilterParamsForDataType,
} from 'ag-grid-community';
import type { FilterHandler } from 'ag-grid-community';

import { translateForFilterPanel } from './filterPanelUtils';

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
    private selectedFilters: Map<string, number> = new Map();
    private valueGetters: Map<string, string | ValueGetterFunc> = new Map();

    public postConstruct(): void {
        const updateFilterStates = this.updateFilterStates.bind(this);
        this.addManagedEventListeners({
            newColumnsLoaded: updateFilterStates,
            filterChanged: updateFilterStates,
        });
    }

    public getFilterValueGetter(colId: string): string | ValueGetterFunc | undefined {
        return this.valueGetters.get(colId);
    }

    public isSelectableFilter(filterDef: IFilterDef): boolean {
        const filter = filterDef.filter;
        return filter === true || filter === 'agSelectableColumnFilter';
    }

    public getSelectableFilterDef(column: AgColumn, filterDef: IFilterDef): IFilterDef {
        const filters = this.getSelectableFilterDefs(column, filterDef);

        const selectedFilter = this.selectedFilters.get(column.getColId()) ?? 0;

        return filters[selectedFilter];
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
            type: 'filterPanelStateChanged',
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
            type: 'filterPanelStateChanged',
            id,
            state: newFilterState.state,
        });
    }

    public updateFilterType(id: string, filterDef: SelectableFilterDef): void {
        const oldFilterStateWrapper = this.states.get(id);
        if (!oldFilterStateWrapper) {
            return;
        }
        filterDef;
        // TODO
        this.dispatchLocalEvent({
            type: 'filterPanelStateChanged',
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
        const name = getDisplayName(beans, column);
        if (expanded) {
            const colDef = column.colDef;
            const filterDefs = this.isSelectableFilter(colDef)
                ? this.getSelectableFilterDefs(column, colDef)
                : undefined;
            const activeFilterDef = filterDefs?.[this.selectedFilters.get(column.getColId()) ?? 0];
            const filterComp = this.createBean(new FilterComp(column, 'TOOLBAR'));
            return {
                state: {
                    column,
                    name,
                    expanded,
                    detail: filterComp.getGui(),
                    activeFilterDef,
                    filterDefs,
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
            type: 'filterPanelStatesChanged',
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

    private getDefaultFilters(column: AgColumn): SelectableFilterDef[] {
        const beans = this.beans;
        const { gos, dataTypeSvc } = beans;
        const isMultiFilterEnabled = gos.isModuleRegistered('MultiFilter');
        const colDef = column.colDef;
        const cellDataType = dataTypeSvc?.getBaseDataType(column);
        const simpleFilter = _getDefaultSimpleFilter(cellDataType, false) as
            | 'agTextColumnFilter'
            | 'agNumberColumnFilter'
            | 'agDateColumnFilter';
        const dataTypeDefinition = dataTypeSvc?.getDataTypeDefinition(column);
        const formatValue = dataTypeSvc?.getFormatValue(cellDataType!);
        const getDef = (
            filter: 'agTextColumnFilter' | 'agNumberColumnFilter' | 'agDateColumnFilter' | 'agSetColumnFilter'
        ) => {
            const { filterParams, filterValueGetter } =
                dataTypeDefinition && formatValue
                    ? _getFilterParamsForDataType(
                          filter,
                          undefined,
                          colDef,
                          dataTypeDefinition,
                          formatValue,
                          beans,
                          this.getLocaleTextFunc()
                      )
                    : { filterParams: undefined, filterValueGetter: undefined };
            return {
                name: translateForFilterPanel(this, `${filter}DisplayName`),
                filter,
                filterParams,
                filterValueGetter,
            };
        };
        return [
            getDef(simpleFilter),
            getDef('agSetColumnFilter'),
            ...(isMultiFilterEnabled
                ? [
                      {
                          name: translateForFilterPanel(this, `agMultiColumnFilterDisplayName`),
                          filter: 'agMultiColumnFilter',
                          ...((dataTypeDefinition && formatValue
                              ? beans.multiFilter?.getParamsForDataType(
                                    undefined,
                                    colDef,
                                    dataTypeDefinition,
                                    formatValue
                                )
                              : undefined) ?? {}),
                      },
                  ]
                : []),
        ];
    }

    private getSelectableFilterDefs(column: AgColumn, filterDef: IFilterDef): SelectableFilterDef[] {
        let filterParams = filterDef.filterParams;
        if (typeof filterParams === 'function') {
            filterParams = filterParams(
                _addGridCommonParams(this.gos, {
                    column,
                    colDef: column.colDef,
                })
            );
        }
        return (filterParams as SelectableFilterParams)?.filters ?? this.getDefaultFilters(column);
    }
}

function getDisplayName(beans: BeanCollection, column: AgColumn): string {
    return beans.colNames.getDisplayNameForColumn(column, 'filterToolPanel') ?? column.getColId();
}
