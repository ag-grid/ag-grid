// ag-grid-enterprise v21.2.2
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var rangeController_1 = require("../../rangeController");
var AbstractSelectionHandle = /** @class */ (function (_super) {
    __extends(AbstractSelectionHandle, _super);
    function AbstractSelectionHandle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.changedCell = false;
        _this.dragging = false;
        _this.shouldDestroyOnEndDragging = false;
        return _this;
    }
    AbstractSelectionHandle.prototype.init = function () {
        var _this = this;
        this.dragService.addDragSource({
            dragStartPixels: 0,
            eElement: this.getGui(),
            onDragStart: this.onDragStart.bind(this),
            onDragging: function (e) {
                _this.dragging = true;
                _this.rangeController.autoScrollService.check(e);
                if (_this.changedCell) {
                    _this.onDrag(e);
                }
            },
            onDragStop: function (e) {
                _this.dragging = false;
                _this.onDragEnd(e);
                _this.clearValues();
                _this.rangeController.autoScrollService.ensureCleared();
                ag_grid_community_1._.removeCssClass(document.body, "ag-dragging-" + _this.type + "-handle");
                if (_this.shouldDestroyOnEndDragging) {
                    _this.destroy();
                }
            }
        });
        this.addDestroyableEventListener(this.getGui(), 'mousedown', this.preventRangeExtension.bind(this));
    };
    AbstractSelectionHandle.prototype.isDragging = function () {
        return this.dragging;
    };
    AbstractSelectionHandle.prototype.getCellComp = function () {
        return this.cellComp;
    };
    AbstractSelectionHandle.prototype.setCellComp = function (cellComp) {
        this.cellComp = cellComp;
    };
    AbstractSelectionHandle.prototype.getCellRange = function () {
        return this.cellRange;
    };
    AbstractSelectionHandle.prototype.setCellRange = function (range) {
        this.cellRange = range;
    };
    AbstractSelectionHandle.prototype.getRangeStartRow = function () {
        return this.rangeStartRow;
    };
    AbstractSelectionHandle.prototype.setRangeStartRow = function (row) {
        this.rangeStartRow = row;
    };
    AbstractSelectionHandle.prototype.getRangeEndRow = function () {
        return this.rangeEndRow;
    };
    AbstractSelectionHandle.prototype.setRangeEndRow = function (row) {
        this.rangeEndRow = row;
    };
    AbstractSelectionHandle.prototype.getLastCellHovered = function () {
        return this.lastCellHovered;
    };
    AbstractSelectionHandle.prototype.preventRangeExtension = function (e) {
        e.preventDefault();
        e.stopPropagation();
    };
    AbstractSelectionHandle.prototype.onDragStart = function (e) {
        this.cellHoverListener = this.addDestroyableEventListener(this.rowRenderer.getGridCore().getRootGui(), 'mousemove', this.updateLastCellPositionHovered.bind(this));
        ag_grid_community_1._.addCssClass(document.body, "ag-dragging-" + this.type + "-handle");
    };
    AbstractSelectionHandle.prototype.updateLastCellPositionHovered = function (e) {
        var cell = this.mouseEventService.getCellPositionForEvent(e);
        if (cell === this.lastCellHovered) {
            this.changedCell = false;
            return;
        }
        this.lastCellHovered = cell;
        this.changedCell = true;
    };
    AbstractSelectionHandle.prototype.getType = function () {
        return this.type;
    };
    AbstractSelectionHandle.prototype.refresh = function (cellComp) {
        var _this = this;
        var oldCellComp = this.getCellComp();
        var eGui = this.getGui();
        var cellRange = ag_grid_community_1._.last(this.rangeController.getCellRanges());
        var start = cellRange.startRow;
        var end = cellRange.endRow;
        if (start && end) {
            var isBefore = this.rowPositionUtils.before(end, start);
            if (isBefore) {
                this.setRangeStartRow(end);
                this.setRangeEndRow(start);
            }
            else {
                this.setRangeStartRow(start);
                this.setRangeEndRow(end);
            }
        }
        if (oldCellComp !== cellComp) {
            this.setCellComp(cellComp);
            window.setTimeout(function () {
                if (_this.isAlive()) {
                    cellComp.appendChild(eGui);
                }
            }, 1);
        }
        this.setCellRange(cellRange);
    };
    AbstractSelectionHandle.prototype.clearValues = function () {
        this.lastCellHovered = undefined;
        this.removeListeners();
    };
    AbstractSelectionHandle.prototype.removeListeners = function () {
        if (this.cellHoverListener) {
            this.cellHoverListener();
            this.cellHoverListener = undefined;
        }
    };
    AbstractSelectionHandle.prototype.destroy = function () {
        if (!this.shouldDestroyOnEndDragging && this.isDragging()) {
            ag_grid_community_1._.setDisplayed(this.getGui(), false);
            this.shouldDestroyOnEndDragging = true;
            return;
        }
        this.shouldDestroyOnEndDragging = false;
        _super.prototype.destroy.call(this);
        this.removeListeners();
        var eGui = this.getGui();
        if (eGui.parentElement) {
            eGui.parentElement.removeChild(eGui);
        }
    };
    __decorate([
        ag_grid_community_1.Autowired("rowRenderer"),
        __metadata("design:type", ag_grid_community_1.RowRenderer)
    ], AbstractSelectionHandle.prototype, "rowRenderer", void 0);
    __decorate([
        ag_grid_community_1.Autowired("dragService"),
        __metadata("design:type", ag_grid_community_1.DragService)
    ], AbstractSelectionHandle.prototype, "dragService", void 0);
    __decorate([
        ag_grid_community_1.Autowired("rangeController"),
        __metadata("design:type", rangeController_1.RangeController)
    ], AbstractSelectionHandle.prototype, "rangeController", void 0);
    __decorate([
        ag_grid_community_1.Autowired("mouseEventService"),
        __metadata("design:type", ag_grid_community_1.MouseEventService)
    ], AbstractSelectionHandle.prototype, "mouseEventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired("columnController"),
        __metadata("design:type", ag_grid_community_1.ColumnController)
    ], AbstractSelectionHandle.prototype, "columnController", void 0);
    __decorate([
        ag_grid_community_1.Autowired("cellNavigationService"),
        __metadata("design:type", ag_grid_community_1.CellNavigationService)
    ], AbstractSelectionHandle.prototype, "cellNavigationService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowPositionUtils'),
        __metadata("design:type", ag_grid_community_1.RowPositionUtils)
    ], AbstractSelectionHandle.prototype, "rowPositionUtils", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AbstractSelectionHandle.prototype, "init", null);
    return AbstractSelectionHandle;
}(ag_grid_community_1.Component));
exports.AbstractSelectionHandle = AbstractSelectionHandle;
