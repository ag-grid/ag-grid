import {Logger, LoggerFactory} from "../logger";
import {Qualifier, PostConstruct, Bean, Autowired, PreDestroy} from "../context/context";
import {Column} from "../entities/column";
import {Utils as _} from "../utils";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {SvgFactory} from "../svgFactory";
import {DragService, DragListenerParams} from "./dragService";
import {ColumnController} from "../columnController/columnController";

var svgFactory = SvgFactory.getInstance();

export enum DragSourceType { ToolPanel, HeaderCell }

export interface DragSource {
    /** So the drop target knows what type of event it is, useful for columns,
     * we we re-ordering or moving dropping from toolPanel */
    type: DragSourceType;
    /** Element which, when dragged, will kick off the DnD process */
    eElement: HTMLElement;
    /** If eElement is dragged, then the dragItem is the object that gets passed around. */
    dragItem: Column[];
    /** This name appears in the ghost icon when dragging */
    dragItemName: string;
    /** The drop target associated with this dragSource. So when dragging starts, this target does not get
     * onDragEnter event. */
    dragSourceDropTarget?: DropTarget;
}

export interface DropTarget {
    /** The main container that will get the drop. */
    getContainer(): HTMLElement;
    /** If any secondary containers. For example when moving columns in ag-Grid, we listen for drops
     * in the header as well as the body (main rows and floating rows) of the grid. */
    getSecondaryContainers?(): HTMLElement[];
    /** Icon to show when drag is over*/
    getIconName?(): string;

    /** Callback for when drag enters */
    onDragEnter?(params: DraggingEvent): void;
    /** Callback for when drag leaves */
    onDragLeave?(params: DraggingEvent): void;
    /** Callback for when dragging */
    onDragging?(params: DraggingEvent): void;
    /** Callback for when drag stops */
    onDragStop?(params: DraggingEvent): void;
}

export interface DraggingEvent {
    event: MouseEvent,
    x: number,
    y: number,
    direction: string,
    dragSource: DragSource,
    fromNudge: boolean
}

