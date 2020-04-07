import { PostConstruct, Bean, Autowired, PreDestroy } from "../context/context";
import { Column } from "../entities/column";
import { ColumnApi } from "../columnController/columnApi";
import { GridApi } from "../gridApi";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { DragService, DragListenerParams } from "./dragService";
import { Environment } from "../environment";
import { RowNode } from "../entities/rowNode";
import { _ } from "../utils";

export interface DragItem {
    /**
     * When dragging a row, this contains the row node being dragged
     * When dragging multiple rows, this contains the row that started the drag.
     */
    rowNode?: RowNode;

    /** When dragging multiple rows, this contains all rows being dragged */
    rowNodes?: RowNode[];

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
    dragItemName: string | (() => string) | null;
    /** Icon to show when not over a drop zone */
    defaultIconName?: string;
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
    api: GridApi;
    columnApi: ColumnApi;
}

@Bean('dragAndDropService')
export class DragAndDropService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('dragService') private dragService: DragService;
    @Autowired('environment') private environment: Environment;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    public static ICON_PINNED = 'pinned';
    public static ICON_MOVE = 'move';
    public static ICON_LEFT = 'left';
    public static ICON_RIGHT = 'right';
    public static ICON_GROUP = 'group';
    public static ICON_AGGREGATE = 'aggregate';
    public static ICON_PIVOT = 'pivot';
    public static ICON_NOT_ALLOWED = 'notAllowed';
    public static ICON_HIDE = 'hide';

    public static GHOST_TEMPLATE =
        '<div ref="eWrapper" class="ag-dnd-wrapper ag-unselectable"><div class="ag-dnd-ghost">' +
        '  <span class="ag-dnd-ghost-icon ag-shake-left-to-right"></span>' +
        '  <div class="ag-dnd-ghost-label"></div>' +
        '</div></div>';

    private dragSourceAndParamsList: { params: DragListenerParams, dragSource: DragSource }[] = [];

    private dragItem: DragItem;
    private eventLastTime: MouseEvent;
    private dragSource: DragSource;
    private dragging: boolean;

    private eWrapper: HTMLElement;
    private eGhostParent: HTMLElement;
    private eGhostIcon: HTMLElement;

    private dropTargets: DropTarget[] = [];
    private lastDropTarget: DropTarget;

    private ePinnedIcon: HTMLElement;
    private eHideIcon: HTMLElement;
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
        this.eHideIcon = _.createIcon('columnMoveHide', this.gridOptionsWrapper, null);
        this.eMoveIcon = _.createIcon('columnMoveMove', this.gridOptionsWrapper, null);
        this.eLeftIcon = _.createIcon('columnMoveLeft', this.gridOptionsWrapper, null);
        this.eRightIcon = _.createIcon('columnMoveRight', this.gridOptionsWrapper, null);
        this.eGroupIcon = _.createIcon('columnMoveGroup', this.gridOptionsWrapper, null);
        this.eAggregateIcon = _.createIcon('columnMoveValue', this.gridOptionsWrapper, null);
        this.ePivotIcon = _.createIcon('columnMovePivot', this.gridOptionsWrapper, null);
        this.eDropNotAllowedIcon = _.createIcon('dropNotAllowed', this.gridOptionsWrapper, null);
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
                if (rect.width === 0 || rect.height === 0) { return; }

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
        const clientX = this.eventLastTime.clientX;
        const eClientX = event.clientX;

        if (clientX === eClientX) { return null; }

        return clientX > eClientX ? HorizontalDirection.Left : HorizontalDirection.Right;
    }

    public getVerticalDirection(event: MouseEvent): VerticalDirection {
        const clientY = this.eventLastTime.clientY;
        const eClientY = event.clientY;

        if (clientY === eClientY) { return null; }

        return clientY > eClientY ? VerticalDirection.Up : VerticalDirection.Down;
    }

    public createDropTargetEvent(dropTarget: DropTarget, event: MouseEvent, hDirection: HorizontalDirection, vDirection: VerticalDirection, fromNudge: boolean): DraggingEvent {
        // localise x and y to the target component
        const rect = dropTarget.getContainer().getBoundingClientRect();
        const { gridApi: api, columnApi, dragItem, dragSource } = this;
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        return { event, x, y, vDirection, hDirection, dragSource, fromNudge, dragItem, api, columnApi };
    }

    private positionGhost(event: MouseEvent): void {
        const ghost = this.eWrapper.querySelector('.ag-dnd-ghost') as HTMLDivElement;
        const ghostRect = ghost.getBoundingClientRect();
        const ghostHeight = ghostRect.height;

        // for some reason, without the '-2', it still overlapped by 1 or 2 pixels, which
        // then brought in scrollbars to the browser. no idea why, but putting in -2 here
        // works around it which is good enough for me.
        const browserWidth = _.getBodyWidth() - 2;
        const browserHeight = _.getBodyHeight() - 2;

        // put ghost vertically in middle of cursor
        let top = event.pageY - (ghostHeight / 2);
        // horizontally, place cursor just right of icon
        let left = event.pageX - 10;

        const usrDocument = this.gridOptionsWrapper.getDocument();
        const windowScrollY = window.pageYOffset || usrDocument.documentElement.scrollTop;
        const windowScrollX = window.pageXOffset || usrDocument.documentElement.scrollLeft;

        // check ghost is not positioned outside of the browser
        if (browserWidth > 0 && ((left + ghost.clientWidth) > (browserWidth + windowScrollX))) {
            left = browserWidth + windowScrollX - ghost.clientWidth;
        }

        if (left < 0) {
            left = 0;
        }

        if (browserHeight > 0 && ((top + ghost.clientHeight) > (browserHeight + windowScrollY))) {
            top = browserHeight + windowScrollY - ghost.clientHeight;
        }

        if (top < 0) {
            top = 0;
        }

        ghost.style.left = left + 'px';
        ghost.style.top = top + 'px';
    }

    private removeGhost(): void {
        if (this.eWrapper && this.eGhostParent) {
            this.eGhostParent.removeChild(this.eWrapper);
        }

        this.eWrapper = null;
    }

    private createGhost(): void {
        this.eWrapper = _.loadTemplate(DragAndDropService.GHOST_TEMPLATE);
        const { theme } = this.environment.getTheme();

        if (theme) {
            _.addCssClass(this.eWrapper, theme);
        }

        this.eGhostIcon = this.eWrapper.querySelector('.ag-dnd-ghost-icon') as HTMLElement;

        this.setGhostIcon(null);

        const eText = this.eWrapper.querySelector('.ag-dnd-ghost-label') as HTMLElement;
        let dragItemName = this.dragSource.dragItemName;

        if (_.isFunction(dragItemName)) {
            dragItemName = (dragItemName as () => string)();
        }

        eText.innerHTML = _.escape(dragItemName as string);

        this.eWrapper.style.height = '25px';
        this.eWrapper.style.top = '20px';
        this.eWrapper.style.left = '20px';

        const usrDocument = this.gridOptionsWrapper.getDocument();
        this.eGhostParent = usrDocument.querySelector('body') as HTMLElement;

        if (!this.eGhostParent) {
            console.warn('ag-Grid: could not find document body, it is needed for dragging columns');
        } else {
            this.eGhostParent.appendChild(this.eWrapper);
        }
    }

    public setGhostIcon(iconName: string, shake = false): void {
        _.clearElement(this.eGhostIcon);

        let eIcon: HTMLElement;

        if (!iconName) {
            iconName = this.dragSource.defaultIconName || DragAndDropService.ICON_NOT_ALLOWED;
        }

        switch (iconName) {
            case DragAndDropService.ICON_PINNED:      eIcon = this.ePinnedIcon; break;
            case DragAndDropService.ICON_MOVE:        eIcon = this.eMoveIcon; break;
            case DragAndDropService.ICON_LEFT:        eIcon = this.eLeftIcon; break;
            case DragAndDropService.ICON_RIGHT:       eIcon = this.eRightIcon; break;
            case DragAndDropService.ICON_GROUP:       eIcon = this.eGroupIcon; break;
            case DragAndDropService.ICON_AGGREGATE:   eIcon = this.eAggregateIcon; break;
            case DragAndDropService.ICON_PIVOT:       eIcon = this.ePivotIcon; break;
            case DragAndDropService.ICON_NOT_ALLOWED: eIcon = this.eDropNotAllowedIcon; break;
            case DragAndDropService.ICON_HIDE:        eIcon = this.eHideIcon; break;
        }

        _.addOrRemoveCssClass(this.eGhostIcon, 'ag-shake-left-to-right', shake);

        if (eIcon === this.eHideIcon && this.gridOptionsWrapper.isSuppressDragLeaveHidesColumns()) {
            return;
        }

        if (eIcon) {
            this.eGhostIcon.appendChild(eIcon);
        }
    }
}
