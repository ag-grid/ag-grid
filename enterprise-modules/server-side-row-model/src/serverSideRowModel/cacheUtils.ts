import {
    _,
    IServerSideChildStore,
    Autowired,
    Bean,
    BeanStub,
    ColumnApi,
    GridApi,
    GridOptionsWrapper,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
    PostConstruct,
    RowNode
} from "@ag-grid-community/core";
import {ChildStoreParams} from "./serverSideRowModel";

@Bean('ssrmCacheUtils')
export class CacheUtils extends BeanStub {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    @PostConstruct
    private postConstruct(): void {
    }

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
        cacheParams: ChildStoreParams,
        parentNode: RowNode,
        successCallback: ()=>void,
        failCallback: ()=>void,
        startRow?: number,
        endRow?: number}
    ): void {
        const groupKeys = this.createGroupKeys(p.parentNode);
        const {cacheParams} = p;

        if (!cacheParams.datasource) { return; }

        const request: IServerSideGetRowsRequest = {
            startRow: p.startRow,
            endRow: p.endRow,
            rowGroupCols: cacheParams.rowGroupCols,
            valueCols: cacheParams.valueCols,
            pivotCols: cacheParams.pivotCols,
            pivotMode: cacheParams.pivotMode,
            groupKeys: groupKeys,
            filterModel: cacheParams.filterModel,
            sortModel: cacheParams.sortModel
        };

        const getRowsParams = {
            successCallback: p.successCallback,
            failCallback: p.failCallback,
            request: request,
            parentNode: p.parentNode,
            api: this.gridApi,
            columnApi: this.columnApi
        } as IServerSideGetRowsParams;

        window.setTimeout(() => {
            if (cacheParams.datasource) {
                cacheParams.datasource.getRows(getRowsParams);
            }
        }, 0);
    }

    public createLoadParams(p: {
                                cacheParams: ChildStoreParams,
                                parentNode: RowNode,
                                successCallback: ()=>void,
                                failCallback: ()=>void,
                                startRow?: number,
                                endRow?: number}
                                ): IServerSideGetRowsParams {

        const groupKeys = this.createGroupKeys(p.parentNode);
        const {cacheParams} = p;

        const request: IServerSideGetRowsRequest = {
            startRow: p.startRow,
            endRow: p.endRow,
            rowGroupCols: cacheParams.rowGroupCols,
            valueCols: cacheParams.valueCols,
            pivotCols: cacheParams.pivotCols,
            pivotMode: cacheParams.pivotMode,
            groupKeys: groupKeys,
            filterModel: cacheParams.filterModel,
            sortModel: cacheParams.sortModel
        };

        const res = {
            successCallback: p.successCallback,
            failCallback: p.failCallback,
            request: request,
            parentNode: p.parentNode,
            api: this.gridApi,
            columnApi: this.columnApi
        } as IServerSideGetRowsParams;

        return res;
    }

    public getChildCache(keys: string[], currentCache: IServerSideChildStore, findNodeFunc: (key: string)=>RowNode ): IServerSideChildStore {
        if (_.missingOrEmpty(keys)) {
            return currentCache;
        }

        const nextKey = keys[0];
        const nextNode = findNodeFunc(nextKey);

        if (nextNode) {
            const keyListForNextLevel = keys.slice(1, keys.length);
            const nextCache = nextNode.childrenCache as IServerSideChildStore;
            return nextCache ? nextCache.getChildCache(keyListForNextLevel) : null;
        } else {
            return null;
        }
    }

    public shouldPurgeCacheAfterSort(params: {
                                        changedColumnsInSort: string[],
                                        rowGroupColIds: string[],
                                        parentRowNode: RowNode,
                                        storeParams: ChildStoreParams}): boolean {
        const {changedColumnsInSort, rowGroupColIds, parentRowNode, storeParams} = params;

        const level = parentRowNode.level + 1;
        const grouping = level < storeParams.rowGroupCols.length;

        if (grouping) {
            const groupColVo = storeParams.rowGroupCols[level];
            const rowGroupBlock = rowGroupColIds.indexOf(groupColVo.id) > -1;
            const sortingByGroup = changedColumnsInSort.indexOf(groupColVo.id) > -1;

            return rowGroupBlock && sortingByGroup;
        } else {
            return true;
        }
    }
}