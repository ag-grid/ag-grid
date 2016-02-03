
import GridOptionsWrapper from "../gridOptionsWrapper";
import {RowNode} from "../entities/rowNode";

export default class FloatingRowModel {

    private gridOptionsWrapper: GridOptionsWrapper;

    private floatingTopRows: RowNode[];
    private floatingBottomRows: RowNode[];

    public init(gridOptionsWrapper: GridOptionsWrapper): void {
        this.gridOptionsWrapper = gridOptionsWrapper;

        this.setFloatingTopRowData(gridOptionsWrapper.getFloatingTopRowData());
        this.setFloatingBottomRowData(gridOptionsWrapper.getFloatingBottomRowData());
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
                var rowNode: RowNode = {
                    data: dataItem,
                    floating: true,
                    floatingTop: isTop,
                    floatingBottom: !isTop,
                    rowTop: nextRowTop,
                    rowHeight: null
                };
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
