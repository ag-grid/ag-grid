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
import { _, Autowired, Bean, BeanStub } from "@ag-grid-community/core";
var StoreUtils = /** @class */ (function (_super) {
    __extends(StoreUtils, _super);
    function StoreUtils() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StoreUtils.prototype.loadFromDatasource = function (p) {
        var storeParams = p.storeParams, parentBlock = p.parentBlock, parentNode = p.parentNode;
        var groupKeys = parentNode.getGroupKeys();
        if (!storeParams.datasource) {
            return;
        }
        var request = {
            startRow: p.startRow,
            endRow: p.endRow,
            rowGroupCols: storeParams.rowGroupCols,
            valueCols: storeParams.valueCols,
            pivotCols: storeParams.pivotCols,
            pivotMode: storeParams.pivotMode,
            groupKeys: groupKeys,
            filterModel: storeParams.filterModel,
            sortModel: storeParams.sortModel
        };
        var getRowsParams = {
            successCallback: p.successCallback,
            success: p.success,
            failCallback: p.failCallback,
            fail: p.fail,
            request: request,
            parentNode: p.parentNode,
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.context
        };
        window.setTimeout(function () {
            if (!storeParams.datasource || !parentBlock.isAlive()) {
                // failCallback() is important, to reduce the 'RowNodeBlockLoader.activeBlockLoadsCount' count
                p.failCallback();
                return;
            }
            storeParams.datasource.getRows(getRowsParams);
        }, 0);
    };
    StoreUtils.prototype.getChildStore = function (keys, currentCache, findNodeFunc) {
        if (_.missingOrEmpty(keys)) {
            return currentCache;
        }
        var nextKey = keys[0];
        var nextNode = findNodeFunc(nextKey);
        if (nextNode) {
            var keyListForNextLevel = keys.slice(1, keys.length);
            var nextStore = nextNode.childStore;
            return nextStore ? nextStore.getChildStore(keyListForNextLevel) : null;
        }
        return null;
    };
    StoreUtils.prototype.isServerRefreshNeeded = function (parentRowNode, rowGroupCols, params) {
        if (params.valueColChanged || params.secondaryColChanged) {
            return true;
        }
        var level = parentRowNode.level + 1;
        var grouping = level < rowGroupCols.length;
        var leafNodes = !grouping;
        if (leafNodes) {
            return true;
        }
        var colIdThisGroup = rowGroupCols[level].id;
        var actionOnThisGroup = params.changedColumns.indexOf(colIdThisGroup) > -1;
        if (actionOnThisGroup) {
            return true;
        }
        var allCols = this.columnModel.getAllGridColumns();
        var affectedGroupCols = allCols
            // find all impacted cols which also a group display column
            .filter(function (col) { return col.getColDef().showRowGroup && params.changedColumns.includes(col.getId()); })
            .map(function (col) { return col.getColDef().showRowGroup; })
            // if displaying all groups, or displaying the effected col for this group, refresh
            .some(function (group) { return group === true || group === colIdThisGroup; });
        return affectedGroupCols;
    };
    StoreUtils.prototype.getServerSideInitialRowCount = function () {
        var rowCount = this.gridOptionsService.getNum('serverSideInitialRowCount');
        if (typeof rowCount === 'number' && rowCount > 0) {
            return rowCount;
        }
        return 1;
    };
    StoreUtils.prototype.assertRowModelIsServerSide = function (key) {
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            _.doOnce(function () { return console.warn("AG Grid: The '" + key + "' property can only be used with the Server Side Row Model."); }, key);
            return false;
        }
        return true;
    };
    StoreUtils.prototype.assertNotTreeData = function (key) {
        if (this.gridOptionsService.is('treeData')) {
            _.doOnce(function () { return console.warn("AG Grid: The '" + key + "' property cannot be used while using tree data."); }, key + '_TreeData');
            return false;
        }
        return true;
    };
    StoreUtils.prototype.isServerSideSortAllLevels = function () {
        return this.gridOptionsService.is('serverSideSortAllLevels') && this.assertRowModelIsServerSide('serverSideSortAllLevels');
    };
    StoreUtils.prototype.isServerSideOnlyRefreshFilteredGroups = function () {
        return this.gridOptionsService.is('serverSideOnlyRefreshFilteredGroups') && this.assertRowModelIsServerSide('serverSideOnlyRefreshFilteredGroups');
    };
    StoreUtils.prototype.isServerSideSortOnServer = function () {
        return this.gridOptionsService.is('serverSideSortOnServer') && this.assertRowModelIsServerSide('serverSideSortOnServer') && this.assertNotTreeData('serverSideSortOnServer');
    };
    StoreUtils.prototype.isServerSideFilterOnServer = function () {
        return this.gridOptionsService.is('serverSideFilterOnServer') && this.assertRowModelIsServerSide('serverSideFilterOnServer') && this.assertNotTreeData('serverSideFilterOnServer');
    };
    __decorate([
        Autowired('columnApi')
    ], StoreUtils.prototype, "columnApi", void 0);
    __decorate([
        Autowired('columnModel')
    ], StoreUtils.prototype, "columnModel", void 0);
    __decorate([
        Autowired('gridApi')
    ], StoreUtils.prototype, "gridApi", void 0);
    StoreUtils = __decorate([
        Bean('ssrmStoreUtils')
    ], StoreUtils);
    return StoreUtils;
}(BeanStub));
export { StoreUtils };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmVVdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zZXJ2ZXJTaWRlUm93TW9kZWwvc3RvcmVzL3N0b3JlVXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFFRCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFXWCxNQUFNLHlCQUF5QixDQUFDO0FBSWpDO0lBQWdDLDhCQUFRO0lBQXhDOztJQXNJQSxDQUFDO0lBaElVLHVDQUFrQixHQUF6QixVQUEwQixDQVNOO1FBRVIsSUFBQSxXQUFXLEdBQThCLENBQUMsWUFBL0IsRUFBRSxXQUFXLEdBQWlCLENBQUMsWUFBbEIsRUFBRSxVQUFVLEdBQUssQ0FBQyxXQUFOLENBQU87UUFDbkQsSUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRTVDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFO1lBQUUsT0FBTztTQUFFO1FBRXhDLElBQU0sT0FBTyxHQUE4QjtZQUN2QyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVE7WUFDcEIsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO1lBQ2hCLFlBQVksRUFBRSxXQUFXLENBQUMsWUFBWTtZQUN0QyxTQUFTLEVBQUUsV0FBVyxDQUFDLFNBQVM7WUFDaEMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQUFTO1lBQ2hDLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUztZQUNoQyxTQUFTLEVBQUUsU0FBUztZQUNwQixXQUFXLEVBQUUsV0FBVyxDQUFDLFdBQVc7WUFDcEMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQUFTO1NBQ25DLENBQUM7UUFFRixJQUFNLGFBQWEsR0FBNkI7WUFDNUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxlQUFlO1lBQ2xDLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTztZQUNsQixZQUFZLEVBQUUsQ0FBQyxD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