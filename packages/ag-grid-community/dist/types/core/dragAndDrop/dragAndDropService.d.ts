import { BeanStub } from "../context/beanStub";
import { Column } from "../entities/column";
import { ColumnApi } from "../columns/columnApi";
import { GridApi } from "../gridApi";
import { RowDropZoneParams } from "../gridBodyComp/rowDragFeature";
import { IRowNode } from "../interfaces/iRowNode";
import { IAggFunc } from "../entities/colDef";
import { HorizontalDirection, VerticalDirection } from "../constants/direction";
export interface DragItem<TValue = any> {
    /**
     * When dragging a row, this contains the row node being dragged
     * When dragging multiple rows, this contains the row that started the drag.
     */
    rowNode?: IRowNode;
    /** When dragging multiple rows, this contains all rows being dragged */
    rowNodes?: IRowNode[];
    /** When dragging columns, this contains the columns being dragged */
    columns?: Column[];
    /** When dragging columns, this contains the visible state of the columns */
    visibleState?: {
        [key: string]: boolean;
    };
    /** When dragging columns, this contains the pivot state of the columns. This is only populated/used in column tool panel */
    pivotState?: {
        [key: string]: {
            pivot?: boolean;
            rowGroup?: boolean;
            aggFunc?: string | IAggFunc | null;
        };
    };
    /** Additional state */
    value?: TValue;
}
export declare enum DragSourceType {
    ToolPanel = 0,
    HeaderCell = 1,
    RowDrag = 2,
    ChartPanel = 3,
    AdvancedFilterBuilder = 4
}
export interface DragSource {
    /**
     * The type of the drag source, used by the drop target to know where the
     * drag originated from.
     */
    type: DragSourceType;
    /** Can be used to identify a specific component as the source */
    sourceId?: string;
    /**
     * Element which, when dragged, will kick off the DnD process
     */
    eElement: Element;
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
    getDefaultIconName?: () => string;
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
    isInterestedIn(type: DragSourceType, el: Element): boolean;
    /**
     * If `true`, the DragSources will only be allowed to be dragged within the DragTarget that contains them.
     * This is useful for changing order of items within a container, and not moving items across containers.
     * @default false
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
    /** @deprecated v31 ColumnApi has been deprecated and all methods moved to the api. */
    columnApi: ColumnApi;
    dropZoneTarget: HTMLElement;
}
export declare class DragAndDropService extends BeanStub {
    private dragService;
    private readonly mouseEventService;
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
    private getAllContainersFromDropTarget;
    private allContainersIntersect;
    private isMouseOnDropTarget;
    private findCurrentDropTarget;
    private enterDragTargetIfExists;
    private leaveLastTargetIfExists;
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
