import {
    AdvancedFilterModel,
    Autowired,
    Bean,
    BeanStub,
    Events,
    FilterManager,
    FilterModel,
    PostConstruct,
    StoreRefreshAfterParams,
} from '@ag-grid-community/core';

import { ServerSideRowModel } from '../serverSideRowModel';
import { ListenerUtils } from './listenerUtils';

@Bean('ssrmFilterListener')
export class FilterListener extends BeanStub {
    @Autowired('rowModel') private serverSideRowModel: ServerSideRowModel;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('ssrmListenerUtils') private listenerUtils: ListenerUtils;

    @PostConstruct
    private postConstruct(): void {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gos.isRowModelType('serverSide')) {
            return;
        }

        this.addManagedListener(this.eventService, Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED, () =>
            this.onFilterChanged(true)
        );
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, () => this.onFilterChanged());
    }

    private onFilterChanged(advancedFilterEnabledChanged?: boolean): void {
        const storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) {
            return;
        } // params is undefined if no datasource set

        const oldModel = storeParams.filterModel;
        let newModel: FilterModel | AdvancedFilterModel | null;
        let changedColumns: string[];

        if (this.filterManager.isAdvancedFilterEnabled()) {
            newModel = this.filterManager.getAdvancedFilterModel();
            // if advancedFilterEnabledChanged, old model is of type `FilterModel`
            const oldColumns = advancedFilterEnabledChanged
                ? Object.keys(oldModel ?? {})
                : this.getAdvancedFilterColumns(oldModel as AdvancedFilterModel | null);
            const newColumns = this.getAdvancedFilterColumns(newModel as AdvancedFilterModel | null);
            oldColumns.forEach((column) => newColumns.add(column));
            changedColumns = Array.from(newColumns);
        } else {
            newModel = this.filterManager.getFilterModel();
            if (advancedFilterEnabledChanged) {
                // old model is of type `AdvancedFilterModel | null`
                const oldColumns = this.getAdvancedFilterColumns(oldModel as AdvancedFilterModel | null);
                Object.keys(newModel).forEach((column) => oldColumns.add(column));
                changedColumns = Array.from(oldColumns);
            } else {
                changedColumns = this.findChangedColumns(oldModel as FilterModel, newModel as FilterModel);
            }
        }

        const valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
        const secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);

        const params: StoreRefreshAfterParams = {
            valueColChanged,
            secondaryColChanged,
            changedColumns,
        };

        this.serverSideRowModel.refreshAfterFilter(newModel, params);
    }

    private findChangedColumns(oldModel: FilterModel, newModel: FilterModel): string[] {
        const allColKeysMap: { [key: string]: boolean } = {};

        Object.keys(oldModel).forEach((key) => (allColKeysMap[key] = true));
        Object.keys(newModel).forEach((key) => (allColKeysMap[key] = true));

        const res: string[] = [];

        Object.keys(allColKeysMap).forEach((key) => {
            const oldJson = JSON.stringify(oldModel[key]);
            const newJson = JSON.stringify(newModel[key]);
            const filterChanged = oldJson != newJson;
            if (filterChanged) {
                res.push(key);
            }
        });

        return res;
    }

    private getAdvancedFilterColumns(model: AdvancedFilterModel | null): Set<string> {
        const columns = new Set<string>();
        if (!model) {
            return columns;
        }

        const processAdvancedFilterModel = (filterModel: AdvancedFilterModel) => {
            if (filterModel.filterType === 'join') {
                filterModel.conditions.forEach((condition) => processAdvancedFilterModel(condition));
            } else {
                columns.add(filterModel.colId);
            }
        };

        processAdvancedFilterModel(model);

        return columns;
    }
}
