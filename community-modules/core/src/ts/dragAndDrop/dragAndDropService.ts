import { BeanStub } from "../context/beanStub";
import { PostConstruct, Bean, Autowired, PreDestroy } from "../context/context";
import { Column } from "../entities/column";
import { ColumnApi } from "../columns/columnApi";
import { GridApi } from "../gridApi";
import { DragService, DragListenerParams } from "./dragService";
import { Environment } from "../environment";
import { RowDropZoneParams } from "../gridBodyComp/rowDragFeature";
import { RowNode } from "../entities/rowNode";
import { escapeString } from "../utils/string";
import { createIcon } from "../utils/icon";
import { flatten, removeFromArray } from "../utils/array";
import { getBodyHeight, getBodyWidth } from "../utils/browser";
import { loadTemplate, clearElement } from "../utils/dom";
import { isFunction } from "../utils/function";

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
    /**
     * The type of the drag source, used by the drop target to know where the
     * drag originated from.
     */
    type: DragSourceType;
    /**
     * Element which, when dragged, will kick off the DnD process
     */
    eElement: HTMLElement;
    /**
     * If eElement is dragged, then the dragItem is the object that gets passed around.
     */
    getDragItem: () => DragItem;
    /**
     * This name appears in the ghost icon when dragging.
     */
    dragItemName: string | (() => string) | null;
    /**
     * Icon to show when not over a drop zone
     */
    defaultIconName?: string;
    /**
     * The drop target associated with this dragSource. When dragging starts, this
     * target does not get an onDragEnter event.
     */
    dragSourceDropTarget?: DropTarget;
    /**
     * The drag source DOM Data Key, this is useful to detect if the origin grid is the same
     * as the target grid.
     */
    dragSourceDomDataKey?: string;
    /**
     * After how many pixels of dragging should the drag operation start. Default is 4.
     */
    dragStartPixels?: number;
    /**
     * Callback for drag started
     */
    onDragStarted?: () => void;
    /**
     * Callback for drag stopped
     */
    onDragStopped?: () => void;
    /**
     * Callback for entering the grid
     */
    onGridEnter?: (dragItem: DragItem | null) => void;
    /**
     * Callback for exiting the grid
     */
    onGridExit?: (dragItem: DragItem | null) => void;
}

export interface DropTarget {
    /** The main container that will get the drop. */
    getContainer(): HTMLElement;
    /** If any secondary containers. For example when moving columns in AG Grid, we listen for drops
     * in the header as well as the body (main rows and pinned rows) of the grid. */
    getSecondaryContainers?(): HTMLElement[][];
    /** Icon to show when drag is over */
    getIconName?(): string | null;

    isInterestedIn(type: DragSourceType, el: HTMLElement): boolean;

    /**
     * If `true`, the DragSources will only be allowed to be dragged within the DragTarget that contains them.
     * This is useful for changing order of items within a container, and not moving items across containers.
     * Default: `false`
     */
    targetContainsSource?: boolean;

    /** Callback for when drag enters */
    onDragEnter?(params: DraggingEvent): void;
    /** Callback for when drag leaves */
    onDragLeave?(params: DraggingEvent): void;
    /** Callback for when dragging */
    onDragging?(params: DraggingEvent): void;
    /** Callback for when drag stops */
    onDragStop?(params: DraggingEvent): void;
    external?: boolean;
}

export enum VerticalDirection { Up, Down }
export enum HorizontalDirection { Left, Right }

export interface DraggingEvent {
    event: MouseEvent;
    x: number;
    y: number;
    vDirection: VerticalDirection | null;
    hDirection: HorizontalDirection | null;
    dragSource: DragSource;
    dragItem: DragItem;
    fromNudge: boolean;
    api: GridApi;
    columnApi: ColumnApi;
    dropZoneTarget: HTMLElement;
}

@Bean('dragAndDropService')
export class DragAndDropService extends BeanStub {

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

