import {Logger} from "../logger";
import {Qualifier} from "../context/context";
import {LoggerFactory} from "../logger";
import {Bean} from "../context/context";
import {Column} from "../entities/column";
import {HeaderTemplateLoader} from "../headerRendering/headerTemplateLoader";
import {Utils as _} from '../utils';
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Autowired} from "../context/context";
import {SvgFactory} from "../svgFactory";
import {DragService} from "./dragService";
import {ColumnGroup} from "../entities/columnGroup";
import {ColumnController} from "../columnController/columnController";

var svgFactory = SvgFactory.getInstance();

export interface DragSource {
    /** Element which, when dragged, will kick off the DnD process */
    eElement: HTMLElement,
    /** If eElement is dragged, then the dragItem is the object that gets passed around. */
    dragItem: Column[],
    /** This name appears in the ghost icon when dragging */
    dragItemName: string,
    /** The drop target associated with this dragSource. So when dragging starts, this target does not get
     * onDragEnter event. */
    dragSourceDropTarget?: DropTarget
}

export interface DropTarget {
    /** The main container that will get the drop. */
    eContainer: HTMLElement,
    /** If any secondary containers. For example when moving columns in ag-Grid, we listen for drops
     * in the header as well as the body (main rows and floating rows) of the grid. */
    eSecondaryContainers?: HTMLElement[],

    /** Icon to show when */
    iconName?: string,

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
    dragSource: DragSource
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

    public static GHOST_TEMPLATE =
        '<div class="ag-dnd-ghost">' +
        '  <span class="ag-dnd-ghost-icon ag-shake-left-to-right"></span>' +
        '  <div class="ag-dnd-ghost-label">' +
        '  </div>' +
        '</div>';

    // '<div class="ag-header-cell ag-header-cell-ghost">' +
    // '  <span id="eGhostIcon" class="ag-header-cell-ghost-icon ag-shake-left-to-right"></span>' +
    // '  <div id="agHeaderCellLabel" class="ag-header-cell-label">' +
    // '    <span id="agText" class="ag-header-cell-text"></span>' +
    // '  </div>' +
    // '</div>';

    private logger: Logger;

    private dragItem: Column[];
    private eventLastTime: MouseEvent;
    private dragSource: DragSource;
    private dragging: boolean;

    private eGhost: HTMLElement;
    private eGhostIcon: HTMLElement;
    private eBody: HTMLElement;

    private dropTargets: DropTarget[] = [];
    private lastDropTarget: DropTarget;

