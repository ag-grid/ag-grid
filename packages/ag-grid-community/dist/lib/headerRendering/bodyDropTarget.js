/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var context_1 = require("../context/context");
var moveColumnController_1 = require("./moveColumnController");
var column_1 = require("../entities/column");
var bodyDropPivotTarget_1 = require("./bodyDropPivotTarget");
var columnController_1 = require("../columnController/columnController");
var DropType;
(function (DropType) {
    DropType[DropType["ColumnMove"] = 0] = "ColumnMove";
    DropType[DropType["Pivot"] = 1] = "Pivot";
})(DropType || (DropType = {}));
var BodyDropTarget = /** @class */ (function () {
    function BodyDropTarget(pinned, eContainer) {
        this.dropListeners = {};
        this.pinned = pinned;
        this.eContainer = eContainer;
    }
    BodyDropTarget.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
        this.moveColumnController.registerGridComp(gridPanel);
        switch (this.pinned) {
            case column_1.Column.PINNED_LEFT:
                this.eSecondaryContainers = this.gridPanel.getDropTargetLeftContainers();
                break;
            case column_1.Column.PINNED_RIGHT:
                this.eSecondaryContainers = this.gridPanel.getDropTargetRightContainers();
                break;
            default:
                this.eSecondaryContainers = this.gridPanel.getDropTargetBodyContainers();
                break;
        }
    };
    BodyDropTarget.prototype.isInterestedIn = function (type) {
        // not interested in row drags
        return type === dragAndDropService_1.DragSourceType.HeaderCell || type === dragAndDropService_1.DragSourceType.ToolPanel;
    };
    BodyDropTarget.prototype.getSecondaryContainers = function () {
        return this.eSecondaryContainers;
    };
    BodyDropTarget.prototype.getContainer = function () {
        return this.eContainer;
    };
    BodyDropTarget.prototype.init = function () {
        this.moveColumnController = new moveColumnController_1.MoveColumnController(this.pinned, this.eContainer);
        this.context.wireBean(this.moveColumnController);
        var bodyDropPivotTarget = new bodyDropPivotTarget_1.BodyDropPivotTarget(this.pinned);
        this.context.wireBean(bodyDropPivotTarget);
        this.dropListeners[DropType.ColumnMove] = this.moveColumnController;
        this.dropListeners[DropType.Pivot] = bodyDropPivotTarget;
        this.dragAndDropService.addDropTarget(this);
    };
    BodyDropTarget.prototype.getIconName = function () {
        return this.currentDropListener.getIconName();
    };
    // we want to use the bodyPivotTarget if the user is dragging columns in from the toolPanel
    // and we are in pivot mode, as it has to logic to set pivot/value/group on the columns when
    // dropped into the grid's body.
    BodyDropTarget.prototype.getDropType = function (draggingEvent) {
        if (this.columnController.isPivotMode()) {
            // in pivot mode, then if moving a column (ie didn't come from toolpanel) then it's
            // a standard column move, however if it came from teh toolpanel, then we are introducing
            // dimensions or values to the grid
            if (draggingEvent.dragSource.type === dragAndDropService_1.DragSourceType.ToolPanel) {
                return DropType.Pivot;
            }
            else {
                return DropType.ColumnMove;
            }
        }
        else {
            // it's a column, and not pivot mode, so always moving
            return DropType.ColumnMove;
        }
    };
    BodyDropTarget.prototype.onDragEnter = function (draggingEvent) {
        // we pick the drop listener depending on whether we are in pivot mode are not. if we are
        // in pivot mode, then dropping cols changes the row group, pivot, value stats. otherwise
        // we change visibility state and position.
        // if (this.columnController.isPivotMode()) {
        var dropType = this.getDropType(draggingEvent);
        this.currentDropListener = this.dropListeners[dropType];
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
        __metadata("design:type", context_1.Context)
    ], BodyDropTarget.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService'),
        __metadata("design:type", dragAndDropService_1.DragAndDropService)
    ], BodyDropTarget.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], BodyDropTarget.prototype, "columnController", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], BodyDropTarget.prototype, "init", null);
    return BodyDropTarget;
}());
exports.BodyDropTarget = BodyDropTarget;
