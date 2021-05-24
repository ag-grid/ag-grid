/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var context_1 = require("../context/context");
var moveColumnController_1 = require("./moveColumnController");
var bodyDropPivotTarget_1 = require("./bodyDropPivotTarget");
var constants_1 = require("../constants/constants");
var beanStub_1 = require("../context/beanStub");
var DropType;
(function (DropType) {
    DropType[DropType["ColumnMove"] = 0] = "ColumnMove";
    DropType[DropType["Pivot"] = 1] = "Pivot";
})(DropType || (DropType = {}));
var BodyDropTarget = /** @class */ (function (_super) {
    __extends(BodyDropTarget, _super);
    function BodyDropTarget(pinned, eContainer) {
        var _this = _super.call(this) || this;
        _this.dropListeners = {};
        _this.pinned = pinned;
        _this.eContainer = eContainer;
        return _this;
    }
    BodyDropTarget.prototype.postConstruct = function () {
        var _this = this;
        this.controllersService.whenReady(function (p) {
            var containers;
            switch (_this.pinned) {
                case constants_1.Constants.PINNED_LEFT:
                    containers = [p.leftRowContainerCon, p.bottomLeftRowContainerCon, p.topLeftRowContainerCon];
                    break;
                case constants_1.Constants.PINNED_RIGHT:
                    containers = [p.rightRowContainerCon, p.bottomRightRowContainerCon, p.topRightRowContainerCon];
                    break;
                default:
                    containers = [p.centerRowContainerCon, p.bottomCenterRowContainerCon, p.topCenterRowContainerCon];
                    break;
            }
            _this.eSecondaryContainers = containers.map(function (c) { return c.getContainerElement(); });
        });
    };
    BodyDropTarget.prototype.isInterestedIn = function (type) {
        return type === dragAndDropService_1.DragSourceType.HeaderCell ||
            (type === dragAndDropService_1.DragSourceType.ToolPanel && this.gridOptionsWrapper.isAllowDragFromColumnsToolPanel());
    };
    BodyDropTarget.prototype.getSecondaryContainers = function () {
        return this.eSecondaryContainers;
    };
    BodyDropTarget.prototype.getContainer = function () {
        return this.eContainer;
    };
    BodyDropTarget.prototype.init = function () {
        this.moveColumnController = this.createBean(new moveColumnController_1.MoveColumnController(this.pinned, this.eContainer));
        var bodyDropPivotTarget = new bodyDropPivotTarget_1.BodyDropPivotTarget(this.pinned);
        this.createBean(bodyDropPivotTarget);
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
            // a standard column move, however if it came from the toolpanel, then we are introducing
            // dimensions or values to the grid
            if (draggingEvent.dragSource.type === dragAndDropService_1.DragSourceType.ToolPanel) {
                return DropType.Pivot;
            }
            return DropType.ColumnMove;
        }
        // it's a column, and not pivot mode, so always moving
        return DropType.ColumnMove;
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
        context_1.Autowired('dragAndDropService')
    ], BodyDropTarget.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('columnController')
    ], BodyDropTarget.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('controllersService')
    ], BodyDropTarget.prototype, "controllersService", void 0);
    __decorate([
        context_1.PostConstruct
    ], BodyDropTarget.prototype, "postConstruct", null);
    __decorate([
        context_1.PostConstruct
    ], BodyDropTarget.prototype, "init", null);
    return BodyDropTarget;
}(beanStub_1.BeanStub));
exports.BodyDropTarget = BodyDropTarget;

//# sourceMappingURL=bodyDropTarget.js.map
