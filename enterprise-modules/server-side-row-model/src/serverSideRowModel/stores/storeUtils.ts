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
    RowNodeBlock
} from "@ag-grid-community/core";
import { SSRMParams } from "../serverSideRowModel";

@Bean('ssrmStoreUtils')
export class StoreUtils extends BeanStub {

    @Autowired('columnApi') private columnApi: ColumnApi;
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
            context : this.gridOptionsWrapper.getContext()
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

        return false;
    }

}