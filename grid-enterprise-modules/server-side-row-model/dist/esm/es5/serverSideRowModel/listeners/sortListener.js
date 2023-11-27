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
import { Autowired, Bean, BeanStub, Events, PostConstruct } from "@ag-grid-community/core";
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
    SortListener.prototype.onSortChanged = function () {
        var storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) {
            return;
        } // params is undefined if no datasource set
        var newSortModel = this.sortController.getSortModel();
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
