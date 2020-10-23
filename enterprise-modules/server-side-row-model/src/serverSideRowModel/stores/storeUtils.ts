import {
    _,
    IServerSideStore,
    Autowired,
    Bean,
    BeanStub,
    ColumnApi,
    GridApi,
    GridOptionsWrapper,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
    RowNode
} from "@ag-grid-community/core";
import { SSRMParams } from "../serverSideRowModel";

@Bean('ssrmCacheUtils')
export class StoreUtils extends BeanStub {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    private createGroupKeys(groupNode: RowNode): string[] {
        const keys: string[] = [];

        let pointer: RowNode | null = groupNode;
        while (pointer && pointer.level >= 0) {
            keys.push(pointer.key);
            pointer = pointer.parent;
        }

        keys.reverse();

        return keys;
    }

    public loadFromDatasource(p: {
        storeParams: SSRMParams,
        parentNode: RowNode,
        successCallback: () => void,
        failCallback: () => void,
        success: () => void,
        fail: () => void,
        startRow?: number,
        endRow?: number}
    ): void {
        const groupKeys = this.createGroupKeys(p.parentNode);
        const {storeParams} = p;

        if (!storeParams.datasource) { return; }

        const request: IServerSideGetRowsRequest = {
            startRow: p.startRow!,
            endRow: p.endRow!,
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
        } as IServerSideGetRowsParams;

        window.setTimeout(() => {
            if (storeParams.datasource) {
                storeParams.datasource.getRows(getRowsParams);
            }
        }, 0);
    }

    public getChildStore(keys: string[], currentCache: IServerSideStore, findNodeFunc: (key: string) => RowNode): IServerSideStore | null {
        if (_.missingOrEmpty(keys)) { return currentCache; }

        const nextKey = keys[0];
        const nextNode = findNodeFunc(nextKey);

        if (nextNode) {
            const keyListForNextLevel = keys.slice(1, keys.length);
            const nextStore = nextNode.childrenCache;
            return nextStore ? nextStore.getChildStore(keyListForNextLevel) : null;
        }

        return null;
    }

}