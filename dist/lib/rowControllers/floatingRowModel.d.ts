// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import GridOptionsWrapper from "../gridOptionsWrapper";
import { RowNode } from "../entities/rowNode";
export default class FloatingRowModel {
    private gridOptionsWrapper;
    private floatingTopRows;
    private floatingBottomRows;
    init(gridOptionsWrapper: GridOptionsWrapper): void;
    setFloatingTopRowData(rowData: any[]): void;
    setFloatingBottomRowData(rowData: any[]): void;
    private createNodesFromData(allData, isTop);
    getFloatingTopRowData(): RowNode[];
    getFloatingBottomRowData(): RowNode[];
    getFloatingTopTotalHeight(): number;
    getFloatingBottomTotalHeight(): number;
    private getTotalHeight(rowNodes);
}
