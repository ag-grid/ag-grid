import {BeanStub} from "../../context/beanStub";
import {AgEvent} from "../../events";
import {_} from "../../utils";

export interface LoadCompleteEvent extends AgEvent {
    success: boolean;
    page: RowNodeBlock;
    lastRow: number;
}

export abstract class RowNodeBlock extends BeanStub {

    public static EVENT_LOAD_COMPLETE = 'loadComplete';

    public static STATE_DIRTY = 'dirty';
    public static STATE_LOADING = 'loading';
    public static STATE_LOADED = 'loaded';
    public static STATE_FAILED = 'failed';

    private state = RowNodeBlock.STATE_DIRTY;

    private version = 0;

    public abstract getBlockStateJson(): { id: string, state: any };

    protected abstract loadFromDatasource(): void;

    protected abstract populateWithRowData(rows: any[]): void;

    public load(): void {
        this.state = RowNodeBlock.STATE_LOADING;
        this.loadFromDatasource();
    }

    public getVersion(): number {
        return this.version;
    }

    public setDirty(): void {
        // in case any current loads in progress, this will have their results ignored
        this.version++;
        this.state = RowNodeBlock.STATE_DIRTY;
    }

    public getState(): string {
        return this.state;
    }

    protected pageLoadFailed() {
        this.state = RowNodeBlock.STATE_FAILED;
        const event: LoadCompleteEvent = {
            type: RowNodeBlock.EVENT_LOAD_COMPLETE,
            success: false,
            page: this,
            lastRow: null
        };
        this.dispatchEvent(event);
    }

    protected pageLoaded(version: number, rows: any[], lastRow: number) {
        // we need to check the version, in case there was an old request
        // from the server that was sent before we refreshed the cache,
        // if the load was done as a result of a cache refresh
        if (version === this.version) {
            this.state = RowNodeBlock.STATE_LOADED;
            this.populateWithRowData(rows);
        }

        lastRow = _.cleanNumber(lastRow);

        // check here if lastRow should be set
        const event: LoadCompleteEvent = {
            type: RowNodeBlock.EVENT_LOAD_COMPLETE,
            success: true,
            page: this,
            lastRow: lastRow
        };

        this.dispatchEvent(event);
    }


}
