import { CellPosition } from "../entities/cellPosition";
import { CellComp } from "../rendering/cellComp";
import { GridPanel } from "./gridPanel";
import { DraggingEvent } from "../dragAndDrop/dragAndDropService";
import { BeanStub } from "../context/beanStub";
export declare class MouseEventService extends BeanStub {
    private eGridDiv;
    private static gridInstanceSequence;
    private static GRID_DOM_KEY;
    private gridPanel;
    private gridInstanceId;
    private init;
    registerGridComp(gridPanel: GridPanel): void;
    private stampDomElementWithGridInstance;
    getRenderedCellForEvent(event: Event): CellComp | null;
    isEventFromThisGrid(event: MouseEvent | KeyboardEvent): boolean;
    getCellPositionForEvent(event: MouseEvent | KeyboardEvent): CellPosition | null;
    getNormalisedPosition(event: MouseEvent | DraggingEvent): {
        x: number;
        y: number;
    };
}
