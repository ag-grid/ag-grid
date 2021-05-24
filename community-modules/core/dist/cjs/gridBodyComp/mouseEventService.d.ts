// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { CellPosition } from "../entities/cellPosition";
import { CellComp } from "../rendering/cellComp";
import { DraggingEvent } from "../dragAndDrop/dragAndDropService";
import { BeanStub } from "../context/beanStub";
export declare class MouseEventService extends BeanStub {
    private controllersService;
    private static gridInstanceSequence;
    private static GRID_DOM_KEY;
    private gridInstanceId;
    stampTopLevelGridCompWithGridInstance(eGridDiv: HTMLElement): void;
    getRenderedCellForEvent(event: Event): CellComp | null;
    isEventFromThisGrid(event: UIEvent): boolean;
    isElementInThisGrid(element: HTMLElement): boolean;
    getCellPositionForEvent(event: MouseEvent | KeyboardEvent): CellPosition | null;
    getNormalisedPosition(event: MouseEvent | DraggingEvent): {
        x: number;
        y: number;
    };
}
