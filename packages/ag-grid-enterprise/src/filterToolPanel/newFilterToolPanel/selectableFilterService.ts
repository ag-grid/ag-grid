import type {
    AgColumn,
    IFilterDef,
    ISelectableFilterService,
    NamedBean,
    SelectableFilterDef,
    SelectableFilterParams,
    ValueGetterFunc,
} from 'ag-grid-community';
import {
    BeanStub,
    _addGridCommonParams,
    _getDefaultSimpleFilter,
    _getFilterParamsForDataType,
    _isSetFilterByDefault,
    _warn,
} from 'ag-grid-community';

import { translateForFilterPanel } from './filterPanelUtils';

type SimpleFilterType = 'agTextColumnFilter' | 'agNumberColumnFilter' | 'agDateColumnFilter';

type ProvidedFilterType = SimpleFilterType | 'agSetColumnFilter' | 'agMultiColumnFilter';

export class SelectableFilterService extends BeanStub implements ISelectableFilterService, NamedBean {
    readonly beanName = 'selectableFilter' as const;

    private selectedFilters: Map<string, number> = new Map();
    private valueGetters: Map<string, string | ValueGetterFunc> = new Map();

    public getFilterValueGetter(colId: string): string | ValueGetterFunc | undefined {
        return this.valueGetters.get(colId);
    }

    public isSelectable(filterDef: IFilterDef): boolean {
        const filter = filterDef.filter;
        return filter === true || filter === 'agSelectableColumnFilter';
    }

    public getFilterDef(column: AgColumn, filterDef: IFilterDef): IFilterDef {
        return this.getDefs(column, filterDef)!.activeFilterDef;
    }

    public getDefs(
        column: AgColumn,
        filterDef: IFilterDef
    ): { filterDefs: SelectableFilterDef[]; activeFilterDef: SelectableFilterDef } | undefined {
        if (!this.isSelectable(filterDef)) {
            return undefined;
        }
        const beans = this.beans;
        const { gos, dataTypeSvc, colFilter } = beans;
        let filterParams = filterDef.filterParams;
        const colDef = column.colDef;
        if (typeof filterParams === 'function') {
            filterParams = filterParams(
                _addGridCommonParams(gos, {
                    column,
                    colDef,
                })
            );
        }
        const cellDataType = dataTypeSvc?.getBaseDataType(column);
        const dataTypeDefinition = dataTypeSvc?.getDataTypeDefinition(column);
        const formatValue = dataTypeSvc?.getFormatValue(cellDataType!);
        const { filters, defaultFilterParams, defaultFilterIndex } = (filterParams as SelectableFilterParams) ?? {};

        const updateDef = (def: SelectableFilterDef) => {
            const { filter, filterParams: defFilterParams, name, filterValueGetter = colDef.filterValueGetter } = def;
            const userParams = defaultFilterParams ? { ...defaultFilterParams, ...defFilterParams } : defFilterParams;
            let updatedParams: { filterParams?: any; filterValueGetter?: string | ValueGetterFunc } | undefined;
            if (dataTypeDefinition && formatValue) {
                if (filter === 'agMultiColumnFilter') {
                    updatedParams = beans.multiFilter?.getParamsForDataType(
                        userParams,
                        filterValueGetter,
                        dataTypeDefinition,
                        formatValue
                    );
                } else {
                    updatedParams = _getFilterParamsForDataType(
                        filter,
                        userParams,
                        filterValueGetter,
                        dataTypeDefinition,
                        formatValue,
                        beans,
                        this.getLocaleTextFunc()
                    );
                }
            }
            let updatedName: string | undefined;
            if (!name) {
                let filterString = filter;
                if (typeof filter === 'boolean') {
                    filterString = colFilter?.getDefaultFilterFromDataType(() => cellDataType);
                }
                if (typeof filterString === 'string') {
                    updatedName = translateForFilterPanel(this, `${filterString as ProvidedFilterType}DisplayName`);
                } else {
                    _warn(280, { colId: column.getColId() });
                    updatedName = '';
                }
            }
            if (defaultFilterParams || updatedParams || updatedName) {
                return {
                    ...def,
                    filterParams: userParams,
                    name: updatedName ?? name,
                    ...updatedParams,
                };
            }
            return def;
        };

        const filterDefs = (filters ?? this.getDefaultFilters(column)).map(updateDef);

        let index =
            this.selectedFilters.get(column.getColId()) ?? // UI selected value
            defaultFilterIndex ?? // col def value
            (!filters && _isSetFilterByDefault(gos) ? 1 : 0); // if using defaults, then respect set filter by default setting, else choose first

        if (index >= filterDefs.length) {
            index = 0;
        }

        const activeFilterDef = filterDefs[index];

        return { filterDefs, activeFilterDef };
    }

    public setActive(colId: string, filterDefs: SelectableFilterDef[], activeFilterDef: SelectableFilterDef): void {
        const index = filterDefs.indexOf(activeFilterDef);
        if (index < 0) {
            return;
        }
        const { selectedFilters, valueGetters } = this;
        selectedFilters.set(colId, index);
        const filterValueGetter = activeFilterDef.filterValueGetter;
        if (filterValueGetter) {
            valueGetters.set(colId, filterValueGetter);
        } else {
            valueGetters.delete(colId);
        }
    }

    public clearActive(colId: string): void {
        const { selectedFilters, valueGetters } = this;
        selectedFilters.delete(colId);
        valueGetters.delete(colId);
    }

    public override destroy(): void {
        const { selectedFilters, valueGetters } = this;
        selectedFilters.clear();
        valueGetters.clear();
        super.destroy();
    }

    private getDefaultFilters(column: AgColumn): SelectableFilterDef[] {
        const beans = this.beans;
        const { gos, dataTypeSvc } = beans;
        const isMultiFilterEnabled = gos.isModuleRegistered('MultiFilter');
        const cellDataType = dataTypeSvc?.getBaseDataType(column);
        const simpleFilter = _getDefaultSimpleFilter(cellDataType, false) as SimpleFilterType;
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
