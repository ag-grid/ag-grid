
import {DraggingEvent, DragAndDropService} from "../dragAndDrop/dragAndDropService";
import {Column} from "../entities/column";
import {ColumnController} from "../columnController/columnController";
import {Autowired} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

export class BodyDropPivotTarget {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private columnsToAggregate: Column[] = [];
    private columnsToGroup: Column[] = [];
    private columnsToPivot: Column[] = [];

    private pinned: string;

    constructor(pinned: string) {
        this.pinned = pinned;
    }

    /** Callback for when drag enters */
    public onDragEnter(draggingEvent: DraggingEvent): void {
        this.clearColumnsList();

        // in pivot mode, we don't accept any drops if functions are read only
        if (this.gridOptionsWrapper.isFunctionsReadOnly()) { return; }

        var dragColumns = draggingEvent.dragSource.dragItem;

        dragColumns.forEach( column => {
            // we don't allow adding secondary columns
            if (!column.isPrimary()) { return; }

            if (column.isAnyFunctionActive()) { return; }

            if (column.isAllowValue()) {
                this.columnsToAggregate.push(column);
            } else if (column.isAllowRowGroup()) {
                this.columnsToGroup.push(column);
            } else if (column.isAllowRowGroup()) {
                this.columnsToPivot.push(column);
            }

        });
    }

    public getIconName(): string {
        var totalColumns = this.columnsToAggregate.length + this.columnsToGroup.length + this.columnsToPivot.length;
        if (totalColumns > 0) {
            return this.pinned ? DragAndDropService.ICON_PINNED : DragAndDropService.ICON_MOVE;
        } else {
            return null;
        }
    }

    /** Callback for when drag leaves */
    public onDragLeave(draggingEvent: DraggingEvent): void {
        // if we are taking columns out of the center, then we remove them from the report
        this.clearColumnsList();
    }

    private clearColumnsList(): void {
        this.columnsToAggregate.length = 0;
        this.columnsToGroup.length = 0;
        this.columnsToPivot.length = 0;
    }

    /** Callback for when dragging */
    public onDragging(draggingEvent: DraggingEvent): void {
    }

    /** Callback for when drag stops */
    public onDragStop(draggingEvent: DraggingEvent): void {
        if (this.columnsToAggregate.length>0) {
            this.columnController.addValueColumns(this.columnsToAggregate);
        }
        if (this.columnsToGroup.length>0) {
            this.columnController.addRowGroupColumns(this.columnsToGroup);
        }
        if (this.columnsToPivot.length>0) {
            this.columnController.addPivotColumns(this.columnsToPivot);
        }
    }
    
}