import {Bean, PostConstruct, Autowired, Context, PreDestroy} from "../context/context";
import {IRowModel} from "../interfaces/iRowModel";
import {RowNode} from "../entities/rowNode";
import {Constants} from "../constants";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {EventService} from "../eventService";
import {Events} from "../events";
import {Utils as _} from "../utils";
import {SelectionController} from "../selectionController";
import {IViewportDatasource} from "../interfaces/iViewportDatasource";

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

    private rowNodesByIndex: {[key: number]: RowNode} = {};

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
        Object.keys(this.rowNodesByIndex).forEach( indexStr => {
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
            this.rowNodesByIndex[rowIndex] = this.createNode(null, rowIndex);
        }

        return this.rowNodesByIndex[rowIndex];
    }

    public getRowCount(): number {
        return this.rowCount;
    }

    public getRowIndexAtPixel(pixel: number): number {
        if (this.rowHeight!==0) { // avoid divide by zero error
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

    public forEachNode(callback:(rowNode: RowNode)=>void): void {
    }

    private setRowData(rowData: {[key: number]: any}): void {
        _.iterateObject(rowData, (indexStr: string, dataItem: any) => {
            var index = parseInt(indexStr);
            if (index >= this.firstRow && index <= this.lastRow) {
                var nodeAlreadyExists = !!this.rowNodesByIndex[index];
                if (nodeAlreadyExists) {
                    this.rowNodesByIndex[index].setData(dataItem);
                } else {
                    this.rowNodesByIndex[index] = this.createNode(dataItem, index);
                }
            }
        });
    }

    // this is duplicated in virtualPageRowModel, need to refactor
    private createNode(data: any, rowIndex: number): RowNode {
        var rowHeight = this.rowHeight;
        var top = rowHeight * rowIndex;

        // need to refactor this, get it in sync with VirtualPageRowController, which was not
        // written with the rowNode.rowUpdated in mind
        var rowNode = new RowNode();
        this.context.wireBean(rowNode);
        rowNode.id = rowIndex;
        rowNode.data = data;
        rowNode.rowTop = top;
        rowNode.rowHeight = rowHeight;

        return rowNode;
    }

    public setRowCount(rowCount: number): void {
        if (rowCount!==this.rowCount) {
            this.rowCount = rowCount;
            this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
        }
    }
    
}