    public static GHOST_TEMPLATE = /* html */
        `<div class="ag-dnd-ghost ag-unselectable">
            <span class="ag-dnd-ghost-icon ag-shake-left-to-right"></span>
            <div class="ag-dnd-ghost-label"></div>
        </div>`;

    private dragSourceAndParamsList: { params: DragListenerParams, dragSource: DragSource }[] = [];

    private dragItem: DragItem | null;
    private eventLastTime: MouseEvent | null;
    private dragSource: DragSource;
    private dragging: boolean;

    private eGhost: HTMLElement | null;
    private eGhostParent: HTMLElement;
    private eGhostIcon: HTMLElement;

    private dropTargets: DropTarget[] = [];
    private lastDropTarget: DropTarget | null | undefined;

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
        this.ePinnedIcon = createIcon('columnMovePin', this.gridOptionsWrapper, null);
        this.eHideIcon = createIcon('columnMoveHide', this.gridOptionsWrapper, null);
        this.eMoveIcon = createIcon('columnMoveMove', this.gridOptionsWrapper, null);
        this.eLeftIcon = createIcon('columnMoveLeft', this.gridOptionsWrapper, null);
        this.eRightIcon = createIcon('columnMoveRight', this.gridOptionsWrapper, null);
        this.eGroupIcon = createIcon('columnMoveGroup', this.gridOptionsWrapper, null);
        this.eAggregateIcon = createIcon('columnMoveValue', this.gridOptionsWrapper, null);
        this.ePivotIcon = createIcon('columnMovePivot', this.gridOptionsWrapper, null);
        this.eDropNotAllowedIcon = createIcon('dropNotAllowed', this.gridOptionsWrapper, null);
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
        const sourceAndParams = this.dragSourceAndParamsList.find(item => item.dragSource === dragSource);

