var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, GROUP_AUTO_COLUMN_ID, Events, PostConstruct } from "@ag-grid-community/core";
let SortListener = class SortListener extends BeanStub {
    postConstruct() {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    }
    extractSortModel() {
        const sortModel = this.sortController.getSortModel();
        // when using tree data we just return the sort model with the 'ag-Grid-AutoColumn' as is, i.e not broken out
        // into it's constitute group columns as they are not defined up front and can vary per node.
        if (this.gridOptionsService.isTreeData()) {
            return sortModel;
        }
        // it autoCol is active, we don't want to send this to the server. instead we want to
        // send the
        this.replaceAutoGroupColumnWithActualRowGroupColumns(sortModel);
        this.removeMultiColumnPrefixOnColumnIds(sortModel);
        return sortModel;
    }
    removeMultiColumnPrefixOnColumnIds(sortModel) {
        if (this.gridOptionsService.isGroupMultiAutoColumn()) {
            const multiColumnPrefix = GROUP_AUTO_COLUMN_ID + "-";
            for (let i = 0; i < sortModel.length; ++i) {
                if (sortModel[i].colId.indexOf(multiColumnPrefix) > -1) {
                    sortModel[i].colId = sortModel[i].colId.substr(multiColumnPrefix.length);
                }
            }
        }
    }
    replaceAutoGroupColumnWithActualRowGroupColumns(sortModel) {
        // find index of auto group column in sort model
        const autoGroupSortModel = sortModel.find(sm => sm.colId == GROUP_AUTO_COLUMN_ID);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydExpc3RlbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3NlcnZlclNpZGVSb3dNb2RlbC9saXN0ZW5lcnMvc29ydExpc3RlbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUNULElBQUksRUFDSixRQUFRLEVBRVIsb0JBQW9CLEVBQ3BCLE1BQU0sRUFDTixhQUFhLEVBS2hCLE1BQU0seUJBQXlCLENBQUM7QUFLakMsSUFBYSxZQUFZLEdBQXpCLE1BQWEsWUFBYSxTQUFRLFFBQVE7SUFROUIsYUFBYTtRQUNqQiw4RkFBOEY7UUFDOUYsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFBRSxPQUFPO1NBQUU7UUFFdEUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDekcsQ0FBQztJQUVNLGdCQUFnQjtRQUNuQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRXJELDZHQUE2RztRQUM3Ryw2RkFBNkY7UUFDN0YsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDdEMsT0FBTyxTQUFTLENBQUM7U0FDcEI7UUFFRCxxRkFBcUY7UUFDckYsV0FBVztRQUNYLElBQUksQ0FBQywrQ0FBK0MsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsa0NBQWtDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFbkQsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVPLGtDQUFrQyxDQUFDLFNBQTBCO1FBQ2pFLElBQUksSUFBSSxDQUFDLGtCQUFr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