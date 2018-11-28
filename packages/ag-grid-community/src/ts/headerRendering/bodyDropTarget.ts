import { DragAndDropService, DraggingEvent, DragSourceType, DropTarget } from "../dragAndDrop/dragAndDropService";
import { Autowired, Context, PostConstruct } from "../context/context";
import { MoveColumnController } from "./moveColumnController";
import { Column } from "../entities/column";
import { GridPanel } from "../gridPanel/gridPanel";
import { BodyDropPivotTarget } from "./bodyDropPivotTarget";
import { ColumnController } from "../columnController/columnController";

export interface DropListener {
    getIconName(): string;
    onDragEnter(params: DraggingEvent): void;
    onDragLeave(params: DraggingEvent): void;
    onDragging(params: DraggingEvent): void;
    onDragStop(params: DraggingEvent): void;
}

enum DropType { ColumnMove, Pivot }

export class BodyDropTarget implements DropTarget {

    @Autowired('context') private context: Context;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('columnController') private columnController: ColumnController;

    private gridPanel: GridPanel;

    private pinned: string;

    // public because it's part of the DropTarget interface
    private eContainer: HTMLElement;

    // public because it's part of the DropTarget interface
    private eSecondaryContainers: HTMLElement[];

    private dropListeners: {[type: number]: DropListener} = {};

    private currentDropListener: DropListener;

    private moveColumnController: MoveColumnController;

    constructor(pinned: string, eContainer: HTMLElement) {
        this.pinned = pinned;
        this.eContainer = eContainer;
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;

        this.moveColumnController.registerGridComp(gridPanel);

        switch (this.pinned) {
            case Column.PINNED_LEFT: this.eSecondaryContainers = this.gridPanel.getDropTargetLeftContainers(); break;
            case Column.PINNED_RIGHT: this.eSecondaryContainers = this.gridPanel.getDropTargetRightContainers(); break;
            default: this.eSecondaryContainers = this.gridPanel.getDropTargetBodyContainers(); break;
        }
    }

    public isInterestedIn(type: DragSourceType): boolean {
        // not interested in row drags
        return type === DragSourceType.HeaderCell || type === DragSourceType.ToolPanel;
    }

    public getSecondaryContainers(): HTMLElement[] {
        return this.eSecondaryContainers;
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }

    @PostConstruct
    private init(): void {

        this.moveColumnController = new MoveColumnController(this.pinned, this.eContainer);
        this.context.wireBean(this.moveColumnController);

        const bodyDropPivotTarget = new BodyDropPivotTarget(this.pinned);
        this.context.wireBean(bodyDropPivotTarget);

        this.dropListeners[DropType.ColumnMove] = this.moveColumnController;
        this.dropListeners[DropType.Pivot] = bodyDropPivotTarget;

        this.dragAndDropService.addDropTarget(this);
    }

    public getIconName(): string {
        return this.currentDropListener.getIconName();
    }

    // we want to use the bodyPivotTarget if the user is dragging columns in from the toolPanel
    // and we are in pivot mode, as it has to logic to set pivot/value/group on the columns when
    // dropped into the grid's body.
    private getDropType(draggingEvent: DraggingEvent): DropType {

        if (this.columnController.isPivotMode()) {
            // in pivot mode, then if moving a column (ie didn't come from toolpanel) then it's
            // a standard column move, however if it came from teh toolpanel, then we are introducing
            // dimensions or values to the grid
            if (draggingEvent.dragSource.type === DragSourceType.ToolPanel) {
                return DropType.Pivot;
            } else {
                return DropType.ColumnMove;
            }
        } else {
            // it's a column, and not pivot mode, so always moving
            return DropType.ColumnMove;
        }
    }

    public onDragEnter(draggingEvent: DraggingEvent): void {
        // we pick the drop listener depending on whether we are in pivot mode are not. if we are
        // in pivot mode, then dropping cols changes the row group, pivot, value stats. otherwise
        // we change visibility state and position.

        // if (this.columnController.isPivotMode()) {
        const dropType: DropType = this.getDropType(draggingEvent);
        this.currentDropListener = this.dropListeners[dropType];

        this.currentDropListener.onDragEnter(draggingEvent);
    }

    public onDragLeave(params: DraggingEvent): void {
        this.currentDropListener.onDragLeave(params);
    }

    public onDragging(params: DraggingEvent): void {
        this.currentDropListener.onDragging(params);
    }

    public onDragStop(params: DraggingEvent): void {
        this.currentDropListener.onDragStop(params);
    }

}