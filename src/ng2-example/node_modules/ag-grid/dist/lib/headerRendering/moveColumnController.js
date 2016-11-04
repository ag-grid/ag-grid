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
var context_1 = require("../context/context");
var logger_1 = require("../logger");
var columnController_1 = require("../columnController/columnController");
var column_1 = require("../entities/column");
var utils_1 = require("../utils");
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var gridPanel_1 = require("../gridPanel/gridPanel");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var MoveColumnController = (function () {
    function MoveColumnController(pinned) {
        this.needToMoveLeft = false;
        this.needToMoveRight = false;
        this.pinned = pinned;
        this.centerContainer = !utils_1.Utils.exists(pinned);
    }
    MoveColumnController.prototype.init = function () {
        this.logger = this.loggerFactory.create('MoveColumnController');
    };
    MoveColumnController.prototype.getIconName = function () {
        return this.pinned ? dragAndDropService_1.DragAndDropService.ICON_PINNED : dragAndDropService_1.DragAndDropService.ICON_MOVE;
        ;
    };
    MoveColumnController.prototype.onDragEnter = function (draggingEvent) {
        // we do dummy drag, so make sure column appears in the right location when first placed
        var columns = draggingEvent.dragSource.dragItem;
        this.columnController.setColumnsVisible(columns, true);
        this.columnController.setColumnsPinned(columns, this.pinned);
        this.onDragging(draggingEvent, true);
    };
    MoveColumnController.prototype.onDragLeave = function (draggingEvent) {
        var hideColumnOnExit = !this.gridOptionsWrapper.isSuppressDragLeaveHidesColumns() && !draggingEvent.fromNudge;
        if (hideColumnOnExit) {
            var columns = draggingEvent.dragSource.dragItem;
            this.columnController.setColumnsVisible(columns, false);
        }
        this.ensureIntervalCleared();
    };
    MoveColumnController.prototype.onDragStop = function () {
        this.ensureIntervalCleared();
    };
    MoveColumnController.prototype.adjustXForScroll = function (draggingEvent) {
        if (this.centerContainer) {
            return draggingEvent.x + this.gridPanel.getHorizontalScrollPosition();
        }
        else {
            return draggingEvent.x;
        }
    };
    MoveColumnController.prototype.workOutNewIndex = function (displayedColumns, allColumns, dragColumn, direction, xAdjustedForScroll) {
        if (direction === dragAndDropService_1.DragAndDropService.DIRECTION_LEFT) {
            return this.getNewIndexForColMovingLeft(displayedColumns, allColumns, dragColumn, xAdjustedForScroll);
        }
        else {
            return this.getNewIndexForColMovingRight(displayedColumns, allColumns, dragColumn, xAdjustedForScroll);
        }
    };
    MoveColumnController.prototype.checkCenterForScrolling = function (xAdjustedForScroll) {
        if (this.centerContainer) {
            // scroll if the mouse has gone outside the grid (or just outside the scrollable part if pinning)
            // putting in 50 buffer, so even if user gets to edge of grid, a scroll will happen
            var firstVisiblePixel = this.gridPanel.getHorizontalScrollPosition();
            var lastVisiblePixel = firstVisiblePixel + this.gridPanel.getCenterWidth();
            this.needToMoveLeft = xAdjustedForScroll < (firstVisiblePixel + 50);
            this.needToMoveRight = xAdjustedForScroll > (lastVisiblePixel - 50);
            if (this.needToMoveLeft || this.needToMoveRight) {
                this.ensureIntervalStarted();
            }
            else {
                this.ensureIntervalCleared();
            }
        }
    };
    MoveColumnController.prototype.onDragging = function (draggingEvent, fromEnter) {
        if (fromEnter === void 0) { fromEnter = false; }
        this.lastDraggingEvent = draggingEvent;
        // if moving up or down (ie not left or right) then do nothing
        if (!draggingEvent.direction) {
            return;
        }
        var xAdjustedForScroll = this.adjustXForScroll(draggingEvent);
        // if the user is dragging into the panel, ie coming from the side panel into the main grid,
        // we don't want to scroll the grid this time, it would appear like the table is jumping
        // each time a column is dragged in.
        if (!fromEnter) {
            this.checkCenterForScrolling(xAdjustedForScroll);
        }
        var columnsToMove = draggingEvent.dragSource.dragItem;
        this.attemptMoveColumns(columnsToMove, draggingEvent.direction, xAdjustedForScroll, fromEnter);
    };
    MoveColumnController.prototype.attemptMoveColumns = function (allMovingColumns, dragDirection, xAdjustedForScroll, fromEnter) {
        var displayedColumns = this.columnController.getDisplayedColumns(this.pinned);
        var gridColumns = this.columnController.getAllGridColumns();
        var draggingLeft = dragDirection === dragAndDropService_1.DragAndDropService.DIRECTION_LEFT;
        var draggingRight = dragDirection === dragAndDropService_1.DragAndDropService.DIRECTION_RIGHT;
        var dragColumn;
        var displayedMovingColumns = utils_1.Utils.filter(allMovingColumns, function (column) { return displayedColumns.indexOf(column) >= 0; });
        // if dragging left, we want to use the left most column, ie move the left most column to
        // under the mouse pointer
        if (draggingLeft) {
            dragColumn = displayedMovingColumns[0];
        }
        else {
            dragColumn = displayedMovingColumns[displayedMovingColumns.length - 1];
        }
        var newIndex = this.workOutNewIndex(displayedColumns, gridColumns, dragColumn, dragDirection, xAdjustedForScroll);
        var oldIndex = gridColumns.indexOf(dragColumn);
        // the two check below stop an error when the user grabs a group my a middle column, then
        // it is possible the mouse pointer is to the right of a column while been dragged left.
        // so we need to make sure that the mouse pointer is actually left of the left most column
        // if moving left, and right of the right most column if moving right
        // we check 'fromEnter' below so we move the column to the new spot if the mouse is coming from
        // outside the grid, eg if the column is moving from side panel, mouse is moving left, then we should
        // place the column to the RHS even if the mouse is moving left and the column is already on
        // the LHS. otherwise we stick to the rule described above.
        // only allow left drag if this column is moving left
        if (!fromEnter && draggingLeft && newIndex >= oldIndex) {
            return;
        }
        // only allow right drag if this column is moving right
        if (!fromEnter && draggingRight && newIndex <= oldIndex) {
            return;
        }
        // if moving right, the new index is the index of the right most column, so adjust to first column
        if (draggingRight) {
            newIndex = newIndex - allMovingColumns.length + 1;
        }
        this.columnController.moveColumns(allMovingColumns, newIndex);
    };
    MoveColumnController.prototype.getNewIndexForColMovingLeft = function (displayedColumns, allColumns, dragColumn, x) {
        var usedX = 0;
        var leftColumn = null;
        for (var i = 0; i < displayedColumns.length; i++) {
            var currentColumn = displayedColumns[i];
            if (currentColumn === dragColumn) {
                continue;
            }
            usedX += currentColumn.getActualWidth();
            if (usedX > x) {
                break;
            }
            leftColumn = currentColumn;
        }
        var newIndex;
        if (leftColumn) {
            newIndex = allColumns.indexOf(leftColumn) + 1;
            var oldIndex = allColumns.indexOf(dragColumn);
            if (oldIndex < newIndex) {
                newIndex--;
            }
        }
        else {
            newIndex = 0;
        }
        return newIndex;
    };
    MoveColumnController.prototype.getNewIndexForColMovingRight = function (displayedColumns, allColumns, dragColumnOrGroup, x) {
        var dragColumn = dragColumnOrGroup;
        var usedX = dragColumn.getActualWidth();
        var leftColumn = null;
        for (var i = 0; i < displayedColumns.length; i++) {
            if (usedX > x) {
                break;
            }
            var currentColumn = displayedColumns[i];
            if (currentColumn === dragColumn) {
                continue;
            }
            usedX += currentColumn.getActualWidth();
            leftColumn = currentColumn;
        }
        var newIndex;
        if (leftColumn) {
            newIndex = allColumns.indexOf(leftColumn) + 1;
            var oldIndex = allColumns.indexOf(dragColumn);
            if (oldIndex < newIndex) {
                newIndex--;
            }
        }
        else {
            newIndex = 0;
        }
        return newIndex;
    };
    MoveColumnController.prototype.ensureIntervalStarted = function () {
        if (!this.movingIntervalId) {
            this.intervalCount = 0;
            this.failedMoveAttempts = 0;
            this.movingIntervalId = setInterval(this.moveInterval.bind(this), 100);
            if (this.needToMoveLeft) {
                this.dragAndDropService.setGhostIcon(dragAndDropService_1.DragAndDropService.ICON_LEFT, true);
            }
            else {
                this.dragAndDropService.setGhostIcon(dragAndDropService_1.DragAndDropService.ICON_RIGHT, true);
            }
        }
    };
    MoveColumnController.prototype.ensureIntervalCleared = function () {
        if (this.moveInterval) {
            clearInterval(this.movingIntervalId);
            this.movingIntervalId = null;
            this.dragAndDropService.setGhostIcon(dragAndDropService_1.DragAndDropService.ICON_MOVE);
        }
    };
    MoveColumnController.prototype.moveInterval = function () {
        var pixelsToMove;
        this.intervalCount++;
        pixelsToMove = 10 + (this.intervalCount * 5);
        if (pixelsToMove > 100) {
            pixelsToMove = 100;
        }
        var pixelsMoved;
        if (this.needToMoveLeft) {
            pixelsMoved = this.gridPanel.scrollHorizontally(-pixelsToMove);
        }
        else if (this.needToMoveRight) {
            pixelsMoved = this.gridPanel.scrollHorizontally(pixelsToMove);
        }
        if (pixelsMoved !== 0) {
            this.onDragging(this.lastDraggingEvent);
            this.failedMoveAttempts = 0;
        }
        else {
            this.failedMoveAttempts++;
            this.dragAndDropService.setGhostIcon(dragAndDropService_1.DragAndDropService.ICON_PINNED);
            if (this.failedMoveAttempts > 7) {
                var columns = this.lastDraggingEvent.dragSource.dragItem;
                var pinType = this.needToMoveLeft ? column_1.Column.PINNED_LEFT : column_1.Column.PINNED_RIGHT;
                this.columnController.setColumnsPinned(columns, pinType);
                this.dragAndDropService.nudge();
            }
        }
    };
    __decorate([
        context_1.Autowired('loggerFactory'), 
        __metadata('design:type', logger_1.LoggerFactory)
    ], MoveColumnController.prototype, "loggerFactory", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], MoveColumnController.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('gridPanel'), 
        __metadata('design:type', gridPanel_1.GridPanel)
    ], MoveColumnController.prototype, "gridPanel", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService'), 
        __metadata('design:type', dragAndDropService_1.DragAndDropService)
    ], MoveColumnController.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], MoveColumnController.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], MoveColumnController.prototype, "init", null);
    return MoveColumnController;
})();
exports.MoveColumnController = MoveColumnController;
