import type {
    AgColumn,
    FilterChangedEventSourceType,
    IFilterDef,
    ISelectableFilterService,
    NamedBean,
    SelectableFilterDef,
    SelectableFilterParams,
    SelectableFilterState,
    ValueGetterFunc,
} from 'ag-grid-community';
import {
    BeanStub,
    _getDefaultFilter,
    _getDefaultSimpleFilter,
    _getFilterKey,
    _isSetFilterByDefault,
} from 'ag-grid-community';

import { translateForFilterPanel } from './filterPanelUtils';

type SimpleFilterType = 'agTextColumnFilter' | 'agNumberColumnFilter' | 'agBigIntColumnFilter' | 'agDateColumnFilter';

type ProvidedFilterType = SimpleFilterType | 'agSetColumnFilter' | 'agMultiColumnFilter';

export class SelectableFilterService
    extends BeanStub<'selectedFilterChanged'>
    implements ISelectableFilterService, NamedBean
{
    readonly beanName = 'selectableFilter' as const;

    private readonly selectedFilters: Map<string, number> = new Map();
    private readonly valueGetters: Map<string, string | ValueGetterFunc> = new Map();

    public postConstruct(): void {
        const { gos, selectedFilters } = this;
        // the filter panel gets initialised before filter state is applied, so set defaults early
        const initialState = gos.get('initialState')?.filter?.selectableFilters ?? {};
        for (const colId of Object.keys(initialState)) {
            selectedFilters.set(colId, initialState[colId]);
        }
        this.addManagedEventListeners({ newColumnsLoaded: () => this.refreshValueGetters() });
    }

    public getFilterValueGetter(colId: string): string | ValueGetterFunc | undefined {
        return this.valueGetters.get(colId);
    }

    /** The active definition alone, as its readers run on every parse and column definition load. */
    public getFilterDef(column: AgColumn, filterDef: IFilterDef): SelectableFilterDef | undefined {
        const resolved = this.resolveDefs(column, filterDef, undefined);
        return resolved?.updateDef(resolved.defs[resolved.index]);
    }

    public getDefs(
        column: AgColumn,
        filterDef: IFilterDef,
        overrideIndex?: number
    ): { filterDefs: SelectableFilterDef[]; activeFilterDef: SelectableFilterDef } | undefined {
        const resolved = this.resolveDefs(column, filterDef, overrideIndex);
        if (!resolved) {
            return undefined;
        }
        const updateDef = resolved.updateDef;
        const filterDefs = resolved.defs.map((def) => this.withName(column, updateDef(def)));
        return { filterDefs, activeFilterDef: filterDefs[resolved.index] };
    }

    /** The panel's label for a choice, only worked out where the choices are listed. */
    private withName(column: AgColumn, def: SelectableFilterDef): SelectableFilterDef {
        if (def.name) {
            return def;
        }
        const beans = this.beans;
        const filterName = _getFilterKey(beans, def.filter, _getDefaultFilter(beans, column));
        if (filterName === undefined) {
            return { ...def, name: '' };
        }
        return { ...def, name: translateForFilterPanel(this, `${filterName as ProvidedFilterType}DisplayName`) };
    }

    private resolveDefs(
        column: AgColumn,
        filterDef: IFilterDef,
        overrideIndex: number | undefined
    ):
        | { defs: SelectableFilterDef[]; index: number; updateDef: (def: SelectableFilterDef) => SelectableFilterDef }
        | undefined {
        if (filterDef.filter !== 'agSelectableColumnFilter') {
            return undefined;
        }
        const beans = this.beans;
        const filterParams = beans.colFilter!.resolveFilterParams(column, filterDef);
        const { filters, defaultFilterParams, defaultFilterIndex } = (filterParams as SelectableFilterParams) ?? {};

        const updateDef = (def: SelectableFilterDef): SelectableFilterDef => {
            if (!def.name) {
                const filter = def.filter;
                const named = typeof filter === 'object' && filter !== null ? filter.component : filter;
                if (typeof named !== 'string' && typeof named !== 'boolean') {
                    // warned as the choice is read, not once the panel lists it
                    this.warn(280, { colId: column.colId });
                }
            }
            if (!defaultFilterParams) {
                return def;
            }
            const defFilterParams = def.filterParams;
            const filterParams =
                typeof defFilterParams === 'function'
                    ? (params: any) => ({ ...defaultFilterParams, ...defFilterParams(params) })
                    : { ...defaultFilterParams, ...defFilterParams };
            return { ...def, filterParams };
        };

        // an empty list provides no filters, so it takes the defaults
        const defs = filters?.length ? filters : this.getDefaultFilters(column);
        const usingDefaults = defs !== filters;

        let index =
            overrideIndex ?? // provided override
            this.selectedFilters.get(column.colId) ?? // UI selected value
            defaultFilterIndex ?? // col def value
            (usingDefaults && _isSetFilterByDefault(this.gos) ? 1 : 0); // if using defaults, then respect set filter by default setting, else choose first

        // an index naming no filter, from the definition or a saved state, selects the first
        if (!Number.isInteger(index) || index < 0 || index >= defs.length) {
            index = 0;
        }

        return { defs, index, updateDef };
    }

    public setActive(
        colId: string,
        filterDefs: SelectableFilterDef[],
        activeFilterDef: SelectableFilterDef,
        silent?: boolean
    ): void {
        const index = filterDefs.indexOf(activeFilterDef);
        if (index < 0) {
            return;
        }
        this.selectedFilters.set(colId, index);
        this.setValueGetter(colId, activeFilterDef.filterValueGetter);
        if (!silent) {
            this.onChange();
        }
    }

    public clearActive(colId: string): void {
        this.selectedFilters.delete(colId);
        const column = this.beans.colModel.getNonPivotColById(colId);
        this.setValueGetter(colId, column && this.getFilterDef(column, column.colDef)?.filterValueGetter);
        this.onChange();
    }

    public getState(): SelectableFilterState | undefined {
        return this.selectedFilters.size > 0 ? Object.fromEntries(this.selectedFilters) : undefined;
    }

    public setState(state: SelectableFilterState | undefined): void {
        const colModel = this.beans.colModel;
        const restored = state ? Object.keys(state) : [];
        // each affected column's choice before and after, so only one whose choice changes is rebuilt
        const activeIndex = (column: AgColumn) => this.resolveDefs(column, column.colDef, undefined)?.index;
        const previous = new Map<AgColumn, number | undefined>();
        const recordActive = (colId: string) => {
            const column = colModel.getNonPivotColById(colId);
            if (column) {
                previous.set(column, activeIndex(column));
            }
        };
        for (const colId of this.selectedFilters.keys()) {
            recordActive(colId);
        }
        for (let i = 0, len = restored.length; i < len; ++i) {
            recordActive(restored[i]);
        }
        this.clearAll();
        if (state) {
            for (let i = 0, len = restored.length; i < len; ++i) {
                const colId = restored[i];
                const column = colModel.getNonPivotColById(colId);
                if (column) {
                    const defs = this.getDefs(column, column.colDef, state[colId]);
                    if (defs) {
                        this.setActive(colId, defs.filterDefs, defs.activeFilterDef, true);
                    }
                }
            }
        }
        this.refreshValueGetters();
        let changed = false;
        for (const [column, index] of previous) {
            if (activeIndex(column) !== index) {
                changed = true;
                this.switchFilter(column, 'api');
            }
        }
        if (changed) {
            this.onChange();
        }
    }

    public switchFilter(column: AgColumn, source: FilterChangedEventSourceType): void {
        this.beans.colFilter?.filterParamsChanged(column.colId, source);
        this.eventSvc.dispatchEvent({ type: 'filterSwitched', column });
    }

    public override destroy(): void {
        this.clearAll();
        super.destroy();
    }

    private clearAll(): void {
        const { selectedFilters, valueGetters } = this;
        selectedFilters.clear();
        valueGetters.clear();
    }

    /** The column-level readers read the active definition's getter, chosen or default, as its filter does. */
    private refreshValueGetters(): void {
        // a choice whose column is missing is kept, for when the column or its definition comes back
        this.valueGetters.clear();
        for (const column of this.beans.colModel.getAllCols()) {
            this.setValueGetter(column.colId, this.getFilterDef(column, column.colDef)?.filterValueGetter);
        }
    }

    private setValueGetter(colId: string, filterValueGetter: string | ValueGetterFunc | undefined): void {
        if (filterValueGetter) {
            this.valueGetters.set(colId, filterValueGetter);
        } else {
            this.valueGetters.delete(colId);
        }
    }

    private onChange(): void {
        this.dispatchLocalEvent({
            type: 'selectedFilterChanged',
        });
    }

    private getDefaultFilters(column: AgColumn): SelectableFilterDef[] {
        const beans = this.beans;
        const { gos, dataTypeSvc } = beans;
        const isMultiFilterEnabled = gos.isModuleRegistered('MultiFilter');
        const cellDataType = dataTypeSvc?.getBaseDataType(column);
        const simpleFilter = _getDefaultSimpleFilter(cellDataType) as SimpleFilterType;
        return [
            { filter: simpleFilter },
            { filter: 'agSetColumnFilter' },
            ...(isMultiFilterEnabled
                ? [
                      {
                          filter: 'agMultiColumnFilter',
                      },
                  ]
                : []),
        ];
    }
}
