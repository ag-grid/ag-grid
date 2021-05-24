/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var constants_1 = require("../constants/constants");
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var generic_1 = require("../utils/generic");
var array_1 = require("../utils/array");
var MoveColumnController = /** @class */ (function () {
    function MoveColumnController(pinned, eContainer) {
        this.needToMoveLeft = false;
        this.needToMoveRight = false;
        this.pinned = pinned;
        this.eContainer = eContainer;
        this.centerContainer = !generic_1.exists(pinned);
    }
    MoveColumnController.prototype.init = function () {
        var _this = this;
        this.logger = this.loggerFactory.create('MoveColumnController');
        this.controllersService.whenReady(function () {
            _this.gridBodyCon = _this.controllersService.getGridBodyController();
        });
    };
    MoveColumnController.prototype.getIconName = function () {
        return this.pinned ? dragAndDropService_1.DragAndDropService.ICON_PINNED : dragAndDropService_1.DragAndDropService.ICON_MOVE;
    };
    MoveColumnController.prototype.onDragEnter = function (draggingEvent) {
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
        this.onDragging(draggingEvent, true);
    };
    MoveColumnController.prototype.onDragLeave = function (draggingEvent) {
        var hideColumnOnExit = !this.gridOptionsWrapper.isSuppressDragLeaveHidesColumns() && !draggingEvent.fromNudge;
        if (hideColumnOnExit) {
            var dragItem = draggingEvent.dragSource.getDragItem();
            var columns = dragItem.columns;
            this.setColumnsVisible(columns, false, "uiColumnDragged");
        }
        this.ensureIntervalCleared();
    };
    MoveColumnController.prototype.setColumnsVisible = function (columns, visible, source) {
        if (source === void 0) { source = "api"; }
        if (columns) {
            var allowedCols = columns.filter(function (c) { return !c.getColDef().lockVisible; });
            this.columnController.setColumnsVisible(allowedCols, visible, source);
        }
    };
    MoveColumnController.prototype.setColumnsPinned = function (columns, pinned, source) {
        if (source === void 0) { source = "api"; }
        if (columns) {
            var allowedCols = columns.filter(function (c) { return !c.getColDef().lockPinned; });
            this.columnController.setColumnsPinned(allowedCols, pinned, source);
        }
    };
    MoveColumnController.prototype.onDragStop = function () {
        this.ensureIntervalCleared();
    };
    MoveColumnController.prototype.normaliseX = function (x) {
        // flip the coordinate if doing RTL
        if (this.gridOptionsWrapper.isEnableRtl()) {
            var clientWidth = this.eContainer.clientWidth;
            x = clientWidth - x;
        }
        // adjust for scroll only if centre container (the pinned containers don't scroll)
        if (this.centerContainer) {
            x += this.controllersService.getCenterRowContainerCon().getCenterViewportScrollLeft();
        }
        return x;
    };
    MoveColumnController.prototype.checkCenterForScrolling = function (xAdjustedForScroll) {
        if (this.centerContainer) {
            // scroll if the mouse has gone outside the grid (or just outside the scrollable part if pinning)
            // putting in 50 buffer, so even if user gets to edge of grid, a scroll will happen
            var firstVisiblePixel = this.controllersService.getCenterRowContainerCon().getCenterViewportScrollLeft();
            var lastVisiblePixel = firstVisiblePixel + this.controllersService.getCenterRowContainerCon().getCenterWidth();
            if (this.gridOptionsWrapper.isEnableRtl()) {
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
    MoveColumnController.prototype.onDragging = function (draggingEvent, fromEnter) {
        var _this = this;
        if (fromEnter === void 0) { fromEnter = false; }
        this.lastDraggingEvent = draggingEvent;
        // if moving up or down (ie not left or right) then do nothing
        if (generic_1.missing(draggingEvent.hDirection)) {
            return;
        }
        var mouseXNormalised = this.normaliseX(draggingEvent.x);
        // if the user is dragging into the panel, ie coming from the side panel into the main grid,
        // we don't want to scroll the grid this time, it would appear like the table is jumping
        // each time a column is dragged in.
        if (!fromEnter) {
            this.checkCenterForScrolling(mouseXNormalised);
        }
        var hDirectionNormalised = this.normaliseDirection(draggingEvent.hDirection);
        var dragSourceType = draggingEvent.dragSource.type;
        var columnsToMove = draggingEvent.dragSource.getDragItem().columns;
        columnsToMove = columnsToMove.filter(function (col) {
            if (col.getColDef().lockPinned) {
                // if locked return true only if both col and container are same pin type.
                // double equals (==) here on purpose so that null==undefined is true (for not pinned options)
                return col.getPinned() == _this.pinned;
            }
            // if not pin locked, then always allowed to be in this container
            return true;
        });
        this.attemptMoveColumns(dragSourceType, columnsToMove, hDirectionNormalised, mouseXNormalised, fromEnter);
    };
    MoveColumnController.prototype.normaliseDirection = function (hDirection) {
        if (this.gridOptionsWrapper.isEnableRtl()) {
            switch (hDirection) {
                case dragAndDropService_1.HorizontalDirection.Left: return dragAndDropService_1.HorizontalDirection.Right;
                case dragAndDropService_1.HorizontalDirection.Right: return dragAndDropService_1.HorizontalDirection.Left;
                default: console.error("AG Grid: Unknown direction " + hDirection);
            }
        }
        else {
            return hDirection;
        }
    };
    // returns the index of the first column in the list ONLY if the cols are all beside
    // each other. if the cols are not beside each other, then returns null
    MoveColumnController.prototype.calculateOldIndex = function (movingCols) {
        var gridCols = this.columnController.getAllGridColumns();
        var indexes = array_1.sortNumerically(movingCols.map(function (col) { return gridCols.indexOf(col); }));
        var firstIndex = indexes[0];
        var lastIndex = array_1.last(indexes);
        var spread = lastIndex - firstIndex;
        var gapsExist = spread !== indexes.length - 1;
        return gapsExist ? null : firstIndex;
    };
    MoveColumnController.prototype.attemptMoveColumns = function (dragSourceType, allMovingColumns, hDirection, mouseX, fromEnter) {
        var draggingLeft = hDirection === dragAndDropService_1.HorizontalDirection.Left;
        var draggingRight = hDirection === dragAndDropService_1.HorizontalDirection.Right;
        // it is important to sort the moving columns as they are in grid columns, as the list of moving columns
        // could themselves be part of 'married children' groups, which means we need to maintain the order within
        // the moving list.
        var allMovingColumnsOrdered = allMovingColumns.slice();
        this.columnController.sortColumnsLikeGridColumns(allMovingColumnsOrdered);
        var validMoves = this.calculateValidMoves(allMovingColumnsOrdered, draggingRight, mouseX);
        // if cols are not adjacent, then this returns null. when moving, we constrain the direction of the move
        // (ie left or right) to the mouse direction. however
        var oldIndex = this.calculateOldIndex(allMovingColumnsOrdered);
        if (validMoves.length === 0) {
            return;
        }
        var firstValidMove = validMoves[0];
        // the two check below stop an error when the user grabs a group my a middle column, then
        // it is possible the mouse pointer is to the right of a column while been dragged left.
        // so we need to make sure that the mouse pointer is actually left of the left most column
        // if moving left, and right of the right most column if moving right
        // we check 'fromEnter' below so we move the column to the new spot if the mouse is coming from
        // outside the grid, eg if the column is moving from side panel, mouse is moving left, then we should
        // place the column to the RHS even if the mouse is moving left and the column is already on
        // the LHS. otherwise we stick to the rule described above.
        var constrainDirection = oldIndex !== null && !fromEnter;
        // don't consider 'fromEnter' when dragging header cells, otherwise group can jump to opposite direction of drag
        if (dragSourceType == dragAndDropService_1.DragSourceType.HeaderCell) {
            constrainDirection = oldIndex !== null;
        }
        if (constrainDirection) {
            // only allow left drag if this column is moving left
            if (draggingLeft && firstValidMove >= oldIndex) {
                return;
            }
            // only allow right drag if this column is moving right
            if (draggingRight && firstValidMove <= oldIndex) {
                return;
            }
        }
        for (var i = 0; i < validMoves.length; i++) {
            var move = validMoves[i];
            if (!this.columnController.doesMovePassRules(allMovingColumnsOrdered, move)) {
                continue;
            }
            this.columnController.moveColumns(allMovingColumnsOrdered, move, "uiColumnDragged");
            // important to return here, so once we do the first valid move, we don't try do any more
            return;
        }
    };
    MoveColumnController.prototype.calculateValidMoves = function (movingCols, draggingRight, mouseX) {
        var isMoveBlocked = this.gridOptionsWrapper.isSuppressMovableColumns() || movingCols.some(function (col) { return col.getColDef().suppressMovable; });
        if (isMoveBlocked) {
            return [];
        }
        // this is the list of cols on the screen, so it's these we use when comparing the x mouse position
        var allDisplayedCols = this.columnController.getDisplayedColumns(this.pinned);
        // but this list is the list of all cols, when we move a col it's the index within this list that gets used,
        // so the result we return has to be and index location for this list
        var allGridCols = this.columnController.getAllGridColumns();
        var movingDisplayedCols = allDisplayedCols.filter(function (col) { return array_1.includes(movingCols, col); });
        var otherDisplayedCols = allDisplayedCols.filter(function (col) { return !array_1.includes(movingCols, col); });
        var otherGridCols = allGridCols.filter(function (col) { return !array_1.includes(movingCols, col); });
        // work out how many DISPLAYED columns fit before the 'x' position. this gives us the displayIndex.
        // for example, if cols are a,b,c,d and we find a,b fit before 'x', then we want to place the moving
        // col between b and c (so that it is under the mouse position).
        var displayIndex = 0;
        var availableWidth = mouseX;
        // if we are dragging right, then the columns will be to the left of the mouse, so we also want to
        // include the width of the moving columns
        if (draggingRight) {
            var widthOfMovingDisplayedCols_1 = 0;
            movingDisplayedCols.forEach(function (col) { return widthOfMovingDisplayedCols_1 += col.getActualWidth(); });
            availableWidth -= widthOfMovingDisplayedCols_1;
        }
        if (availableWidth > 0) {
            // now count how many of the displayed columns will fit to the left
            for (var i = 0; i < otherDisplayedCols.length; i++) {
                var col = otherDisplayedCols[i];
                availableWidth -= col.getActualWidth();
                if (availableWidth < 0) {
                    break;
                }
                displayIndex++;
            }
            // trial and error, if going right, we adjust by one, i didn't manage to quantify why, but it works
            if (draggingRight) {
                displayIndex++;
            }
        }
        // the display index is with respect to all the showing columns, however when we move, it's with
        // respect to all grid columns, so we need to translate from display index to grid index
        var firstValidMove;
        if (displayIndex > 0) {
            var leftColumn = otherDisplayedCols[displayIndex - 1];
            firstValidMove = otherGridCols.indexOf(leftColumn) + 1;
        }
        else {
            firstValidMove = otherGridCols.indexOf(otherDisplayedCols[0]);
            if (firstValidMove === -1) {
                firstValidMove = 0;
            }
        }
        var validMoves = [firstValidMove];
        var numberComparator = function (a, b) { return a - b; };
        // add in other valid moves due to hidden columns and married children. for example, a particular
        // move might break a group that has married children (so move isn't valid), however there could
        // be hidden columns (not displayed) that we could jump over to make the move valid. because
        // they are hidden, user doesn't see any different, however it allows moves that would otherwise
        // not work. for example imagine a group with 9 columns and all columns are hidden except the
        // middle one (so 4 hidden to left, 4 hidden to right), then when moving 'firstValidMove' will
        // be relative to the not-shown column, however we need to consider the move jumping over all the
        // hidden children. if we didn't do this, then if the group just described was at the end (RHS) of the
        // grid, there would be no way to put a column after it (as the grid would only consider beside the
        // visible column, which would fail valid move rules).
        if (draggingRight) {
            // if dragging right, then we add all the additional moves to the right. so in other words
            // if the next move is not valid, find the next move to the right that is valid.
            var pointer = firstValidMove + 1;
            var lastIndex = allGridCols.length - 1;
            while (pointer <= lastIndex) {
                validMoves.push(pointer);
                pointer++;
            }
            // adding columns here means the order is now messed up
            validMoves.sort(numberComparator);
        }
        else {
            // if dragging left we do the reverse of dragging right, we add in all the valid moves to the
            // left. however we also have to consider moves to the right for all hidden columns first.
            // (this logic is hard to reason with, it was worked out with trial and error,
            // more observation rather than science).
            // add moves to the right
            var pointer = firstValidMove;
            var lastIndex = allGridCols.length - 1;
            var displacedCol = allGridCols[pointer];
            while (pointer <= lastIndex && this.isColumnHidden(allDisplayedCols, displacedCol)) {
                pointer++;
                validMoves.push(pointer);
                displacedCol = allGridCols[pointer];
            }
            // add moves to the left
            pointer = firstValidMove - 1;
            var firstDisplayIndex = 0;
            while (pointer >= firstDisplayIndex) {
                validMoves.push(pointer);
                pointer--;
            }
            // adding columns here means the order is now messed up
            validMoves.sort(numberComparator).reverse();
        }
        return validMoves;
    };
    // isHidden takes into account visible=false and group=closed, ie it is not displayed
    MoveColumnController.prototype.isColumnHidden = function (displayedColumns, col) {
        return displayedColumns.indexOf(col) < 0;
    };
    MoveColumnController.prototype.ensureIntervalStarted = function () {
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
    MoveColumnController.prototype.ensureIntervalCleared = function () {
        if (this.movingIntervalId) {
            window.clearInterval(this.movingIntervalId);
            this.movingIntervalId = null;
            this.dragAndDropService.setGhostIcon(dragAndDropService_1.DragAndDropService.ICON_MOVE);
        }
    };
    MoveColumnController.prototype.moveInterval = function () {
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
                    var pinType = this.needToMoveLeft ? constants_1.Constants.PINNED_LEFT : constants_1.Constants.PINNED_RIGHT;
                    this.setColumnsPinned(columnsThatCanPin, pinType, "uiColumnDragged");
                    this.dragAndDropService.nudge();
                }
            }
        }
    };
    __decorate([
        context_1.Autowired('loggerFactory')
    ], MoveColumnController.prototype, "loggerFactory", void 0);
    __decorate([
        context_1.Autowired('columnController')
    ], MoveColumnController.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService')
    ], MoveColumnController.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], MoveColumnController.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('controllersService')
    ], MoveColumnController.prototype, "controllersService", void 0);
    __decorate([
        context_1.PostConstruct
    ], MoveColumnController.prototype, "init", null);
    return MoveColumnController;
}());
exports.MoveColumnController = MoveColumnController;

//# sourceMappingURL=moveColumnController.js.map
