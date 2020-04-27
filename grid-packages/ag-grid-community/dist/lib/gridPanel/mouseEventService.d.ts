import { CellPosition } from "../entities/cellPosition";
import { CellComp } from "../rendering/cellComp";
import { GridPanel } from "./gridPanel";
import { DraggingEvent } from "../dragAndDrop/dragAndDropService";
export declare class MouseEventService {
    private gridOptionsWrapper;
    private eGridDiv;
    private static gridInstanceSequence;
    private static GRID_DOM_KEY;
    private gridPanel;
    private gridInstanceId;
    private init;
    registerGridComp(gridPanel: GridPanel): void;
    private stampDomElementWithGridInstance;
    getRenderedCellForEvent(event: Event): CellComp;
    isEventFromThisGrid(event: MouseEvent | KeyboardEvent): boolean;
    getCellPositionForEvent(event: MouseEvent | KeyboardEvent): CellPosition;
    getNormalisedPosition(event: MouseEvent | DraggingEvent): {
        x: number;
        y: number;
    };
}
