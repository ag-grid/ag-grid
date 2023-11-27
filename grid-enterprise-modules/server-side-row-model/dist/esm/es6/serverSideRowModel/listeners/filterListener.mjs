var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub, Events, PostConstruct } from "@ag-grid-community/core";
let FilterListener = class FilterListener extends BeanStub {
    postConstruct() {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
        this.addManagedListener(this.eventService, Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED, () => this.onFilterChanged(true));
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, () => this.onFilterChanged());
    }
    onFilterChanged(advancedFilterEnabledChanged) {
        const storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) {
            return;
        } // params is undefined if no datasource set
        const oldModel = storeParams.filterModel;
        let newModel;
        let changedColumns;
        if (this.filterManager.isAdvancedFilterEnabled()) {
            newModel = this.filterManager.getAdvancedFilterModel();
            // if advancedFilterEnabledChanged, old model is of type `FilterModel`
            const oldColumns = advancedFilterEnabledChanged ? Object.keys(oldModel !== null && oldModel !== void 0 ? oldModel : {}) : this.getAdvancedFilterColumns(oldModel);
            const newColumns = this.getAdvancedFilterColumns(newModel);
            oldColumns.forEach(column => newColumns.add(column));
            changedColumns = Array.from(newColumns);
        }
        else {
            newModel = this.filterManager.getFilterModel();
            if (advancedFilterEnabledChanged) {
                // old model is of type `AdvancedFilterModel | null`
                const oldColumns = this.getAdvancedFilterColumns(oldModel);
                Object.keys(newModel).forEach(column => oldColumns.add(column));
                changedColumns = Array.from(oldColumns);
            }
            else {
                changedColumns = this.findChangedColumns(oldModel, newModel);
            }
        }
        const valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
        const secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);
        const params = {
            valueColChanged,
            secondaryColChanged,
            changedColumns
        };
        this.serverSideRowModel.refreshAfterFilter(newModel, params);
    }
    findChangedColumns(oldModel, newModel) {
        const allColKeysMap = {};
        Object.keys(oldModel).forEach(key => allColKeysMap[key] = true);
        Object.keys(newModel).forEach(key => allColKeysMap[key] = true);
        const res = [];
        Object.keys(allColKeysMap).forEach(key => {
            const oldJson = JSON.stringify(oldModel[key]);
            const newJson = JSON.stringify(newModel[key]);
            const filterChanged = oldJson != newJson;
            if (filterChanged) {
                res.push(key);
            }
        });
        return res;
    }
    getAdvancedFilterColumns(model) {
        const columns = new Set();
        if (!model) {
            return columns;
        }
        const processAdvancedFilterModel = (filterModel) => {
            if (filterModel.filterType === 'join') {
                filterModel.conditions.forEach(condition => processAdvancedFilterModel(condition));
            }
            else {
                columns.add(filterModel.colId);
            }
        };
        processAdvancedFilterModel(model);
        return columns;
    }
};
__decorate([
    Autowired('rowModel')
], FilterListener.prototype, "serverSideRowModel", void 0);
__decorate([
    Autowired('filterManager')
], FilterListener.prototype, "filterManager", void 0);
__decorate([
    Autowired('ssrmListenerUtils')
], FilterListener.prototype, "listenerUtils", void 0);
__decorate([
    PostConstruct
], FilterListener.prototype, "postConstruct", null);
FilterListener = __decorate([
    Bean('ssrmFilterListener')
], FilterListener);
export { FilterListener };
