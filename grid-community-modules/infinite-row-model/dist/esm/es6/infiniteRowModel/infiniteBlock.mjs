var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, PostConstruct, PreDestroy, RowNode, RowNodeBlock, Autowired } from "@ag-grid-community/core";
export class InfiniteBlock extends RowNodeBlock {
    constructor(id, parentCache, params) {
        super(id);
        this.parentCache = parentCache;
        this.params = params;
        // we don't need to calculate these now, as the inputs don't change,
        // however it makes the code easier to read if we work them out up front
        this.startRow = id * params.blockSize;
        this.endRow = this.startRow + params.blockSize;
    }
    postConstruct() {
        this.createRowNodes();
    }
    getBlockStateJson() {
        return {
            id: '' + this.getId(),
            state: {
                blockNumber: this.getId(),
                startRow: this.getStartRow(),
                endRow: this.getEndRow(),
                pageStatus: this.getState()
            }
        };
    }
    setDataAndId(rowNode, data, index) {
        // if there's no id and the rowNode was rendered before, it means this
        // was a placeholder rowNode and should not be recycled. Setting
        // `alreadyRendered`  to `false` forces the rowRenderer to flush it.
        if (!rowNode.id && rowNode.alreadyRendered) {
            rowNode.alreadyRendered = false;
        }
        if (_.exists(data)) {
            // this means if the user is not providing id's we just use the
            // index for the row. this will allow selection to work (that is based
            // on index) as long user is not inserting or deleting rows,
            // or wanting to keep selection between server side sorting or filtering
            rowNode.setDataAndId(data, index.toString());
        }
        else {
            rowNode.setDataAndId(undefined, undefined);
        }
    }
    loadFromDatasource() {
        const params = this.createLoadParams();
        if (_.missing(this.params.datasource.getRows)) {
            console.warn(`AG Grid: datasource is missing getRows method`);
            return;
        }
        // put in timeout, to force result to be async
        window.setTimeout(() => {
            this.params.datasource.getRows(params);
        }, 0);
    }
    processServerFail() {
        // todo - this method has better handling in SSRM
    }
    createLoadParams() {
        // PROBLEM . . . . when the user sets sort via colDef.sort, then this code
        // is executing before the sort is set up, so server is not getting the sort
        // model. need to change with regards order - so the server side request is
        // AFTER thus it gets the right sort model.
        const params = {
            startRow: this.getStartRow(),
            endRow: this.getEndRow(),
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this, this.getVersion()),
            sortModel: this.params.sortModel,
            filterModel: this.params.filterModel,
            context: this.gridOptionsService.context
        };
        return params;
    }
    forEachNode(callback, sequence, rowCount) {
        this.rowNodes.forEach((rowNode, index) => {
            const rowIndex = this.startRow + index;
            if (rowIndex < rowCount) {
                callback(rowNode, sequence.next());
            }
        });
    }
    getLastAccessed() {
        return this.lastAccessed;
    }
    getRow(rowIndex, dontTouchLastAccessed = false) {
        if (!dontTouchLastAccessed) {
            this.lastAccessed = this.params.lastAccessedSequence.next();
        }
        const localIndex = rowIndex - this.startRow;
        return this.rowNodes[localIndex];
    }
    getStartRow() {
        return this.startRow;
    }
    getEndRow() {
        return this.endRow;
    }
    // creates empty row nodes, data is missing as not loaded yet
    createRowNodes() {
        this.rowNodes = [];
        for (let i = 0; i < this.params.blockSize; i++) {
            const rowIndex = this.startRow + i;
            const rowNode = new RowNode(this.beans);
            rowNode.setRowHeight(this.params.rowHeight);
            rowNode.uiLevel = 0;
            rowNode.setRowIndex(rowIndex);
            rowNode.setRowTop(this.params.rowHeight * rowIndex);
            this.rowNodes.push(rowNode);
        }
    }
    processServerResult(params) {
        this.rowNodes.forEach((rowNode, index) => {
            const data = params.rowData ? params.rowData[index] : undefined;
            this.setDataAndId(rowNode, data, this.startRow + index);
        });
        const finalRowCount = params.rowCount != null && params.rowCount >= 0 ? params.rowCount : undefined;
        this.parentCache.pageLoaded(this, finalRowCount);
    }
    destroyRowNodes() {
        this.rowNodes.forEach(rowNode => {
            // this is needed, so row render knows to fade out the row, otherwise it
            // sees row top is present, and thinks the row should be shown.
            rowNode.clearRowTopAndRowIndex();
        });
    }
}
__decorate([
    Autowired('beans')
], InfiniteBlock.prototype, "beans", void 0);
__decorate([
    PostConstruct
], InfiniteBlock.prototype, "postConstruct", null);
__decorate([
    PreDestroy
], InfiniteBlock.prototype, "destroyRowNodes", null);
