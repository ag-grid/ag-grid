import { Logger, LoggerFactory } from "../logger";
import { Qualifier, PostConstruct, Bean, Autowired, PreDestroy } from "../context/context";
import { Column } from "../entities/column";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { DragService, DragListenerParams } from "./dragService";
import { Environment } from "../environment";
import { RowNode } from "../entities/rowNode";
import { _ } from "../utils";

export interface DragItem {
    /** When dragging a row, this contains the row node being dragged */
    rowNode?: RowNode;

    /** When dragging columns, this contains the columns being dragged */
    columns?: Column[];

    /** When dragging columns, this contains the visible state of the columns */
    visibleState?: { [key: string]: boolean };
}

export enum DragSourceType { ToolPanel, HeaderCell, RowDrag, ChartPanel }

export interface DragSource {
    /** The type of the drag source, used by the drop target to know where the drag originated from. */
    type: DragSourceType;
    /** Element which, when dragged, will kick off the DnD process */
    eElement: HTMLElement;
    /** If eElement is dragged, then the dragItem is the object that gets passed around. */
    getDragItem: () => DragItem;
    /** This name appears in the ghost icon when dragging */
    dragItemName: string | null;
    /** The drop target associated with this dragSource. When dragging starts, this target does not get an
     * onDragEnter event. */
    dragSourceDropTarget?: DropTarget;
    /** After how many pixels of dragging should the drag operation start. Default is 4. */
    dragStartPixels?: number;
    /** Callback for drag started */
    onDragStarted?: () => void;
    /** Callback for drag stopped */
    onDragStopped?: () => void;
}

export interface DropTarget {
    /** The main container that will get the drop. */
    getContainer(): HTMLElement;
    /** If any secondary containers. For example when moving columns in ag-Grid, we listen for drops
     * in the header as well as the body (main rows and pinned rows) of the grid. */
    getSecondaryContainers?(): HTMLElement[];
    /** Icon to show when drag is over */
    getIconName?(): string;

    isInterestedIn(type: DragSourceType): boolean;

    /** Callback for when drag enters */
    onDragEnter?(params: DraggingEvent): void;
    /** Callback for when drag leaves */
    onDragLeave?(params: DraggingEvent): void;
    /** Callback for when dragging */
    onDragging?(params: DraggingEvent): void;
    /** Callback for when drag stops */
    onDragStop?(params: DraggingEvent): void;
}

export enum VerticalDirection { Up, Down }
export enum HorizontalDirection { Left, Right }

export interface DraggingEvent {
    event: MouseEvent;
    x: number;
    y: number;
    vDirection: VerticalDirection;
    hDirection: HorizontalDirection;
    dragSource: DragSource;
    dragItem: DragItem;
    fromNudge: boolean;
}

