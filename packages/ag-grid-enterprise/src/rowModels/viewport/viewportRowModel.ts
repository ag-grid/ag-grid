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
    SelectionController,
    IViewportDatasource,
    RowBounds,
    GridApi,
    ColumnApi,
    ModelUpdatedEvent,
    RowRenderer,
    _
} from "ag-grid-community";

@Bean('rowModel')
export class ViewportRowModel implements IRowModel {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('context') private context: Context;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;

    // rowRenderer tells us these
    private firstRow = -1;
    private lastRow = -1;

    // datasource tells us this
    private rowCount = -1;

    private rowNodesByIndex: {[index: number]: RowNode} = {};

    private rowHeight: number;

    private viewportDatasource: IViewportDatasource;

    // we don't implement as lazy row heights is not supported in this row model
    public ensureRowHeightsValid(startPixel: number, endPixel: number, startLimitIndex: number, endLimitIndex: number): boolean { return false; }

    @PostConstruct
    private init(): void {
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.eventService.addEventListener(Events.EVENT_VIEWPORT_CHANGED, this.onViewportChanged.bind(this));

        const viewportEnabled = this.gridOptionsWrapper.isRowModelViewport();

        if (viewportEnabled && this.gridOptionsWrapper.getViewportDatasource()) {
            this.setViewportDatasource(this.gridOptionsWrapper.getViewportDatasource());
        }
    }

    public isLastRowFound(): boolean {
        return true;
    }

    @PreDestroy
    private destroyDatasource(): void {
        if (this.viewportDatasource) {
            if (this.viewportDatasource.destroy) {
                this.viewportDatasource.destroy();
            }
            this.rowRenderer.datasourceChanged();
            this.firstRow = -1;
            this.lastRow = -1;
        }
    }

    private calculateFirstRow(firstRenderedRow: number): number {
        const bufferSize = this.gridOptionsWrapper.getViewportRowModelBufferSize();
        const pageSize = this.gridOptionsWrapper.getViewportRowModelPageSize();
        const afterBuffer = firstRenderedRow - bufferSize;

        if (afterBuffer < 0) {
            return 0;
        } else {
            return Math.floor(afterBuffer / pageSize) * pageSize;
        }
    }

    private calculateLastRow(lastRenderedRow: number): number {
        if (lastRenderedRow === -1) {
            return lastRenderedRow;
        }
        const bufferSize = this.gridOptionsWrapper.getViewportRowModelBufferSize();
        const pageSize = this.gridOptionsWrapper.getViewportRowModelPageSize();
        const afterBuffer = lastRenderedRow + bufferSize;

        const result = Math.ceil(afterBuffer / pageSize) * pageSize;
        const lastRowIndex = this.rowCount - 1;
        return Math.min(result, lastRowIndex);
    }

    private onViewportChanged(event: any): void {
        const newFirst = this.calculateFirstRow(event.firstRow);
        const newLast = this.calculateLastRow(event.lastRow);
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
            const index = parseInt(indexStr, 10);
            if (index < this.firstRow || index > this.lastRow) {
                delete this.rowNodesByIndex[index];
            }
        });
    }

    public setViewportDatasource(viewportDatasource: IViewportDatasource): void {
        this.destroyDatasource();

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

    public getRowNode(id: string): RowNode | null {
        let result: RowNode | null = null;
        this.forEachNode(rowNode => {
            if (rowNode.id === id) {
                result = rowNode;
            }
        });
        return result;
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

    public getRowBounds(index: number): RowBounds {
        return {
            rowHeight: this.rowHeight,
            rowTop: this.rowHeight * index
        };
    }

    public getTopLevelRowCount(): number {
        return this.getRowCount();
    }

    public getTopLevelRowDisplayedIndex(topLevelIndex: number): number {
        return topLevelIndex;
    }

    public getCurrentPageHeight(): number {
        return this.rowCount * this.rowHeight;
    }

    public isEmpty(): boolean {
        return this.rowCount > 0;
    }

    public isRowsToRender(): boolean {
        return this.rowCount > 0;
    }

    public getNodesInRangeForSelection(firstInRange: RowNode, lastInRange: RowNode): RowNode[] {
        const firstIndex = _.missing(firstInRange) ? 0 : firstInRange.rowIndex;
        const lastIndex = lastInRange.rowIndex;

        const firstNodeOutOfRange = firstIndex < this.firstRow || firstIndex > this.lastRow;
        const lastNodeOutOfRange = lastIndex < this.firstRow || lastIndex > this.lastRow;

        if (firstNodeOutOfRange || lastNodeOutOfRange) { return []; }

        const result: RowNode[] = [];

        const startIndex = firstIndex <= lastIndex ? firstIndex : lastIndex;
        const endIndex = firstIndex <= lastIndex ? lastIndex : firstIndex;

        for (let i = startIndex; i <= endIndex; i++) {
            result.push(this.rowNodesByIndex[i]);
        }

        return result;
    }

    public forEachNode(callback: (rowNode: RowNode, index: number) => void): void {
        let callbackCount = 0;
        Object.keys(this.rowNodesByIndex).forEach(indexStr => {
            const index = parseInt(indexStr, 10);
            const rowNode: RowNode = this.rowNodesByIndex[index];
            callback(rowNode, callbackCount);
            callbackCount++;
        });
    }

    private setRowData(rowData: {[key: number]: any}): void {
        _.iterateObject(rowData, (indexStr: string, dataItem: any) => {
            const index = parseInt(indexStr, 10);
            // we should never keep rows that we didn't specifically ask for, this
            // guarantees the contract we have with the server.
            if (index >= this.firstRow && index <= this.lastRow) {
                let rowNode = this.rowNodesByIndex[index];

                // the abnormal case is we requested a row even though the grid didn't need it
                // as a result of the paging and buffer (ie the row is off screen), in which
                // case we need to create a new node now
                if (_.missing(rowNode)) {
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
        const rowNode = new RowNode();
        this.context.wireBean(rowNode);
        rowNode.setRowHeight(this.rowHeight);
        rowNode.setRowTop(this.rowHeight * rowIndex);
        rowNode.setRowIndex(rowIndex);
        return rowNode;
    }

    public setRowCount(rowCount: number): void {
        if (rowCount !== this.rowCount) {
            this.rowCount = rowCount;
            const event: ModelUpdatedEvent = {
                type: Events.EVENT_MODEL_UPDATED,
                api: this.gridApi,
                columnApi: this.columnApi,
                newData: false,
                newPage: false,
                keepRenderedRows: false,
                animate: false
            };
            this.eventService.dispatchEvent(event);
        }
    }

    public isRowPresent(rowNode: RowNode): boolean {
        return false;
    }

}
