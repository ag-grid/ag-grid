import type { DragListenerParams } from 'ag-stack';
import { Direction } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';

interface HorizontalResizeParams {
    eResizeBar: HTMLElement;
    dragStartPixels?: number;
    /** use column cursor when resizing, default false */
    isColumn?: boolean;
    onResizeStart: (shiftKey: boolean) => void;
    onResizing: (delta: number) => void;
    onResizeEnd: (delta: number) => void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class HorizontalResizeService extends BeanStub implements NamedBean {
    beanName = 'horizontalResizeSvc' as const;

    private dragStartX: number;
    private resizeAmount: number;

    public addResizeBar(params: HorizontalResizeParams): () => void {
        const dragSource: DragListenerParams = {
            dragStartPixels: params.dragStartPixels || 0,
            eElement: params.eResizeBar,
            onDragStart: this.onDragStart.bind(this, params),
            onDragStop: this.onDragStop.bind(this, params),
            onDragging: this.onDragging.bind(this, params),
            onDragCancel: this.onDragStop.bind(this, params),
            includeTouch: true,
            stopPropagationForTouch: true,
        };

        const { dragSvc } = this.beans;

        dragSvc!.addDragSource(dragSource);

        // we pass remove func back to the caller, so call can tell us when they
        // are finished, and then we remove the listener from the drag source
        const finishedWithResizeFunc = () => dragSvc!.removeDragSource(dragSource);

        return finishedWithResizeFunc;
    }

    private onDragStart(params: HorizontalResizeParams, mouseEvent: MouseEvent | Touch): void {
        this.dragStartX = mouseEvent.clientX;

        this.setResizeIcons(!!params.isColumn);

        const shiftKey = mouseEvent instanceof MouseEvent && mouseEvent.shiftKey === true;
        params.onResizeStart(shiftKey);
    }

    private setResizeIcons(isColumn: boolean): void {
        const ctrl = this.beans.ctrlsSvc.get('gridCtrl');
        // change the body cursor, so when drag moves out of the drag bar, the cursor is still 'resize' (or 'move'
        ctrl.setResizeCursor(Direction.Horizontal, isColumn);
        // we don't want text selection outside the grid (otherwise it looks weird as text highlights when we move)
        ctrl.disableUserSelect(true);
    }

    private onDragStop(params: HorizontalResizeParams): void {
        params.onResizeEnd(this.resizeAmount);
        this.resetIcons();
    }

    private resetIcons(): void {
        const ctrl = this.beans.ctrlsSvc.get('gridCtrl');
        ctrl.setResizeCursor(false);
        ctrl.disableUserSelect(false);
    }

    private onDragging(params: HorizontalResizeParams, mouseEvent: MouseEvent | Touch): void {
        this.resizeAmount = mouseEvent.clientX - this.dragStartX;
        params.onResizing(this.resizeAmount);
    }
}
