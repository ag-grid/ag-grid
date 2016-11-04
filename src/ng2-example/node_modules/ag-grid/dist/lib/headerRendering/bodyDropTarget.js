/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v6.2.1
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
var context_1 = require("../context/context");
var moveColumnController_1 = require("./moveColumnController");
var column_1 = require("../entities/column");
var gridPanel_1 = require("../gridPanel/gridPanel");
var bodyDropPivotTarget_1 = require("./bodyDropPivotTarget");
var columnController_1 = require("../columnController/columnController");
var BodyDropTarget = (function () {
    function BodyDropTarget(pinned, eContainer) {
        this.pinned = pinned;
        this.eContainer = eContainer;
    }
    BodyDropTarget.prototype.getSecondaryContainers = function () {
        return this.eSecondaryContainers;
    };
    BodyDropTarget.prototype.getContainer = function () {
        return this.eContainer;
    };
    BodyDropTarget.prototype.init = function () {
        this.moveColumnController = new moveColumnController_1.MoveColumnController(this.pinned);
        this.context.wireBean(this.moveColumnController);
        this.bodyDropPivotTarget = new bodyDropPivotTarget_1.BodyDropPivotTarget(this.pinned);
        this.context.wireBean(this.bodyDropPivotTarget);
        switch (this.pinned) {
            case column_1.Column.PINNED_LEFT:
                this.eSecondaryContainers = this.gridPanel.getDropTargetLeftContainers();
                break;
            case column_1.Column.PINNED_RIGHT:
                this.eSecondaryContainers = this.gridPanel.getDropTargetPinnedRightContainers();
                break;
            default:
                this.eSecondaryContainers = this.gridPanel.getDropTargetBodyContainers();
                break;
        }
        this.dragAndDropService.addDropTarget(this);
    };
    BodyDropTarget.prototype.getIconName = function () {
        return this.currentDropListener.getIconName();
    };
    // we want to use the bodyPivotTarget if the user is dragging columns in from the toolPanel
    // and we are in pivot mode, as it has to logic to set pivot/value/group on the columns when
    // dropped into the grid's body.
    BodyDropTarget.prototype.isUseBodyDropPivotTarget = function (draggingEvent) {
        // if not in pivot mode, then we never use the pivot drop target
        if (!this.columnController.isPivotMode()) {
            return false;
        }
        // otherwise we use the drop target if the column came from the toolPanel (ie not reordering)
        return draggingEvent.dragSource.type === dragAndDropService_1.DragSourceType.ToolPanel;
    };
    BodyDropTarget.prototype.onDragEnter = function (draggingEvent) {
        // we pick the drop listener depending on whether we are in pivot mode are not. if we are
        // in pivot mode, then dropping cols changes the row group, pivot, value stats. otherwise
        // we change visibility state and position.
        // if (this.columnController.isPivotMode()) {
        var useBodyDropPivotTarget = this.isUseBodyDropPivotTarget(draggingEvent);
        if (useBodyDropPivotTarget) {
            this.currentDropListener = this.bodyDropPivotTarget;
        }
        else {
            this.currentDropListener = this.moveColumnController;
        }
        this.currentDropListener.onDragEnter(draggingEvent);
    };
    BodyDropTarget.prototype.onDragLeave = function (params) {
        this.currentDropListener.onDragLeave(params);
    };
    BodyDropTarget.prototype.onDragging = function (params) {
        this.currentDropListener.onDragging(params);
    };
    BodyDropTarget.prototype.onDragStop = function (params) {
        this.currentDropListener.onDragStop(params);
    };
    __decorate([
        context_1.Autowired('context'), 
        __metadata('design:type', context_1.Context)
    ], BodyDropTarget.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('gridPanel'), 
        __metadata('design:type', gridPanel_1.GridPanel)
    ], BodyDropTarget.prototype, "gridPanel", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService'), 
        __metadata('design:type', dragAndDropService_1.DragAndDropService)
    ], BodyDropTarget.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], BodyDropTarget.prototype, "columnController", void 0);
    __decorate([
        context_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], BodyDropTarget.prototype, "init", null);
    return BodyDropTarget;
})();
exports.BodyDropTarget = BodyDropTarget;
