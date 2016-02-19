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
import SvgFactory from "../svgFactory";

var svgFactory = SvgFactory.getInstance();

export interface DragSource {
    eElement: HTMLElement,
    dragItem: Column,
    dragSourceDropTarget?: DropTarget
}

export interface DropTarget {
    eContainer: HTMLElement,
    iconName?: string,
    eSecondaryContainers?: HTMLElement[],
    onDragEnter?: (params: DraggingEvent)=>void,
    onDragLeave?: (params: DraggingEvent)=>void,
    onDragging?: (params: DraggingEvent)=>void,
    onDragStop?: (params: DraggingEvent)=>void
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

    public static ICON_PINNED = 'pinned';
    public static ICON_ADD = 'add';
    public static ICON_MOVE = 'move';
    public static ICON_LEFT = 'left';
    public static ICON_RIGHT = 'right';
    public static ICON_GROUP = 'group';

    private logger: Logger;

    private dragging = false;
    private dragItem: Column;
    private dragStartEvent: MouseEvent;
    private eventLastTime: MouseEvent;

    private dragSource: DragSource;

    private onMouseUpListener = this.onMouseUp.bind(this);
    private onMouseMoveListener = this.onMouseMove.bind(this);

    private eGhost: HTMLElement;
    private eGhostIcon: HTMLElement;
    private eBody: HTMLElement;

    private dropTargets: DropTarget[] = [];
    private lastDropTarget: DropTarget;

    private addMovingCssToGrid: boolean;

    private ePinnedIcon = svgFactory.createPinIcon();
    private ePlusIcon = svgFactory.createPlusIcon();
    private eMinusIcon = svgFactory.createMinusIcon();
    private eMoveIcon = svgFactory.createMoveIcon();
    private eLeftIcon = svgFactory.createLeftIcon();
    private eRightIcon = svgFactory.createRightIcon();
    private eGroupIcon = svgFactory.createGroupIcon();

    public agWire(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('DragAndDropService');
        this.addMovingCssToGrid = !this.gridOptionsWrapper.isSuppressMovingCss();
        this.eBody = <HTMLElement> document.querySelector('body');
        if (!this.eBody) {
            console.warn('ag-Grid: could not find document body, it is needed for dragging columns');
        }
    }

    // we do not need to clean up drag sources, as we are just adding a listener to the element.
    // when the element is disposed, the drag source is also disposed, even though this service
    // remains. this is a bit different to normal 'addListener' methods
    public addDragSource(params: DragSource): void {
        params.eElement.addEventListener('mousedown', this.onMouseDown.bind(this, params));
    }

    public nudge(): void {
        if (this.dragging) {
            this.onMouseMove(this.eventLastTime);
        }
    }

    public onMouseDown(dragSource: DragSource, mouseEvent: MouseEvent): void {
        this.dragSource = dragSource;
        this.dragging = false;
        this.eventLastTime = mouseEvent;
        this.dragStartEvent = mouseEvent;
        document.addEventListener('mousemove', this.onMouseMoveListener);
        document.addEventListener('mouseup', this.onMouseUpListener);
    }

    public addDropTarget(dropTarget: DropTarget) {
        this.dropTargets.push(dropTarget);
    }

    public workOutDirection(event: MouseEvent): string {
        var direction: string;
        if (this.eventLastTime.clientX > event.clientX) {
            direction = DragAndDropService2.DIRECTION_LEFT;
        } else if (this.eventLastTime.clientX < event.clientX) {
            direction = DragAndDropService2.DIRECTION_RIGHT;
        } else {
            direction = null;
        }

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

        var direction = this.workOutDirection(event);
        this.eventLastTime = event;

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

        if (dropTarget!==this.lastDropTarget) {
            if (this.lastDropTarget) {
                this.logger.log('onDragLeave');
                var dragLeaveEvent = this.createDropTargetEvent(this.lastDropTarget, event, direction);
                this.lastDropTarget.onDragLeave(dragLeaveEvent);
                this.setGhostIcon(null);
            }
            if (dropTarget) {
                this.logger.log('onDragEnter');
                var dragEnterEvent = this.createDropTargetEvent(dropTarget, event, direction);
                dropTarget.onDragEnter(dragEnterEvent);
                this.setGhostIcon(dropTarget.iconName);
            }
            this.lastDropTarget = dropTarget;
        } else if (dropTarget) {
            var draggingEvent = this.createDropTargetEvent(dropTarget, event, direction);
            dropTarget.onDragging(draggingEvent);
        }

    }

    private positionGhost(event: MouseEvent): void {
        var ghostRect = this.eGhost.getBoundingClientRect();
        var ghostHeight = ghostRect.height;
        // for some reason, without the '-2', it still overlapped by 1 or 2 pixels, which
        // then brought in scrollbars to the browser. no idea why, but putting in -2 here
        // works around it which is good enough for me.
        var browserWidth = _.getBrowserWidth() - 2;
        var browserHeight = _.getBrowserHeight() - 2;

        // put ghost vertically in middle of cursor
        var top = event.clientY - (ghostHeight / 2);
        // horizontally, place cursor just right of icon
        var left = event.clientX - 30;

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
        this.eGhostIcon = <HTMLElement> this.eGhost.querySelector('#eGhostIcon');

        if (this.lastDropTarget) {
            this.setGhostIcon(this.lastDropTarget.iconName);
        }

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

    public setGhostIcon(iconName: string, shake = false): void {
        _.removeAllChildren(this.eGhostIcon);
        var eIcon: HTMLElement;
        switch (iconName) {
            case DragAndDropService2.ICON_ADD: eIcon = this.ePlusIcon; break;
            case DragAndDropService2.ICON_PINNED: eIcon = this.ePinnedIcon; break;
            case DragAndDropService2.ICON_MOVE: eIcon = this.eMoveIcon; break;
            case DragAndDropService2.ICON_LEFT: eIcon = this.eLeftIcon; break;
            case DragAndDropService2.ICON_RIGHT: eIcon = this.eRightIcon; break;
            case DragAndDropService2.ICON_GROUP: eIcon = this.eGroupIcon; break;
            default: eIcon = this.eMinusIcon; break;
        }
        this.eGhostIcon.appendChild(eIcon);
        _.addOrRemoveCssClass(this.eGhostIcon, 'ag-shake-left-to-right', shake);
    }

    public onMouseUp(mouseEvent: MouseEvent): void {
        this.logger.log('onMouseUp');

        document.removeEventListener('mouseup', this.onMouseUpListener);
        document.removeEventListener('mousemove', this.onMouseMoveListener);

        this.dragStartEvent = null;
        this.eventLastTime = null;

        if (this.dragging) {
            this.dragItem.setMoving(false);
            this.dragging = false;
            if (this.lastDropTarget && this.lastDropTarget.onDragStop) {
                var draggingEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, null);
                this.lastDropTarget.onDragStop(draggingEvent);
            }
            this.lastDropTarget = null;
            this.dragItem = null;
            this.removeGhost();
        }

    }

}
