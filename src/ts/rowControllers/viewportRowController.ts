import {Bean, PostConstruct, Autowired} from "../context/context";
import {IRowModel} from "../interfaces/iRowModel";
import {RowNode} from "../entities/rowNode";
import {Constants} from "../constants";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {EventService} from "../eventService";
import {Events} from "../events";
import {Utils as _} from "../utils";
import {SelectionController} from "../selectionController";
import {ViewportDatasource} from "../interfaces/iViewportDatasourcet";

@Bean('rowModel')
export class ViewportRowController implements IRowModel {

    /** Have rowNode emit an event when the data changes. Then the cell should look at the data, and if it's
     * different, do a flash */

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('selectionController') private selectionController: SelectionController;

    // rowRenderer tells us these
    private firstRow = -1;
    private lastRow = -1;

    // datasource tells us this
    private rowCount = -1;

    private rowNodesByIndex: {[key: number]: RowNode} = {};

    private rowHeight: number;

    private viewportDatasource: ViewportDatasource;

    @PostConstruct
    private init(): void {
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
        this.eventService.addEventListener(Events.EVENT_VIEWPORT_CHANGED, this.onViewportChanged.bind(this));
    }

    private onViewportChanged(event: any): void {
        this.firstRow = event.firstRow;
        this.lastRow = event.lastRow;
        this.purgeRowsNotInViewport();
        if (this.viewportDatasource) {
            this.viewportDatasource.setViewportRange(this.firstRow, this.lastRow);
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

    public setViewportDatasource(viewportDatasource: ViewportDatasource): void {
        this.viewportDatasource = viewportDatasource;
        this.rowCount = 0;
        if (!viewportDatasource.init) {
            console.warn('ag-Grid: viewport is missing init method.');
        } else {
            viewportDatasource.init({
                setRowCount: this.setRowCount.bind(this),
                setRowData: this.setRowData.bind(this)
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

    private setRowData(rowData: {[key: number]: RowNode}): void {
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

    // this is duplicated in virtualPageRowController, need to refactor
    private createNode(data: any, rowIndex: number): RowNode {
        var rowHeight = this.rowHeight;
        var top = rowHeight * rowIndex;

        // need to refactor this, get it in sync with VirtualPageRowController, which was not
        // written with the rowNode.rowUpdated in mind
        var rowNode = new RowNode(this.eventService, this.gridOptionsWrapper, this.selectionController);
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
