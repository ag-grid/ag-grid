
import {DropTarget, DraggingEvent, DragAndDropService, DragSourceType} from "../dragAndDrop/dragAndDropService";
import {Autowired, PostConstruct, Context} from "../context/context";
import {MoveColumnController} from "./moveColumnController";
import {Column} from "../entities/column";
import {GridPanel} from "../gridPanel/gridPanel";
import {BodyDropPivotTarget} from "./bodyDropPivotTarget";
import {ColumnController} from "../columnController/columnController";

interface DropListener {
    getIconName(): string;
    onDragEnter(params: DraggingEvent): void;
    onDragLeave(params: DraggingEvent): void;
    onDragging(params: DraggingEvent): void;
    onDragStop(params: DraggingEvent): void;
}

export class BodyDropTarget implements DropTarget {

    @Autowired('context') private context: Context;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('columnController') private columnController: ColumnController;

    private pinned: string;

    // public because it's part of the DropTarget interface
    private eContainer: HTMLElement;

    // public because it's part of the DropTarget interface
    private eSecondaryContainers: HTMLElement[];

    private moveColumnController: MoveColumnController;
    private bodyDropPivotTarget: BodyDropPivotTarget;

    private currentDropListener: DropListener;

    constructor(pinned: string, eContainer: HTMLElement) {
        this.pinned = pinned;
        this.eContainer = eContainer;
    }

    public getSecondaryContainers(): HTMLElement[] {
        return this.eSecondaryContainers;
    }
    
    public getContainer(): HTMLElement {
        return this.eContainer;
    }
    
    @PostConstruct
    private init(): void {

        this.moveColumnController = new MoveColumnController(this.pinned);
        this.context.wireBean(this.moveColumnController);

        this.bodyDropPivotTarget = new BodyDropPivotTarget(this.pinned);
        this.context.wireBean(this.bodyDropPivotTarget);

        switch (this.pinned) {
            case Column.PINNED_LEFT: this.eSecondaryContainers = this.gridPanel.getDropTargetLeftContainers(); break;
            case Column.PINNED_RIGHT: this.eSecondaryContainers = this.gridPanel.getDropTargetPinnedRightContainers(); break;
            default: this.eSecondaryContainers = this.gridPanel.getDropTargetBodyContainers(); break;
        }

        this.dragAndDropService.addDropTarget(this);
    }

    public getIconName(): string {
        return this.currentDropListener.getIconName();
    }

    // we want to use the bodyPivotTarget if the user is dragging columns in from the toolPanel
    // and we are in pivot mode, as it has to logic to set pivot/value/group on the columns when
    // dropped into the grid's body.
    private isUseBodyDropPivotTarget(draggingEvent: DraggingEvent): boolean {

        // if not in pivot mode, then we never use the pivot drop target
        if (!this.columnController.isPivotMode()) { return false; }

        // otherwise we use the drop target if the column came from the toolPanel (ie not reordering)
        return draggingEvent.dragSource.type === DragSourceType.ToolPanel;
    }

    public onDragEnter(draggingEvent: DraggingEvent): void {
        // we pick the drop listener depending on whether we are in pivot mode are not. if we are
        // in pivot mode, then dropping cols changes the row group, pivot, value stats. otherwise
        // we change visibility state and position.

        // if (this.columnController.isPivotMode()) {
        var useBodyDropPivotTarget = this.isUseBodyDropPivotTarget(draggingEvent);
        if (useBodyDropPivotTarget) {
            this.currentDropListener = this.bodyDropPivotTarget;
        } else {
            this.currentDropListener = this.moveColumnController;
        }
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