        if (sourceAndParams) {
            this.dragService.removeDragSource(sourceAndParams.params);
            removeFromArray(this.dragSourceAndParamsList, sourceAndParams);
        }
    }

    @PreDestroy
    private clearDragSourceParamsList(): void {
        this.dragSourceAndParamsList.forEach(sourceAndParams => this.dragService.removeDragSource(sourceAndParams.params));
        this.dragSourceAndParamsList.length = 0;
    }

    public nudge(): void {
        if (this.dragging) {
            this.onDragging(this.eventLastTime!, true);
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
        const validDropTargets = this.dropTargets.filter(target => this.isMouseOnDropTarget(mouseEvent, target));
        const dropTarget: DropTarget | null = this.findCurrentDropTarget(mouseEvent, validDropTargets);

        if (dropTarget !== this.lastDropTarget) {
            if (this.lastDropTarget !== null && dropTarget === null) {
                this.dragSource.onGridExit?.(this.dragItem);
            }
            if (this.lastDropTarget === null && dropTarget !== null) {
                this.dragSource.onGridEnter?.(this.dragItem);
            }
            this.leaveLastTargetIfExists(mouseEvent, hDirection, vDirection, fromNudge);
            this.enterDragTargetIfExists(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            this.lastDropTarget = dropTarget;
        } else if (dropTarget && dropTarget.onDragging) {
            const draggingEvent = this.createDropTargetEvent(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
            dropTarget.onDragging(draggingEvent);
        }
    }

    private getAllContainersFromDropTarget(dropTarget: DropTarget): HTMLElement[][] {
        const secondaryContainers = dropTarget.getSecondaryContainers ? dropTarget.getSecondaryContainers() : null;
        const containers: HTMLElement[][] = [[dropTarget.getContainer()]];

        return secondaryContainers ? containers.concat(secondaryContainers) : containers;
    }

    private allContainersIntersect(mouseEvent: MouseEvent, containers: HTMLElement[]) {
        for (const container of containers) {
            const rect = container.getBoundingClientRect();

            // if element is not visible, then width and height are zero
            if (rect.width === 0 || rect.height === 0) { return false; }

            const horizontalFit = mouseEvent.clientX >= rect.left && mouseEvent.clientX < rect.right;
            const verticalFit = mouseEvent.clientY >= rect.top && mouseEvent.clientY < rect.bottom;

            if (!horizontalFit || !verticalFit) { return false; }
        }
        return true;
    }

    // checks if the mouse is on the drop target. it checks eContainer and eSecondaryContainers
    private isMouseOnDropTarget(mouseEvent: MouseEvent, dropTarget: DropTarget): boolean {
        const allContainersFromDropTarget = this.getAllContainersFromDropTarget(dropTarget);
        let mouseOverTarget = false;

        for (const currentContainers of allContainersFromDropTarget) {
            if (this.allContainersIntersect(mouseEvent, currentContainers)) {
                mouseOverTarget = true;
                break;
            }
        }

        if (dropTarget.targetContainsSource && !dropTarget.getContainer().contains(this.dragSource.eElement)) { return false; }

        return mouseOverTarget && dropTarget.isInterestedIn(this.dragSource.type, this.dragSource.eElement);
    }

    private findCurrentDropTarget(mouseEvent: MouseEvent, validDropTargets: DropTarget[]): DropTarget | null {
        const len = validDropTargets.length;

        if (len === 0) { return  null; }
        if (len === 1) { return validDropTargets[0]; }

        const eDocument = this.gridOptionsWrapper.getDocument();

        // elementsFromPoint return a list of elements under
        // the mouseEvent sorted from topMost to bottomMost
        const elementStack = eDocument.elementsFromPoint(mouseEvent.x, mouseEvent.y) as HTMLElement[];

        // loop over the sorted elementStack to find which dropTarget comes first
        for (const el of elementStack) {
            for (const dropTarget of validDropTargets) {
                const containers = flatten(this.getAllContainersFromDropTarget(dropTarget));
                if (containers.indexOf(el) !== -1) { return dropTarget; }
            }
        }

        // we should never hit this point of the code because only
        // valid dropTargets should be provided to this method.
        return null;
    }

    private enterDragTargetIfExists(dropTarget: DropTarget | null, mouseEvent: MouseEvent, hDirection: HorizontalDirection | null, vDirection: VerticalDirection | null, fromNudge: boolean): void {
        if (!dropTarget) { return; }

        if (dropTarget.onDragEnter) {
            const dragEnterEvent = this.createDropTargetEvent(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);

            dropTarget.onDragEnter(dragEnterEvent);
        }

        this.setGhostIcon(dropTarget.getIconName ? dropTarget.getIconName() : null);
    }

    private leaveLastTargetIfExists(mouseEvent: MouseEvent, hDirection: HorizontalDirection | null, vDirection: VerticalDirection | null, fromNudge: boolean): void {
        if (!this.lastDropTarget) { return; }

        if (this.lastDropTarget.onDragLeave) {
            const dragLeaveEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, hDirection, vDirection, fromNudge);

            this.lastDropTarget.onDragLeave(dragLeaveEvent);
        }

        this.setGhostIcon(null);
    }

    public addDropTarget(dropTarget: DropTarget) {
        this.dropTargets.push(dropTarget);
    }

    public removeDropTarget(dropTarget: DropTarget) {
        this.dropTargets = this.dropTargets.filter(target => target.getContainer() !== dropTarget.getContainer());
    }

    public hasExternalDropZones(): boolean {
        return this.dropTargets.some(zones => zones.external);
    }

    public findExternalZone(params: RowDropZoneParams): DropTarget | null {
        const externalTargets = this.dropTargets.filter(target => target.external);

        return externalTargets.find(zone => zone.getContainer() === params.getContainer()) || null;
    }

    public getHorizontalDirection(event: MouseEvent): HorizontalDirection | null {
        const clientX = this.eventLastTime && this.eventLastTime.clientX;
        const eClientX = event.clientX;

        if (clientX === eClientX) { return null; }

        return clientX! > eClientX ? HorizontalDirection.Left : HorizontalDirection.Right;
    }

    public getVerticalDirection(event: MouseEvent): VerticalDirection | null {
        const clientY = this.eventLastTime && this.eventLastTime.clientY;
        const eClientY = event.clientY;

        if (clientY === eClientY) { return null; }

        return clientY! > eClientY ? VerticalDirection.Up : VerticalDirection.Down;
    }

    public createDropTargetEvent(
        dropTarget: DropTarget,
        event: MouseEvent,
        hDirection: HorizontalDirection | null,
        vDirection: VerticalDirection | null,
        fromNudge: boolean
    ): DraggingEvent {
        // localise x and y to the target
        const dropZoneTarget = dropTarget.getContainer();
        const rect = dropZoneTarget.getBoundingClientRect();
        const { gridApi: api, columnApi, dragItem, dragSource } = this;
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        return { event, x, y, vDirection, hDirection, dragSource, fromNudge, dragItem: dragItem as DragItem, api, columnApi, dropZoneTarget };
    }

    private positionGhost(event: MouseEvent): void {
        const ghost = this.eGhost;

        if (!ghost) { return; }

        const ghostRect = ghost.getBoundingClientRect();
        const ghostHeight = ghostRect.height;

        // for some reason, without the '-2', it still overlapped by 1 or 2 pixels, which
        // then brought in scrollbars to the browser. no idea why, but putting in -2 here
        // works around it which is good enough for me.
        const browserWidth = getBodyWidth() - 2;
        const browserHeight = getBodyHeight() - 2;

        let top = event.pageY - (ghostHeight / 2);
        let left = event.pageX - 10;

        const eDocument = this.gridOptionsWrapper.getDocument();
        const win = (eDocument.defaultView || window);
        const windowScrollY = win.pageYOffset || eDocument.documentElement.scrollTop;
        const windowScrollX = win.pageXOffset || eDocument.documentElement.scrollLeft;

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

        ghost.style.left = `${left}px`;
        ghost.style.top = `${top}px`;
    }

    private removeGhost(): void {
        if (this.eGhost && this.eGhostParent) {
            this.eGhostParent.removeChild(this.eGhost);
        }

        this.eGhost = null;
    }

    private createGhost(): void {
        this.eGhost = loadTemplate(DragAndDropService.GHOST_TEMPLATE);
        const { theme } = this.environment.getTheme();

        if (theme) {
            this.eGhost.classList.add(theme);
        }

        this.eGhostIcon = this.eGhost.querySelector('.ag-dnd-ghost-icon') as HTMLElement;

        this.setGhostIcon(null);

        const eText = this.eGhost.querySelector('.ag-dnd-ghost-label') as HTMLElement;
        let dragItemName = this.dragSource.dragItemName;

        if (isFunction(dragItemName)) {
            dragItemName = (dragItemName as () => string)();
        }

        eText.innerHTML = escapeString(dragItemName as string) || '';

        this.eGhost.style.height = '25px';
        this.eGhost.style.top = '20px';
        this.eGhost.style.left = '20px';

        const eDocument = this.gridOptionsWrapper.getDocument();
        let targetEl: HTMLElement | null = null;

        try {
            targetEl = eDocument.fullscreenElement as HTMLElement | null;
        } catch (e) {
            // some environments like SalesForce will throw errors
            // simply by trying to read the fullscreenElement property
        } finally {
            if (!targetEl) {
                targetEl = eDocument.querySelector('body');
            }
        }

        this.eGhostParent = targetEl as HTMLElement;

        if (!this.eGhostParent) {
            console.warn('AG Grid: could not find document body, it is needed for dragging columns');
        } else {
            this.eGhostParent.appendChild(this.eGhost);
        }
    }

    public setGhostIcon(iconName: string | null, shake = false): void {
        clearElement(this.eGhostIcon);

        let eIcon: HTMLElement | null = null;

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

        this.eGhostIcon.classList.toggle('ag-shake-left-to-right', shake);

        if (eIcon === this.eHideIcon && this.gridOptionsWrapper.isSuppressDragLeaveHidesColumns()) {
            return;
        }

        if (eIcon) {
            this.eGhostIcon.appendChild(eIcon);
        }
    }
}
