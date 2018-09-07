// Type definitions for ag-grid-community v19.0.0
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
    private isCellGoodToFocusOn;
    private getCellToLeft;
    private getCellToRight;
    getRowBelow(lastRow: GridRow): GridRow;
    private getCellBelow;
    private isLastRowInContainer;
    private getRowAbove;
    private getCellAbove;
    private getLastBodyCell;
    private getLastFloatingTopRow;
    getNextTabbedCell(gridCell: GridCell, backwards: boolean): GridCell;
    getNextTabbedCellForwards(gridCell: GridCell): GridCell;
    getNextTabbedCellBackwards(gridCell: GridCell): GridCell;
}
