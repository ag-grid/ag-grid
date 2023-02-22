import {
    _,
    IServerSideStore,
    Autowired,
    Bean,
    BeanStub,
    ColumnApi,
    GridApi,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
    StoreRefreshAfterParams,
    RowNode,
    ColumnVO,
    RowNodeBlock,
    ColumnModel,
    GridOptions
} from "@ag-grid-community/core";
import { SSRMParams } from "../serverSideRowModel";

@Bean('ssrmStoreUtils')
export class StoreUtils extends BeanStub {

    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('gridApi') private gridApi: GridApi;

    public loadFromDatasource(p: {
        storeParams: SSRMParams,
        parentNode: RowNode,
        parentBlock: RowNodeBlock,
        successCallback: () => void,
        failCallback: () => void,
        success: () => void,
        fail: () => void,
        startRow?: number,
        endRow?: number}
    ): void {
        const { storeParams, parentBlock, parentNode } = p;
        const groupKeys = parentNode.getGroupKeys();

        if (!storeParams.datasource) { return; }

        const request: IServerSideGetRowsRequest = {
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

        const getRowsParams: IServerSideGetRowsParams = {
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

    public getChildStore(keys: string[], currentCache: IServerSideStore, findNodeFunc: (key: string) => RowNode): IServerSideStore | null {
        if (_.missingOrEmpty(keys)) { return currentCache; }

        const nextKey = keys[0];
        const nextNode = findNodeFunc(nextKey);

        if (nextNode) {
            const keyListForNextLevel = keys.slice(1, keys.length);
            const nextStore = nextNode.childStore;
            return nextStore ? nextStore.getChildStore(keyListForNextLevel) : null;
        }

        return null;
    }

    public isServerRefreshNeeded(parentRowNode: RowNode, rowGroupCols: ColumnVO[], params: StoreRefreshAfterParams): boolean {
        if (params.valueColChanged || params.secondaryColChanged) {
            return true;
        }

        const level = parentRowNode.level + 1;
        const grouping = level < rowGroupCols.length;
        const leafNodes = !grouping;

        if (leafNodes) { return true; }

        const colIdThisGroup = rowGroupCols[level].id;
        const actionOnThisGroup = params.changedColumns.indexOf(colIdThisGroup) > -1;

        if (actionOnThisGroup) { return true; }

        const allCols = this.columnModel.getAllGridColumns();
        const affectedGroupCols = allCols
            // find all impacted cols which also a group display column
            .filter(col => col.getColDef().showRowGroup && params.changedColumns.includes(col.getId()))
            .map(col => col.getColDef().showRowGroup)
            // if displaying all groups, or displaying the effected col for this group, refresh
            .some(group => group === true || group === colIdThisGroup);

        return affectedGroupCols;
    }

    public getServerSideInitialRowCount(): number {
        const rowCount = this.gridOptionsService.getNum('serverSideInitialRowCount');
        if (typeof rowCount === 'number' && rowCount > 0) {
            return rowCount;
        }
        return 1;
    }

    private assertRowModelIsServerSide(key: keyof GridOptions) {
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            _.doOnce(() => console.warn(`AG Grid: The '${key}' property can only be used with the Server Side Row Model.`), key);
            return false;
        }
        return true;
    }
    private assertNotTreeData(key: keyof GridOptions) {
        if (this.gridOptionsService.is('treeData')) {
            _.doOnce(() => console.warn(`AG Grid: The '${key}' property cannot be used while using tree data.`), key + '_TreeData');
            return false;
        }
        return true;
    }

    public isServerSideSortAllLevels() {
        return this.gridOptionsService.is('serverSideSortAllLevels') && this.assertRowModelIsServerSide('serverSideSortAllLevels');
    }
    public isServerSideFilterAllLevels() {
        return this.gridOptionsService.is('serverSideFilterAllLevels') && this.assertRowModelIsServerSide('serverSideFilterAllLevels');
    }
    public isServerSideSortOnServer() {
        return this.gridOptionsService.is('serverSideSortOnServer') && this.assertRowModelIsServerSide('serverSideSortOnServer') && this.assertNotTreeData('serverSideSortOnServer');
    }
    public isServerSideFilterOnServer() {
        return this.gridOptionsService.is('serverSideFilterOnServer') && this.assertRowModelIsServerSide('serverSideFilterOnServer') && this.assertNotTreeData('serverSideFilterOnServer');
    }

}