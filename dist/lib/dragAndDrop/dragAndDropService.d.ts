// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "../entities/column";
export declare enum DragSourceType {
    ToolPanel = 0,
    HeaderCell = 1,
}
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
export declare enum VDirection {
    Up = 0,
    Down = 1,
}
export declare enum HDirection {
    Left = 0,
    Right = 1,
}
export interface DraggingEvent {
    event: MouseEvent;
    x: number;
    y: number;
    vDirection: VDirection;
    hDirection: HDirection;
    dragSource: DragSource;
    fromNudge: boolean;
}
export declare class DragAndDropService {
    private gridOptionsWrapper;
    private dragService;
    private columnController;
    static ICON_PINNED: string;
    static ICON_ADD: string;
    static ICON_MOVE: string;
    static ICON_LEFT: string;
    static ICON_RIGHT: string;
    static ICON_GROUP: string;
    static ICON_AGGREGATE: string;
    static ICON_PIVOT: string;
    static ICON_NOT_ALLOWED: string;
    static GHOST_TEMPLATE: string;
    private logger;
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
    private ePlusIcon;
    private eHiddenIcon;
    private eMoveIcon;
    private eLeftIcon;
    private eRightIcon;
    private eGroupIcon;
    private eAggregateIcon;
    private ePivotIcon;
    private eDropNotAllowedIcon;
    private init();
    private setBeans(loggerFactory);
    addDragSource(dragSource: DragSource, allowTouch?: boolean): void;
    removeDragSource(dragSource: DragSource): void;
    private destroy();
    nudge(): void;
    private onDragStart(dragSource, mouseEvent);
    private onDragStop(mouseEvent);
    private onDragging(mouseEvent, fromNudge);
    private enterDragTargetIfExists(dropTarget, mouseEvent, hDirection, vDirection, fromNudge);
    private leaveLastTargetIfExists(mouseEvent, hDirection, vDirection, fromNudge);
    private getAllContainersFromDropTarget(dropTarget);
    private isMouseOnDropTarget(mouseEvent, dropTarget);
    addDropTarget(dropTarget: DropTarget): void;
    workOutHDirection(event: MouseEvent): HDirection;
    workOutVDirection(event: MouseEvent): VDirection;
    createDropTargetEvent(dropTarget: DropTarget, event: MouseEvent, hDirection: HDirection, vDirection: VDirection, fromNudge: boolean): DraggingEvent;
    private positionGhost(event);
    private removeGhost();
    private createGhost();
    setGhostIcon(iconName: string, shake?: boolean): void;
}
