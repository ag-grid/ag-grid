/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var columnController_1 = require("../columnController/columnController");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var BodyDropPivotTarget = (function () {
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
        var dragColumns = draggingEvent.dragSource.dragItem;
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
            else if (column.isAllowRowGroup()) {
                _this.columnsToPivot.push(column);
            }
        });
    };
    BodyDropPivotTarget.prototype.getIconName = function () {
        var totalColumns = this.columnsToAggregate.length + this.columnsToGroup.length + this.columnsToPivot.length;
        if (totalColumns > 0) {
            return this.pinned ? dragAndDropService_1.DragAndDropService.ICON_PINNED : dragAndDropService_1.DragAndDropService.ICON_MOVE;
        }
        else {
            return null;
        }
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
            this.columnController.addValueColumns(this.columnsToAggregate);
        }
        if (this.columnsToGroup.length > 0) {
            this.columnController.addRowGroupColumns(this.columnsToGroup);
        }
        if (this.columnsToPivot.length > 0) {
            this.columnController.addPivotColumns(this.columnsToPivot);
        }
    };
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], BodyDropPivotTarget.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], BodyDropPivotTarget.prototype, "gridOptionsWrapper", void 0);
    return BodyDropPivotTarget;
})();
exports.BodyDropPivotTarget = BodyDropPivotTarget;
