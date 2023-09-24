import { IServerSideStore, BeanStub, StoreRefreshAfterParams, RowNode, ColumnVO, RowNodeBlock } from "@ag-grid-community/core";
import { SSRMParams } from "../serverSideRowModel";
export declare class StoreUtils extends BeanStub {
    private columnApi;
    private columnModel;
    private gridApi;
    private serverSideRowModel;
    private storeFactory;
    loadFromDatasource(p: {
        storeParams: SSRMParams;
        parentNode: RowNode;
        parentBlock: RowNodeBlock;
        successCallback: () => void;
        failCallback: () => void;
        success: () => void;
        fail: () => void;
        startRow?: number;
        endRow?: number;
    }): void;
    getChildStore(keys: string[], currentCache: IServerSideStore, findNodeFunc: (key: string) => RowNode | null): IServerSideStore | null;
    isServerRefreshNeeded(parentRowNode: RowNode, rowGroupCols: ColumnVO[], params: StoreRefreshAfterParams): boolean;
    getServerSideInitialRowCount(): number;
    private assertRowModelIsServerSide;
    private assertNotTreeData;
    isServerSideSortAllLevels(): boolean;
    isServerSideOnlyRefreshFilteredGroups(): boolean;
    isServerSideSortOnServer(): boolean;
    isServerSideFilterOnServer(): boolean;
}
