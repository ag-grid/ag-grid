import { AgEvent } from "../events";
import { BeanStub } from "../context/beanStub";
export interface LoadCompleteEvent extends AgEvent {
    success: boolean;
    block: RowNodeBlock;
}
export interface LoadSuccessParams {
    /**
     * Data retrieved from the server as requested by the grid.
     */
    rowData: any[];
    /**
     * The last row, if known, to help Infinite Scroll.
     */
    rowCount?: number;
    /**
     * Any extra information for the grid to associate with this load.
     */
    groupLevelInfo?: any;
    /**
     * The pivot fields in the response - if provided the grid will attempt to generate secondary columns.
     */
    pivotResultFields?: string[];
}
export declare abstract class RowNodeBlock extends BeanStub {
    static EVENT_LOAD_COMPLETE: string;
    static STATE_WAITING_TO_LOAD: string;
    static STATE_LOADING: string;
    static STATE_LOADED: string;
    static STATE_FAILED: string;
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
    getState(): string;
    protected pageLoadFailed(version: number): void;
    protected success(version: number, params: LoadSuccessParams): void;
    protected pageLoaded(version: number, rows: any[], lastRow: number): void;
    private isRequestMostRecentAndLive;
    protected successCommon(version: number, params: LoadSuccessParams): void;
    private dispatchLoadCompleted;
}
