
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {RowNode} from "../entities/rowNode";
import {Bean, Context} from "../context/context";
import {Qualifier} from "../context/context";
import {EventService} from "../eventService";
import {Autowired} from "../context/context";
import {Events} from "../events";
import {PostConstruct} from "../context/context";
import {Constants} from "../constants";
import {Utils as _} from '../utils';

@Bean('floatingRowModel')
export class FloatingRowModel {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    private floatingTopRows: RowNode[];
    private floatingBottomRows: RowNode[];

    @PostConstruct
    public init(): void {
        this.setFloatingTopRowData(this.gridOptionsWrapper.getFloatingTopRowData());
        this.setFloatingBottomRowData(this.gridOptionsWrapper.getFloatingBottomRowData());
    }

    public isEmpty(floating: string): boolean {
        var rows = floating===Constants.FLOATING_TOP ? this.floatingTopRows : this.floatingBottomRows;
        return _.missingOrEmpty(rows);
    }

    public isRowsToRender(floating: string): boolean {
        return !this.isEmpty(floating);
    }

    public getRowAtPixel(pixel: number, floating: string): number {
        var rows = floating===Constants.FLOATING_TOP ? this.floatingTopRows : this.floatingBottomRows;
        if (_.missingOrEmpty(rows)) {
            return 0; // this should never happen, just in case, 0 is graceful failure
        }
        for (var i = 0; i<rows.length; i++) {
            var rowNode = rows[i];
            var rowTopPixel = rowNode.rowTop + rowNode.rowHeight - 1;
            // only need to range check against the top pixel, as we are going through the list
            // in order, first row to hit the pixel wins
            if (rowTopPixel >= pixel) {
                return i;
            }
        }
        return rows.length - 1;
    }

    public setFloatingTopRowData(rowData: any[]): void {
        this.floatingTopRows = this.createNodesFromData(rowData, true);
        this.eventService.dispatchEvent(Events.EVENT_FLOATING_ROW_DATA_CHANGED);
    }

    public setFloatingBottomRowData(rowData: any[]): void {
        this.floatingBottomRows = this.createNodesFromData(rowData, false);
        this.eventService.dispatchEvent(Events.EVENT_FLOATING_ROW_DATA_CHANGED);
    }

    private createNodesFromData(allData: any[], isTop: boolean): RowNode[] {
        var rowNodes: RowNode[] = [];
        if (allData) {
            var nextRowTop = 0;
            allData.forEach( (dataItem) => {
                var rowNode = new RowNode();
                this.context.wireBean(rowNode);
                rowNode.data = dataItem;
                rowNode.floating = isTop ? Constants.FLOATING_TOP : Constants.FLOATING_BOTTOM;
                rowNode.rowTop = nextRowTop;
                rowNode.rowHeight = this.gridOptionsWrapper.getRowHeightForNode(rowNode);

                nextRowTop += rowNode.rowHeight;
                rowNodes.push(rowNode);
            });
        }
        return rowNodes
    }

    public getFloatingTopRowData(): RowNode[] {
        return this.floatingTopRows;
    }

    public getFloatingBottomRowData(): RowNode[] {
        return this.floatingBottomRows;
    }

    public getFloatingTopTotalHeight(): number {
        return this.getTotalHeight(this.floatingTopRows);
    }

    public getFloatingTopRowCount(): number {
        return this.floatingTopRows ? this.floatingTopRows.length : 0;
    }

    public getFloatingBottomRowCount(): number {
        return this.floatingBottomRows ? this.floatingBottomRows.length : 0;
    }

    public getFloatingTopRow(index: number): RowNode {
        return this.floatingTopRows[index];
    }

    public getFloatingBottomRow(index: number): RowNode {
        return this.floatingBottomRows[index];
    }

    public forEachFloatingTopRow(callback: (rowNode: RowNode, index: number)=>void): void {
        if (_.missingOrEmpty(this.floatingTopRows)) { return; }
        this.floatingTopRows.forEach(callback);
    }

    public forEachFloatingBottomRow(callback: (rowNode: RowNode, index: number)=>void): void {
        if (_.missingOrEmpty(this.floatingBottomRows)) { return; }
        this.floatingBottomRows.forEach(callback);
    }

    public getFloatingBottomTotalHeight(): number {
        return this.getTotalHeight(this.floatingBottomRows);
    }

    private getTotalHeight(rowNodes: RowNode[]): number {
        if (!rowNodes || rowNodes.length === 0) {
            return 0;
        } else {
            var lastNode = rowNodes[rowNodes.length - 1];
            return lastNode.rowTop + lastNode.rowHeight;
        }
    }

}
