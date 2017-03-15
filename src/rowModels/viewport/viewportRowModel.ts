import {
    Bean,
    PostConstruct,
    Autowired,
    Context,
    PreDestroy,
    IRowModel,
    RowNode,
    Constants,
    GridOptionsWrapper,
    EventService,
    Events,
    Utils,
    SelectionController,
    IViewportDatasource
} from "ag-grid/main";

@Bean('rowModel')
export class ViewportRowModel implements IRowModel {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('context') private context: Context;

    // rowRenderer tells us these
    private firstRow = -1;
    private lastRow = -1;

    // datasource tells us this
    private rowCount = -1;

    private rowNodesByIndex: {[index: number]: RowNode} = {};

    private rowHeight: number;

    private viewportDatasource: IViewportDatasource;

    @PostConstruct
    private init(): void {
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.eventService.addEventListener(Events.EVENT_VIEWPORT_CHANGED, this.onViewportChanged.bind(this));

        var viewportEnabled = this.gridOptionsWrapper.isRowModelViewport();

        if (viewportEnabled && this.gridOptionsWrapper.getViewportDatasource()) {
            this.setViewportDatasource(this.gridOptionsWrapper.getViewportDatasource());
        }

    }

    @PreDestroy
    private destroy(): void {
        this.destroyCurrentDatasource();
    }

    private destroyCurrentDatasource(): void {
        if (this.viewportDatasource && this.viewportDatasource.destroy) {
            this.viewportDatasource.destroy();
        }
    }

    private calculateFirstRow(firstRenderedRow: number): number {
        var bufferSize = this.gridOptionsWrapper.getViewportRowModelBufferSize();
        var pageSize = this.gridOptionsWrapper.getViewportRowModelPageSize();
        var afterBuffer = firstRenderedRow - bufferSize;

        if (afterBuffer < 0) {
            return 0;
        } else {
            return Math.floor(afterBuffer / pageSize) * pageSize;
        }
    }

    private calculateLastRow(lastRenderedRow: number): number {
        var bufferSize = this.gridOptionsWrapper.getViewportRowModelBufferSize();
        var pageSize = this.gridOptionsWrapper.getViewportRowModelPageSize();
        var afterBuffer = lastRenderedRow + bufferSize;

        var result = Math.ceil(afterBuffer / pageSize) * pageSize;
        if (result <= this.rowCount) {
            return result;
        } else {
            return this.rowCount;
        }
    }

    private onViewportChanged(event: any): void {
        var newFirst = this.calculateFirstRow(event.firstRow);
        var newLast = this.calculateLastRow(event.lastRow);
        if (this.firstRow !== newFirst || this.lastRow !== newLast) {
            this.firstRow = newFirst;
            this.lastRow = newLast;
            this.purgeRowsNotInViewport();
            if (this.viewportDatasource) {
                this.viewportDatasource.setViewportRange(this.firstRow, this.lastRow);
            }
        }
    }

    public purgeRowsNotInViewport(): void {
        Object.keys(this.rowNodesByIndex).forEach(indexStr => {
            var index = parseInt(indexStr);
            if (index < this.firstRow || index > this.lastRow) {
                delete this.rowNodesByIndex[index];
            }
        });
    }

    public setViewportDatasource(viewportDatasource: IViewportDatasource): void {
        this.destroyCurrentDatasource();

        this.viewportDatasource = viewportDatasource;
        this.rowCount = 0;

        if (!viewportDatasource.init) {
            console.warn('ag-Grid: viewport is missing init method.');
        } else {
            viewportDatasource.init({
                setRowCount: this.setRowCount.bind(this),
                setRowData: this.setRowData.bind(this),
                getRow: this.getRow.bind(this)
            });
        }
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_VIEWPORT;
    }

    public getRow(rowIndex: number): RowNode {
        if (!this.rowNodesByIndex[rowIndex]) {
            this.rowNodesByIndex[rowIndex] = this.createBlankRowNode(rowIndex);
        }

        return this.rowNodesByIndex[rowIndex];
    }

    public getRowCount(): number {
        return this.rowCount;
    }

    public getRowIndexAtPixel(pixel: number): number {
        if (this.rowHeight !== 0) { // avoid divide by zero error
            return Math.floor(pixel / this.rowHeight);
        } else {
            return 0;
        }
    }

    public getRowCombinedHeight(): number {
        return this.rowCount * this.rowHeight;
    }

    public isEmpty(): boolean {
        return this.rowCount > 0;
    }

    public isRowsToRender(): boolean {
        return this.rowCount > 0;
    }

    public forEachNode(callback: (rowNode: RowNode, index: number) => void): void {
        var callbackCount = 0;
        Object.keys(this.rowNodesByIndex).forEach(indexStr => {
            var index = parseInt(indexStr);
            var rowNode: RowNode = this.rowNodesByIndex[index];
            callback(rowNode, callbackCount);
            callbackCount++;
        });
    }

    private setRowData(rowData: {[key: number]: any}): void {
        Utils.iterateObject(rowData, (indexStr: string, dataItem: any) => {
            var index = parseInt(indexStr);
            // we should never keep rows that we didn't specifically ask for, this
            // guarantees the contract we have with the server.
            if (index >= this.firstRow && index <= this.lastRow) {
                var rowNode = this.rowNodesByIndex[index];

                // the abnormal case is we requested a row even though the grid didn't need it
                // as a result of the paging and buffer (ie the row is off screen), in which
                // case we need to create a new node now
                if (Utils.missing(rowNode)) {
                    rowNode = this.createBlankRowNode(index);
                    this.rowNodesByIndex[index] = rowNode;
                }

                // now we deffo have a row node, so set in the details
                // if the grid already asked for this row (the normal case), then we would
                // of put a placeholder node in place.
                rowNode.setDataAndId(dataItem, index.toString());
            }
        });
    }

    private createBlankRowNode(rowIndex: number): RowNode {
        let rowNode = new RowNode();
        this.context.wireBean(rowNode);
        rowNode.setRowHeight(this.rowHeight);
        rowNode.setRowTop(this.rowHeight * rowIndex);
        rowNode.setRowIndex(rowIndex);
        return rowNode;
    }

    public setRowCount(rowCount: number): void {
        if (rowCount !== this.rowCount) {
            this.rowCount = rowCount;
            this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
        }
    }

    public insertItemsAtIndex(index: number, items: any[], skipRefresh: boolean): void {
        console.log('not yet supported');
    }

    public removeItems(rowNodes: RowNode[], skipRefresh: boolean): void {
        console.log('not yet supported');
    }

    public addItems(item: any[], skipRefresh: boolean): void {
        console.log('not yet supported');
    }

    public isRowPresent(rowNode: RowNode): boolean {
        console.log('not yet supported');
        return false;
    }

}