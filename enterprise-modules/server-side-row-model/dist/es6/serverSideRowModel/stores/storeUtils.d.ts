import { IServerSideStore, BeanStub, StoreRefreshAfterParams, RowNode, ColumnVO } from "@ag-grid-community/core";
import { SSRMParams } from "../serverSideRowModel";
export declare class StoreUtils extends BeanStub {
    private columnApi;
    private gridApi;
    createGroupKeys(groupNode: RowNode): string[];
    loadFromDatasource(p: {
        storeParams: SSRMParams;
        parentNode: RowNode;
        successCallback: () => void;
        failCallback: () => void;
        success: () => void;
        fail: () => void;
        startRow?: number;
        endRow?: number;
    }): void;
    getChildStore(keys: string[], currentCache: IServerSideStore, findNodeFunc: (key: string) => RowNode): IServerSideStore | null;
    isServerRefreshNeeded(parentRowNode: RowNode, rowGroupCols: ColumnVO[], params: StoreRefreshAfterParams): boolean;
}
