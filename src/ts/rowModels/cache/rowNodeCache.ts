import {NumberSequence, Utils as _} from "../../utils";
import {RowNode} from "../../entities/rowNode";
import {BeanStub} from "../../context/beanStub";
import {RowNodeBlock} from "./rowNodeBlock";
import {Logger} from "../../logger";

export interface RowNodeCacheParams {
    initialRowCount: number;
    blockSize: number;
    overflowSize: number;
    sortModel: any;
    filterModel: any;
    maxBlocksInCache: number;
    rowHeight: number;
    lastAccessedSequence: NumberSequence;
    maxConcurrentRequests: number;
}

export abstract class RowNodeCache<T extends RowNodeBlock, P extends RowNodeCacheParams> extends BeanStub {

    public static EVENT_CACHE_UPDATED = 'cacheUpdated';

    private virtualRowCount: number;
    private maxRowFound = false;

    protected cacheParams: P;

    private active: boolean;
    private activeBlockLoadsCount = 0;

    private blocks: {[blockNumber: string]: T} = {};
    private blockCount = 0;

    protected logger: Logger;

    constructor(cacheParams: P) {
        super();
        this.virtualRowCount = cacheParams.initialRowCount;
        this.cacheParams = cacheParams;
    }

    public getBlockState(): any {
        let result: any[] = [];
        this.forEachBlockInOrder( (block: RowNodeBlock, id: number) => {
            let stateItem = {
                blockNumber: id,
                startRow: block.getStartRow(),
                endRow: block.getEndRow(),
                pageStatus: block.getState()
            };
            result.push(stateItem);
        });
        return result;
    }

    protected init(): void {
        this.active = true;
        this.addDestroyFunc( ()=> this.active = false );
    }

    public isActive(): boolean {
        return this.active;
    }

    public getVirtualRowCount(): number {
        return this.virtualRowCount;
    }

    public hack_setVirtualRowCount(virtualRowCount: number): void {
        this.virtualRowCount = virtualRowCount;
    }

    public isMaxRowFound(): boolean {
        return this.maxRowFound;
    }

    // listener on EVENT_LOAD_COMPLETE
    protected onPageLoaded(event: any): void {
        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.isActive()) {
            return;
        }

        this.logger.log(`onPageLoaded: page = ${event.page.getPageNumber()}, lastRow = ${event.lastRow}`);
        this.activeBlockLoadsCount--;
        this.checkBlockToLoad();

        if (event.success) {
            this.checkVirtualRowCount(event.page, event.lastRow);
        }
    }

    private printCacheStatus(): void {
        this.logger.log(`checkPageToLoad: activePageLoadsCount = ${this.activeBlockLoadsCount},`
            + ` pages = ${JSON.stringify(this.getBlockState())}`);
    }

    // gets called after: 1) block loaded 2) block created 3) cache refresh
    protected checkBlockToLoad() {
        this.printCacheStatus();

        if (this.activeBlockLoadsCount >= this.cacheParams.maxConcurrentRequests) {
            this.logger.log(`checkPageToLoad: max loads exceeded`);
            return;
        }

        let blockToLoad: RowNodeBlock = null;
        this.forEachBlockInOrder( block => {
            if (block.getState() === RowNodeBlock.STATE_DIRTY) {
                blockToLoad = block;
            }
        });

        if (blockToLoad) {
            blockToLoad.load();
            this.activeBlockLoadsCount++;
            this.logger.log(`checkPageToLoad: loading page ${blockToLoad.getPageNumber()}`);
            this.printCacheStatus();
        } else {
            this.logger.log(`checkPageToLoad: no pages to load`);
        }
    }

    protected checkVirtualRowCount(block: T, lastRow: any): void {
        // if client provided a last row, we always use it, as it could change between server calls
        // if user deleted data and then called refresh on the grid.
        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.virtualRowCount = lastRow;
            this.maxRowFound = true;
            this.onCacheUpdated();
        } else if (!this.maxRowFound) {
            // otherwise, see if we need to add some virtual rows
            var lastRowIndex = (block.getPageNumber() + 1) * this.cacheParams.blockSize;
            var lastRowIndexPlusOverflow = lastRowIndex + this.cacheParams.overflowSize;

            if (this.virtualRowCount < lastRowIndexPlusOverflow) {
                this.virtualRowCount = lastRowIndexPlusOverflow;
                this.onCacheUpdated();
            }
        }
    }

    public setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void {
        this.virtualRowCount = rowCount;
        // if undefined is passed, we do not set this value, if one of {true,false}
        // is passed, we do set the value.
        if (_.exists(maxRowFound)) {
            this.maxRowFound = maxRowFound;
        }

        // if we are still searching, then the row count must not end at the end
        // of a particular page, otherwise the searching will not pop into the
        // next page
        if (!this.maxRowFound) {
            if (this.virtualRowCount % this.cacheParams.blockSize === 0) {
                this.virtualRowCount++;
            }
        }

        this.onCacheUpdated();
    }

    public forEachNode(callback: (rowNode: RowNode, index: number)=> void, sequence: NumberSequence): void {
        this.forEachBlockInOrder( block => {
            block.forEachNode(callback, sequence, this.virtualRowCount);
        });
    }

    protected forEachBlockInOrder(callback: (block: T, id: number)=>void): void {
        let ids = this.getBlockIdsSorted();
        this.forEachBlockId(ids, callback);
    }

    protected forEachBlockInReverseOrder(callback: (block: T, id: number)=>void): void {
        let ids = this.getBlockIdsSorted().reverse();
        this.forEachBlockId(ids, callback);
    }

    private forEachBlockId(ids: number[], callback: (block: T, id: number)=>void): void {
        ids.forEach( id => {
            let block = this.blocks[id];
            callback(block, id);
        });
    }

    protected getBlockIdsSorted(): number[] {
        // get all page id's as NUMBERS (not strings, as we need to sort as numbers) and in descending order
        let numberComparator = (a: number, b: number) => a - b; // default comparator for array is string comparison
        let blockIds = Object.keys(this.blocks).map(idStr => parseInt(idStr)).sort(numberComparator);
        return blockIds;
    }

    protected getBlock(blockId: string|number): T {
        return this.blocks[blockId];
    }

    protected setBlock(id: number, block: T): void {
        this.blocks[id] = block;
        this.blockCount++;
    }

    protected destroyBlock(block: T): void {
        delete this.blocks[block.getPageNumber()];
        block.destroy();
        this.blockCount--;
    }

    protected getBlockCount(): number {
        return this.blockCount;
    }

    // gets called 1) row count changed 2) cache purged 3) items inserted
    protected onCacheUpdated(): void {
        if (this.isActive()) {
            // this results in both row models (infinite and enterprise) firing ModelUpdated,
            // however enterprise also updates the row indexes first
            this.dispatchEvent(RowNodeCache.EVENT_CACHE_UPDATED);
        }
    }

    public abstract getRow(rowIndex: number): RowNode;
}
