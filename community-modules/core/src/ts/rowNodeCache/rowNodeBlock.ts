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
     * @deprecated use groupLevelInfo instead
     */
    storeInfo?: any;
    /**
     * Any extra information for the grid to associate with this load.
     */
    groupLevelInfo?: any;
}

export abstract class RowNodeBlock extends BeanStub {

    public static EVENT_LOAD_COMPLETE = 'loadComplete';

    public static STATE_WAITING_TO_LOAD = 'needsLoading';
    public static STATE_LOADING = 'loading';
    public static STATE_LOADED = 'loaded';
    public static STATE_FAILED = 'failed';

    private readonly id: number;

    private state = RowNodeBlock.STATE_WAITING_TO_LOAD;

    private version = 0;

    public abstract getBlockStateJson(): { id: string, state: any };

    protected abstract loadFromDatasource(): void;

    protected abstract processServerResult(params: LoadSuccessParams): void;

    protected abstract processServerFail(): void;

    protected constructor(id: number) {
        super();
        this.id = id;
    }

    public getId(): number {
        return this.id;
    }

    public load(): void {
        this.state = RowNodeBlock.STATE_LOADING;
        this.loadFromDatasource();
    }

    public getVersion(): number {
        return this.version;
    }

    public setStateWaitingToLoad(): void {
        // in case any current loads in progress, this will have their results ignored
        this.version++;
        this.state = RowNodeBlock.STATE_WAITING_TO_LOAD;
    }

    public getState(): string {
        return this.state;
    }

    protected pageLoadFailed(version: number) {
        const requestMostRecentAndLive = this.isRequestMostRecentAndLive(version);
        if (requestMostRecentAndLive) {
            this.state = RowNodeBlock.STATE_FAILED;
            this.processServerFail();
        }

        this.dispatchLoadCompleted(false);
    }

    protected success(version: number, params: LoadSuccessParams): void {
        this.successCommon(version, params);
    }

    protected pageLoaded(version: number, rows: any[], lastRow: number) {
        this.successCommon(version, { rowData: rows, rowCount: lastRow });
    }

    private isRequestMostRecentAndLive(version: number): boolean {
        // thisIsMostRecentRequest - if block was refreshed, then another request
        // could of been sent after this one.
        const thisIsMostRecentRequest = version === this.version;

        // weAreNotDestroyed - if InfiniteStore is purged, then blocks are destroyed
        // and new blocks created. so data loads of old blocks are discarded.
        const weAreNotDestroyed = this.isAlive();

        return thisIsMostRecentRequest && weAreNotDestroyed;
    }

    protected successCommon(version: number, params: LoadSuccessParams) {

        // need to dispatch load complete before processing the data, as PaginationComp checks
        // RowNodeBlockLoader to see if it is still loading, so the RowNodeBlockLoader needs to
        // be updated first (via LoadComplete event) before PaginationComp updates (via processServerResult method)
        this.dispatchLoadCompleted();

        const requestMostRecentAndLive = this.isRequestMostRecentAndLive(version);

        if (requestMostRecentAndLive) {
            this.state = RowNodeBlock.STATE_LOADED;
            this.processServerResult(params);
        }
    }

    private dispatchLoadCompleted(success = true) {
        // we fire event regardless of processing data or now, as we want
        // the concurrentLoadRequests count to be reduced in BlockLoader
        const event: LoadCompleteEvent = {
            type: RowNodeBlock.EVENT_LOAD_COMPLETE,
            success: success,
            block: this
        };

        this.dispatchEvent(event);
    }
}
