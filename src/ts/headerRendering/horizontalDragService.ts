import {Utils as _} from '../utils';
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Bean, Autowired} from "../context/context";
import {Qualifier} from "../context/context";

/** need to get this class to use the dragService, so no duplication */

export interface DragServiceParams {
    eDraggableElement: Element,
    eBody: HTMLElement,
    cursor: string,
    startAfterPixels: number,
    onDragStart: (event?: MouseEvent)=>void,
    onDragging: (delta: number, finished: boolean)=>void
}

@Bean('horizontalDragService')
export class HorizontalDragService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public addDragHandling(params: DragServiceParams): void {
        params.eDraggableElement.addEventListener('mousedown', (startEvent: MouseEvent) => {
            let myDocument = this.gridOptionsWrapper.getDocument();
            let eBody = <HTMLElement> myDocument.querySelector('body');
            new DragInstance(params, startEvent, eBody);
        });
    }
}

class DragInstance {

    private mouseMove: EventListener = this.onMouseMove.bind(this);
    private mouseUp: EventListener = this.onMouseUp.bind(this);
    private mouseLeave: EventListener = this.onMouseLeave.bind(this);

    private startEvent: MouseEvent;
    private dragStartX: number;
    private eDragParent: HTMLElement;

    private oldBodyCursor: string;
    private oldParentCursor: string;
    private oldMsUserSelect: string;
    private oldWebkitUserSelect: string;

    private lastDelta = 0;
    private params: DragServiceParams;
    private draggingStarted: boolean;

    constructor(params: DragServiceParams, startEvent: MouseEvent, eBody: HTMLElement) {

        this.params = params;
        this.eDragParent = eBody;

        this.dragStartX = startEvent.clientX;
        this.startEvent = startEvent;

        this.eDragParent.addEventListener('mousemove', this.mouseMove);
        this.eDragParent.addEventListener('mouseup', this.mouseUp);
        this.eDragParent.addEventListener('mouseleave', this.mouseLeave);

        this.draggingStarted = false;
        var startAfterPixelsExist = typeof params.startAfterPixels === 'number' && params.startAfterPixels>0;
        if (!startAfterPixelsExist) {
            this.startDragging();
        }
    }

    private startDragging(): void {
        this.draggingStarted = true;

        this.oldBodyCursor = this.params.eBody.style.cursor;
        this.oldParentCursor = this.eDragParent.style.cursor;
        this.oldMsUserSelect = this.eDragParent.style.msUserSelect;
        this.oldWebkitUserSelect = this.eDragParent.style.webkitUserSelect;

        // change the body cursor, so when drag moves out of the drag bar, the cursor is still 'resize' (or 'move'
        this.params.eBody.style.cursor = this.params.cursor;
        // same for outside the grid, we want to keep the resize (or move) cursor
        this.eDragParent.style.cursor = this.params.cursor;
        // we don't want text selection outside the grid (otherwise it looks weird as text highlights when we move)
        this.eDragParent.style.msUserSelect = 'none';
        this.eDragParent.style.webkitUserSelect = 'none';

        this.params.onDragStart(this.startEvent);
    }

    private onMouseMove(moveEvent: MouseEvent): void {
        var newX = moveEvent.clientX;
        this.lastDelta = newX - this.dragStartX;

        if (!this.draggingStarted) {
            var dragExceededStartAfterPixels = Math.abs(this.lastDelta) >= this.params.startAfterPixels;
            if (dragExceededStartAfterPixels) {
                this.startDragging();
            }
        }

        if (this.draggingStarted) {
            this.params.onDragging(this.lastDelta, false);
        }
    }

    private onMouseUp(): void {
        this.stopDragging();
    }

    private onMouseLeave(): void {
        this.stopDragging();
    }

    private stopDragging() {
        // reset cursor back to original cursor, if they were changed in the first place
        if (this.draggingStarted) {
            this.params.eBody.style.cursor = this.oldBodyCursor;
            this.eDragParent.style.cursor = this.oldParentCursor;
            this.eDragParent.style.msUserSelect = this.oldMsUserSelect;
            this.eDragParent.style.webkitUserSelect = this.oldWebkitUserSelect;
            this.params.onDragging(this.lastDelta, true);
        }
        // always remove the listeners, as these are always added
        this.eDragParent.removeEventListener('mousemove', this.mouseMove);
        this.eDragParent.removeEventListener('mouseup', this.mouseUp);
        this.eDragParent.removeEventListener('mouseleave', this.mouseLeave);
    }

}