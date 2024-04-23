import { IServerSideStore, RowNode } from "ag-grid-community";
import { SSRMParams } from "../serverSideRowModel";
export declare class StoreFactory {
    private gos;
    private columnModel;
    createStore(ssrmParams: SSRMParams, parentNode: RowNode): IServerSideStore;
    private getStoreParams;
    private getMaxBlocksInCache;
    private getBlockSize;
    private getLevelSpecificParams;
    private isInfiniteScroll;
    private isSuppressServerSideInfiniteScroll;
}
