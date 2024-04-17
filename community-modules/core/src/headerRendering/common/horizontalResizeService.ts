import { Autowired, Bean } from "../../context/context";
import { DragListenerParams, DragService } from "../../dragAndDrop/dragService";
import { BeanStub } from "../../context/beanStub";
import { CtrlsService } from "../../ctrlsService";

export interface HorizontalResizeParams {
    eResizeBar: HTMLElement;
    dragStartPixels?: number;
    onResizeStart: (shiftKey: boolean) => void;
    onResizing: (delta: number) => void;
    onResizeEnd: (delta: number) => void;
}

@Bean('horizontalResizeService')
export class HorizontalResizeService extends BeanStub {

    @Autowired('dragService') private dragService: DragService;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;

    private dragStartX: number;
    private resizeAmount: number;

    public addResizeBar(params: HorizontalResizeParams): () => void {
        const dragSource: DragListenerParams = {
            dragStartPixels: params.dragStartPixels || 0,
            eElement: params.eResizeBar,
            onDragStart: this.onDragStart.bind(this, params),
            onDragStop: this.onDragStop.bind(this, params),
            onDragging: this.onDragging.bind(this, params),
            includeTouch: true,
            stopPropagationForTouch: true
        };

        this.dragService.addDragSource(dragSource);

        // we pass remove func back to the caller, so call can tell us when they
        // are finished, and then we remove the listener from the drag source
        const finishedWithResizeFunc = () => this.dragService.removeDragSource(dragSource);

        return finishedWithResizeFunc;
    }

    private onDragStart(params: HorizontalResizeParams, mouseEvent: MouseEvent | Touch): void {
        this.dragStartX = mouseEvent.clientX;

        this.setResizeIcons();

        const shiftKey = mouseEvent instanceof MouseEvent && mouseEvent.shiftKey === true;
        params.onResizeStart(shiftKey);
    }

    private setResizeIcons(): void {

        const ctrl = this.ctrlsService.get('gridCtrl');
        // change the body cursor, so when drag moves out of the drag bar, the cursor is still 'resize' (or 'move'
        ctrl.setResizeCursor(true);
        // we don't want text selection outside the grid (otherwise it looks weird as text highlights when we move)
        ctrl.disableUserSelect(true);
    }

    private onDragStop(params: HorizontalResizeParams, mouseEvent: MouseEvent | Touch): void {
        params.onResizeEnd(this.resizeAmount);
        this.resetIcons();
    }

    private resetIcons(): void {
        const ctrl = this.ctrlsService.get('gridCtrl');
        ctrl.setResizeCursor(false);
        ctrl.disableUserSelect(false);
    }

    private onDragging(params: HorizontalResizeParams, mouseEvent: MouseEvent | Touch): void {
        this.resizeAmount = mouseEvent.clientX - this.dragStartX;
        params.onResizing(this.resizeAmount);
    }

}
