// Type definitions for ag-grid v5.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Column } from "../entities/column";
export interface DragSource {
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
    event: MouseEvent;
    x: number;
    y: number;
    direction: string;
    dragSource: DragSource;
    fromNudge: boolean;
}
export declare class DragAndDropService {
    private gridOptionsWrapper;
    private dragService;
    private columnController;
    static DIRECTION_LEFT: string;
    static DIRECTION_RIGHT: string;
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
    private dragItem;
    private eventLastTime;
    private dragSource;
    private dragging;
    private eGhost;
    private eGhostIcon;
    private eBody;
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
    addDragSource(dragSource: DragSource): void;
    nudge(): void;
    private onDragStart(dragSource, mouseEvent);
    private onDragStop(mouseEvent);
    private onDragging(mouseEvent, fromNudge);
    private enterDragTargetIfExists(dropTarget, mouseEvent, direction, fromNudge);
    private leaveLastTargetIfExists(mouseEvent, direction, fromNudge);
    private getAllContainersFromDropTarget(dropTarget);
    private isMouseOnDropTarget(mouseEvent, dropTarget);
    addDropTarget(dropTarget: DropTarget): void;
    workOutDirection(event: MouseEvent): string;
    createDropTargetEvent(dropTarget: DropTarget, event: MouseEvent, direction: string, fromNudge: boolean): DraggingEvent;
    private positionGhost(event);
    private removeGhost();
    private createGhost();
    setGhostIcon(iconName: string, shake?: boolean): void;
}