@Bean('dragAndDropService')
export class DragAndDropService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('dragService') private dragService: DragService;
    @Autowired('environment') private environment: Environment;

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

    private dragSourceAndParamsList: { params: DragListenerParams, dragSource: DragSource }[] = [];

    private dragItem: DragItem;
    private eventLastTime: MouseEvent;
    private dragSource: DragSource;
    private dragging: boolean;

    private eGhost: HTMLElement;
    private eGhostParent: HTMLElement;
    private eGhostIcon: HTMLElement;

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
        this.ePinnedIcon = _.createIcon('columnMovePin', this.gridOptionsWrapper, null);
        this.ePlusIcon = _.createIcon('columnMoveAdd', this.gridOptionsWrapper, null);
        this.eHiddenIcon = _.createIcon('columnMoveHide', this.gridOptionsWrapper, null);
        this.eMoveIcon = _.createIcon('columnMoveMove', this.gridOptionsWrapper, null);
        this.eLeftIcon = _.createIcon('columnMoveLeft', this.gridOptionsWrapper, null);
        this.eRightIcon = _.createIcon('columnMoveRight', this.gridOptionsWrapper, null);
        this.eGroupIcon = _.createIcon('columnMoveGroup', this.gridOptionsWrapper, null);
        this.eAggregateIcon = _.createIcon('columnMoveValue', this.gridOptionsWrapper, null);
        this.ePivotIcon = _.createIcon('columnMovePivot', this.gridOptionsWrapper, null);
        this.eDropNotAllowedIcon = _.createIcon('dropNotAllowed', this.gridOptionsWrapper, null);
    }

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('OldToolPanelDragAndDropService');
    }

    public addDragSource(dragSource: DragSource, allowTouch = false): void {
        const params: DragListenerParams = {
            eElement: dragSource.eElement,
            dragStartPixels: dragSource.dragStartPixels,
            onDragStart: this.onDragStart.bind(this, dragSource),
            onDragStop: this.onDragStop.bind(this),
            onDragging: this.onDragging.bind(this)
        };

        this.dragSourceAndParamsList.push({ params: params, dragSource: dragSource });

        this.dragService.addDragSource(params, allowTouch);
    }

    public removeDragSource(dragSource: DragSource): void {
        const sourceAndParams = _.find(this.dragSourceAndParamsList, item => item.dragSource === dragSource);

        if (sourceAndParams) {
            this.dragService.removeDragSource(sourceAndParams.params);
            _.removeFromArray(this.dragSourceAndParamsList, sourceAndParams);
        }
    }

    @PreDestroy
    private destroy(): void {
        this.dragSourceAndParamsList.forEach(sourceAndParams => this.dragService.removeDragSource(sourceAndParams.params));
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
        this.dragItem = this.dragSource.getDragItem();
        this.lastDropTarget = this.dragSource.dragSourceDropTarget;

        if (this.dragSource.onDragStarted) {
            this.dragSource.onDragStarted();
        }

        this.createGhost();
    }

    private onDragStop(mouseEvent: MouseEvent): void {
        this.eventLastTime = null;
        this.dragging = false;

        if (this.dragSource.onDragStopped) {
            this.dragSource.onDragStopped();
        }

        if (this.lastDropTarget && this.lastDropTarget.onDragStop) {
            const draggingEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, null, null, false);
            this.lastDropTarget.onDragStop(draggingEvent);
        }

        this.lastDropTarget = null;
        this.dragItem = null;
        this.removeGhost();
    }

    private onDragging(mouseEvent: MouseEvent, fromNudge: boolean): void {
        const hDirection = this.getHorizontalDirection(mouseEvent);
        const vDirection = this.getVerticalDirection(mouseEvent);

        this.eventLastTime = mouseEvent;

        this.positionGhost(mouseEvent);

        // check if mouseEvent intersects with any of the drop targets
        const dropTarget = _.find(this.dropTargets, this.isMouseOnDropTarget.bind(this, mouseEvent));

        if (dropTarget !== this.lastDropTarget) {
            this.leaveLastTargetIfExists(mouseEvent, hDirection, vDirection, fromNudge);
            this.enterDragTargetIfExists(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            this.lastDropTarget = dropTarget;
        } else if (dropTarget) {
            const draggingEvent = this.createDropTargetEvent(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            dropTarget.onDragging(draggingEvent);
        }
    }

    private enterDragTargetIfExists(dropTarget: DropTarget, mouseEvent: MouseEvent, hDirection: HorizontalDirection, vDirection: VerticalDirection, fromNudge: boolean): void {
        if (!dropTarget) { return; }

        if (dropTarget.onDragEnter) {
            const dragEnterEvent = this.createDropTargetEvent(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);

            dropTarget.onDragEnter(dragEnterEvent);
        }

        this.setGhostIcon(dropTarget.getIconName ? dropTarget.getIconName() : null);
    }

    private leaveLastTargetIfExists(mouseEvent: MouseEvent, hDirection: HorizontalDirection, vDirection: VerticalDirection, fromNudge: boolean): void {
        if (!this.lastDropTarget) { return; }

        if (this.lastDropTarget.onDragLeave) {
            const dragLeaveEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, hDirection, vDirection, fromNudge);

            this.lastDropTarget.onDragLeave(dragLeaveEvent);
        }

        this.setGhostIcon(null);
    }

    private getAllContainersFromDropTarget(dropTarget: DropTarget): HTMLElement[] {
        let containers = [dropTarget.getContainer()];
        const secondaryContainers = dropTarget.getSecondaryContainers ? dropTarget.getSecondaryContainers() : null;

        if (secondaryContainers) {
            containers = containers.concat(secondaryContainers);
        }

        return containers;
    }

    // checks if the mouse is on the drop target. it checks eContainer and eSecondaryContainers
    private isMouseOnDropTarget(mouseEvent: MouseEvent, dropTarget: DropTarget): boolean {
        let mouseOverTarget = false;

        this.getAllContainersFromDropTarget(dropTarget)
            .filter(eContainer => eContainer) // secondary can be missing
            .forEach(eContainer => {
                const rect = eContainer.getBoundingClientRect();

                // if element is not visible, then width and height are zero
                if (rect.width === 0 || rect.height === 0) {
                    return;
                }

                const horizontalFit = mouseEvent.clientX >= rect.left && mouseEvent.clientX <= rect.right;
                const verticalFit = mouseEvent.clientY >= rect.top && mouseEvent.clientY <= rect.bottom;

                if (horizontalFit && verticalFit) {
                    mouseOverTarget = true;
                }
            });

        return mouseOverTarget && dropTarget.isInterestedIn(this.dragSource.type);
    }

    public addDropTarget(dropTarget: DropTarget) {
        this.dropTargets.push(dropTarget);
    }

    public getHorizontalDirection(event: MouseEvent): HorizontalDirection {
        if (this.eventLastTime.clientX > event.clientX) {
            return HorizontalDirection.Left;
        } else if (this.eventLastTime.clientX < event.clientX) {
            return HorizontalDirection.Right;
        } else {
            return null;
        }
    }

    public getVerticalDirection(event: MouseEvent): VerticalDirection {
        if (this.eventLastTime.clientY > event.clientY) {
            return VerticalDirection.Up;
        } else if (this.eventLastTime.clientY < event.clientY) {
            return VerticalDirection.Down;
        } else {
            return null;
        }
    }

    public createDropTargetEvent(dropTarget: DropTarget, event: MouseEvent, hDirection: HorizontalDirection, vDirection: VerticalDirection, fromNudge: boolean): DraggingEvent {
        // localise x and y to the target component
        const rect = dropTarget.getContainer().getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        return {
            event,
            x,
            y,
            vDirection,
            hDirection,
            dragSource: this.dragSource,
            fromNudge,
            dragItem: this.dragItem
        };
    }

    private positionGhost(event: MouseEvent): void {
        const ghostRect = this.eGhost.getBoundingClientRect();
        const ghostHeight = ghostRect.height;

        // for some reason, without the '-2', it still overlapped by 1 or 2 pixels, which
        // then brought in scrollbars to the browser. no idea why, but putting in -2 here
        // works around it which is good enough for me.
        const browserWidth = _.getBodyWidth() - 2;
        const browserHeight = _.getBodyHeight() - 2;

        // put ghost vertically in middle of cursor
        let top = event.pageY - (ghostHeight / 2);
        // horizontally, place cursor just right of icon
        let left = event.pageX - 30;

        const usrDocument = this.gridOptionsWrapper.getDocument();
        const windowScrollY = window.pageYOffset || usrDocument.documentElement.scrollTop;
        const windowScrollX = window.pageXOffset || usrDocument.documentElement.scrollLeft;

        // check ghost is not positioned outside of the browser
        if (browserWidth > 0 && ((left + this.eGhost.clientWidth) > (browserWidth + windowScrollX))) {
            left = browserWidth + windowScrollX - this.eGhost.clientWidth;
        }

        if (left < 0) {
            left = 0;
        }

        if (browserHeight > 0 && ((top + this.eGhost.clientHeight) > (browserHeight + windowScrollY))) {
            top = browserHeight + windowScrollY - this.eGhost.clientHeight;
        }

        if (top < 0) {
            top = 0;
        }

        this.eGhost.style.left = left + 'px';
        this.eGhost.style.top = top + 'px';
    }

    private removeGhost(): void {
        if (this.eGhost && this.eGhostParent) {
            this.eGhostParent.removeChild(this.eGhost);
        }

        this.eGhost = null;
    }

    private createGhost(): void {
        this.eGhost = _.loadTemplate(DragAndDropService.GHOST_TEMPLATE);
        const { theme } = this.environment.getTheme();

        if (theme) {
            _.addCssClass(this.eGhost, theme);
        }

        this.eGhostIcon = this.eGhost.querySelector('.ag-dnd-ghost-icon') as HTMLElement;

        this.setGhostIcon(null);

        const eText = this.eGhost.querySelector('.ag-dnd-ghost-label') as HTMLElement;
        eText.innerHTML = _.escape(this.dragSource.dragItemName);

        this.eGhost.style.height = '25px';
        this.eGhost.style.top = '20px';
        this.eGhost.style.left = '20px';

        const usrDocument = this.gridOptionsWrapper.getDocument();
        this.eGhostParent = usrDocument.querySelector('body') as HTMLElement;

        if (!this.eGhostParent) {
            console.warn('ag-Grid: could not find document body, it is needed for dragging columns');
        } else {
            this.eGhostParent.appendChild(this.eGhost);
        }
    }

    public setGhostIcon(iconName: string, shake = false): void {
        _.clearElement(this.eGhostIcon);

        let eIcon: HTMLElement;

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

        // if we are dragging out of the grid but suppressDragLeaveHidesColumns
        // is true then no icon should be added.
        if (eIcon !== this.eHiddenIcon || !this.gridOptionsWrapper.isSuppressDragLeaveHidesColumns()) {
            this.eGhostIcon.appendChild(eIcon);
        }

        _.addOrRemoveCssClass(this.eGhostIcon, 'ag-shake-left-to-right', shake);
    }
}
