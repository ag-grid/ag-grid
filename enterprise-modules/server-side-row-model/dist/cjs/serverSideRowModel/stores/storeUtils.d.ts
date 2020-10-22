import { IServerSideStore, BeanStub, RowNode } from "@ag-grid-community/core";
import { SSRMParams } from "../serverSideRowModel";
export declare class StoreUtils extends BeanStub {
    private gridOptionsWrapper;
    private columnApi;
    private gridApi;
    private createGroupKeys;
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
}
