import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { RowNodeBlock } from './rowNodeBlock';
export type RowNodeBlockLoaderEvent = 'blockLoaded' | 'blockLoaderFinished';
export declare class RowNodeBlockLoader extends BeanStub<RowNodeBlockLoaderEvent> implements NamedBean {
    beanName: "rowNodeBlockLoader";
    private rowModel;
    wireBeans(beans: BeanCollection): void;
    private maxConcurrentRequests;
    private checkBlockToLoadDebounce;
    private activeBlockLoadsCount;
    private blocks;
    private active;
    postConstruct(): void;
    private getMaxConcurrentDatasourceRequests;
    addBlock(block: RowNodeBlock): void;
    removeBlock(block: RowNodeBlock): void;
    destroy(): void;
    loadComplete(): void;
    checkBlockToLoad(): void;
    private performCheckBlocksToLoad;
    getBlockState(): void | {
        [key: string]: any;
    };
    private printCacheStatus;
    isLoading(): boolean;
    registerLoads(count: number): void;
    getAvailableLoadingCount(): number | undefined;
}
