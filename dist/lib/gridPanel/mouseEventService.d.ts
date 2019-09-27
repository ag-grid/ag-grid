// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { CellPosition } from "../entities/cellPosition";
import { CellComp } from "../rendering/cellComp";
export declare class MouseEventService {
    private gridOptionsWrapper;
    private eGridDiv;
    private static gridInstanceSequence;
    private static GRID_DOM_KEY;
    private gridInstanceId;
    private init;
    private stampDomElementWithGridInstance;
    getRenderedCellForEvent(event: Event): CellComp;
    isEventFromThisGrid(event: MouseEvent | KeyboardEvent): boolean;
    getCellPositionForEvent(event: MouseEvent | KeyboardEvent): CellPosition;
}
