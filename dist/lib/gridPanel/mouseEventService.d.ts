// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { GridCell } from "../entities/gridCell";
import { RenderedCell } from "../rendering/renderedCell";
export declare class MouseEventService {
    private gridOptionsWrapper;
    getRenderedCellForEvent(event: MouseEvent | KeyboardEvent): RenderedCell;
    getGridCellForEvent(event: MouseEvent | KeyboardEvent): GridCell;
}
