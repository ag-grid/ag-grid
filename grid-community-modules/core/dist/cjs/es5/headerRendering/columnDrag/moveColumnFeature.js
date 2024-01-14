"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveColumnFeature = void 0;
var context_1 = require("../../context/context");
var dragAndDropService_1 = require("../../dragAndDrop/dragAndDropService");
var generic_1 = require("../../utils/generic");
var columnMoveHelper_1 = require("../columnMoveHelper");
var direction_1 = require("../../constants/direction");
var MoveColumnFeature = /** @class */ (function () {
    function MoveColumnFeature(pinned, eContainer) {
        this.needToMoveLeft = false;
        this.needToMoveRight = false;
        this.lastMovedInfo = null;
        this.pinned = pinned;
        this.eContainer = eContainer;
        this.centerContainer = !(0, generic_1.exists)(pinned);
    }
    MoveColumnFeature.prototype.init = function () {
        var _this = this;
        this.ctrlsService.whenReady(function () {
            _this.gridBodyCon = _this.ctrlsService.getGridBodyCtrl();
        });
    };
    MoveColumnFeature.prototype.getIconName = function () {
        return this.pinned ? dragAndDropService_1.DragAndDropService.ICON_PINNED : dragAndDropService_1.DragAndDropService.ICON_MOVE;
    };
    MoveColumnFeature.prototype.onDragEnter = function (draggingEvent) {
        // we do dummy drag, so make sure column appears in the right location when first placed
        var columns = draggingEvent.dragItem.columns;
        var dragCameFromToolPanel = draggingEvent.dragSource.type === dragAndDropService_1.DragSourceType.ToolPanel;
        if (dragCameFromToolPanel) {
            // the if statement doesn't work if drag leaves grid, then enters again
            this.setColumnsVisible(columns, true, "uiColumnDragged");
        }
        else {
            // restore previous state of visible columns upon re-entering. this means if the user drags
            // a group out, and then drags the group back in, only columns that were originally visible
            // will be visible again. otherwise a group with three columns (but only two visible) could
            // be dragged out, then when it's dragged in again, all three are visible. this stops that.
            var visibleState_1 = draggingEvent.dragItem.visibleState;
            var visibleColumns = (columns || []).filter(function (column) { return visibleState_1[column.getId()]; });
            this.setColumnsVisible(visibleColumns, true, "uiColumnDragged");
        }
        this.setColumnsPinned(columns, this.pinned, "uiColumnDragged");
        this.onDragging(draggingEvent, true, true);
    };
    MoveColumnFeature.prototype.onDragLeave = function () {
        this.ensureIntervalCleared();
        this.lastMovedInfo = null;
    };
    MoveColumnFeature.prototype.setColumnsVisible = function (columns, visible, source) {
        if (source === void 0) { source = "api"; }
        if (columns) {
            var allowedCols = columns.filter(function (c) { return !c.getColDef().lockVisible; });
            this.columnModel.setColumnsVisible(allowedCols, visible, source);
        }
    };
    MoveColumnFeature.prototype.setColumnsPinned = function (columns, pinned, source) {
        if (source === void 0) { source = "api"; }
        if (columns) {
            var allowedCols = columns.filter(function (c) { return !c.getColDef().lockPinned; });
            this.columnModel.setColumnsPinned(allowedCols, pinned, source);
        }
    };
    MoveColumnFeature.prototype.onDragStop = function () {
        this.onDragging(this.lastDraggingEvent, false, true, true);
        this.ensureIntervalCleared();
        this.lastMovedInfo = null;
    };
    MoveColumnFeature.prototype.checkCenterForScrolling = function (xAdjustedForScroll) {
        if (this.centerContainer) {
            // scroll if the mouse has gone outside the grid (or just outside the scrollable part if pinning)
            // putting in 50 buffer, so even if user gets to edge of grid, a scroll will happen
            var firstVisiblePixel = this.ctrlsService.getCenterRowContainerCtrl().getCenterViewportScrollLeft();
            var lastVisiblePixel = firstVisiblePixel + this.ctrlsService.getCenterRowContainerCtrl().getCenterWidth();
            if (this.gridOptionsService.get('enableRtl')) {
                this.needToMoveRight = xAdjustedForScroll < (firstVisiblePixel + 50);
                this.needToMoveLeft = xAdjustedForScroll > (lastVisiblePixel - 50);
            }
            else {
                this.needToMoveLeft = xAdjustedForScroll < (firstVisiblePixel + 50);
                this.needToMoveRight = xAdjustedForScroll > (lastVisiblePixel - 50);
            }
            if (this.needToMoveLeft || this.needToMoveRight) {
                this.ensureIntervalStarted();
            }
            else {
                this.ensureIntervalCleared();
            }
        }
    };
    MoveColumnFeature.prototype.onDragging = function (draggingEvent, fromEnter, fakeEvent, finished) {
        var _this = this;
        var _a;
        if (draggingEvent === void 0) { draggingEvent = this.lastDraggingEvent; }
        if (fromEnter === void 0) { fromEnter = false; }
        if (fakeEvent === void 0) { fakeEvent = false; }
        if (finished === void 0) { finished = false; }
        if (finished) {
            if (this.lastMovedInfo) {
                var _b = this.lastMovedInfo, columns = _b.columns, toIndex = _b.toIndex;
                columnMoveHelper_1.ColumnMoveHelper.moveColumns(columns, toIndex, 'uiColumnMoved', true, this.columnModel);
            }
            return;
        }
        this.lastDraggingEvent = draggingEvent;
        // if moving up or down (ie not left or right) then do nothing
        if ((0, generic_1.missing)(draggingEvent.hDirection)) {
            return;
        }
        var mouseX = columnMoveHelper_1.ColumnMoveHelper.normaliseX(draggingEvent.x, this.pinned, false, this.gridOptionsService, this.ctrlsService);
        // if the user is dragging into the panel, ie coming from the side panel into the main grid,
        // we don't want to scroll the grid this time, it would appear like the table is jumping
        // each time a column is dragged in.
        if (!fromEnter) {
            this.checkCenterForScrolling(mouseX);
        }
        var hDirection = this.normaliseDirection(draggingEvent.hDirection);
        var dragSourceType = draggingEvent.dragSource.type;
        var allMovingColumns = ((_a = draggingEvent.dragSource.getDragItem().columns) === null || _a === void 0 ? void 0 : _a.filter(function (col) {
            if (col.getColDef().lockPinned) {
                // if locked return true only if both col and container are same pin type.
                // double equals (==) here on purpose so that null==undefined is true (for not pinned options)
                return col.getPinned() == _this.pinned;
            }
            // if not pin locked, then always allowed to be in this container
            return true;
        })) || [];
        var lastMovedInfo = columnMoveHelper_1.ColumnMoveHelper.attemptMoveColumns({
            allMovingColumns: allMovingColumns,
            isFromHeader: dragSourceType === dragAndDropService_1.DragSourceType.HeaderCell,
            hDirection: hDirection,
            xPosition: mouseX,
            pinned: this.pinned,
            fromEnter: fromEnter,
            fakeEvent: fakeEvent,
            gridOptionsService: this.gridOptionsService,
            columnModel: this.columnModel
        });
        if (lastMovedInfo) {
            this.lastMovedInfo = lastMovedInfo;
        }
    };
    MoveColumnFeature.prototype.normaliseDirection = function (hDirection) {
        if (this.gridOptionsService.get('enableRtl')) {
            switch (hDirection) {
                case direction_1.HorizontalDirection.Left: return direction_1.HorizontalDirection.Right;
                case direction_1.HorizontalDirection.Right: return direction_1.HorizontalDirection.Left;
                default: console.error("AG Grid: Unknown direction ".concat(hDirection));
            }
        }
        else {
            return hDirection;
        }
    };
    MoveColumnFeature.prototype.ensureIntervalStarted = function () {
        if (!this.movingIntervalId) {
            this.intervalCount = 0;
            this.failedMoveAttempts = 0;
            this.movingIntervalId = window.setInterval(this.moveInterval.bind(this), 100);
            if (this.needToMoveLeft) {
                this.dragAndDropService.setGhostIcon(dragAndDropService_1.DragAndDropService.ICON_LEFT, true);
            }
            else {
                this.dragAndDropService.setGhostIcon(dragAndDropService_1.DragAndDropService.ICON_RIGHT, true);
            }
        }
    };
    MoveColumnFeature.prototype.ensureIntervalCleared = function () {
        if (this.movingIntervalId) {
            window.clearInterval(this.movingIntervalId);
            this.movingIntervalId = null;
            this.dragAndDropService.setGhostIcon(dragAndDropService_1.DragAndDropService.ICON_MOVE);
        }
    };
    MoveColumnFeature.prototype.moveInterval = function () {
        // the amounts we move get bigger at each interval, so the speed accelerates, starting a bit slow
        // and getting faster. this is to give smoother user experience. we max at 100px to limit the speed.
        var pixelsToMove;
        this.intervalCount++;
        pixelsToMove = 10 + (this.intervalCount * 5);
        if (pixelsToMove > 100) {
            pixelsToMove = 100;
        }
        var pixelsMoved = null;
        var scrollFeature = this.gridBodyCon.getScrollFeature();
        if (this.needToMoveLeft) {
            pixelsMoved = scrollFeature.scrollHorizontally(-pixelsToMove);
        }
        else if (this.needToMoveRight) {
            pixelsMoved = scrollFeature.scrollHorizontally(pixelsToMove);
        }
        if (pixelsMoved !== 0) {
            this.onDragging(this.lastDraggingEvent);
            this.failedMoveAttempts = 0;
        }
        else {
            // we count the failed move attempts. if we fail to move 7 times, then we pin the column.
            // this is how we achieve pining by dragging the column to the edge of the grid.
            this.failedMoveAttempts++;
            var columns = this.lastDraggingEvent.dragItem.columns;
            var columnsThatCanPin = columns.filter(function (c) { return !c.getColDef().lockPinned; });
            if (columnsThatCanPin.length > 0) {
                this.dragAndDropService.setGhostIcon(dragAndDropService_1.DragAndDropService.ICON_PINNED);
                if (this.failedMoveAttempts > 7) {
                    var pinType = this.needToMoveLeft ? 'left' : 'right';
                    this.setColumnsPinned(columnsThatCanPin, pinType, "uiColumnDragged");
                    this.dragAndDropService.nudge();
                }
            }
        }
    };
    __decorate([
        (0, context_1.Autowired)('columnModel')
    ], MoveColumnFeature.prototype, "columnModel", void 0);
    __decorate([
        (0, context_1.Autowired)('dragAndDropService')
    ], MoveColumnFeature.prototype, "dragAndDropService", void 0);
    __decorate([
        (0, context_1.Autowired)('gridOptionsService')
    ], MoveColumnFeature.prototype, "gridOptionsService", void 0);
    __decorate([
        (0, context_1.Autowired)('ctrlsService')
    ], MoveColumnFeature.prototype, "ctrlsService", void 0);
    __decorate([
        context_1.PostConstruct
    ], MoveColumnFeature.prototype, "init", null);
    return MoveColumnFeature;
}());
exports.MoveColumnFeature = MoveColumnFeature;
