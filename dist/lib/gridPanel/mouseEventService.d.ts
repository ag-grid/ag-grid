// Type definitions for ag-grid v13.3.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridCell } from "../entities/gridCell";
import { CellComp } from "../rendering/cellComp";
export declare class MouseEventService {
    private gridOptionsWrapper;
    private eGridDiv;
    private static gridInstanceSequence;
    private static GRID_DOM_KEY;
    private gridInstanceId;
    private init();
    private stampDomElementWithGridInstance();
    getRenderedCellForEvent(event: MouseEvent | KeyboardEvent): CellComp;
    isEventFromThisGrid(event: MouseEvent | KeyboardEvent): boolean;
    getGridCellForEvent(event: MouseEvent | KeyboardEvent): GridCell;
}
