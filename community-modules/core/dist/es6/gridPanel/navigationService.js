/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
import { Autowired, Bean, Optional, PostConstruct } from "../context/context";
import { Constants } from "../constants";
import { BeanStub } from "../context/beanStub";
import { _ } from "../utils";
var NavigationService = /** @class */ (function (_super) {
    __extends(NavigationService, _super);
    function NavigationService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.timeLastPageEventProcessed = 0;
        return _this;
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
            case Constants.KEY_PAGE_HOME:
            case Constants.KEY_PAGE_END:
                // handle home and end when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    this.onHomeOrEndKey(key);
                    processed = true;
                }
                break;
            case Constants.KEY_LEFT:
            case Constants.KEY_RIGHT:
                // handle left and right when ctrl is pressed only
                if (ctrl && !alt) {
                    this.onCtrlLeftOrRight(key, currentCell);
                    processed = true;
                }
                break;
            case Constants.KEY_UP:
            case Constants.KEY_DOWN:
                // handle up and down when ctrl is pressed only
                if (ctrl && !alt) {
                    this.onCtrlUpOrDown(key, currentCell);
                    processed = true;
                }
                break;
            case Constants.KEY_PAGE_DOWN:
                // handle page up and page down when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    this.onPageDown(currentCell);
                    processed = true;
                }
                break;
            case Constants.KEY_PAGE_UP:
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
        if (_.exists(scrollColumn)) {
            this.gridPanel.ensureColumnVisible(scrollColumn);
        }
        if (_.exists(scrollIndex)) {
            this.gridPanel.ensureIndexVisible(scrollIndex, scrollType);
        }
        // make sure the cell is rendered, needed if we are to focus
        this.animationFrameService.flushAllFrames();
        // if we don't do this, the range will be left on the last cell, which will leave the last focused cell
        // highlighted.
        this.focusController.setFocusedCell(focusIndex, focusColumn, null, true);
        if (this.rangeController) {
            var cellPosition = { rowIndex: focusIndex, rowPinned: null, column: focusColumn };
            this.rangeController.setRangeToCell(cellPosition);
        }
    };
    // ctrl + up/down will bring focus to same column, first/last row. no horizontal scrolling.
    NavigationService.prototype.onCtrlUpOrDown = function (key, gridCell) {
        var upKey = key === Constants.KEY_UP;
        var rowIndexToScrollTo = upKey ? 0 : this.paginationProxy.getPageLastRow();
        this.navigateTo(rowIndexToScrollTo, null, gridCell.column, rowIndexToScrollTo, gridCell.column);
    };
    // ctrl + left/right will bring focus to same row, first/last cell. no vertical scrolling.
    NavigationService.prototype.onCtrlLeftOrRight = function (key, gridCell) {
        var leftKey = key === Constants.KEY_LEFT;
        var allColumns = this.columnController.getAllDisplayedColumns();
        var columnToSelect = leftKey ? allColumns[0] : _.last(allColumns);
        this.navigateTo(gridCell.rowIndex, null, columnToSelect, gridCell.rowIndex, columnToSelect);
    };
    // home brings focus to top left cell, end brings focus to bottom right, grid scrolled to bring
    // same cell into view (which means either scroll all the way up, or all the way down).
    NavigationService.prototype.onHomeOrEndKey = function (key) {
        var homeKey = key === Constants.KEY_PAGE_HOME;
        var allColumns = this.columnController.getAllDisplayedColumns();
        var columnToSelect = homeKey ? allColumns[0] : _.last(allColumns);
        var rowIndexToScrollTo = homeKey ? 0 : this.paginationProxy.getPageLastRow();
        this.navigateTo(rowIndexToScrollTo, null, columnToSelect, rowIndexToScrollTo, columnToSelect);
    };
    __decorate([
        Autowired('mouseEventService')
    ], NavigationService.prototype, "mouseEventService", void 0);
    __decorate([
        Autowired('paginationProxy')
    ], NavigationService.prototype, "paginationProxy", void 0);
    __decorate([
        Autowired('focusController')
    ], NavigationService.prototype, "focusController", void 0);
    __decorate([
        Autowired('animationFrameService')
    ], NavigationService.prototype, "animationFrameService", void 0);
    __decorate([
        Optional('rangeController')
    ], NavigationService.prototype, "rangeController", void 0);
    __decorate([
        Autowired('columnController')
    ], NavigationService.prototype, "columnController", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], NavigationService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        PostConstruct
    ], NavigationService.prototype, "init", null);
    NavigationService = __decorate([
        Bean('navigationService')
    ], NavigationService);
    return NavigationService;
}(BeanStub));
export { NavigationService };
