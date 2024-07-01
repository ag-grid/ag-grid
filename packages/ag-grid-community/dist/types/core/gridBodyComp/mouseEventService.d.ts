import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { DraggingEvent } from '../dragAndDrop/dragAndDropService';
import type { CellPosition } from '../entities/cellPositionUtils';
import { CellCtrl } from '../rendering/cell/cellCtrl';
export declare class MouseEventService extends BeanStub implements NamedBean {
    beanName: "mouseEventService";
    private ctrlsService;
    wireBeans(beans: BeanCollection): void;
    private static gridInstanceSequence;
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
