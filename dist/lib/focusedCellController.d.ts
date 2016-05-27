// Type definitions for ag-grid v4.2.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Column } from "./entities/column";
import { ColDef } from "./entities/colDef";
import { GridCell } from "./entities/gridCell";
export declare class FocusedCellController {
    private eventService;
    private gridOptionsWrapper;
    private columnController;
    private focusedCell;
    private init();
    clearFocusedCell(): void;
    getFocusedCell(): GridCell;
    getFocusCellIfBrowserFocused(): GridCell;
    private getGridCellForDomElement(eBrowserCell);
    setFocusedCell(rowIndex: number, colKey: Column | ColDef | string, floating: string, forceBrowserFocus?: boolean): void;
    isCellFocused(gridCell: GridCell): boolean;
    isRowFocused(rowIndex: number, floating: string): boolean;
    private onCellFocused(forceBrowserFocus);
}
