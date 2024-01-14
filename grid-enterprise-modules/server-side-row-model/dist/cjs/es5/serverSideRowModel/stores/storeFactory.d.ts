import { IServerSideStore, RowNode } from "@ag-grid-community/core";
import { SSRMParams } from "../serverSideRowModel";
export declare class StoreFactory {
    private gridOptionsService;
    private columnModel;
    createStore(ssrmParams: SSRMParams, parentNode: RowNode): IServerSideStore;
    private getStoreParams;
    private getMaxBlocksInCache;
    private getBlockSize;
    private getLevelSpecificParams;
    private isInfiniteScroll;
    private isSuppressServerSideInfiniteScroll;
}
