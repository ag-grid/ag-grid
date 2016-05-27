// Type definitions for ag-grid v4.2.5
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
    eContainer: HTMLElement;
    /** If any secondary containers. For example when moving columns in ag-Grid, we listen for drops
     * in the header as well as the body (main rows and floating rows) of the grid. */
    eSecondaryContainers?: HTMLElement[];
    /** Icon to show when */
    iconName?: string;
    onDragEnter?: (params: DraggingEvent) => void;
    onDragLeave?: (params: DraggingEvent) => void;
    onDragging?: (params: DraggingEvent) => void;
    onDragStop?: (params: DraggingEvent) => void;
}
export interface DraggingEvent {
    event: MouseEvent;
    x: number;
    y: number;
    direction: string;
    dragSource: DragSource;
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
    private setBeans(loggerFactory);
    addDragSource(dragSource: DragSource): void;
    nudge(): void;
    private onDragStart(dragSource, mouseEvent);
    private onDragStop(mouseEvent);
    private onDragging(mouseEvent);
    private enterDragTargetIfExists(dropTarget, mouseEvent, direction);
    private leaveLastTargetIfExists(mouseEvent, direction);
    private isMouseOnDropTarget(mouseEvent, dropTarget);
    addDropTarget(dropTarget: DropTarget): void;
    workOutDirection(event: MouseEvent): string;
    createDropTargetEvent(dropTarget: DropTarget, event: MouseEvent, direction: string): DraggingEvent;
    private positionGhost(event);
    private removeGhost();
    private createGhost();
    setGhostIcon(iconName: string, shake?: boolean): void;
}
