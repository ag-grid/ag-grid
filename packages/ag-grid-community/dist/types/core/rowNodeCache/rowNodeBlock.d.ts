import { BeanStub } from '../context/beanStub';
import type { LoadSuccessParams } from './iRowNodeBlock';
type RowNodeBlockState = 'needsLoading' | 'loading' | 'loaded' | 'failed';
export type RowNodeBlockEvent = 'loadComplete';
export declare abstract class RowNodeBlock extends BeanStub<RowNodeBlockEvent> {
    private readonly id;
    private state;
    private version;
    abstract getBlockStateJson(): {
        id: string;
        state: any;
    };
    protected abstract loadFromDatasource(): void;
    protected abstract processServerResult(params: LoadSuccessParams): void;
    protected abstract processServerFail(): void;
    protected constructor(id: number);
    getId(): number;
    load(): void;
    getVersion(): number;
    setStateWaitingToLoad(): void;
    getState(): RowNodeBlockState;
    protected pageLoadFailed(version: number): void;
    protected success(version: number, params: LoadSuccessParams): void;
    protected pageLoaded(version: number, rows: any[], lastRow: number): void;
    private isRequestMostRecentAndLive;
    protected successCommon(version: number, params: LoadSuccessParams): void;
    private dispatchLoadCompleted;
}
export {};
