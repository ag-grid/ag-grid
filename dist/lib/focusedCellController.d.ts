// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "./entities/column";
import { ColDef } from "./entities/colDef";
import { GridCell } from "./entities/gridCell";
import { RowNode } from "./entities/rowNode";
export declare class FocusedCellController {
    private eventService;
    private gridOptionsWrapper;
    private columnController;
    private focusedCell;
    private init();
    clearFocusedCell(): void;
    getFocusedCell(): GridCell;
    getFocusCellToUseAfterRefresh(): GridCell;
    private getGridCellForDomElement(eBrowserCell);
    setFocusedCell(rowIndex: number, colKey: Column | ColDef | string, floating: string, forceBrowserFocus?: boolean): void;
    isCellFocused(gridCell: GridCell): boolean;
    isRowNodeFocused(rowNode: RowNode): boolean;
    isAnyCellFocused(): boolean;
    isRowFocused(rowIndex: number, floating: string): boolean;
    private onCellFocused(forceBrowserFocus);
}
