var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, GROUP_AUTO_COLUMN_ID, Events, PostConstruct } from "@ag-grid-community/core";
var SortListener = /** @class */ (function (_super) {
    __extends(SortListener, _super);
    function SortListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SortListener.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
    };
    SortListener.prototype.extractSortModel = function () {
        var sortModel = this.sortController.getSortModel();
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
    };
    SortListener.prototype.removeMultiColumnPrefixOnColumnIds = function (sortModel) {
        if (this.gridOptionsService.isGroupMultiAutoColumn()) {
            var multiColumnPrefix = GROUP_AUTO_COLUMN_ID + "-";
            for (var i = 0; i < sortModel.length; ++i) {
                if (sortModel[i].colId.indexOf(multiColumnPrefix) > -1) {
                    sortModel[i].colId = sortModel[i].colId.substr(multiColumnPrefix.length);
                }
            }
        }
    };
    SortListener.prototype.replaceAutoGroupColumnWithActualRowGroupColumns = function (sortModel) {
        // find index of auto group column in sort model
        var autoGroupSortModel = sortModel.find(function (sm) { return sm.colId == GROUP_AUTO_COLUMN_ID; });
        // replace auto column with individual group columns
        if (autoGroupSortModel) {
            // remove auto group column
            var autoGroupIndex = sortModel.indexOf(autoGroupSortModel);
            _.removeFromArray(sortModel, autoGroupSortModel);
            var isNotInSortModel = function (col) { return sortModel.filter(function (sm) { return sm.colId === col.getColId(); }).length == 0; };
            var mapColumnToSortModel = function (col) { return ({ colId: col.getId(), sort: autoGroupSortModel.sort }); };
            var newModels = this.columnModel.getRowGroupColumns()
                .filter(isNotInSortModel)
                .map(mapColumnToSortModel);
            _.insertArrayIntoArray(sortModel, newModels, autoGroupIndex);
        }
    };
    SortListener.prototype.onSortChanged = function () {
        var storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) {
            return;
        } // params is undefined if no datasource set
        var newSortModel = this.extractSortModel();
        var oldSortModel = storeParams.sortModel;
        var changedColumns = this.findChangedColumnsInSort(newSortModel, oldSortModel);
        var valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
        var secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);
        var params = {
            valueColChanged: valueColChanged,
            secondaryColChanged: secondaryColChanged,
            changedColumns: changedColumns
        };
        this.serverSideRowModel.refreshAfterSort(newSortModel, params);
    };
    // returns back all the cols that were effected by the sorting. eg if we were sorting by col A,
    // and now we are sorting by col B, the list of impacted cols should be A and B. so if a cache
    // is impacted by sorting on A or B then it needs to be refreshed. this includes where the cache
    // was previously sorted by A and then the A sort now needs to be cleared.
    SortListener.prototype.findChangedColumnsInSort = function (newSortModel, oldSortModel) {
        var allColsInBothSorts = [];
        [newSortModel, oldSortModel].forEach(function (sortModel) {
            if (sortModel) {
                var ids = sortModel.map(function (sm) { return sm.colId; });
                allColsInBothSorts = allColsInBothSorts.concat(ids);
            }
        });
        var differentSorts = function (oldSortItem, newSortItem) {
            var oldSort = oldSortItem ? oldSortItem.sort : null;
            var newSort = newSortItem ? newSortItem.sort : null;
            return oldSort !== newSort;
        };
        var differentIndexes = function (oldSortItem, newSortItem) {
            var oldIndex = oldSortItem ? oldSortModel.indexOf(oldSortItem) : -1;
            var newIndex = newSortItem ? newSortModel.indexOf(newSortItem) : -1;
            return oldIndex !== newIndex;
        };
        return allColsInBothSorts.filter(function (colId) {
            var oldSortItem = oldSortModel.find(function (sm) { return sm.colId === colId; });
            var newSortItem = newSortModel.find(function (sm) { return sm.colId === colId; });
            return differentSorts(oldSortItem, newSortItem) || differentIndexes(oldSortItem, newSortItem);
        });
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
    return SortListener;
}(BeanStub));
export { SortListener };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydExpc3RlbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3NlcnZlclNpZGVSb3dNb2RlbC9saXN0ZW5lcnMvc29ydExpc3RlbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUNULElBQUksRUFDSixRQUFRLEVBRVIsb0JBQW9CLEVBQ3BCLE1BQU0sRUFDTixhQUFhLEVBS2hCLE1BQU0seUJBQXlCLENBQUM7QUFLakM7SUFBa0MsZ0NBQVE7SUFBMUM7O0lBeUhBLENBQUM7SUFqSFcsb0NBQWEsR0FBckI7UUFDSSw4RkFBOEY7UUFDOUYsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFBRSxPQUFPO1NBQUU7UUFFdEUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDekcsQ0FBQztJQUVNLHVDQUFnQixHQUF2QjtRQUNJLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFckQsNkdBQTZHO1FBQzdHLDZGQUE2RjtRQUM3RixJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUN0QyxPQUFPLFNBQVMsQ0FBQztTQUNwQjtRQUVELHFGQUFxRjtRQUNyRixXQUFXO1FBQ1gsSUFBSSxDQUFDLCtDQUErQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVuRCxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBRU8seURBQWtDLEdBQTFDLFVBQTJDLFNBQTBC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