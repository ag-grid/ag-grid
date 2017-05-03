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

    constructor(blockNumber: number, rowNodeCacheParams: RowNodeCacheParams) {
        super();

        this.rowNodeCacheParams = rowNodeCacheParams;
        this.blockNumber = blockNumber;

        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        this.startRow = blockNumber * rowNodeCacheParams.blockSize;
        this.endRow = this.startRow + rowNodeCacheParams.blockSize;
    }

    public forEachNode(callback: (rowNode: RowNode, index: number)=> void, sequence: NumberSequence, rowCount: number): void {
        for (let rowIndex = this.startRow; rowIndex < this.endRow; rowIndex++) {
            // we check against virtualRowCount as this page may be the last one, and if it is, then
            // it's probable that the last rows are not part of the set
            if (rowIndex < rowCount) {
                let rowNode = this.getRow(rowIndex);
                callback(rowNode, sequence.next());
                // this will only every happen for enterprise row model, as infinite
                // row model doesn't have groups
                if (rowNode.childrenCache) {
                    rowNode.childrenCache.forEachNode(callback, sequence);
                }
            }
        }
    }

    public getVersion(): number {
        return this.version;
    }

    public getLastAccessed(): number {
        return this.lastAccessed;
    }

    // this gets the row using local (not display) indexes. for infinite scrolling, the
    // local index is the same as the display index. however for enterprise, they are different,
    // hence enterprise overrides this method.
    public getRow(rowIndex: number): RowNode {
        this.lastAccessed = this.rowNodeCacheParams.lastAccessedSequence.next();
        var localIndex = rowIndex - this.startRow;
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
        var localIndex = rowIndex - this.startRow;
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
        var event = {success: false, page: this};
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
        var event = {success: true, page: this, lastRow: lastRow};

        this.dispatchEvent(RowNodeBlock.EVENT_LOAD_COMPLETE, event);
    }

}

