// Type definitions for @ag-grid-community/core v23.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "./entities/column";
import { CellPosition } from "./entities/cellPosition";
import { RowNode } from "./entities/rowNode";
export declare class FocusController {
    private eventService;
    private gridOptionsWrapper;
    private columnController;
    private columnApi;
    private gridApi;
    private focusedCellPosition;
    private keyboardFocusActive;
    private events;
    private init;
    destroy(): void;
    isKeyboardFocus(): boolean;
    clearFocusedCell(): void;
    getFocusedCell(): CellPosition;
    private activateMouseMode;
    private activateKeyboardMode;
    getFocusCellToUseAfterRefresh(): CellPosition;
    private getGridCellForDomElement;
    setFocusedCell(rowIndex: number, colKey: string | Column, floating: string | undefined, forceBrowserFocus?: boolean): void;
    isCellFocused(cellPosition: CellPosition): boolean;
    isRowNodeFocused(rowNode: RowNode): boolean;
    isAnyCellFocused(): boolean;
    isRowFocused(rowIndex: number, floating: string): boolean;
    findFocusableElements(rootNode: HTMLElement, exclude?: string): HTMLElement[];
    private onCellFocused;
}
