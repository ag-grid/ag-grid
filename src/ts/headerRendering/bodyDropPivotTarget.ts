
import {DraggingEvent} from "../dragAndDrop/dragAndDropService";
import {Column} from "../entities/column";
import {ColumnController} from "../columnController/columnController";
import {Autowired} from "../context/context";

export class BodyDropPivotTarget {

    @Autowired('columnController') private columnController: ColumnController;

    private columnsToAggregate: Column[] = [];
    private columnsToGroup: Column[] = [];

    /** Callback for when drag enters */
    public onDragEnter(draggingEvent: DraggingEvent): void {
        this.columnsToAggregate = [];
        this.columnsToGroup = [];

        var dragColumns = draggingEvent.dragSource.dragItem;

        dragColumns.forEach( column => {
            if (column.isAllowValue()) {
                if (!column.isValueActive()) {
                    this.columnsToAggregate.push(column);
                }
            } else {
                if (!column.isPivotActive() && !column.isRowGroupActive()) {
                    this.columnsToGroup.push(column);
                }
            }
        });
    }

    /** Callback for when drag leaves */
    public onDragLeave(draggingEvent: DraggingEvent): void {

        // if we are taking columns out of the center, then we remove them from the report

        this.columnsToAggregate = null;
        this.columnsToGroup = null;
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
    }
    
}