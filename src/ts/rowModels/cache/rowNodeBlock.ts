import {NumberSequence, Utils as _} from "../../utils";
import {RowNode} from "../../entities/rowNode";
import {Context} from "../../context/context";
import {BeanStub} from "../../context/beanStub";
import {RowNodeCacheParams} from "./rowNodeCache";
import {RowRenderer} from "../../rendering/rowRenderer";

export interface RowNodeBlockBeans {
    context: Context;
    rowRenderer: RowRenderer;
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

    private blockNumber: number;
    private startRow: number;
    private endRow: number;
    private rowNodes: RowNode[];

    // because the framework cannot wire beans in parent classes, this is a hack
    // to pass bean references up. give out to niall for not getting an IoC context
    // that can do this yet
    private beans: RowNodeBlockBeans;

    private rowNodeCacheParams: RowNodeCacheParams;

    // gets base class to load, based on what the datasource type is
    protected abstract loadFromDatasource(): void;

    // how we set the data and id is also dependent ton the base class, as the enterprise
    // model is concerned with groups (so has to set keys for the group)
    protected abstract setDataAndId(rowNode: RowNode, data: any, index: number): void;

    // this gets the row using display indexes. for infinite scrolling, the
    // local index is the same as the display index, so the override just calls
    // getRowUsingLocalIndex(). however for enterprise, they are different, hence
    // enterprise does logic before calling getRowUsingLocalIndex().
    public abstract getRow(displayIndex: number): RowNode;

    // returns the node id prefix, which is essentially the id of the cache
    // that the block belongs to. this is used for debugging purposes, where the
    // user can get the state of the cache, it lets us include what cache the block
    // belongs to
    public abstract getNodeIdPrefix(): string;

    constructor(blockNumber: number, rowNodeCacheParams: RowNodeCacheParams) {
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
        this.forEachNodeCallback( (rowNode: RowNode) => {
            if (rowNode.expanded) {
                result = true;
            }
        }, rowCount);
        return result;
    }

    private forEachNodeCallback(callback: (rowNode: RowNode, index: number)=> void, rowCount: number): void {
        for (let rowIndex = this.startRow; rowIndex < this.endRow; rowIndex++) {
            // we check against rowCount as this page may be the last one, and if it is, then
            // the last rows are not part of the set
            if (rowIndex < rowCount) {
                let rowNode = this.getRowUsingLocalIndex(rowIndex);
                callback(rowNode, rowIndex);
            }
        }
    }

    private forEachNode(callback: (rowNode: RowNode, index: number)=> void, sequence: NumberSequence, rowCount: number, deep: boolean): void {
        this.forEachNodeCallback( (rowNode: RowNode) => {
            callback(rowNode, sequence.next());
            // this will only every happen for enterprise row model, as infinite
            // row model doesn't have groups
            if (deep && rowNode.childrenCache) {
                rowNode.childrenCache.forEachNodeDeep(callback, sequence);
            }
        }, rowCount);
    }

    public forEachNodeDeep(callback: (rowNode: RowNode, index: number)=> void, sequence: NumberSequence, rowCount: number): void {
        this.forEachNode(callback, sequence, rowCount, true);
    }

    public forEachNodeShallow(callback: (rowNode: RowNode, index: number)=> void, sequence: NumberSequence, rowCount: number): void {
        this.forEachNode(callback, sequence, rowCount, false);
    }

    public getVersion(): number {
        return this.version;
    }

    public getLastAccessed(): number {
        return this.lastAccessed;
    }

    public getRowUsingLocalIndex(rowIndex: number): RowNode {
        this.lastAccessed = this.rowNodeCacheParams.lastAccessedSequence.next();
        let localIndex = rowIndex - this.startRow;
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

    public getPageNumber(): number {
        return this.blockNumber;
    }

    public setDirty(): void {
        // in case any current loads in progress, this will have their results ignored
        this.version++;
        this.state = RowNodeBlock.STATE_DIRTY;
    }

    public setDirtyAndPurge(): void {
        this.setDirty();
        this.rowNodes.forEach( rowNode => {
            rowNode.setData(null);
        });
    }

    public getState(): string {
        return this.state;
    }

    public setRowNode(rowIndex: number, rowNode: RowNode): void {
        let localIndex = rowIndex - this.startRow;
        this.rowNodes[localIndex] = rowNode;
    }

    public setBlankRowNode(rowIndex: number): RowNode {
        let localIndex = rowIndex - this.startRow;
        let newRowNode = this.createBlankRowNode(rowIndex);
        this.rowNodes[localIndex] = newRowNode;
        return newRowNode;
    }

    public setNewData(rowIndex: number, dataItem: any): RowNode {
        let newRowNode = this.setBlankRowNode(rowIndex);
        this.setDataAndId(newRowNode, dataItem, this.startRow + rowIndex);
        return newRowNode;
    }

    protected createBlankRowNode(rowIndex: number): RowNode {
        let rowNode = new RowNode();
        this.beans.context.wireBean(rowNode);
        rowNode.setRowHeight(this.rowNodeCacheParams.rowHeight);
        return rowNode;
    }

    // creates empty row nodes, data is missing as not loaded yet
    protected createRowNodes(): void {
        this.rowNodes = [];
        for (let i = 0; i < this.rowNodeCacheParams.blockSize; i++) {
            let rowIndex = this.startRow + i;
            let rowNode = this.createBlankRowNode(rowIndex);
            this.rowNodes.push(rowNode);
        }
    }

    public load(): void {
        this.state = RowNodeBlock.STATE_LOADING;
        this.loadFromDatasource();
    }

    protected pageLoadFailed() {
        this.state = RowNodeBlock.STATE_FAILED;
        let event = {success: false, page: this};
        this.dispatchEvent(RowNodeBlock.EVENT_LOAD_COMPLETE, event);
    }

    private populateWithRowData(rows: any[]): void {
        let rowNodesToRefresh: RowNode[] = [];
        this.rowNodes.forEach( (rowNode: RowNode, index: number)=> {
            let data = rows[index];
            if (rowNode.stub) {
                rowNodesToRefresh.push(rowNode);
            }
            this.setDataAndId(rowNode, data, this.startRow + index);
        });
        if (rowNodesToRefresh.length > 0) {
            this.beans.rowRenderer.refreshRows(rowNodesToRefresh);
        }
    }

    public destroy(): void {
        super.destroy();
        this.rowNodes.forEach( rowNode => {
            if (rowNode.childrenCache) {
                rowNode.childrenCache.destroy();
                rowNode.childrenCache = null;
            }
        });
    }

    protected pageLoaded(version: number, rows: any[], lastRow: number) {
        // we need to check the version, in case there was an old request
        // from the server that was sent before we refreshed the cache,
        // if the load was done as a result of a cache refresh
        if (version===this.version) {
            this.state = RowNodeBlock.STATE_LOADED;
            this.populateWithRowData(rows);
        }

        lastRow = _.cleanNumber(lastRow);

        // check here if lastrow should be set
        let event = {success: true, page: this, lastRow: lastRow};

        this.dispatchEvent(RowNodeBlock.EVENT_LOAD_COMPLETE, event);
    }

}

