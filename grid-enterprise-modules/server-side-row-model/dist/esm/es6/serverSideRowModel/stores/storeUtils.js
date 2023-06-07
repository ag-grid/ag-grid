var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub } from "@ag-grid-community/core";
let StoreUtils = class StoreUtils extends BeanStub {
    loadFromDatasource(p) {
        const { storeParams, parentBlock, parentNode } = p;
        const groupKeys = parentNode.getGroupKeys();
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
            columnApi: this.columnApi,
            context: this.gridOptionsService.context
        };
        window.setTimeout(() => {
            if (!storeParams.datasource || !parentBlock.isAlive()) {
                // failCallback() is important, to reduce the 'RowNodeBlockLoader.activeBlockLoadsCount' count
                p.failCallback();
                return;
            }
            storeParams.datasource.getRows(getRowsParams);
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
        if (params.valueColChanged || params.secondaryColChanged) {
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
        const allCols = this.columnModel.getAllGridColumns();
        const affectedGroupCols = allCols
            // find all impacted cols which also a group display column
            .filter(col => col.getColDef().showRowGroup && params.changedColumns.includes(col.getId()))
            .map(col => col.getColDef().showRowGroup)
            // if displaying all groups, or displaying the effected col for this group, refresh
            .some(group => group === true || group === colIdThisGroup);
        return affectedGroupCols;
    }
    getServerSideInitialRowCount() {
        const rowCount = this.gridOptionsService.getNum('serverSideInitialRowCount');
        if (typeof rowCount === 'number' && rowCount > 0) {
            return rowCount;
        }
        return 1;
    }
    assertRowModelIsServerSide(key) {
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            _.doOnce(() => console.warn(`AG Grid: The '${key}' property can only be used with the Server Side Row Model.`), key);
            return false;
        }
        return true;
    }
    assertNotTreeData(key) {
        if (this.gridOptionsService.is('treeData')) {
            _.doOnce(() => console.warn(`AG Grid: The '${key}' property cannot be used while using tree data.`), key + '_TreeData');
            return false;
        }
        return true;
    }
    isServerSideSortAllLevels() {
        return this.gridOptionsService.is('serverSideSortAllLevels') && this.assertRowModelIsServerSide('serverSideSortAllLevels');
    }
    isServerSideOnlyRefreshFilteredGroups() {
        return this.gridOptionsService.is('serverSideOnlyRefreshFilteredGroups') && this.assertRowModelIsServerSide('serverSideOnlyRefreshFilteredGroups');
    }
    isServerSideSortOnServer() {
        return this.gridOptionsService.is('serverSideSortOnServer') && this.assertRowModelIsServerSide('serverSideSortOnServer') && this.assertNotTreeData('serverSideSortOnServer');
    }
    isServerSideFilterOnServer() {
        return this.gridOptionsService.is('serverSideFilterOnServer') && this.assertRowModelIsServerSide('serverSideFilterOnServer') && this.assertNotTreeData('serverSideFilterOnServer');
    }
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
export { StoreUtils };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmVVdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zZXJ2ZXJTaWRlUm93TW9kZWwvc3RvcmVzL3N0b3JlVXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFFRCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFXWCxNQUFNLHlCQUF5QixDQUFDO0FBSWpDLElBQWEsVUFBVSxHQUF2QixNQUFhLFVBQVcsU0FBUSxRQUFRO0lBTTdCLGtCQUFrQixDQUFDLENBU047UUFFaEIsTUFBTSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ25ELE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUU1QyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRTtZQUFFLE9BQU87U0FBRTtRQUV4QyxNQUFNLE9BQU8sR0FBOEI7WUFDdkMsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRO1lBQ3BCLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTTtZQUNoQixZQUFZLEVBQUUsV0FBVyxDQUFDLFlBQVk7WUFDdEMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQUFTO1lBQ2hDLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUztZQUNoQyxTQUFTLEVBQUUsV0FBVyxDQUFDLFNBQVM7WUFDaEMsU0FBUyxFQUFFLFNBQVM7WUFDcEIsV0FBVyxFQUFFLFdBQVcsQ0FBQyxXQUFXO1lBQ3BDLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUztTQUNuQyxDQUFDO1FBRUYsTUFBTSxhQUFhLEdBQTZCO1lBQzVDLGVBQWUsRUFBRSxDQUFDLENBQUMsZUFBZTtZQUNsQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU87WUFDbEIsWUFBWSxFQUFFLENBQUMsQ0FBQyxZQUFZO1lBQzVCLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtZQUNa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