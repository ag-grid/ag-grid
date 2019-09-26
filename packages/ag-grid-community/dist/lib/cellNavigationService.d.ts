// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { CellPosition } from "./entities/cellPosition";
import { RowPosition } from "./entities/rowPosition";
export declare class CellNavigationService {
    private columnController;
    private rowModel;
    private pinnedRowModel;
    private gridOptionsWrapper;
    getNextCellToFocus(key: any, lastCellToFocus: CellPosition): CellPosition | null;
    private isCellGoodToFocusOn;
    private getCellToLeft;
    private getCellToRight;
    getRowBelow(rowPosition: RowPosition): RowPosition | null;
    private getCellBelow;
    private isLastRowInContainer;
    getRowAbove(rowPosition: RowPosition): RowPosition | null;
    private getCellAbove;
    private getLastBodyCell;
    private getLastFloatingTopRow;
    getNextTabbedCell(gridCell: CellPosition, backwards: boolean): CellPosition | null;
    getNextTabbedCellForwards(gridCell: CellPosition): CellPosition | null;
    getNextTabbedCellBackwards(gridCell: CellPosition): CellPosition | null;
}
