import { BeanStub } from '../context/beanStub';
import type { LoadSuccessParams } from '../interfaces/iServerSideRowModel';

type RowNodeBlockState = 'needsLoading' | 'loading' | 'loaded' | 'failed';

export type RowNodeBlockEvent = 'loadComplete';
export abstract class RowNodeBlock extends BeanStub<RowNodeBlockEvent> {
    private readonly id: number;

    private state: RowNodeBlockState = 'needsLoading';

    private version = 0;

    public abstract getBlockStateJson(): { id: string; state: any };

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
        this.state = 'loading';
        this.loadFromDatasource();
    }

    public getVersion(): number {
        return this.version;
    }

    public setStateWaitingToLoad(): void {
        // in case any current loads in progress, this will have their results ignored
        this.version++;
        this.state = 'needsLoading';
    }

    public getState(): RowNodeBlockState {
        return this.state;
    }

    protected pageLoadFailed(version: number) {
        const requestMostRecentAndLive = this.isRequestMostRecentAndLive(version);
        if (requestMostRecentAndLive) {
            this.state = 'failed';
            this.processServerFail();
        }

        this.dispatchLocalEvent({ type: 'loadComplete' });
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
        this.dispatchLocalEvent({ type: 'loadComplete' });

        const requestMostRecentAndLive = this.isRequestMostRecentAndLive(version);

        if (requestMostRecentAndLive) {
            this.state = 'loaded';
            this.processServerResult(params);
        }
    }
}
