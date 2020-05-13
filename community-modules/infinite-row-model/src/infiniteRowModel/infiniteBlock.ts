import {
    GridOptionsWrapper,
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

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
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
        const rowNode = super.createBlankRowNode(rowIndex);

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

    @PostConstruct
    protected init(): void {
        super.init({
            context: this.getContext(),
            rowRenderer: this.rowRenderer
        });
    }

    public getNodeIdPrefix(): string {
        return null;
    }

    public getRow(displayIndex: number): RowNode {
        return this.getRowUsingLocalIndex(displayIndex);
    }

    private setIndexAndTopOnRowNode(rowNode: RowNode, rowIndex: number): void {
        rowNode.setRowIndex(rowIndex);
        rowNode.rowTop = this.cacheParams.rowHeight * rowIndex;
    }

    protected loadFromDatasource(): void {
        // PROBLEM . . . . when the user sets sort via colDef.sort, then this code
        // is executing before the sort is set up, so server is not getting the sort
        // model. need to change with regards order - so the server side request is
        // AFTER thus it gets the right sort model.
        const params: IGetRowsParams = {
            startRow: this.getStartRow(),
            endRow: this.getEndRow(),
            successCallback: this.pageLoaded.bind(this, this.getVersion()),
            failCallback: this.pageLoadFailed.bind(this),
            sortModel: this.cacheParams.sortModel,
            filterModel: this.cacheParams.filterModel,
            context: this.gridOptionsWrapper.getContext()
        };

        if (_.missing(this.cacheParams.datasource.getRows)) {
            console.warn(`ag-Grid: datasource is missing getRows method`);
            return;
        }

        // put in timeout, to force result to be async
        window.setTimeout(() => {
            this.cacheParams.datasource.getRows(params);
        }, 0);

    }
}
