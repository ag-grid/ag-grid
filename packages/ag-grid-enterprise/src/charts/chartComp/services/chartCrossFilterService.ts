import type {
    FilterModel,
    IMultiFilterModel,
    IProvidedFilter,
    NamedBean,
    SetFilterModel,
    SetFilterModelValue,
} from 'ag-grid-community';
import { BeanStub, _warn } from 'ag-grid-community';

import type { MultiFilter } from '../../../multiFilter/multiFilter';
import type { MultiFilterUi } from '../../../multiFilter/multiFilterUi';
import type { SetFilter } from '../../../setFilter/setFilter';
import type { SetFilterHandler } from '../../../setFilter/setFilterHandler';

export class ChartCrossFilterService extends BeanStub implements NamedBean {
    beanName = 'chartCrossFilterSvc' as const;

    public filter(event: any, reset: boolean = false): void {
        const filterManager = this.beans.filterManager;

        const filterModel = filterManager?.getFilterModel() ?? {};

        // filters should be reset when user clicks on canvas background
        if (reset) {
            if (Object.keys(filterModel).length > 0) {
                // only reset filters / charts when necessary to prevent undesirable flickering effect
                filterManager?.setFilterModel(null);
            }
            return;
        }

        let colId = extractFilterColId(event);
        if (colId.indexOf('-filtered-out')) {
            colId = colId.replace('-filtered-out', '');
        }
        // update filters based on current chart selections
        this.updateFilters(filterModel, event, colId);
    }

    private updateFilters(filterModel: FilterModel, event: any, colId: string): void {
        const dataKey = extractFilterColId(event);
        const rawValue = this.convertRawValue(colId, event.datum[dataKey]);
        if (rawValue === undefined) {
            return;
        }

        const filterManager = this.beans.filterManager;

        filterManager?.getColumnFilterInstance(colId).then((filter) => {
            const filterType = (filter as IProvidedFilter)?.filterType;
            let setFilter: SetFilter | undefined;
            let processModel = (model: any): any => model;
            if (filterType === 'multi') {
                const result = extractFromMultiFilter(filter as unknown as MultiFilterUi | MultiFilter);
                setFilter = result.setFilter;
                processModel = result.processModel ?? processModel;
            } else if (filterType === 'set') {
                setFilter = filter as any;
            }
            if (!setFilter) {
                _warn(154, { colId });
                return;
            }

            const update = event.event.metaKey || event.event.ctrlKey;

            const setFilterModel = (setFilter.getFilterHandler() as SetFilterHandler).getCrossFilterModel(
                (createKey, availableKeys, existingValues) =>
                    getSetFilterModel(update, createKey(rawValue), availableKeys, existingValues)
            );

            const colFilterModel = processModel(setFilterModel);
            const newFilterModel = update ? { ...filterModel } : {};
            newFilterModel[colId] = colFilterModel;
            filterManager?.setFilterModel(newFilterModel);
        });
    }

    private convertRawValue(colId: string, rawValue: any): any {
        const { colModel, dataTypeSvc } = this.beans;
        const column = colModel.getColById(colId);
        const colDef = column?.colDef;
        if (colDef && dataTypeSvc && colDef.chartDataType === 'time' && colDef.cellDataType === 'dateString') {
            // need to convert from `Date` back to `string`
            return dataTypeSvc.getDateFormatterFunction(column)(rawValue as Date);
        }
        return rawValue;
    }
}

function processMultiFilterModel(setFilterModel: any, index: number, numFilters: number): IMultiFilterModel {
    const filterModels = new Array(numFilters);
    for (let i = 0; i < numFilters; i++) {
        filterModels[i] = i === index ? setFilterModel : null;
    }
    return { filterType: 'multi', filterModels };
}

function extractFromMultiFilter(multiFilter: MultiFilterUi | MultiFilter): {
    setFilter?: SetFilter;
    processModel?: (model: any) => any;
} {
    const numFilters = multiFilter.getNumChildFilters();
    for (let i = 0; i < numFilters; i++) {
        const childFilter = multiFilter.getChildFilterInstance(i);
        if ((childFilter as IProvidedFilter)?.filterType === 'set') {
            return {
                setFilter: childFilter as any,
                processModel: (model) => processMultiFilterModel(model, i, numFilters),
            };
        }
    }
    return {};
}

function extractFilterColId(event: any): string {
    return event.xKey || event.calloutLabelKey;
}

function getSetFilterModel(
    update: boolean,
    key: string | null,
    availableKeySet: Set<string | null>,
    existingValues: SetFilterModelValue | undefined
): SetFilterModel {
    let values: SetFilterModelValue;
    if (update) {
        if (availableKeySet.has(key) && (existingValues == null || existingValues.includes(key))) {
            // exists in grid, so remove
            values = [];
            if (existingValues == null) {
                for (const availableKey of availableKeySet) {
                    if (availableKey !== key) {
                        values.push(availableKey);
                    }
                }
            } else {
                for (const existingValue of existingValues) {
                    if (existingValue !== key && availableKeySet.has(existingValue)) {
                        values.push(existingValue);
                    }
                }
            }
        } else {
            // add
            if (existingValues == null) {
                values = Array.from(availableKeySet);
            } else {
                values = [];
                for (const existingValue of existingValues) {
                    if (availableKeySet.has(existingValue)) {
                        values.push(existingValue);
                    }
                }
            }
            values.push(key);
        }
    } else {
        values = [key];
    }
    return {
        filterType: 'set',
        values,
    };
}
