import type { BeanCollection, ColumnVO, IServerSideStore, NamedBean, RowNode, RowNodeBlock, StoreRefreshAfterParams } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import type { SSRMParams } from '../serverSideRowModel';
export declare class StoreUtils extends BeanStub implements NamedBean {
    beanName: "ssrmStoreUtils";
    private columnModel;
    private serverSideRowModel;
    private storeFactory;
    wireBeans(beans: BeanCollection): void;
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
