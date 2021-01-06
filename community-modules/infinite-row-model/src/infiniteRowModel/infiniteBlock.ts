import {
    _,
    Autowired,
    IGetRowsParams,
    NumberSequence,
    PostConstruct,
    PreDestroy,
    RowNode,
    Autowired,
    PostConstruct,
    IGetRowsParams,
    IEventEmitter,
    RowNodeBlock,
    RowRenderer,
    _
} from "@ag-grid-community/core";
import { InfiniteCacheParams } from "./infiniteCache";

export class InfiniteBlock extends RowNodeBlock implements IEventEmitter {

    @Autowired('rowRenderer') private rowRenderer: RowRenderer;

    private cacheParams: InfiniteCacheParams;

    constructor(pageNumber: number, params: InfiniteCacheParams) {
        super(pageNumber, params);

        this.cacheParams = params;
    }

    public getDisplayIndexStart(): number {
        return this.getBlockNumber() * this.cacheParams.blockSize;
    }

    // this is an estimate, as the last block will probably only be partially full. however
    // this method is used to know if this block is been rendered, before destroying, so
    // and this estimate works in that use case.
    public getDisplayIndexEnd(): number {
        return this.getDisplayIndexStart() + this.cacheParams.blockSize;
    }

    protected createBlankRowNode(rowIndex: number): RowNode {
        const rowNode = super.createBlankRowNode();

        rowNode.uiLevel = 0;

        this.setIndexAndTopOnRowNode(rowNode, rowIndex);

        return rowNode;
    }

    protected setDataAndId(rowNode: RowNode, data: any, index: number): void {
        if (_.exists(data)) {
            // this means if the user is not providing id's we just use the
            // index for the row. this will allow selection to work (that is based
            // on index) as long user is not inserting or deleting rows,
            // or wanting to keep selection between server side sorting or filtering
            rowNode.setDataAndId(data, index.toString());
        } else {
            rowNode.setDataAndId(undefined, undefined);
        }
    }

    public setRowNode(rowIndex: number, rowNode: RowNode): void {
        super.setRowNode(rowIndex, rowNode);
        this.setIndexAndTopOnRowNode(rowNode, rowIndex);
    }

    // no need for @postConstruct, as attached to parent
    protected init(): void {
        super.init();
    }

    public getNodeIdPrefix(): string {
        return null;
    }

    public getRow(displayIndex: number): RowNode {
        return this.getRowUsingLocalIndex(displayIndex);
    }

    protected processServerFail(): void {
        // todo - this method has better handling in SSRM
    }

    protected createLoadParams(): any {
        // PROBLEM . . . . when the user sets sort via colDef.sort, then this code
        // is executing before the sort is set up, so server is not getting the sort
        // model. need to change with regards order - so the server side request is
        // AFTER thus it gets the right sort model.
        const params: IGetRowsParams = {
            startRow: this.getStartRow(),
            endRow: this.getEndRow(),
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this, this.getVersion()),
            sortModel: this.params.sortModel,
            filterModel: this.params.filterModel,
            context: this.gridOptionsWrapper.getContext()
        };

    public forEachNode(callback: (rowNode: RowNode, index: number) => void,
                       sequence: NumberSequence,
                       rowCount: number): void {
        this.rowNodes.forEach((rowNode: RowNode, index: number) => {
            const rowIndex = this.startRow + index;
            if (rowIndex < rowCount) {
                callback(rowNode, sequence.next());
            }
        });
    }

    public getLastAccessed(): number {
        return this.lastAccessed;
    }

    public getRow(rowIndex: number, dontTouchLastAccessed = false): RowNode {
        if (!dontTouchLastAccessed) {
            this.lastAccessed = this.params.lastAccessedSequence.next();
        }
        const localIndex = rowIndex - this.startRow;
        return this.rowNodes[localIndex];
    }

    public getStartRow(): number {
        return this.startRow;
    }

    public getEndRow(): number {
        return this.endRow;
    }

    // creates empty row nodes, data is missing as not loaded yet
    protected createRowNodes(): void {
        this.rowNodes = [];
        for (let i = 0; i < this.params.blockSize!; i++) {
            const rowIndex = this.startRow + i;

            const rowNode = this.getContext().createBean(new RowNode());

            rowNode.setRowHeight(this.params.rowHeight);
            rowNode.uiLevel = 0;
            rowNode.setRowIndex(rowIndex);
            rowNode.rowTop = this.params.rowHeight * rowIndex;

            this.rowNodes.push(rowNode);
        }
    }

    protected processServerResult(params: LoadSuccessParams): void {
        const rowNodesToRefresh: RowNode[] = [];

        this.rowNodes.forEach((rowNode: RowNode, index: number) => {
            const data = params.rowData ? params.rowData[index] : undefined;
            if (rowNode.stub) {
                rowNodesToRefresh.push(rowNode);
            }
            this.setDataAndId(rowNode, data, this.startRow + index);
        });

        if (rowNodesToRefresh.length > 0) {
            this.rowRenderer.redrawRows(rowNodesToRefresh);
        }

        const finalRowCount = params.rowCount != null && params.rowCount >= 0 ? params.rowCount : undefined;

        this.parentCache.pageLoaded(this, finalRowCount);
    }

    @PreDestroy
    private destroyRowNodes(): void {
        this.rowNodes.forEach(rowNode => {
            // this is needed, so row render knows to fade out the row, otherwise it
            // sees row top is present, and thinks the row should be shown. maybe
            // rowNode should have a flag on whether it is visible???
            rowNode.clearRowTop();
        });
    }
}
