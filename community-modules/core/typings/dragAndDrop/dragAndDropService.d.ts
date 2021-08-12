import { BeanStub } from "../context/beanStub";
import { Column } from "../entities/column";
import { ColumnApi } from "../columns/columnApi";
import { GridApi } from "../gridApi";
import { RowDropZoneParams } from "../gridBodyComp/rowDragFeature";
import { RowNode } from "../entities/rowNode";
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
    visibleState?: {
        [key: string]: boolean;
    };
}
export declare enum DragSourceType {
    ToolPanel = 0,
    HeaderCell = 1,
    RowDrag = 2,
    ChartPanel = 3
}
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
}
export interface DropTarget {
    /** The main container that will get the drop. */
    getContainer(): HTMLElement;
    /** If any secondary containers. For example when moving columns in AG Grid, we listen for drops
     * in the header as well as the body (main rows and pinned rows) of the grid. */
    getSecondaryContainers?(): HTMLElement[][];
    /** Icon to show when drag is over */
    getIconName?(): string | null;
    isInterestedIn(type: DragSourceType): boolean;
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
export declare enum VerticalDirection {
    Up = 0,
    Down = 1
}
export declare enum HorizontalDirection {
    Left = 0,
    Right = 1
}
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
export declare class DragAndDropService extends BeanStub {
    private dragService;
    private environment;
    private columnApi;
    private gridApi;
    static ICON_PINNED: string;
    static ICON_MOVE: string;
    static ICON_LEFT: string;
    static ICON_RIGHT: string;
    static ICON_GROUP: string;
    static ICON_AGGREGATE: string;
    static ICON_PIVOT: string;
    static ICON_NOT_ALLOWED: string;
    static ICON_HIDE: string;
    static GHOST_TEMPLATE: string;
    private dragSourceAndParamsList;
    private dragItem;
    private eventLastTime;
    private dragSource;
    private dragging;
    private eGhost;
    private eGhostParent;
    private eGhostIcon;
    private dropTargets;
    private lastDropTarget;
    private ePinnedIcon;
    private eHideIcon;
    private eMoveIcon;
    private eLeftIcon;
    private eRightIcon;
    private eGroupIcon;
    private eAggregateIcon;
    private ePivotIcon;
    private eDropNotAllowedIcon;
    private init;
    addDragSource(dragSource: DragSource, allowTouch?: boolean): void;
    removeDragSource(dragSource: DragSource): void;
    private clearDragSourceParamsList;
    nudge(): void;
    private onDragStart;
    private onDragStop;
    private onDragging;
    private enterDragTargetIfExists;
    private leaveLastTargetIfExists;
    private getAllContainersFromDropTarget;
    private allContainersIntersect;
    private isMouseOnDropTarget;
    addDropTarget(dropTarget: DropTarget): void;
    removeDropTarget(dropTarget: DropTarget): void;
    hasExternalDropZones(): boolean;
    findExternalZone(params: RowDropZoneParams): DropTarget | null;
    getHorizontalDirection(event: MouseEvent): HorizontalDirection | null;
    getVerticalDirection(event: MouseEvent): VerticalDirection | null;
    createDropTargetEvent(dropTarget: DropTarget, event: MouseEvent, hDirection: HorizontalDirection | null, vDirection: VerticalDirection | null, fromNudge: boolean): DraggingEvent;
    private positionGhost;
    private removeGhost;
    private createGhost;
    setGhostIcon(iconName: string | null, shake?: boolean): void;
}
