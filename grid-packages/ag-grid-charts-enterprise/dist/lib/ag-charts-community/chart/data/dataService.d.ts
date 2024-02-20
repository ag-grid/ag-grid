import { Listeners } from '../../util/listeners';
import type { AnimationManager } from '../interaction/animationManager';
interface DataSourceCallbackParams {
    windowStart?: Date;
    windowEnd?: Date;
}
type DataSourceCallback = (params: DataSourceCallbackParams) => Promise<unknown>;
type EventType = 'data-source-change' | 'data-load' | 'data-error';
type EventHandler<D extends object> = (() => void) | ((event: DataLoadEvent<D>) => void);
export interface DataLoadEvent<D extends object> {
    type: 'data-load';
    data: D[];
}
export interface DataErrorEvent {
    type: 'data-error';
}
export declare class DataService<D extends object> extends Listeners<EventType, EventHandler<D>> {
    private readonly animationManager;
    dispatchOnlyLatest: boolean;
    dispatchThrottle: number;
    requestThrottle: number;
    private dataSourceCallback?;
    private isLoadingInitialData;
    private freshRequests;
    private requestCounter;
    private readonly debug;
    private throttledFetch;
    private throttledDispatch;
    constructor(animationManager: AnimationManager);
    updateCallback(dataSourceCallback: DataSourceCallback): void;
    clearCallback(): void;
    load(params: DataSourceCallbackParams): void;
    isLazy(): boolean;
    isLoading(): boolean;
    private createThrottledFetch;
    private createThrottledDispatch;
    private fetch;
}
export {};
