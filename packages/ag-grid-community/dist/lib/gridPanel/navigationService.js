/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
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
var context_1 = require("../context/context");
var constants_1 = require("../constants");
var mouseEventService_1 = require("./mouseEventService");
var paginationProxy_1 = require("../rowModels/paginationProxy");
var focusedCellController_1 = require("../focusedCellController");
var animationFrameService_1 = require("../misc/animationFrameService");
var columnController_1 = require("../columnController/columnController");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var utils_1 = require("../utils");
var NavigationService = /** @class */ (function () {
    function NavigationService() {
        this.timeLastPageEventProcessed = 0;
    }
    NavigationService.prototype.init = function () {
        this.scrollWidth = this.gridOptionsWrapper.getScrollbarWidth();
    };
    NavigationService.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
    };
    NavigationService.prototype.handlePageScrollingKey = function (event) {
        var key = event.which || event.keyCode;
        var alt = event.altKey;
        var ctrl = event.ctrlKey;
        var currentCell = this.mouseEventService.getCellPositionForEvent(event);
        if (!currentCell) {
            return false;
        }
        var processed = false;
        switch (key) {
            case constants_1.Constants.KEY_PAGE_HOME:
            case constants_1.Constants.KEY_PAGE_END:
                // handle home and end when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    this.onHomeOrEndKey(key);
                    processed = true;
                }
                break;
            case constants_1.Constants.KEY_LEFT:
            case constants_1.Constants.KEY_RIGHT:
                // handle left and right when ctrl is pressed only
                if (ctrl && !alt) {
                    this.onCtrlLeftOrRight(key, currentCell);
                    processed = true;
                }
                break;
            case constants_1.Constants.KEY_UP:
            case constants_1.Constants.KEY_DOWN:
                // handle up and down when ctrl is pressed only
                if (ctrl && !alt) {
                    this.onCtrlUpOrDown(key, currentCell);
                    processed = true;
                }
                break;
            case constants_1.Constants.KEY_PAGE_DOWN:
                // handle page up and page down when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    this.onPageDown(currentCell);
                    processed = true;
                }
                break;
            case constants_1.Constants.KEY_PAGE_UP:
                // handle page up and page down when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    this.onPageUp(currentCell);
                    processed = true;
                }
                break;
        }
        if (processed) {
            event.preventDefault();
        }
        return processed;
    };
    // the page up/down keys caused a problem, in that if the user
    // held the page up/down key down, lots of events got generated,
    // which clogged up the event queue (as they take time to process)
    // which in turn froze the grid. Logic below makes sure we wait 100ms
    // between processing the page up/down events, so when user has finger
    // held down on key, we ignore page up/down events until 100ms has passed,
    // which effectively empties the queue of page up/down events.
    NavigationService.prototype.isTimeSinceLastPageEventToRecent = function () {
        var now = new Date().getTime();
        var diff = now - this.timeLastPageEventProcessed;
        return (diff < 100);
    };
    NavigationService.prototype.setTimeLastPageEventProcessed = function () {
        this.timeLastPageEventProcessed = new Date().getTime();
    };
    NavigationService.prototype.onPageDown = function (gridCell) {
        if (this.isTimeSinceLastPageEventToRecent()) {
            return;
        }
        var scrollPosition = this.gridPanel.getVScrollPosition();
        var pixelsInOnePage = scrollPosition.bottom - scrollPosition.top;
        if (this.gridPanel.isHorizontalScrollShowing()) {
            pixelsInOnePage -= this.scrollWidth;
        }
        var pagingPixelOffset = this.paginationProxy.getPixelOffset();
        var currentPageBottomPixel = scrollPosition.top + pixelsInOnePage;
        var currentPageBottomRow = this.paginationProxy.getRowIndexAtPixel(currentPageBottomPixel + pagingPixelOffset);
        var scrollIndex = currentPageBottomRow;
        var currentCellPixel = this.paginationProxy.getRow(gridCell.rowIndex).rowTop;
        var nextCellPixel = currentCellPixel + pixelsInOnePage - pagingPixelOffset;
        var focusIndex = this.paginationProxy.getRowIndexAtPixel(nextCellPixel + pagingPixelOffset);
        var pageLastRow = this.paginationProxy.getPageLastRow();
        if (focusIndex > pageLastRow) {
            focusIndex = pageLastRow;
        }
        if (scrollIndex > pageLastRow) {
            scrollIndex = pageLastRow;
        }
        this.navigateTo(scrollIndex, 'top', null, focusIndex, gridCell.column);
        this.setTimeLastPageEventProcessed();
    };
    NavigationService.prototype.onPageUp = function (gridCell) {
        if (this.isTimeSinceLastPageEventToRecent()) {
            return;
        }
        var scrollPosition = this.gridPanel.getVScrollPosition();
        var pixelsInOnePage = scrollPosition.bottom - scrollPosition.top;
        if (this.gridPanel.isHorizontalScrollShowing()) {
            pixelsInOnePage -= this.scrollWidth;
        }
        var pagingPixelOffset = this.paginationProxy.getPixelOffset();
        var currentPageTopPixel = scrollPosition.top;
        var currentPageTopRow = this.paginationProxy.getRowIndexAtPixel(currentPageTopPixel + pagingPixelOffset);
        var scrollIndex = currentPageTopRow;
        var currentRowNode = this.paginationProxy.getRow(gridCell.rowIndex);
        var nextCellPixel = currentRowNode.rowTop + currentRowNode.rowHeight - pixelsInOnePage - pagingPixelOffset;
        var focusIndex = this.paginationProxy.getRowIndexAtPixel(nextCellPixel + pagingPixelOffset);
        var firstRow = this.paginationProxy.getPageFirstRow();
        if (focusIndex < firstRow) {
            focusIndex = firstRow;
        }
        if (scrollIndex < firstRow) {
            scrollIndex = firstRow;
        }
        this.navigateTo(scrollIndex, 'bottom', null, focusIndex, gridCell.column);
        this.setTimeLastPageEventProcessed();
    };
    // common logic to navigate. takes parameters:
    // scrollIndex - what row to vertically scroll to
    // scrollType - what position to put scroll index ie top/bottom
    // scrollColumn - what column to horizontally scroll to
    // focusIndex / focusColumn - for page up / down, we want to scroll to one row/column, but focus another
    NavigationService.prototype.navigateTo = function (scrollIndex, scrollType, scrollColumn, focusIndex, focusColumn) {
        if (utils_1._.exists(scrollColumn)) {
            this.gridPanel.ensureColumnVisible(scrollColumn);
        }
        if (utils_1._.exists(scrollIndex)) {
            this.gridPanel.ensureIndexVisible(scrollIndex, scrollType);
        }
        // make sure the cell is rendered, needed if we are to focus
        this.animationFrameService.flushAllFrames();
        // if we don't do this, the range will be left on the last cell, which will leave the last focused cell
        // highlighted.
        this.focusedCellController.setFocusedCell(focusIndex, focusColumn, null, true);
        if (this.rangeController) {
            var cellPosition = { rowIndex: focusIndex, rowPinned: null, column: focusColumn };
            this.rangeController.setRangeToCell(cellPosition);
        }
    };
    // ctrl + up/down will bring focus to same column, first/last row. no horizontal scrolling.
    NavigationService.prototype.onCtrlUpOrDown = function (key, gridCell) {
        var upKey = key === constants_1.Constants.KEY_UP;
        var rowIndexToScrollTo = upKey ? 0 : this.paginationProxy.getPageLastRow();
        this.navigateTo(rowIndexToScrollTo, null, gridCell.column, rowIndexToScrollTo, gridCell.column);
    };
    // ctrl + left/right will bring focus to same row, first/last cell. no vertical scrolling.
    NavigationService.prototype.onCtrlLeftOrRight = function (key, gridCell) {
        var leftKey = key === constants_1.Constants.KEY_LEFT;
        var allColumns = this.columnController.getAllDisplayedColumns();
        var columnToSelect = leftKey ? allColumns[0] : utils_1._.last(allColumns);
        this.navigateTo(gridCell.rowIndex, null, columnToSelect, gridCell.rowIndex, columnToSelect);
    };
    // home brings focus to top left cell, end brings focus to bottom right, grid scrolled to bring
    // same cell into view (which means either scroll all the way up, or all the way down).
    NavigationService.prototype.onHomeOrEndKey = function (key) {
        var homeKey = key === constants_1.Constants.KEY_PAGE_HOME;
        var allColumns = this.columnController.getAllDisplayedColumns();
        var columnToSelect = homeKey ? allColumns[0] : utils_1._.last(allColumns);
        var rowIndexToScrollTo = homeKey ? 0 : this.paginationProxy.getPageLastRow();
        this.navigateTo(rowIndexToScrollTo, null, columnToSelect, rowIndexToScrollTo, columnToSelect);
    };
    __decorate([
        context_1.Autowired('mouseEventService'),
        __metadata("design:type", mouseEventService_1.MouseEventService)
    ], NavigationService.prototype, "mouseEventService", void 0);
    __decorate([
        context_1.Autowired('paginationProxy'),
        __metadata("design:type", paginationProxy_1.PaginationProxy)
    ], NavigationService.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.Autowired('focusedCellController'),
        __metadata("design:type", focusedCellController_1.FocusedCellController)
    ], NavigationService.prototype, "focusedCellController", void 0);
    __decorate([
        context_1.Autowired('animationFrameService'),
        __metadata("design:type", animationFrameService_1.AnimationFrameService)
    ], NavigationService.prototype, "animationFrameService", void 0);
    __decorate([
        context_1.Optional('rangeController'),
        __metadata("design:type", Object)
    ], NavigationService.prototype, "rangeController", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], NavigationService.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], NavigationService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], NavigationService.prototype, "init", null);
    NavigationService = __decorate([
        context_1.Bean('navigationService')
    ], NavigationService);
    return NavigationService;
}());
exports.NavigationService = NavigationService;
