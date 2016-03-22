import {Bean, PostConstruct, Autowired} from "../context/context";
import {IRowModel} from "../interfaces/iRowModel";
import {RowNode} from "../entities/rowNode";
import {Constants} from "../constants";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {EventService} from "../eventService";
import {Events} from "../events";
import {Utils as _} from "../utils";
import {SelectionController} from "../selectionController";
import {ViewportSource} from "../interfaces/iViewportSourcet";

@Bean('rowModel')
export class ViewportRowController implements IRowModel {

    /** Have rowNode emit an event when the data changes. Then the cell should look at the data, and if it's
     * different, do a flash */

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('selectionController') private selectionController: SelectionController;

    private rowCount = -1;
    private viewportIndex = -1;
    private viewportHeight = -1;

    private rows: any = <any>{};

    private rowHeight: number;

    private viewportSource: ViewportSource;

    @PostConstruct
    private init(): void {
        this.rowHeight = this.gridOptionsWrapper.getRowHeightAsNumber();
    }

    public setViewportSource(viewportSource: ViewportSource): void {
        this.viewportSource = viewportSource;
    }

    public getType(): string {
        return Constants.ROW_MODEL_TYPE_VIEWPORT;
    }

    public getRow(index: number): RowNode {
        return this.rows[index];
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

    public setViewportIndex(index: number): void {
        if (this.viewportIndex !== index) {
            this.viewportIndex = index;
            this.viewportSource.onIndexChanged(index);
        }
    }

    public setViewportHeight(height: number): void {
        if (this.viewportHeight!==height) {
            this.viewportHeight = height;
            this.viewportSource.onHeightChanged(height);
        }
    }

    private setRowData(rowData: any): void {
        var viewportEnd = this.viewportIndex + this.viewportHeight;
        _.iterateObject(rowData, (indexStr: string, dataItem: any) => {
            var index = parseInt(indexStr);
            if (index >= this.viewportIndex && index <= this.viewportHeight) {
                this.rows[index] = this.createNode(dataItem, index, true);
            }
        });
    }

    // this is duplicated in virtualPageRowController, need to refactor
    private createNode(data: any, rowIndex: number, realNode: boolean): RowNode {
        var rowHeight = this.rowHeight;
        var top = rowHeight * rowIndex;

        var rowNode: RowNode;
        if (realNode) {
            // if a real node, then always create a new one
            rowNode = new RowNode(this.eventService, this.gridOptionsWrapper, this.selectionController);
            rowNode.id = rowIndex;
            rowNode.data = data;
            // and see if the previous one was selected, and if yes, swap it out
            this.selectionController.syncInRowNode(rowNode);
        } else {
            // if creating a proxy node, see if there is a copy in selected memory that we can use
            var rowNode = this.selectionController.getNodeForIdIfSelected(rowIndex);
            if (!rowNode) {
                rowNode = new RowNode(this.eventService, this.gridOptionsWrapper, this.selectionController);
                rowNode.id = rowIndex;
                rowNode.data = data;
            }
        }
        rowNode.rowTop = top;
        rowNode.rowHeight = rowHeight;

        return rowNode;
    }

    private setRowCount(rowCount: number): void {
        if (rowCount!==this.rowCount) {
            this.rowCount = rowCount;
            this.eventService.dispatchEvent(Events.EVENT_MODEL_UPDATED);
        }
    }
    
}
