
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

@Bean('pinnedRowModel')
export class PinnedRowModel {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    private pinnedTopRows: RowNode[];
    private pinnedBottomRows: RowNode[];

    @PostConstruct
    public init(): void {
        this.setPinnedTopRowData(this.gridOptionsWrapper.getPinnedTopRowData());
        this.setPinnedBottomRowData(this.gridOptionsWrapper.getPinnedBottomRowData());
    }

    public isEmpty(floating: string): boolean {
        let rows = floating===Constants.PINNED_TOP ? this.pinnedTopRows : this.pinnedBottomRows;
        return _.missingOrEmpty(rows);
    }

    public isRowsToRender(floating: string): boolean {
        return !this.isEmpty(floating);
    }

    public getRowAtPixel(pixel: number, floating: string): number {
        let rows = floating===Constants.PINNED_TOP ? this.pinnedTopRows : this.pinnedBottomRows;
        if (_.missingOrEmpty(rows)) {
            return 0; // this should never happen, just in case, 0 is graceful failure
        }
        for (let i = 0; i<rows.length; i++) {
            let rowNode = rows[i];
            let rowTopPixel = rowNode.rowTop + rowNode.rowHeight - 1;
            // only need to range check against the top pixel, as we are going through the list
            // in order, first row to hit the pixel wins
            if (rowTopPixel >= pixel) {
                return i;
            }
        }
        return rows.length - 1;
    }

    public setPinnedTopRowData(rowData: any[]): void {
        this.pinnedTopRows = this.createNodesFromData(rowData, true);
        this.eventService.dispatchEvent(Events.EVENT_PINNED_ROW_DATA_CHANGED);
    }

    public setPinnedBottomRowData(rowData: any[]): void {
        this.pinnedBottomRows = this.createNodesFromData(rowData, false);
        this.eventService.dispatchEvent(Events.EVENT_PINNED_ROW_DATA_CHANGED);
    }

    private createNodesFromData(allData: any[], isTop: boolean): RowNode[] {
        let rowNodes: RowNode[] = [];
        if (allData) {
            let nextRowTop = 0;
            allData.forEach( (dataItem: any, index: number) => {
                let rowNode = new RowNode();
                this.context.wireBean(rowNode);
                rowNode.data = dataItem;
                rowNode.rowPinned = isTop ? Constants.PINNED_TOP : Constants.PINNED_BOTTOM;
                rowNode.setRowTop(nextRowTop);
                rowNode.setRowHeight(this.gridOptionsWrapper.getRowHeightForNode(rowNode));
                rowNode.setRowIndex(index);
                nextRowTop += rowNode.rowHeight;
                rowNodes.push(rowNode);
            });
        }
        return rowNodes
    }

    public getPinnedTopRowData(): RowNode[] {
        return this.pinnedTopRows;
    }

    public getPinnedBottomRowData(): RowNode[] {
        return this.pinnedBottomRows;
    }

    public getPinnedTopTotalHeight(): number {
        return this.getTotalHeight(this.pinnedTopRows);
    }

    public getPinnedTopRowCount(): number {
        return this.pinnedTopRows ? this.pinnedTopRows.length : 0;
    }

    public getPinnedBottomRowCount(): number {
        return this.pinnedBottomRows ? this.pinnedBottomRows.length : 0;
    }

    public getPinnedTopRow(index: number): RowNode {
        return this.pinnedTopRows[index];
    }

    public getPinnedBottomRow(index: number): RowNode {
        return this.pinnedBottomRows[index];
    }

    public forEachPinnedTopRow(callback: (rowNode: RowNode, index: number)=>void): void {
        if (_.missingOrEmpty(this.pinnedTopRows)) { return; }
        this.pinnedTopRows.forEach(callback);
    }

    public forEachPinnedBottomRow(callback: (rowNode: RowNode, index: number)=>void): void {
        if (_.missingOrEmpty(this.pinnedBottomRows)) { return; }
        this.pinnedBottomRows.forEach(callback);
    }

    public getPinnedBottomTotalHeight(): number {
        return this.getTotalHeight(this.pinnedBottomRows);
    }

    private getTotalHeight(rowNodes: RowNode[]): number {
        if (!rowNodes || rowNodes.length === 0) {
            return 0;
        } else {
            let lastNode = rowNodes[rowNodes.length - 1];
            return lastNode.rowTop + lastNode.rowHeight;
        }
    }

}
