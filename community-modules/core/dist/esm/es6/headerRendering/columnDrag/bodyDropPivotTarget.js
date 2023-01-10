/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { DragAndDropService } from "../../dragAndDrop/dragAndDropService";
import { Autowired } from "../../context/context";
export class BodyDropPivotTarget {
    constructor(pinned) {
        this.columnsToAggregate = [];
        this.columnsToGroup = [];
        this.columnsToPivot = [];
        this.pinned = pinned;
    }
    /** Callback for when drag enters */
    onDragEnter(draggingEvent) {
        this.clearColumnsList();
        // in pivot mode, we don't accept any drops if functions are read only
        if (this.gridOptionsService.is('functionsReadOnly')) {
            return;
        }
        const dragColumns = draggingEvent.dragItem.columns;
        if (!dragColumns) {
            return;
        }
        dragColumns.forEach(column => {
            // we don't allow adding secondary columns
            if (!column.isPrimary()) {
                return;
            }
            if (column.isAnyFunctionActive()) {
                return;
            }
            if (column.isAllowValue()) {
                this.columnsToAggregate.push(column);
            }
            else if (column.isAllowRowGroup()) {
                this.columnsToGroup.push(column);
            }
            else if (column.isAllowPivot()) {
                this.columnsToPivot.push(column);
            }
        });
    }
    getIconName() {
        const totalColumns = this.columnsToAggregate.length + this.columnsToGroup.length + this.columnsToPivot.length;
        if (totalColumns > 0) {
            return this.pinned ? DragAndDropService.ICON_PINNED : DragAndDropService.ICON_MOVE;
        }
        return null;
    }
    /** Callback for when drag leaves */
    onDragLeave(draggingEvent) {
        // if we are taking columns out of the center, then we remove them from the report
        this.clearColumnsList();
    }
    clearColumnsList() {
        this.columnsToAggregate.length = 0;
        this.columnsToGroup.length = 0;
        this.columnsToPivot.length = 0;
    }
    /** Callback for when dragging */
    onDragging(draggingEvent) {
    }
    /** Callback for when drag stops */
    onDragStop(draggingEvent) {
        if (this.columnsToAggregate.length > 0) {
            this.columnModel.addValueColumns(this.columnsToAggregate, "toolPanelDragAndDrop");
        }
        if (this.columnsToGroup.length > 0) {
            this.columnModel.addRowGroupColumns(this.columnsToGroup, "toolPanelDragAndDrop");
        }
        if (this.columnsToPivot.length > 0) {
            this.columnModel.addPivotColumns(this.columnsToPivot, "toolPanelDragAndDrop");
        }
    }
}
__decorate([
    Autowired('columnModel')
], BodyDropPivotTarget.prototype, "columnModel", void 0);
__decorate([
    Autowired('gridOptionsService')
], BodyDropPivotTarget.prototype, "gridOptionsService", void 0);
