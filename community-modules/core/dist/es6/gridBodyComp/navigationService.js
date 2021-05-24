/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
import { BeanStub } from "../context/beanStub";
import { exists } from "../utils/generic";
import { last } from "../utils/array";
import { KeyCode } from '../constants/keyCode';
var NavigationService = /** @class */ (function (_super) {
    __extends(NavigationService, _super);
    function NavigationService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.timeLastPageEventProcessed = 0;
        return _this;
    }
    NavigationService.prototype.postConstruct = function () {
        var _this = this;
        this.controllersService.whenReady(function (p) {
            _this.gridBodyCon = p.gridBodyCon;
        });
    };
    NavigationService.prototype.handlePageScrollingKey = function (event) {
        var key = event.which || event.keyCode;
        var alt = event.altKey;
        var ctrl = event.ctrlKey || event.metaKey;
        var currentCell = this.mouseEventService.getCellPositionForEvent(event);
        if (!currentCell) {
            return false;
        }
        var processed = false;
        switch (key) {
            case KeyCode.PAGE_HOME:
            case KeyCode.PAGE_END:
                // handle home and end when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    this.onHomeOrEndKey(key);
                    processed = true;
                }
                break;
            case KeyCode.LEFT:
            case KeyCode.RIGHT:
                // handle left and right when ctrl is pressed only
                if (ctrl && !alt) {
                    this.onCtrlLeftOrRight(key, currentCell);
                    processed = true;
                }
                break;
            case KeyCode.UP:
            case KeyCode.DOWN:
                // handle up and down when ctrl is pressed only
                if (ctrl && !alt) {
                    this.onCtrlUpOrDown(key, currentCell);
                    processed = true;
                }
                break;
            case KeyCode.PAGE_DOWN:
                // handle page up and page down when ctrl & alt are NOT pressed
                if (!ctrl && !alt) {
                    this.onPageDown(currentCell);
                    processed = true;
                }
                break;
            case KeyCode.PAGE_UP:
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
    NavigationService.prototype.navigateTo = function (navigateParams) {
        var scrollIndex = navigateParams.scrollIndex, scrollType = navigateParams.scrollType, scrollColumn = navigateParams.scrollColumn, focusIndex = navigateParams.focusIndex, focusColumn = navigateParams.focusColumn;
        if (exists(scrollColumn)) {
            this.gridBodyCon.getScrollFeature().ensureColumnVisible(scrollColumn);
        }
        if (exists(scrollIndex)) {
            this.gridBodyCon.getScrollFeature().ensureIndexVisible(scrollIndex, scrollType);
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
    NavigationService.prototype.onPageDown = function (gridCell) {
        if (this.isTimeSinceLastPageEventToRecent()) {
            return;
        }
        var gridBodyCon = this.controllersService.getGridBodyController();
        var scrollPosition = gridBodyCon.getScrollFeature().getVScrollPosition();
        var scrollbarWidth = this.gridOptionsWrapper.getScrollbarWidth();
        var pixelsInOnePage = scrollPosition.bottom - scrollPosition.top;
        if (this.controllersService.getCenterRowContainerCon().isHorizontalScrollShowing()) {
            pixelsInOnePage -= scrollbarWidth;
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
        this.navigateTo({
            scrollIndex: scrollIndex,
            scrollType: 'top',
            scrollColumn: null,
            focusIndex: focusIndex,
            focusColumn: gridCell.column
        });
        this.setTimeLastPageEventProcessed();
    };
    NavigationService.prototype.onPageUp = function (gridCell) {
        if (this.isTimeSinceLastPageEventToRecent()) {
            return;
        }
        var gridBodyCon = this.controllersService.getGridBodyController();
        var scrollPosition = gridBodyCon.getScrollFeature().getVScrollPosition();
        var scrollbarWidth = this.gridOptionsWrapper.getScrollbarWidth();
        var pixelsInOnePage = scrollPosition.bottom - scrollPosition.top;
        if (this.controllersService.getCenterRowContainerCon().isHorizontalScrollShowing()) {
            pixelsInOnePage -= scrollbarWidth;
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
        this.navigateTo({
            scrollIndex: scrollIndex,
            scrollType: 'bottom',
            scrollColumn: null,
            focusIndex: focusIndex,
            focusColumn: gridCell.column
        });
        this.setTimeLastPageEventProcessed();
    };
    NavigationService.prototype.getIndexToFocus = function (indexToScrollTo, isDown) {
        var indexToFocus = indexToScrollTo;
        // for SSRM, when user hits ctrl+down, we can end up trying to focus the loading row.
        // instead we focus the last row with data instead.
        if (isDown) {
            var node = this.paginationProxy.getRow(indexToScrollTo);
            if (node && node.stub) {
                indexToFocus -= 1;
            }
        }
        return indexToFocus;
    };
    // ctrl + up/down will bring focus to same column, first/last row. no horizontal scrolling.
    NavigationService.prototype.onCtrlUpOrDown = function (key, gridCell) {
        var upKey = key === KeyCode.UP;
        var rowIndexToScrollTo = upKey ? this.paginationProxy.getPageFirstRow() : this.paginationProxy.getPageLastRow();
        this.navigateTo({
            scrollIndex: rowIndexToScrollTo,
            scrollType: null,
            scrollColumn: gridCell.column,
            focusIndex: this.getIndexToFocus(rowIndexToScrollTo, !upKey),
            focusColumn: gridCell.column
        });
    };
    // ctrl + left/right will bring focus to same row, first/last cell. no vertical scrolling.
    NavigationService.prototype.onCtrlLeftOrRight = function (key, gridCell) {
        var leftKey = key === KeyCode.LEFT;
        var allColumns = this.columnController.getAllDisplayedColumns();
        var columnToSelect = leftKey ? allColumns[0] : last(allColumns);
        this.navigateTo({
            scrollIndex: gridCell.rowIndex,
            scrollType: null,
            scrollColumn: columnToSelect,
            focusIndex: gridCell.rowIndex,
            focusColumn: columnToSelect
        });
    };
    // home brings focus to top left cell, end brings focus to bottom right, grid scrolled to bring
    // same cell into view (which means either scroll all the way up, or all the way down).
    NavigationService.prototype.onHomeOrEndKey = function (key) {
        var homeKey = key === KeyCode.PAGE_HOME;
        var allColumns = this.columnController.getAllDisplayedColumns();
        var columnToSelect = homeKey ? allColumns[0] : last(allColumns);
        var scrollIndex = homeKey ? this.paginationProxy.getPageFirstRow() : this.paginationProxy.getPageLastRow();
        this.navigateTo({
            scrollIndex: scrollIndex,
            scrollType: null,
            scrollColumn: columnToSelect,
            focusIndex: this.getIndexToFocus(scrollIndex, !homeKey),
            focusColumn: columnToSelect
        });
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
        Autowired('controllersService')
    ], NavigationService.prototype, "controllersService", void 0);
    __decorate([
        PostConstruct
    ], NavigationService.prototype, "postConstruct", null);
    NavigationService = __decorate([
        Bean('navigationService')
    ], NavigationService);
    return NavigationService;
}(BeanStub));
export { NavigationService };
