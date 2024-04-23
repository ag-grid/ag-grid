import { IServerSideStore, BeanStub, StoreRefreshAfterParams, RowNode, ColumnVO, RowNodeBlock } from "ag-grid-community";
import { SSRMParams } from "../serverSideRowModel";
export declare class StoreUtils extends BeanStub {
    private columnModel;
    private serverSideRowModel;
    private storeFactory;
    loadFromDatasource(p: {
        storeParams: SSRMParams;
        parentNode: RowNode;
        parentBlock: RowNodeBlock;
        success: () => void;
        fail: () => void;
        startRow?: number;
        endRow?: number;
    }): void;
    getChildStore(keys: string[], currentCache: IServerSideStore, findNodeFunc: (key: string) => RowNode | null): IServerSideStore | null;
    isServerRefreshNeeded(parentRowNode: RowNode, rowGroupCols: ColumnVO[], params: StoreRefreshAfterParams): boolean;
    getServerSideInitialRowCount(): number | null;
    private assertRowModelIsServerSide;
    private assertNotTreeData;
    isServerSideSortAllLevels(): boolean;
    isServerSideOnlyRefreshFilteredGroups(): boolean;
    isServerSideSortOnServer(): boolean;
    isServerSideFilterOnServer(): boolean;
}
