// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridRow } from "./entities/gridRow";
import { GridCell } from "./entities/gridCell";
export declare class CellNavigationService {
    private columnController;
    private rowModel;
    private pinnedRowModel;
    private gridOptionsWrapper;
    getNextCellToFocus(key: any, lastCellToFocus: GridCell): GridCell;
    private isCellGoodToFocusOn(gridCell);
    private getCellToLeft(lastCell);
    private getCellToRight(lastCell);
    getRowBelow(lastRow: GridRow): GridRow;
    private getCellBelow(lastCell);
    private isLastRowInContainer(gridRow);
    private getRowAbove(lastRow);
    private getCellAbove(lastCell);
    private getLastBodyCell();
    private getLastFloatingTopRow();
    getNextTabbedCell(gridCell: GridCell, backwards: boolean): GridCell;
    getNextTabbedCellForwards(gridCell: GridCell): GridCell;
    getNextTabbedCellBackwards(gridCell: GridCell): GridCell;
}