    private ePinnedIcon = svgFactory.createPinIcon();
    private ePlusIcon = svgFactory.createPlusIcon();
    private eHiddenIcon = svgFactory.createColumnHiddenIcon();
    private eMoveIcon = svgFactory.createMoveIcon();
    private eLeftIcon = svgFactory.createLeftIcon();
    private eRightIcon = svgFactory.createRightIcon();
    private eGroupIcon = svgFactory.createGroupIcon();

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('OldToolPanelDragAndDropService');
        this.eBody = <HTMLElement> document.querySelector('body');
        if (!this.eBody) {
            console.warn('ag-Grid: could not find document body, it is needed for dragging columns');
        }
    }

    // we do not need to clean up drag sources, as we are just adding a listener to the element.
    // when the element is disposed, the drag source is also disposed, even though this service
    // remains. this is a bit different to normal 'addListener' methods
    public addDragSource(dragSource: DragSource): void {
        this.dragService.addDragSource({
            eElement: dragSource.eElement,
            onDragStart: this.onDragStart.bind(this, dragSource),
            onDragStop: this.onDragStop.bind(this),
            onDragging: this.onDragging.bind(this)
        });
    }

    public nudge(): void {
        if (this.dragging) {
            this.onDragging(this.eventLastTime);
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
            var draggingEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, null);
            this.lastDropTarget.onDragStop(draggingEvent);
        }
        this.lastDropTarget = null;
        this.dragItem = null;
        this.removeGhost();
    }

    private onDragging(mouseEvent: MouseEvent): void {

        var direction = this.workOutDirection(mouseEvent);
        this.eventLastTime = mouseEvent;

        this.positionGhost(mouseEvent);

        // check if mouseEvent intersects with any of the drop targets
        var dropTarget = _.find(this.dropTargets, this.isMouseOnDropTarget.bind(this, mouseEvent));

        if (dropTarget!==this.lastDropTarget) {
            this.leaveLastTargetIfExists(mouseEvent, direction);
            this.enterDragTargetIfExists(dropTarget, mouseEvent, direction);
            this.lastDropTarget = dropTarget;
        } else if (dropTarget) {
            var draggingEvent = this.createDropTargetEvent(dropTarget, mouseEvent, direction);
            dropTarget.onDragging(draggingEvent);
        }
    }

    private enterDragTargetIfExists(dropTarget: DropTarget, mouseEvent: MouseEvent, direction: string): void {
        if (!dropTarget) { return; }

        var dragEnterEvent = this.createDropTargetEvent(dropTarget, mouseEvent, direction);
        dropTarget.onDragEnter(dragEnterEvent);
        this.setGhostIcon(dropTarget.iconName);
    }

    private leaveLastTargetIfExists(mouseEvent: MouseEvent, direction: string): void {
        if (!this.lastDropTarget) { return; }

        var dragLeaveEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, direction);
        this.lastDropTarget.onDragLeave(dragLeaveEvent);
        this.setGhostIcon(null);
    }

    // checks if the mouse is on the drop target. it checks eContainer and eSecondaryContainers
    private isMouseOnDropTarget(mouseEvent: MouseEvent, dropTarget: DropTarget): boolean {
        var ePrimaryAndSecondaryContainers = [dropTarget.eContainer];
        if (dropTarget.eSecondaryContainers) {
            ePrimaryAndSecondaryContainers = ePrimaryAndSecondaryContainers.concat(dropTarget.eSecondaryContainers);
        }

        var gotMatch: boolean = false;
        ePrimaryAndSecondaryContainers.forEach( (eContainer: HTMLElement) => {
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
            dragSource: this.dragSource
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
        this.eGhost = _.loadTemplate(DragAndDropService.GHOST_TEMPLATE);
        this.eGhostIcon = <HTMLElement> this.eGhost.querySelector('.ag-dnd-ghost-icon');

        if (this.lastDropTarget) {
            this.setGhostIcon(this.lastDropTarget.iconName);
        }

        var eText = <HTMLElement> this.eGhost.querySelector('.ag-dnd-ghost-label');
        eText.innerHTML = this.dragSource.dragItemName;

        this.eGhost.style.height = this.gridOptionsWrapper.getHeaderHeight() + 'px';

        this.eGhost.style.top = '20px';
        this.eGhost.style.left = '20px';
        this.eBody.appendChild(this.eGhost);
    }

/*
// took this out as it wasn't making sense when dragging from the side panel, as it was possible to drag
   columns that were not visible - which is fine, as you are selecting from all columns here. what should be
   done is we check what columns to include in the drag depending on what started to drag - but that is to
   much coding for now, so just hardcoding the width to 200px for now.
    private getActualWidth(columns: Column[]): number {
        var totalColWidth = 0;

        // we only include displayed columns so hidden columns do not add space as this would look weird,
        // if for example moving a group with 5 cols, but only 1 displayed, we want ghost to be just the width
        // of the 1 displayed column
        var allDisplayedColumns = this.columnController.getAllDisplayedColumns();
        var displayedColumns = _.filter(columns, column => allDisplayedColumns.indexOf(column) >= 0 );

        displayedColumns.forEach( column => totalColWidth += column.getActualWidth() );

        return totalColWidth;
    }
*/

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
            default: eIcon = this.eHiddenIcon; break;
        }
        this.eGhostIcon.appendChild(eIcon);
        _.addOrRemoveCssClass(this.eGhostIcon, 'ag-shake-left-to-right', shake);
    }

}
