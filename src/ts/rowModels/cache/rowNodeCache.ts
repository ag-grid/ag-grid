import {NumberSequence, Utils as _} from "../../utils";
import {RowNode} from "../../entities/rowNode";
import {BeanStub} from "../../context/beanStub";
import {RowNodeBlock} from "./rowNodeBlock";
import {Logger} from "../../logger";

export interface RowNodeCacheParams {
    initialRowCount: number;
    pageSize: number;
    overflowSize: number;
    sortModel: any;
    filterModel: any;
    maxBlocksInCache: number;
    rowHeight: number;
    lastAccessedSequence: NumberSequence;
    maxConcurrentRequests: number;
}

export abstract class RowNodeCache<T extends RowNodeBlock, P extends RowNodeCacheParams> extends BeanStub {

    private virtualRowCount: number;
    private maxRowFound = false;

    protected cacheParams: P;

    private active = true;
    private activePageLoadsCount = 0;

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

    // as we are not a context managed bean, we cannot use @PreDestroy
    public destroy(): void {
        this.active = false;
    }

    protected onPageLoaded(event: any): void {
        // if we are not active, then we ignore all events, otherwise we could end up getting the
        // grid to refresh even though we are no longer the active cache
        if (!this.isActive()) {
            return;
        }

        this.logger.log(`onPageLoaded: page = ${event.page.getPageNumber()}, lastRow = ${event.lastRow}`);
        this.activePageLoadsCount--;
        this.checkBlockToLoad();

        if (event.success) {
            this.checkVirtualRowCount(event.page, event.lastRow);
        }
    }

    private printCacheStatus(): void {
        this.logger.log(`checkPageToLoad: activePageLoadsCount = ${this.activePageLoadsCount}, 
                            pages = ${JSON.stringify(this.getBlockState())}`);
    }

    protected checkBlockToLoad() {
        this.printCacheStatus();

        if (this.activePageLoadsCount >= this.cacheParams.maxConcurrentRequests) {
            this.logger.log(`checkPageToLoad: max loads exceeded`);
            return;
        }

        let pageToLoad: RowNodeBlock = null;
        this.forEachBlockInOrder( block => {
            if (block.getState() === RowNodeBlock.STATE_DIRTY) {
                pageToLoad = block;
            }
        });

        if (pageToLoad) {
            pageToLoad.load();
            this.activePageLoadsCount++;
            this.logger.log(`checkPageToLoad: loading page ${pageToLoad.getPageNumber()}`);
            this.printCacheStatus();
        } else {
            this.logger.log(`checkPageToLoad: no pages to load`);
        }
    }

    protected checkVirtualRowCount(page: T, lastRow: any): void {
        // if client provided a last row, we always use it, as it could change between server calls
        // if user deleted data and then called refresh on the grid.
        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.virtualRowCount = lastRow;
            this.maxRowFound = true;
            this.dispatchModelUpdated();
        } else if (!this.maxRowFound) {
            // otherwise, see if we need to add some virtual rows
            var lastRowIndex = (page.getPageNumber() + 1) * this.cacheParams.pageSize;
            var lastRowIndexPlusOverflow = lastRowIndex + this.cacheParams.overflowSize;

            if (this.virtualRowCount < lastRowIndexPlusOverflow) {
                this.virtualRowCount = lastRowIndexPlusOverflow;
                this.dispatchModelUpdated();
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
            if (this.virtualRowCount % this.cacheParams.pageSize === 0) {
                this.virtualRowCount++;
            }
        }

        this.dispatchModelUpdated();
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

    protected removeBlock(id: number): void {
        delete this.blocks[id];
        this.blockCount--;
    }

    protected getBlockCount(): number {
        return this.blockCount;
    }

    protected abstract dispatchModelUpdated(): void;

    public abstract getRow(rowIndex: number): RowNode;
}
