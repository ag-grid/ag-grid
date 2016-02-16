
import {Logger} from "../logger";
import {Qualifier} from "../context/context";
import {LoggerFactory} from "../logger";
import {Bean} from "../context/context";
import Column from "../entities/column";
import HeaderTemplateLoader from "../headerRendering/headerTemplateLoader";
import _ from '../utils';
import GridOptionsWrapper from "../gridOptionsWrapper";
import {Autowired} from "../context/context";

export interface DragSource {
    eElement: HTMLElement,
    dragItem: Column,
    dragSource: any
}

export interface DropTarget {
    eElement: HTMLElement,
    onDragCallback: Function
}

@Bean('dragAndDropService2')
export class DragAndDropService2 {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public static DIRECTION_LEFT = 'left';
    public static DIRECTION_RIGHT = 'right';

    private logger: Logger;

    private dragging = false;
    private dragItem: Column;

    private dragSource: any;
    private eventXLastTime: number;

    private onMouseUpListener = this.onMouseUp.bind(this);
    private onMouseMoveListener = this.onMouseMove.bind(this);

    private eGhost: HTMLElement;
    private eBody: HTMLElement;

    private dropTargets: DropTarget[] = [];

    public agWire(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('DragAndDropService');
        this.eBody = <HTMLElement> document.querySelector('body');
        if (!this.eBody) {
            console.warn('ag-Grid: could not find document body, it is needed for dragging columns');
        }
    }

    public addDragSource(params: DragSource): void {
        params.eElement.addEventListener('mousedown', this.onMouseDown.bind(this, params));
    }

    public onMouseDown(dragSource: DragSource, mouseEvent: MouseEvent): void {
        this.startDrag(dragSource, mouseEvent);
    }

    public addDropTarget(dropTarget: DropTarget) {
        this.dropTargets.push(dropTarget);
    }

    public informDropTarget(dropTarget: DropTarget, event: MouseEvent): void {
        //localise x and y to the target component
        var rect = dropTarget.eElement.getBoundingClientRect();
        var x = event.x - rect.left;
        var y = event.y - rect.top;

        var direction: string;
        if (this.eventXLastTime > event.x) {
            direction = DragAndDropService2.DIRECTION_LEFT;
        } else if (this.eventXLastTime < event.x) {
            direction = DragAndDropService2.DIRECTION_RIGHT;
        } else {
            direction = null;
        }

        dropTarget.onDragCallback({
            event: event,
            x: x,
            y: y,
            direction: direction,
            dragItem: this.dragItem,
            dragSource: this.dragSource
        });

        this.eventXLastTime = event.x;
    }

    public startDrag(dragSource: DragSource, mouseEvent: MouseEvent): void {
        this.logger.log('startDrag');
        this.eventXLastTime = mouseEvent.x;
        dragSource.dragItem.setMoving(true);
        this.dragging = true;
        this.dragItem = dragSource.dragItem;
        this.dragSource = dragSource;
        document.addEventListener('mouseup', this.onMouseUpListener);

        this.createGhost(dragSource.dragItem);
    }

    private onMouseMove(event: MouseEvent): void {
        this.positionGhost(event);

        var dropTarget = _.find(this.dropTargets, (dropTarget: DropTarget)=> {
            var rect = dropTarget.eElement.getBoundingClientRect();
            var horizontalFit = event.x > rect.left && event.x < rect.right;
            var verticalFit = event.y > rect.top && event.y < rect.bottom;
            return horizontalFit && verticalFit;
        });

        if (dropTarget) {
            this.informDropTarget(dropTarget, event);
        }
    }

    private positionGhost(event: MouseEvent): void {
        var ghostRect = this.eGhost.getBoundingClientRect();
        var ghostWidth = ghostRect.width;
        var ghostHeight = ghostRect.height;
        // for some reason, without the '-2', it still overlapped by 1 or 2 pixels, which
        // then brought in scrollbars to the browser. no idea why, but putting in -2 here
        // works around it which is good enough for me.
        var browserWidth = _.getBrowserWidth() - 2;
        var browserHeight = _.getBrowserHeight() - 2;

        // put ghost in middle of cursor
        var left = event.x - (ghostWidth / 2);
        var top = event.y - (ghostHeight / 2);

        // check ghost is not positioned outside of the browser
        if (browserWidth>0) {
            if ( (left + this.eGhost.clientWidth) > browserWidth) {
                left = browserWidth - this.eGhost.clientWidth;
            }
        }
        if (left < 0) {
            left = 0;
        }
        if (browserHeight>0) {
            if ( (top + this.eGhost.clientHeight) > browserHeight) {
                top = browserHeight - this.eGhost.clientHeight;
            }
        }
        if (top < 0) {
            top = 0;
        }

        this.eGhost.style.left = left + 'px';
        this.eGhost.style.top = top + 'px';
    }

    private removeGhost(): void {
        if (this.eGhost) {
            this.eBody.removeChild(this.eGhost);
        }
        this.eGhost = null;
        document.removeEventListener('mousemove', this.onMouseMoveListener);
    }

    private createGhost(dragItem: Column): void {
        this.eGhost = _.loadTemplate(HeaderTemplateLoader.HEADER_CELL_DND_TEMPLATE);
        var eText = <HTMLElement> this.eGhost.querySelector('#agText');
        if (dragItem.getColDef().headerName) {
            eText.innerHTML = dragItem.getColDef().headerName;
        } else {
            eText.innerHTML = dragItem.getColId()
        }
        this.eGhost.style.width = dragItem.getActualWidth() + 'px';
        this.eGhost.style.height = this.gridOptionsWrapper.getHeaderHeight() + 'px';
        this.eGhost.style.top = '20px';
        this.eGhost.style.left = '20px';
        this.eBody.appendChild(this.eGhost);

        document.addEventListener('mousemove', this.onMouseMoveListener)
    }

    public onMouseUp(): void {
        this.logger.log('onMouseUp');
        this.dragItem.setMoving(false);
        this.dragging = false;
        this.dragItem = null;
        this.removeGhost();
        document.removeEventListener('mouseup', this.onMouseUpListener);
    }

}
