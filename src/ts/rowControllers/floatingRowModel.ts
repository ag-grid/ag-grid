
import GridOptionsWrapper from "../gridOptionsWrapper";
import {RowNode} from "../entities/rowNode";
import {Bean} from "../context/context";
import {Qualifier} from "../context/context";
import EventService from "../eventService";

@Bean('floatingRowModel')
export default class FloatingRowModel {

    @Qualifier('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Qualifier('eventService') private eventService: EventService;

    private floatingTopRows: RowNode[];
    private floatingBottomRows: RowNode[];

    public agPostWire() {
        this.setFloatingTopRowData(this.gridOptionsWrapper.getFloatingTopRowData());
        this.setFloatingBottomRowData(this.gridOptionsWrapper.getFloatingBottomRowData());
    }

    public setFloatingTopRowData(rowData: any[]): void {
        this.floatingTopRows = this.createNodesFromData(rowData, false);
    }

    public setFloatingBottomRowData(rowData: any[]): void {
        this.floatingBottomRows = this.createNodesFromData(rowData, false);
    }

    private createNodesFromData(allData: any[], isTop: boolean): RowNode[] {
        var rowNodes: RowNode[] = [];
        if (allData) {
            var nextRowTop = 0;
            allData.forEach( (dataItem) => {
                var rowNode = new RowNode(this.eventService, this.gridOptionsWrapper, null, null);
                rowNode.data = dataItem;
                rowNode.floating = true;
                rowNode.floatingTop = isTop;
                rowNode.floatingBottom = !isTop;
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
