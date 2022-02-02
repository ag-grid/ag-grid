var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
    StoreUtils.prototype.createGroupKeys = function (groupNode) {
        var keys = [];
        var pointer = groupNode;
        while (pointer && pointer.level >= 0) {
            keys.push(pointer.key);
            pointer = pointer.parent;
        }
        keys.reverse();
        return keys;
    };
    StoreUtils.prototype.loadFromDatasource = function (p) {
        var groupKeys = this.createGroupKeys(p.parentNode);
        var storeParams = p.storeParams;
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
            columnApi: this.columnApi
        };
        window.setTimeout(function () {
            if (storeParams.datasource) {
                storeParams.datasource.getRows(getRowsParams);
            }
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
        if (params.alwaysReset || params.valueColChanged || params.secondaryColChanged) {
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
        return false;
    };
    __decorate([
        Autowired('columnApi')
    ], StoreUtils.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridApi')
    ], StoreUtils.prototype, "gridApi", void 0);
    StoreUtils = __decorate([
        Bean('ssrmCacheUtils')
    ], StoreUtils);
    return StoreUtils;
}(BeanStub));
export { StoreUtils };
//# sourceMappingURL=storeUtils.js.map