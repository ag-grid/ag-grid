/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var column_1 = require("../entities/column");
var MoveColumnController = (function () {
    function MoveColumnController(column, eDraggableElement, eRoot, eHeaderCell, headerRenderer, columnController, dragService, gridPanel, gridOptionsWrapper) {
        this.lastDelta = 0;
        this.needToMoveLeft = false;
        this.needToMoveRight = false;
        this.eHeaderCell = eHeaderCell;
        this.headerRenderer = headerRenderer;
        this.columnController = columnController;
        this.column = column;
        this.gridPanel = gridPanel;
        this.addMovingCssToGrid = !gridOptionsWrapper.isSuppressMovingCss();
        this.centreWidth = gridPanel.getCenterWidth();
        dragService.addDragHandling({
            eDraggableElement: eDraggableElement,
            eBody: eRoot,
            cursor: 'move',
            // we only want to start dragging if the user moves at least 4px, otherwise we will loose
            // the ability for the user to click on the cell (eg for sorting)
            startAfterPixels: 4,
            onDragStart: this.onDragStart.bind(this),
            onDragging: this.onDragging.bind(this)
        });
    }
    MoveColumnController.prototype.onDragStart = function (event) {
        // the overlay spans all three (left, right, center), so we need to
        // pad the floating clone so it appears over the right container
        if (this.column.getPinned() === column_1.default.PINNED_LEFT) {
            this.floatPadding = 0;
        }
        else if (this.column.getPinned() === column_1.default.PINNED_RIGHT) {
            this.floatPadding = this.headerRenderer.getRightPinnedStartPixel();
        }
        else {
            this.floatPadding = this.columnController.getPinnedLeftContainerWidth();
            this.floatPadding -= this.gridPanel.getHorizontalScrollPosition();
        }
        // make clone of header cell for the 'floating ghost'
        this.eFloatingCloneCell = this.eHeaderCell.cloneNode(true);
        this.headerRenderer.addChildToOverlay(this.eFloatingCloneCell);
        this.startLeftPosition = this.columnController.getPixelsBeforeConsideringPinned(this.column);
        utils_1.default.addCssClass(this.eFloatingCloneCell, 'ag-header-cell-moving-clone');
        this.eFloatingCloneCell.style.position = 'absolute';
        this.eFloatingCloneCell.style.top = 0 + 'px';
        this.eFloatingCloneCell.style.left = this.floatPadding + this.startLeftPosition + 'px';
        // showing menu while hovering looks ugly, so hide header
        var cloneMenu = this.eFloatingCloneCell.querySelector('#agMenu');
        if (cloneMenu) {
            cloneMenu.style.display = 'none';
        }
        // see how many pixels to the edge of the column we are
        var headerCellLeft = this.eHeaderCell.getBoundingClientRect().left;
        this.clickPositionOnHeader = event.clientX - headerCellLeft;
        this.column.setMoving(true);
        if (this.addMovingCssToGrid) {
            this.gridPanel.setMovingCss(true);
        }
        this.scrollSinceStart = 0;
        this.hoveringOverPixelLastTime = this.startLeftPosition + this.clickPositionOnHeader + this.scrollSinceStart;
    };
    MoveColumnController.prototype.onDragging = function (delta, finished) {
        this.eFloatingCloneCell.style.left = this.floatPadding + (this.startLeftPosition + delta) + 'px';
        // get current pixel position
        var hoveringOverPixel = this.startLeftPosition + this.clickPositionOnHeader + delta + this.scrollSinceStart;
        var dragMovingRight = hoveringOverPixel > this.hoveringOverPixelLastTime;
        var dragMovingLeft = hoveringOverPixel < this.hoveringOverPixelLastTime;
        this.hoveringOverPixelLastTime = hoveringOverPixel;
        // the while loop keeps going until there are no more columns to move. this caters for the user
        // moving the mouse very fast and we need to swap the column twice or more
        var checkForAnotherColumn = true;
        while (checkForAnotherColumn) {
            var dragOverLeftColumn = this.column.getLeft() > hoveringOverPixel;
            var dragOverRightColumn = (this.column.getLeft() + this.column.getActualWidth()) < hoveringOverPixel;
            var wantToMoveLeft = dragOverLeftColumn && dragMovingLeft;
            var wantToMoveRight = dragOverRightColumn && dragMovingRight;
            checkForAnotherColumn = false;
            var colToSwapWith = null;
            if (wantToMoveLeft) {
                colToSwapWith = this.columnController.getDisplayedColBeforeForMoving(this.column);
            }
            if (wantToMoveRight) {
                colToSwapWith = this.columnController.getDisplayedColAfterForMoving(this.column);
            }
            // if we are a closed group, we need to move all the columns, not just this one
            if (colToSwapWith) {
                var newIndex = this.columnController.getColumnIndex(colToSwapWith);
                // we move one column, UNLESS the column is the only visible column
                // of a group, in which case we move the whole group.
                var columnsToMove = this.getColumnsAndOrphans(this.column);
                this.columnController.moveColumns(columnsToMove.reverse(), newIndex);
                checkForAnotherColumn = true;
            }
        }
        // we only look to scroll if the column is not pinned, as pinned columns are always visible
        if (!this.column.isPinned()) {
            // scroll if the mouse has gone outside the grid (or just outside the scrollable part if pinning)
            //var hoveringOverPixelScrollAdjusted = this.startLeftPosition + this.clickPositionOnHeaderScrollAdjusted + delta;
            // putting in 50 buffer, so even if user gets to edge of grid, a scroll will happen
            var firstVisiblePixel = this.gridPanel.getHorizontalScrollPosition();
            var lastVisiblePixel = firstVisiblePixel + this.gridPanel.getCenterWidth();
            this.needToMoveLeft = hoveringOverPixel < (firstVisiblePixel + 50);
            this.needToMoveRight = hoveringOverPixel > (lastVisiblePixel - 50);
            if (this.needToMoveLeft || this.needToMoveRight) {
                this.ensureIntervalStarted();
            }
            else {
                this.ensureIntervalCleared();
            }
        }
        if (finished) {
            this.column.setMoving(false);
            this.headerRenderer.removeChildFromOverlay(this.eFloatingCloneCell);
            if (this.addMovingCssToGrid) {
                this.gridPanel.setMovingCss(false);
            }
            this.ensureIntervalCleared();
        }
        this.lastDelta = delta;
    };
    MoveColumnController.prototype.ensureIntervalStarted = function () {
        if (!this.movingIntervalId) {
            this.intervalCount = 0;
            this.movingIntervalId = setInterval(this.moveInterval.bind(this), 100);
        }
    };
    MoveColumnController.prototype.ensureIntervalCleared = function () {
        if (this.moveInterval) {
            clearInterval(this.movingIntervalId);
            this.movingIntervalId = null;
        }
    };
    MoveColumnController.prototype.moveInterval = function () {
        var pixelsToMove;
        this.intervalCount++;
        pixelsToMove = 10 + (this.intervalCount * 5);
        if (pixelsToMove > 100) {
            pixelsToMove = 100;
        }
        var pixelsMoved = 0;
        if (this.needToMoveLeft) {
            pixelsMoved = this.gridPanel.scrollHorizontally(-pixelsToMove);
        }
        else if (this.needToMoveRight) {
            pixelsMoved = this.gridPanel.scrollHorizontally(pixelsToMove);
        }
        this.scrollSinceStart += pixelsMoved;
        this.onDragging(this.lastDelta, false);
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
    return MoveColumnController;
})();
exports.MoveColumnController = MoveColumnController;
