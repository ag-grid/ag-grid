// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { GridCell } from "../entities/gridCell";
import { CellComp } from "../rendering/cellComp";
export declare class MouseEventService {
    private gridOptionsWrapper;
    getRenderedCellForEvent(event: MouseEvent | KeyboardEvent): CellComp;
    getGridCellForEvent(event: MouseEvent | KeyboardEvent): GridCell;
}
