import { CellPosition } from "../entities/cellPositionUtils";
import { DraggingEvent } from "../dragAndDrop/dragAndDropService";
import { BeanStub } from "../context/beanStub";
import { CellCtrl } from "../rendering/cell/cellCtrl";
export declare class MouseEventService extends BeanStub {
    private ctrlsService;
    private static gridInstanceSequence;
    private static GRID_DOM_KEY;
    private gridInstanceId;
    stampTopLevelGridCompWithGridInstance(eGridDiv: HTMLElement): void;
    getRenderedCellForEvent(event: Event): CellCtrl | null;
    isEventFromThisGrid(event: UIEvent): boolean;
    isElementInThisGrid(element: HTMLElement): boolean;
    getCellPositionForEvent(event: MouseEvent | KeyboardEvent): CellPosition | null;
    getNormalisedPosition(event: MouseEvent | DraggingEvent): {
        x: number;
        y: number;
    };
}
