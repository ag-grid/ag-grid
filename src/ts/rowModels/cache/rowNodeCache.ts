import {NumberSequence, Utils as _} from "../../utils";
import {RowNode} from "../../entities/rowNode";
import {BeanStub} from "../../context/beanStub";
import {RowNodeBlock} from "./rowNodeBlock";
import {InfiniteBlock} from "../infinite/infiniteBlock";

export interface RowNodeCacheParams {
    initialRowCount: number;
    pageSize: number;
    overflowSize: number;
    sortModel: any;
    filterModel: any;
    maxBlocksInCache: number;
    rowHeight: number;
    lastAccessedSequence: NumberSequence;
}

export abstract class RowNodeCache<T extends RowNodeBlock> extends BeanStub {

    private virtualRowCount: number;
    private maxRowFound = false;

    private rowNodeCacheParams: RowNodeCacheParams;

    private active = true;

    private blocks: {[blockNumber: string]: T} = {};
    private blockCount = 0;

    constructor(params: RowNodeCacheParams) {
        super();
        this.virtualRowCount = params.initialRowCount;
        this.rowNodeCacheParams = params;
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

    protected checkVirtualRowCount(page: InfiniteBlock, lastRow: any): void {
        // if client provided a last row, we always use it, as it could change between server calls
        // if user deleted data and then called refresh on the grid.
        if (typeof lastRow === 'number' && lastRow >= 0) {
            this.virtualRowCount = lastRow;
            this.maxRowFound = true;
            this.dispatchModelUpdated();
        } else if (!this.maxRowFound) {
            // otherwise, see if we need to add some virtual rows
            var lastRowIndex = (page.getPageNumber() + 1) * this.rowNodeCacheParams.pageSize;
            var lastRowIndexPlusOverflow = lastRowIndex + this.rowNodeCacheParams.overflowSize;

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
            if (this.virtualRowCount % this.rowNodeCacheParams.pageSize === 0) {
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
