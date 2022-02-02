var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub } from "@ag-grid-community/core";
let StoreUtils = class StoreUtils extends BeanStub {
    createGroupKeys(groupNode) {
        const keys = [];
        let pointer = groupNode;
        while (pointer && pointer.level >= 0) {
            keys.push(pointer.key);
            pointer = pointer.parent;
        }
        keys.reverse();
        return keys;
    }
    loadFromDatasource(p) {
        const groupKeys = this.createGroupKeys(p.parentNode);
        const { storeParams } = p;
        if (!storeParams.datasource) {
            return;
        }
        const request = {
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
        const getRowsParams = {
            successCallback: p.successCallback,
            success: p.success,
            failCallback: p.failCallback,
            fail: p.fail,
            request: request,
            parentNode: p.parentNode,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        window.setTimeout(() => {
            if (storeParams.datasource) {
                storeParams.datasource.getRows(getRowsParams);
            }
        }, 0);
    }
    getChildStore(keys, currentCache, findNodeFunc) {
        if (_.missingOrEmpty(keys)) {
            return currentCache;
        }
        const nextKey = keys[0];
        const nextNode = findNodeFunc(nextKey);
        if (nextNode) {
            const keyListForNextLevel = keys.slice(1, keys.length);
            const nextStore = nextNode.childStore;
            return nextStore ? nextStore.getChildStore(keyListForNextLevel) : null;
        }
        return null;
    }
    isServerRefreshNeeded(parentRowNode, rowGroupCols, params) {
        if (params.alwaysReset || params.valueColChanged || params.secondaryColChanged) {
            return true;
        }
        const level = parentRowNode.level + 1;
        const grouping = level < rowGroupCols.length;
        const leafNodes = !grouping;
        if (leafNodes) {
            return true;
        }
        const colIdThisGroup = rowGroupCols[level].id;
        const actionOnThisGroup = params.changedColumns.indexOf(colIdThisGroup) > -1;
        if (actionOnThisGroup) {
            return true;
        }
        return false;
    }
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
export { StoreUtils };
//# sourceMappingURL=storeUtils.js.map