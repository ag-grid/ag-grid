import type { BeanCollection, IServerSideStore, NamedBean, RowNode } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import type { SSRMParams } from '../serverSideRowModel';
export declare class StoreFactory extends BeanStub implements NamedBean {
    beanName: "ssrmStoreFactory";
    private columnModel;
    private funcColsService;
    wireBeans(beans: BeanCollection): void;
    createStore(ssrmParams: SSRMParams, parentNode: RowNode): IServerSideStore;
    private getStoreParams;
    private getMaxBlocksInCache;
    private getBlockSize;
    private getLevelSpecificParams;
    private isInfiniteScroll;
    private isSuppressServerSideInfiniteScroll;
}
