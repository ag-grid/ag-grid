
import {Logger} from "../logger";
import {Qualifier} from "../context/context";
import {LoggerFactory} from "../logger";
import {Bean} from "../context/context";
import Column from "../entities/column";
import HeaderTemplateLoader from "../headerRendering/headerTemplateLoader";
import _ from '../utils';
import GridOptionsWrapper from "../gridOptionsWrapper";
import {Autowired} from "../context/context";
import GridPanel from "../gridPanel/gridPanel";

export interface DragSource {
    eElement: HTMLElement,
    dragItem: Column,
    dragSourceDropTarget: DropTarget
}

export interface DropTarget {
    eContainer: HTMLElement,
    eSecondaryContainers: HTMLElement[],
    onDragEnter?: (params: DraggingEvent)=>void,
    onDragLeave?: (params: DraggingEvent)=>void,
    onDragging?: (params: DraggingEvent)=>void,
    onDragStop?: ()=>void
}

export interface DraggingEvent {
    event: MouseEvent,
    x: number,
    y: number,
    direction: string,
    dragItem: Column,
    dragSource: DragSource
}

@Bean('dragAndDropService2')
export class DragAndDropService2 {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridPanel') private gridPanel: GridPanel;

    public static DIRECTION_LEFT = 'left';
    public static DIRECTION_RIGHT = 'right';

    private logger: Logger;

    private dragging = false;
    private dragItem: Column;
    private dragStartEvent: MouseEvent;

    private dragSource: DragSource;
    private eventXLastTime: number;

    private onMouseUpListener = this.onMouseUp.bind(this);
    private onMouseMoveListener = this.onMouseMove.bind(this);

    private eGhost: HTMLElement;
    private eBody: HTMLElement;

    private dropTargets: DropTarget[] = [];
    private lastDropTarget: DropTarget;

    private addMovingCssToGrid: boolean;


    public agWire(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('DragAndDropService');
        this.addMovingCssToGrid = !this.gridOptionsWrapper.isSuppressMovingCss();
        this.eBody = <HTMLElement> document.querySelector('body');
        if (!this.eBody) {
            console.warn('ag-Grid: could not find document body, it is needed for dragging columns');
        }
    }

    public addDragSource(params: DragSource): void {
        params.eElement.addEventListener('mousedown', this.onMouseDown.bind(this, params));
    }

    public onMouseDown(dragSource: DragSource, mouseEvent: MouseEvent): void {
        this.dragSource = dragSource;
        this.eventXLastTime = mouseEvent.clientX;
        this.dragging = false;
        this.dragStartEvent = mouseEvent;
        document.addEventListener('mousemove', this.onMouseMoveListener)
        document.addEventListener('mouseup', this.onMouseUpListener);
    }

    public addDropTarget(dropTarget: DropTarget) {
        this.dropTargets.push(dropTarget);
    }

    public workOutDirection(event: MouseEvent): string {
        var direction: string;
        if (this.eventXLastTime > event.clientX) {
            direction = DragAndDropService2.DIRECTION_LEFT;
        } else if (this.eventXLastTime < event.clientX) {
            direction = DragAndDropService2.DIRECTION_RIGHT;
        } else {
            direction = null;
        }

        this.eventXLastTime = event.clientX;

        return direction;
    }

    public createDropTargetEvent(dropTarget: DropTarget, event: MouseEvent, direction: string): DraggingEvent {

        // localise x and y to the target component
        var rect = dropTarget.eContainer.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        var dropTargetEvent = {
            event: event,
            x: x,
            y: y,
            direction: direction,
            dragItem: this.dragItem,
            dragSource: this.dragSource
        };

        return dropTargetEvent;
    }

    public startDrag(): void {

        this.logger.log('startDrag');
        this.dragSource.dragItem.setMoving(true);
        this.dragging = true;
        this.dragItem = this.dragSource.dragItem;
        this.lastDropTarget = this.dragSource.dragSourceDropTarget;

        this.createGhost();
    }

    private getDistanceBetweenEvents(event1: MouseEvent, event2: MouseEvent): number {
        var diffX = Math.abs(event1.clientX - event2.clientX);
        var diffY = Math.abs(event1.clientY - event2.clientY);
        return Math.max(diffX, diffY);
    }

    private onMouseMove(event: MouseEvent): void {

        if (!this.dragging) {
            // we want to have moved at least 4px before the drag starts
            if (this.getDistanceBetweenEvents(event, this.dragStartEvent) < 4) {
                return;
            }
            this.startDrag();
        }

        this.positionGhost(event);

        // check if mouseEvent intersects with any of the drop targets
        var dropTarget = _.find(this.dropTargets, (dropTarget: DropTarget)=> {
            var targetsToCheck = [dropTarget.eContainer];
            if (dropTarget.eSecondaryContainers) {
                targetsToCheck = targetsToCheck.concat(dropTarget.eSecondaryContainers);
            }
            var gotMatch: boolean = false;
            targetsToCheck.forEach( (eContainer: HTMLElement) => {
                if (!eContainer) { return; } // secondary can be missing
                var rect = eContainer.getBoundingClientRect();

                // if element is not visible, then width and height are zero
                if (rect.width===0 || rect.height===0) {
                    return;
                }
                var horizontalFit = event.clientX >= rect.left && event.clientX <= rect.right;
                var verticalFit = event.clientY >= rect.top && event.clientY <= rect.bottom;

                //console.log(`rect.width = ${rect.width} || rect.height = ${rect.height} ## verticalFit = ${verticalFit}, horizontalFit = ${horizontalFit}, `);

                if (horizontalFit && verticalFit) {
                    gotMatch = true;
                }
            });
            return gotMatch;
        });

        var direction = this.workOutDirection(event);

        if (dropTarget!==this.lastDropTarget) {
            if (this.lastDropTarget) {
                this.logger.log('onDragLeave');
                var dragLeaveEvent = this.createDropTargetEvent(this.lastDropTarget, event, direction);
                this.lastDropTarget.onDragLeave(dragLeaveEvent);
            }
            if (dropTarget) {
                this.logger.log('onDragEnter');
                var dragEnterEvent = this.createDropTargetEvent(dropTarget, event, direction);
                dropTarget.onDragEnter(dragEnterEvent);
            }
            this.lastDropTarget = dropTarget;
        } else if (dropTarget) {
            var draggingEvent = this.createDropTargetEvent(dropTarget, event, direction);
            dropTarget.onDragging(draggingEvent);
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
        var left = event.clientX - (ghostWidth / 2);
        var top = event.clientY - (ghostHeight / 2);

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
    }

    private createGhost(): void {
        var dragItem = this.dragSource.dragItem;
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
    }

    public onMouseUp(): void {
        this.logger.log('onMouseUp');

        document.removeEventListener('mouseup', this.onMouseUpListener);
        document.removeEventListener('mousemove', this.onMouseMoveListener)

        this.dragStartEvent = null;

        if (this.dragging) {
            this.dragItem.setMoving(false);
            this.dragging = false;
            if (this.lastDropTarget && this.lastDropTarget.onDragStop) {
                this.lastDropTarget.onDragStop();
            }
            this.lastDropTarget = null;
            this.dragItem = null;
            this.removeGhost();
        }

    }

}
