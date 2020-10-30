import { AgEvent } from "../events";
import { BeanStub } from "../context/beanStub";

export interface LoadCompleteEvent extends AgEvent {
    success: boolean;
    block: RowNodeBlock;
}

export interface LoadSuccessParams {
    rowData: any[];
    finalRowCount?: number;
    storeInfo?: any;
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

    protected pageLoadFailed() {
        this.state = RowNodeBlock.STATE_FAILED;
        const event: LoadCompleteEvent = {
            type: RowNodeBlock.EVENT_LOAD_COMPLETE,
            success: false,
            block: this
        };
        this.dispatchEvent(event);
    }

    protected success(version: number, params: LoadSuccessParams): void {
        this.successCommon(version, params);
    }

    protected pageLoaded(version: number, rows: any[], lastRow: number) {
        this.successCommon(version, {rowData: rows, finalRowCount: lastRow});
    }

    protected successCommon(version: number, params: LoadSuccessParams) {

        // we need to check the version, in case there was an old request
        // from the server that was sent before we refreshed the cache,
        // if the load was done as a result of a cache refresh
        if (version === this.version) {
            this.state = RowNodeBlock.STATE_LOADED;
            this.processServerResult(params);
        }

        // check here if lastRow should be set
        const event: LoadCompleteEvent = {
            type: RowNodeBlock.EVENT_LOAD_COMPLETE,
            success: true,
            block: this
        };

        this.dispatchEvent(event);
    }

}
