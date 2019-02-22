import { NumberSequence, _ } from "../../utils";
import { RowNode } from "../../entities/rowNode";
import { Context } from "../../context/context";
import { BeanStub } from "../../context/beanStub";
import { RowNodeCacheParams } from "./rowNodeCache";
import { RowRenderer } from "../../rendering/rowRenderer";
import { AgEvent } from "../../events";

export interface RowNodeBlockBeans {
    context: Context;
    rowRenderer: RowRenderer;
}

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

    private version = 0;
    private state = RowNodeBlock.STATE_DIRTY;

    private lastAccessed: number;

    private readonly blockNumber: number;
    private readonly startRow: number;
    private readonly endRow: number;
    public rowNodes: RowNode[];

    // because the framework cannot wire beans in parent classes, this is a hack
    // to pass bean references up. give out to niall for not getting an IoC context
    // that can do this yet
    private beans: RowNodeBlockBeans;

    private rowNodeCacheParams: RowNodeCacheParams;

    // gets base class to load, based on what the datasource type is
    protected abstract loadFromDatasource(): void;

    // how we set the data and id is also dependent ton the base class, as the server side row model
    // is concerned with groups (so has to set keys for the group)
    protected abstract setDataAndId(rowNode: RowNode, data: any, index: number): void;

    // this gets the row using display indexes. for infinite scrolling, the
    // local index is the same as the display index, so the override just calls
    // getRowUsingLocalIndex(). however for server side row model, they are different, hence
    // server side row model does logic before calling getRowUsingLocalIndex().
    public abstract getRow(displayIndex: number): RowNode | null;

    // returns the node id prefix, which is essentially the id of the cache
    // that the block belongs to. this is used for debugging purposes, where the
    // user can get the state of the cache, it lets us include what cache the block
    // belongs to
    public abstract getNodeIdPrefix(): string;

    protected constructor(blockNumber: number, rowNodeCacheParams: RowNodeCacheParams) {
        super();

        this.rowNodeCacheParams = rowNodeCacheParams;
        this.blockNumber = blockNumber;

        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        this.startRow = blockNumber * rowNodeCacheParams.blockSize;
        this.endRow = this.startRow + rowNodeCacheParams.blockSize;
    }

    public isAnyNodeOpen(rowCount: number): boolean {
        let result = false;
        this.forEachNodeCallback((rowNode: RowNode) => {
            if (rowNode.expanded) {
                result = true;
            }
        }, rowCount);
        return result;
    }

    private forEachNodeCallback(callback: (rowNode: RowNode, index: number) => void, rowCount: number): void {
        for (let rowIndex = this.startRow; rowIndex < this.endRow; rowIndex++) {
            // we check against rowCount as this page may be the last one, and if it is, then
            // the last rows are not part of the set
            if (rowIndex < rowCount) {
                const rowNode = this.getRowUsingLocalIndex(rowIndex);
                callback(rowNode, rowIndex);
            }
        }
    }

    private forEachNode(callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number, deep: boolean): void {
        this.forEachNodeCallback((rowNode: RowNode) => {
            callback(rowNode, sequence.next());
            // this will only every happen for server side row model, as infinite
            // row model doesn't have groups
            if (deep && rowNode.childrenCache) {
                rowNode.childrenCache.forEachNodeDeep(callback, sequence);
            }
        }, rowCount);
    }

    public forEachNodeDeep(callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number): void {
        this.forEachNode(callback, sequence, rowCount, true);
    }

    public forEachNodeShallow(callback: (rowNode: RowNode, index: number) => void, sequence: NumberSequence, rowCount: number): void {
        this.forEachNode(callback, sequence, rowCount, false);
    }

    public getVersion(): number {
        return this.version;
    }

    public getLastAccessed(): number {
        return this.lastAccessed;
    }

    public getRowUsingLocalIndex(rowIndex: number, dontTouchLastAccessed = false): RowNode {
        if (!dontTouchLastAccessed) {
            this.lastAccessed = this.rowNodeCacheParams.lastAccessedSequence.next();
        }
        const localIndex = rowIndex - this.startRow;
        return this.rowNodes[localIndex];
    }

    protected init(beans: RowNodeBlockBeans): void {
        this.beans = beans;
        this.createRowNodes();
    }

    public getStartRow(): number {
        return this.startRow;
    }

    public getEndRow(): number {
        return this.endRow;
    }

    public getBlockNumber(): number {
        return this.blockNumber;
    }

    public setDirty(): void {
        // in case any current loads in progress, this will have their results ignored
        this.version++;
        this.state = RowNodeBlock.STATE_DIRTY;
    }

    public setDirtyAndPurge(): void {
        this.setDirty();
        this.rowNodes.forEach(rowNode => {
            rowNode.setData(null);
        });
    }

    public getState(): string {
        return this.state;
    }

    public setRowNode(rowIndex: number, rowNode: RowNode): void {
        const localIndex = rowIndex - this.startRow;
        this.rowNodes[localIndex] = rowNode;
    }

    public setBlankRowNode(rowIndex: number): RowNode {
        const localIndex = rowIndex - this.startRow;
        const newRowNode = this.createBlankRowNode(rowIndex);
        this.rowNodes[localIndex] = newRowNode;
        return newRowNode;
    }

    public setNewData(rowIndex: number, dataItem: any): RowNode {
        const newRowNode = this.setBlankRowNode(rowIndex);
        this.setDataAndId(newRowNode, dataItem, this.startRow + rowIndex);
        return newRowNode;
    }

    protected createBlankRowNode(rowIndex: number): RowNode {
        const rowNode = new RowNode();
        this.beans.context.wireBean(rowNode);
        rowNode.setRowHeight(this.rowNodeCacheParams.rowHeight);
        return rowNode;
    }

    // creates empty row nodes, data is missing as not loaded yet
    protected createRowNodes(): void {
        this.rowNodes = [];
        for (let i = 0; i < this.rowNodeCacheParams.blockSize; i++) {
            const rowIndex = this.startRow + i;
            const rowNode = this.createBlankRowNode(rowIndex);
            this.rowNodes.push(rowNode);
        }
    }

    public load(): void {
        this.state = RowNodeBlock.STATE_LOADING;
        this.loadFromDatasource();
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

    private populateWithRowData(rows: any[]): void {
        const rowNodesToRefresh: RowNode[] = [];
        this.rowNodes.forEach((rowNode: RowNode, index: number) => {
            const data = rows[index];
            if (rowNode.stub) {
                rowNodesToRefresh.push(rowNode);
            }
            this.setDataAndId(rowNode, data, this.startRow + index);
        });
        if (rowNodesToRefresh.length > 0) {
            this.beans.rowRenderer.redrawRows(rowNodesToRefresh);
        }
    }

    public destroy(): void {
        super.destroy();
        this.rowNodes.forEach(rowNode => {
            if (rowNode.childrenCache) {
                rowNode.childrenCache.destroy();
                rowNode.childrenCache = null;
            }
            // this is needed, so row render knows to fade out the row, otherwise it
            // sees row top is present, and thinks the row should be shown. maybe
            // rowNode should have a flag on whether it is visible???
            rowNode.clearRowTop();
        });
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
