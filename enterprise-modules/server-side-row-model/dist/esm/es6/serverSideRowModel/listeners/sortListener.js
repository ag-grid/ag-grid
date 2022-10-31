var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, Constants, Events, PostConstruct } from "@ag-grid-community/core";
let SortListener = class SortListener extends BeanStub {
    postConstruct() {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsWrapper.isRowModelServerSide()) {
            return;
        }
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    }
    extractSortModel() {
        const sortModel = this.sortController.getSortModel();
        // when using tree data we just return the sort model with the 'ag-Grid-AutoColumn' as is, i.e not broken out
        // into it's constitute group columns as they are not defined up front and can vary per node.
        if (this.gridOptionsWrapper.isTreeData()) {
            return sortModel;
        }
        // it autoCol is active, we don't want to send this to the server. instead we want to
        // send the
        this.replaceAutoGroupColumnWithActualRowGroupColumns(sortModel);
        this.removeMultiColumnPrefixOnColumnIds(sortModel);
        return sortModel;
    }
    removeMultiColumnPrefixOnColumnIds(sortModel) {
        if (this.gridOptionsWrapper.isGroupMultiAutoColumn()) {
            const multiColumnPrefix = Constants.GROUP_AUTO_COLUMN_ID + "-";
            for (let i = 0; i < sortModel.length; ++i) {
                if (sortModel[i].colId.indexOf(multiColumnPrefix) > -1) {
                    sortModel[i].colId = sortModel[i].colId.substr(multiColumnPrefix.length);
                }
            }
        }
    }
    replaceAutoGroupColumnWithActualRowGroupColumns(sortModel) {
        // find index of auto group column in sort model
        const autoGroupSortModel = sortModel.find(sm => sm.colId == Constants.GROUP_AUTO_COLUMN_ID);
        // replace auto column with individual group columns
        if (autoGroupSortModel) {
            // remove auto group column
            const autoGroupIndex = sortModel.indexOf(autoGroupSortModel);
            _.removeFromArray(sortModel, autoGroupSortModel);
            const isNotInSortModel = (col) => sortModel.filter(sm => sm.colId === col.getColId()).length == 0;
            const mapColumnToSortModel = (col) => ({ colId: col.getId(), sort: autoGroupSortModel.sort });
            const newModels = this.columnModel.getRowGroupColumns()
                .filter(isNotInSortModel)
                .map(mapColumnToSortModel);
            _.insertArrayIntoArray(sortModel, newModels, autoGroupIndex);
        }
    }
    onSortChanged() {
        const storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) {
            return;
        } // params is undefined if no datasource set
        const newSortModel = this.extractSortModel();
        const oldSortModel = storeParams.sortModel;
        const changedColumns = this.findChangedColumnsInSort(newSortModel, oldSortModel);
        const valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
        const secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);
        const params = {
            valueColChanged,
            secondaryColChanged,
            changedColumns
        };
        this.serverSideRowModel.refreshAfterSort(newSortModel, params);
    }
    // returns back all the cols that were effected by the sorting. eg if we were sorting by col A,
    // and now we are sorting by col B, the list of impacted cols should be A and B. so if a cache
    // is impacted by sorting on A or B then it needs to be refreshed. this includes where the cache
    // was previously sorted by A and then the A sort now needs to be cleared.
    findChangedColumnsInSort(newSortModel, oldSortModel) {
        let allColsInBothSorts = [];
        [newSortModel, oldSortModel].forEach(sortModel => {
            if (sortModel) {
                const ids = sortModel.map(sm => sm.colId);
                allColsInBothSorts = allColsInBothSorts.concat(ids);
            }
        });
        const differentSorts = (oldSortItem, newSortItem) => {
            const oldSort = oldSortItem ? oldSortItem.sort : null;
            const newSort = newSortItem ? newSortItem.sort : null;
            return oldSort !== newSort;
        };
        const differentIndexes = (oldSortItem, newSortItem) => {
            const oldIndex = oldSortItem ? oldSortModel.indexOf(oldSortItem) : -1;
            const newIndex = newSortItem ? newSortModel.indexOf(newSortItem) : -1;
            return oldIndex !== newIndex;
        };
        return allColsInBothSorts.filter(colId => {
            const oldSortItem = oldSortModel.find(sm => sm.colId === colId);
            const newSortItem = newSortModel.find(sm => sm.colId === colId);
            return differentSorts(oldSortItem, newSortItem) || differentIndexes(oldSortItem, newSortItem);
        });
    }
};
__decorate([
    Autowired('sortController')
], SortListener.prototype, "sortController", void 0);
__decorate([
    Autowired('columnModel')
], SortListener.prototype, "columnModel", void 0);
__decorate([
    Autowired('rowModel')
], SortListener.prototype, "serverSideRowModel", void 0);
__decorate([
    Autowired('ssrmListenerUtils')
], SortListener.prototype, "listenerUtils", void 0);
__decorate([
    PostConstruct
], SortListener.prototype, "postConstruct", null);
SortListener = __decorate([
    Bean('ssrmSortService')
], SortListener);
export { SortListener };