@Bean('dragAndDropService')
export class DragAndDropService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('dragService') private dragService: DragService;
    @Autowired('columnController') private columnController: ColumnController;

    public static DIRECTION_LEFT = 'left';
    public static DIRECTION_RIGHT = 'right';

    public static ICON_PINNED = 'pinned';
    public static ICON_ADD = 'add';
    public static ICON_MOVE = 'move';
    public static ICON_LEFT = 'left';
    public static ICON_RIGHT = 'right';
    public static ICON_GROUP = 'group';
    public static ICON_AGGREGATE = 'aggregate';
    public static ICON_PIVOT = 'pivot';
    public static ICON_NOT_ALLOWED = 'notAllowed';

    public static GHOST_TEMPLATE =
        '<div class="ag-dnd-ghost">' +
        '  <span class="ag-dnd-ghost-icon ag-shake-left-to-right"></span>' +
        '  <div class="ag-dnd-ghost-label">' +
        '  </div>' +
        '</div>';

    private logger: Logger;

    private dragSourceAndParamsList: {params: DragListenerParams, dragSource: DragSource}[] = [];

    private dragItem: Column[];
    private eventLastTime: MouseEvent;
    private dragSource: DragSource;
    private dragging: boolean;

    private eGhost: HTMLElement;
    private eGhostIcon: HTMLElement;
    private eBody: HTMLElement;

    private dropTargets: DropTarget[] = [];
    private lastDropTarget: DropTarget;

    private ePinnedIcon: HTMLElement;
    private ePlusIcon: HTMLElement;
    private eHiddenIcon: HTMLElement;
    private eMoveIcon: HTMLElement;
    private eLeftIcon: HTMLElement;
    private eRightIcon: HTMLElement;
    private eGroupIcon: HTMLElement;
    private eAggregateIcon: HTMLElement;
    private ePivotIcon: HTMLElement;
    private eDropNotAllowedIcon: HTMLElement;

    @PostConstruct
    private init(): void {
        this.ePinnedIcon = _.createIcon('columnMovePin', this.gridOptionsWrapper, null, svgFactory.createPinIcon);
        this.ePlusIcon = _.createIcon('columnMoveAdd', this.gridOptionsWrapper, null, svgFactory.createPlusIcon);
        this.eHiddenIcon = _.createIcon('columnMoveHide', this.gridOptionsWrapper, null, svgFactory.createColumnHiddenIcon);
        this.eMoveIcon = _.createIcon('columnMoveMove', this.gridOptionsWrapper, null, svgFactory.createMoveIcon);
        this.eLeftIcon = _.createIcon('columnMoveLeft', this.gridOptionsWrapper, null, svgFactory.createLeftIcon);
        this.eRightIcon = _.createIcon('columnMoveRight', this.gridOptionsWrapper, null, svgFactory.createRightIcon);
        this.eGroupIcon = _.createIcon('columnMoveGroup', this.gridOptionsWrapper, null, svgFactory.createGroupIcon);
        this.eAggregateIcon = _.createIcon('columnMoveValue', this.gridOptionsWrapper, null, svgFactory.createAggregationIcon);
        this.ePivotIcon = _.createIcon('columnMovePivot', this.gridOptionsWrapper, null, svgFactory.createPivotIcon);
        this.eDropNotAllowedIcon = _.createIcon('dropNotAllowed', this.gridOptionsWrapper, null, svgFactory.createDropNotAllowedIcon);
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('OldToolPanelDragAndDropService');
        this.eBody = <HTMLElement> document.querySelector('body');
        if (!this.eBody) {
            console.warn('ag-Grid: could not find document body, it is needed for dragging columns');
        }
    }

    public addDragSource(dragSource: DragSource, allowTouch = false): void {
        let params = <DragListenerParams> {
            eElement: dragSource.eElement,
            onDragStart: this.onDragStart.bind(this, dragSource),
            onDragStop: this.onDragStop.bind(this),
            onDragging: this.onDragging.bind(this)
        };

        this.dragSourceAndParamsList.push({params: params, dragSource: dragSource});

        this.dragService.addDragSource(params, allowTouch);
    }

    public removeDragSource(dragSource: DragSource): void {
        var sourceAndParams = _.find(this.dragSourceAndParamsList, item => item.dragSource === dragSource);
        if (sourceAndParams) {
            this.dragService.removeDragSource(sourceAndParams.params);
            _.removeFromArray(this.dragSourceAndParamsList, sourceAndParams);
        }
    }

    @PreDestroy
    private destroy(): void {
        this.dragSourceAndParamsList.forEach( sourceAndParams => {
            this.dragService.removeDragSource(sourceAndParams.params);
        });
        this.dragSourceAndParamsList.length = 0;
    }

    public nudge(): void {
        if (this.dragging) {
            this.onDragging(this.eventLastTime, true);
        }
    }

    private onDragStart(dragSource: DragSource, mouseEvent: MouseEvent): void {
        this.dragging = true;
        this.dragSource = dragSource;
        this.eventLastTime = mouseEvent;
        this.dragSource.dragItem.forEach( column => column.setMoving(true));
        this.dragItem = this.dragSource.dragItem;
        this.lastDropTarget = this.dragSource.dragSourceDropTarget;
        this.createGhost();
    }

    private onDragStop(mouseEvent: MouseEvent): void {
        this.eventLastTime = null;
        this.dragging = false;

        this.dragItem.forEach( column => column.setMoving(false) );
        if (this.lastDropTarget && this.lastDropTarget.onDragStop) {
            var draggingEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, null, false);
            this.lastDropTarget.onDragStop(draggingEvent);
        }
        this.lastDropTarget = null;
        this.dragItem = null;
        this.removeGhost();
    }

    private onDragging(mouseEvent: MouseEvent, fromNudge: boolean): void {

        var direction = this.workOutDirection(mouseEvent);
        this.eventLastTime = mouseEvent;

        this.positionGhost(mouseEvent);

        // check if mouseEvent intersects with any of the drop targets
        var dropTarget = _.find(this.dropTargets, this.isMouseOnDropTarget.bind(this, mouseEvent));

        if (dropTarget!==this.lastDropTarget) {
            this.leaveLastTargetIfExists(mouseEvent, direction, fromNudge);
            this.enterDragTargetIfExists(dropTarget, mouseEvent, direction, fromNudge);
            this.lastDropTarget = dropTarget;
        } else if (dropTarget) {
            var draggingEvent = this.createDropTargetEvent(dropTarget, mouseEvent, direction, fromNudge);
            dropTarget.onDragging(draggingEvent);
        }
    }

    private enterDragTargetIfExists(dropTarget: DropTarget, mouseEvent: MouseEvent, direction: string, fromNudge: boolean): void {
        if (!dropTarget) { return; }

        var dragEnterEvent = this.createDropTargetEvent(dropTarget, mouseEvent, direction, fromNudge);
        dropTarget.onDragEnter(dragEnterEvent);
        this.setGhostIcon(dropTarget.getIconName ? dropTarget.getIconName() : null);
    }

    private leaveLastTargetIfExists(mouseEvent: MouseEvent, direction: string, fromNudge: boolean): void {
        if (!this.lastDropTarget) { return; }

        var dragLeaveEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, direction, fromNudge);
        this.lastDropTarget.onDragLeave(dragLeaveEvent);
        this.setGhostIcon(null);
    }

    private getAllContainersFromDropTarget(dropTarget: DropTarget): HTMLElement[] {
        var containers = [dropTarget.getContainer()];
        var secondaryContainers = dropTarget.getSecondaryContainers ? dropTarget.getSecondaryContainers() : null;
        if (secondaryContainers) {
            containers = containers.concat(secondaryContainers);
        }
        return containers;
    }

    // checks if the mouse is on the drop target. it checks eContainer and eSecondaryContainers
    private isMouseOnDropTarget(mouseEvent: MouseEvent, dropTarget: DropTarget): boolean {
        var allContainers = this.getAllContainersFromDropTarget(dropTarget);

        var gotMatch: boolean = false;
        allContainers.forEach( (eContainer: HTMLElement) => {
            if (!eContainer) { return; } // secondary can be missing
            var rect = eContainer.getBoundingClientRect();

            // if element is not visible, then width and height are zero
            if (rect.width===0 || rect.height===0) {
                return;
            }
            var horizontalFit = mouseEvent.clientX >= rect.left && mouseEvent.clientX <= rect.right;
            var verticalFit = mouseEvent.clientY >= rect.top && mouseEvent.clientY <= rect.bottom;

            //console.log(`rect.width = ${rect.width} || rect.height = ${rect.height} ## verticalFit = ${verticalFit}, horizontalFit = ${horizontalFit}, `);

            if (horizontalFit && verticalFit) {
                gotMatch = true;
            }
        });
        return gotMatch;
    }

    public addDropTarget(dropTarget: DropTarget) {
        this.dropTargets.push(dropTarget);
    }

    public workOutDirection(event: MouseEvent): string {
        var direction: string;
        if (this.eventLastTime.clientX > event.clientX) {
            direction = DragAndDropService.DIRECTION_LEFT;
        } else if (this.eventLastTime.clientX < event.clientX) {
            direction = DragAndDropService.DIRECTION_RIGHT;
        } else {
            direction = null;
        }

        return direction;
    }

    public createDropTargetEvent(dropTarget: DropTarget, event: MouseEvent, direction: string, fromNudge: boolean): DraggingEvent {

        // localise x and y to the target component
        var rect = dropTarget.getContainer().getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        var dropTargetEvent = {
            event: event,
            x: x,
            y: y,
            direction: direction,
            dragSource: this.dragSource,
            fromNudge: fromNudge
        };

        return dropTargetEvent;
    }

    private positionGhost(event: MouseEvent): void {
        var ghostRect = this.eGhost.getBoundingClientRect();
        var ghostHeight = ghostRect.height;
        // for some reason, without the '-2', it still overlapped by 1 or 2 pixels, which
        // then brought in scrollbars to the browser. no idea why, but putting in -2 here
        // works around it which is good enough for me.
        var browserWidth = _.getBodyWidth() - 2;
        var browserHeight = _.getBodyHeight() - 2;

        // put ghost vertically in middle of cursor
        var top = event.pageY - (ghostHeight / 2);
        // horizontally, place cursor just right of icon
        var left = event.pageX - 30;

        var windowScrollY = window.pageYOffset || document.documentElement.scrollTop;
        var windowScrollX = window.pageXOffset || document.documentElement.scrollLeft;

        // check ghost is not positioned outside of the browser
        if (browserWidth>0) {
            if ( (left + this.eGhost.clientWidth) > (browserWidth + windowScrollX) ) {
                left = browserWidth + windowScrollX - this.eGhost.clientWidth;
            }
        }
        if (left < 0) {
            left = 0;
        }
        if (browserHeight>0) {
            if ( (top + this.eGhost.clientHeight) > (browserHeight + windowScrollY) ) {
                top = browserHeight + windowScrollY - this.eGhost.clientHeight;
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
        this.eGhost = _.loadTemplate(DragAndDropService.GHOST_TEMPLATE);
        this.eGhostIcon = <HTMLElement> this.eGhost.querySelector('.ag-dnd-ghost-icon');

        if (this.lastDropTarget) {
            this.setGhostIcon(this.lastDropTarget.getIconName ? this.lastDropTarget.getIconName() : null);
        }

        var eText = <HTMLElement> this.eGhost.querySelector('.ag-dnd-ghost-label');
        eText.innerHTML = this.dragSource.dragItemName;

        this.eGhost.style.height = this.gridOptionsWrapper.getHeaderHeight() + 'px';

        this.eGhost.style.top = '20px';
        this.eGhost.style.left = '20px';
        this.eBody.appendChild(this.eGhost);
    }

    public setGhostIcon(iconName: string, shake = false): void {
        _.removeAllChildren(this.eGhostIcon);
        var eIcon: HTMLElement;
        switch (iconName) {
            case DragAndDropService.ICON_ADD: eIcon = this.ePlusIcon; break;
            case DragAndDropService.ICON_PINNED: eIcon = this.ePinnedIcon; break;
            case DragAndDropService.ICON_MOVE: eIcon = this.eMoveIcon; break;
            case DragAndDropService.ICON_LEFT: eIcon = this.eLeftIcon; break;
            case DragAndDropService.ICON_RIGHT: eIcon = this.eRightIcon; break;
            case DragAndDropService.ICON_GROUP: eIcon = this.eGroupIcon; break;
            case DragAndDropService.ICON_AGGREGATE: eIcon = this.eAggregateIcon; break;
            case DragAndDropService.ICON_PIVOT: eIcon = this.ePivotIcon; break;
            case DragAndDropService.ICON_NOT_ALLOWED: eIcon = this.eDropNotAllowedIcon; break;
            default: eIcon = this.eHiddenIcon; break;
        }
        this.eGhostIcon.appendChild(eIcon);
        _.addOrRemoveCssClass(this.eGhostIcon, 'ag-shake-left-to-right', shake);
    }

}
