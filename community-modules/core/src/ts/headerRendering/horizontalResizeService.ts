import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { Autowired, Bean } from "../context/context";
import { DragListenerParams, DragService } from "../dragAndDrop/dragService";

export interface HorizontalResizeParams {
    eResizeBar: HTMLElement;
    dragStartPixels?: number;
    onResizeStart: (shiftKey: boolean) => void;
    onResizing: (delta: number) => void;
    onResizeEnd: (delta: number) => void;
}

@Bean('horizontalResizeService')
export class HorizontalResizeService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('dragService') private dragService: DragService;
    @Autowired('eGridDiv') private eGridDiv: HTMLElement;

    private draggingStarted: boolean;
    private dragStartX: number;
    private resizeAmount: number;

    private oldBodyCursor: string;
    private oldMsUserSelect: string;
    private oldWebkitUserSelect: string;

    public addResizeBar(params: HorizontalResizeParams): () => void {
        const dragSource: DragListenerParams = {
            dragStartPixels: params.dragStartPixels || 0,
            eElement: params.eResizeBar,
            onDragStart: this.onDragStart.bind(this, params),
            onDragStop: this.onDragStop.bind(this, params),
            onDragging: this.onDragging.bind(this, params)
        };

        this.dragService.addDragSource(dragSource, true);

        // we pass remove func back to the caller, so call can tell us when they
        // are finished, and then we remove the listener from the drag source
        const finishedWithResizeFunc = () => this.dragService.removeDragSource(dragSource);

        return finishedWithResizeFunc;
    }

    private onDragStart(params: HorizontalResizeParams, mouseEvent: MouseEvent | Touch): void {
        this.draggingStarted = true;
        this.dragStartX = mouseEvent.clientX;

        this.setResizeIcons();

        const shiftKey = mouseEvent instanceof MouseEvent ? (mouseEvent as MouseEvent).shiftKey === true : false;
        params.onResizeStart(shiftKey);
    }

    private setResizeIcons(): void {
        this.oldBodyCursor = this.eGridDiv.style.cursor;
        this.oldMsUserSelect = this.eGridDiv.style.msUserSelect;
        this.oldWebkitUserSelect = this.eGridDiv.style.webkitUserSelect;

        // change the body cursor, so when drag moves out of the drag bar, the cursor is still 'resize' (or 'move'
        this.eGridDiv.style.cursor = 'col-resize';
        // we don't want text selection outside the grid (otherwise it looks weird as text highlights when we move)
        this.eGridDiv.style.msUserSelect = 'none';
        this.eGridDiv.style.webkitUserSelect = 'none';
    }

    private onDragStop(params: HorizontalResizeParams, mouseEvent: MouseEvent | Touch): void {
        params.onResizeEnd(this.resizeAmount);
        this.resetIcons();
    }

    private resetIcons(): void {
        // we don't want text selection outside the grid (otherwise it looks weird as text highlights when we move)
        this.eGridDiv.style.cursor = this.oldBodyCursor;
        this.eGridDiv.style.msUserSelect = this.oldMsUserSelect;
        this.eGridDiv.style.webkitUserSelect = this.oldWebkitUserSelect;
    }

    private onDragging(params: HorizontalResizeParams, mouseEvent: MouseEvent | Touch): void {
        this.resizeAmount = mouseEvent.clientX - this.dragStartX;
        params.onResizing(this.resizeAmount);
    }

}
