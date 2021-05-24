/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { DragAndDropService } from "../dragAndDrop/dragAndDropService";
import { Autowired } from "../context/context";
var BodyDropPivotTarget = /** @class */ (function () {
    function BodyDropPivotTarget(pinned) {
        this.columnsToAggregate = [];
        this.columnsToGroup = [];
        this.columnsToPivot = [];
        this.pinned = pinned;
    }
    /** Callback for when drag enters */
    BodyDropPivotTarget.prototype.onDragEnter = function (draggingEvent) {
        var _this = this;
        this.clearColumnsList();
        // in pivot mode, we don't accept any drops if functions are read only
        if (this.gridOptionsWrapper.isFunctionsReadOnly()) {
            return;
        }
        var dragColumns = draggingEvent.dragItem.columns;
        if (!dragColumns) {
            return;
        }
        dragColumns.forEach(function (column) {
            // we don't allow adding secondary columns
            if (!column.isPrimary()) {
                return;
            }
            if (column.isAnyFunctionActive()) {
                return;
            }
            if (column.isAllowValue()) {
                _this.columnsToAggregate.push(column);
            }
            else if (column.isAllowRowGroup()) {
                _this.columnsToGroup.push(column);
            }
            else if (column.isAllowPivot()) {
                _this.columnsToPivot.push(column);
            }
        });
    };
    BodyDropPivotTarget.prototype.getIconName = function () {
        var totalColumns = this.columnsToAggregate.length + this.columnsToGroup.length + this.columnsToPivot.length;
        if (totalColumns > 0) {
            return this.pinned ? DragAndDropService.ICON_PINNED : DragAndDropService.ICON_MOVE;
        }
        return null;
    };
    /** Callback for when drag leaves */
    BodyDropPivotTarget.prototype.onDragLeave = function (draggingEvent) {
        // if we are taking columns out of the center, then we remove them from the report
        this.clearColumnsList();
    };
    BodyDropPivotTarget.prototype.clearColumnsList = function () {
        this.columnsToAggregate.length = 0;
        this.columnsToGroup.length = 0;
        this.columnsToPivot.length = 0;
    };
    /** Callback for when dragging */
    BodyDropPivotTarget.prototype.onDragging = function (draggingEvent) {
    };
    /** Callback for when drag stops */
    BodyDropPivotTarget.prototype.onDragStop = function (draggingEvent) {
        if (this.columnsToAggregate.length > 0) {
            this.columnController.addValueColumns(this.columnsToAggregate, "toolPanelDragAndDrop");
        }
        if (this.columnsToGroup.length > 0) {
            this.columnController.addRowGroupColumns(this.columnsToGroup, "toolPanelDragAndDrop");
        }
        if (this.columnsToPivot.length > 0) {
            this.columnController.addPivotColumns(this.columnsToPivot, "toolPanelDragAndDrop");
        }
    };
    __decorate([
        Autowired('columnController')
    ], BodyDropPivotTarget.prototype, "columnController", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], BodyDropPivotTarget.prototype, "gridOptionsWrapper", void 0);
    return BodyDropPivotTarget;
}());
export { BodyDropPivotTarget };
