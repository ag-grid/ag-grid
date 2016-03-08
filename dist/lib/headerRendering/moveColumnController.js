/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.0
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
var utils_1 = require('../utils');
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var gridPanel_1 = require("../gridPanel/gridPanel");
var context_2 = require("../context/context");
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
    MoveColumnController.prototype.onDragEnter = function (draggingEvent) {
        // we do dummy drag, so make sure column appears in the right location when first placed
        this.columnController.setColumnVisible(draggingEvent.dragItem, true);
        this.columnController.setColumnPinned(draggingEvent.dragItem, this.pinned);
        this.onDragging(draggingEvent);
    };
    MoveColumnController.prototype.onDragLeave = function (draggingEvent) {
        this.columnController.setColumnVisible(draggingEvent.dragItem, false);
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
    MoveColumnController.prototype.workOutNewIndex = function (displayedColumns, allColumns, draggingEvent, xAdjustedForScroll) {
        if (draggingEvent.direction === dragAndDropService_1.DragAndDropService.DIRECTION_LEFT) {
            return this.getNewIndexForColMovingLeft(displayedColumns, allColumns, draggingEvent.dragItem, xAdjustedForScroll);
        }
        else {
            return this.getNewIndexForColMovingRight(displayedColumns, allColumns, draggingEvent.dragItem, xAdjustedForScroll);
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
    MoveColumnController.prototype.onDragging = function (draggingEvent) {
        this.lastDraggingEvent = draggingEvent;
        // if moving up or down (ie not left or right) then do nothing
        if (!draggingEvent.direction) {
            return;
        }
        var xAdjustedForScroll = this.adjustXForScroll(draggingEvent);
        this.checkCenterForScrolling(xAdjustedForScroll);
        // find out what the correct position is for this column
        this.checkColIndexAndMove(draggingEvent, xAdjustedForScroll);
    };
    MoveColumnController.prototype.checkColIndexAndMove = function (draggingEvent, xAdjustedForScroll) {
        var displayedColumns = this.columnController.getDisplayedColumns(this.pinned);
        var allColumns = this.columnController.getAllColumns();
        var newIndex = this.workOutNewIndex(displayedColumns, allColumns, draggingEvent, xAdjustedForScroll);
        var oldColumn = allColumns[newIndex];
        // if col already at required location, do nothing
        if (oldColumn === draggingEvent.dragItem) {
            return;
        }
        // we move one column, UNLESS the column is the only visible column
        // of a group, in which case we move the whole group.
        var columnsToMove = this.getColumnsAndOrphans(draggingEvent.dragItem);
        this.columnController.moveColumns(columnsToMove.reverse(), newIndex);
    };
    MoveColumnController.prototype.getNewIndexForColMovingLeft = function (displayedColumns, allColumns, dragItem, x) {
        var usedX = 0;
        var leftColumn = null;
        for (var i = 0; i < displayedColumns.length; i++) {
            var currentColumn = displayedColumns[i];
            if (currentColumn === dragItem) {
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
            var oldIndex = allColumns.indexOf(dragItem);
            if (oldIndex < newIndex) {
                newIndex--;
            }
        }
        else {
            newIndex = 0;
        }
        return newIndex;
    };
    MoveColumnController.prototype.getNewIndexForColMovingRight = function (displayedColumns, allColumns, dragItem, x) {
        var usedX = dragItem.getActualWidth();
        var leftColumn = null;
        for (var i = 0; i < displayedColumns.length; i++) {
            if (usedX > x) {
                break;
            }
            var currentColumn = displayedColumns[i];
            if (currentColumn === dragItem) {
                continue;
            }
            usedX += currentColumn.getActualWidth();
            leftColumn = currentColumn;
        }
        var newIndex;
        if (leftColumn) {
            newIndex = allColumns.indexOf(leftColumn) + 1;
            var oldIndex = allColumns.indexOf(dragItem);
            if (oldIndex < newIndex) {
                newIndex--;
            }
        }
        else {
            newIndex = 0;
        }
        return newIndex;
    };
    MoveColumnController.prototype.getColumnsAndOrphans = function (column) {
        // if this column was to move, how many children would be left without a parent
        var pathToChild = this.columnController.getPathForColumn(column);
        for (var i = pathToChild.length - 1; i >= 0; i--) {
            var columnGroup = pathToChild[i];
            var onlyDisplayedChild = columnGroup.getDisplayedChildren().length === 1;
            var moreThanOneChild = columnGroup.getChildren().length > 1;
            if (onlyDisplayedChild && moreThanOneChild) {
                // return total columns below here, not including the column under inspection
                var leafColumns = columnGroup.getLeafColumns();
                return leafColumns;
            }
        }
        return [column];
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
            if (this.failedMoveAttempts > 7) {
                if (this.needToMoveLeft) {
                    this.columnController.setColumnPinned(this.lastDraggingEvent.dragItem, column_1.Column.PINNED_LEFT);
                }
                else {
                    this.columnController.setColumnPinned(this.lastDraggingEvent.dragItem, column_1.Column.PINNED_RIGHT);
                }
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
        context_2.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], MoveColumnController.prototype, "init", null);
    return MoveColumnController;
})();
exports.MoveColumnController = MoveColumnController;
