// Type definitions for ag-grid v13.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridCell } from "../entities/gridCell";
import { CellComp } from "../rendering/cellComp";
export declare class MouseEventService {
    private gridOptionsWrapper;
    getRenderedCellForEvent(event: MouseEvent | KeyboardEvent): CellComp;
    getGridCellForEvent(event: MouseEvent | KeyboardEvent): GridCell;
}
