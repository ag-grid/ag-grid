// Type definitions for ag-grid-community v19.1.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "./entities/column";
import { GridCell } from "./entities/gridCell";
import { RowNode } from "./entities/rowNode";
export declare class FocusedCellController {
    private eventService;
    private gridOptionsWrapper;
    private columnController;
    private columnApi;
    private gridApi;
    private focusedCell;
    private init;
    clearFocusedCell(): void;
    getFocusedCell(): GridCell;
    getFocusCellToUseAfterRefresh(): GridCell;
    private getGridCellForDomElement;
    setFocusedCell(rowIndex: number, colKey: string | Column, floating: string, forceBrowserFocus?: boolean): void;
    isCellFocused(gridCell: GridCell): boolean;
    isRowNodeFocused(rowNode: RowNode): boolean;
    isAnyCellFocused(): boolean;
    isRowFocused(rowIndex: number, floating: string): boolean;
    private onCellFocused;
}
//# sourceMappingURL=focusedCellController.d.ts.map