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
import { Autowired, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { getInnerHeight, getScrollLeft, isRtlNegativeScroll, setScrollLeft } from "../utils/dom";
import { Events } from "../eventKeys";
import { debounce } from "../utils/function";
import { isIOSUserAgent } from "../utils/browser";
import { Constants } from "../constants/constants";
var GridBodyScrollFeature = /** @class */ (function (_super) {
    __extends(GridBodyScrollFeature, _super);
    function GridBodyScrollFeature(eBodyViewport) {
        var _this = _super.call(this) || this;
        _this.scrollLeft = -1;
        _this.nextScrollTop = -1;
        _this.scrollTop = -1;
        _this.eBodyViewport = eBodyViewport;
        _this.resetLastHorizontalScrollElementDebounced = debounce(_this.resetLastHorizontalScrollElement.bind(_this), 500);
        return _this;
    }
    GridBodyScrollFeature.prototype.postConstruct = function () {
        var _this = this;
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));
        this.controllersService.whenReady(function (p) {
            _this.centerRowContainerCon = p.centerRowContainerCon;
            _this.onDisplayedColumnsWidthChanged();
            _this.addScrollListener();
        });
    };
    GridBodyScrollFeature.prototype.addScrollListener = function () {
        var fakeHScroll = this.controllersService.getFakeHScrollCon();
        this.addManagedListener(this.centerRowContainerCon.getViewportElement(), 'scroll', this.onCenterViewportScroll.bind(this));
        this.addManagedListener(fakeHScroll.getViewport(), 'scroll', this.onFakeHorizontalScroll.bind(this));
        var onVerticalScroll = this.gridOptionsWrapper.isDebounceVerticalScrollbar() ?
            debounce(this.onVerticalScroll.bind(this), 100)
            : this.onVerticalScroll.bind(this);
        this.addManagedListener(this.eBodyViewport, 'scroll', onVerticalScroll);
    };
    GridBodyScrollFeature.prototype.onDisplayedColumnsWidthChanged = function () {
        if (this.enableRtl) {
            // because RTL is all backwards, a change in the width of the row
            // can cause a change in the scroll position, without a scroll event,
            // because the scroll position in RTL is a function that depends on
            // the width. to be convinced of this, take out this line, enable RTL,
            // scroll all the way to the left and then resize a column
            this.horizontallyScrollHeaderCenterAndFloatingCenter();
        }
    };
    GridBodyScrollFeature.prototype.horizontallyScrollHeaderCenterAndFloatingCenter = function (scrollLeft) {
        if (scrollLeft === undefined) {
            scrollLeft = this.centerRowContainerCon.getCenterViewportScrollLeft();
        }
        var offset = this.enableRtl ? scrollLeft : -scrollLeft;
        var topCenterContainer = this.controllersService.getTopCenterRowContainerCon();
        var bottomCenterContainer = this.controllersService.getBottomCenterRowContainerCon();
        var headerRootComp = this.controllersService.getHeaderRootComp();
        var fakeHScroll = this.controllersService.getFakeHScrollCon();
        headerRootComp.setHorizontalScroll(offset);
        bottomCenterContainer.setContainerTranslateX(offset);
        topCenterContainer.setContainerTranslateX(offset);
        var partner = this.lastHorizontalScrollElement === this.centerRowContainerCon.getViewportElement() ?
            fakeHScroll.getViewport() : this.centerRowContainerCon.getViewportElement();
        setScrollLeft(partner, Math.abs(scrollLeft), this.enableRtl);
    };
    GridBodyScrollFeature.prototype.isControllingScroll = function (eDiv) {
        if (!this.lastHorizontalScrollElement) {
            this.lastHorizontalScrollElement = eDiv;
            return true;
        }
        return eDiv === this.lastHorizontalScrollElement;
    };
    GridBodyScrollFeature.prototype.onFakeHorizontalScroll = function () {
        var fakeHScrollViewport = this.controllersService.getFakeHScrollCon().getViewport();
        if (!this.isControllingScroll(fakeHScrollViewport)) {
            return;
        }
        this.onBodyHorizontalScroll(fakeHScrollViewport);
    };
    GridBodyScrollFeature.prototype.onCenterViewportScroll = function () {
        var centerContainerViewport = this.centerRowContainerCon.getViewportElement();
        if (!this.isControllingScroll(centerContainerViewport)) {
            return;
        }
        this.onBodyHorizontalScroll(centerContainerViewport);
    };
    GridBodyScrollFeature.prototype.onBodyHorizontalScroll = function (eSource) {
        var centerContainerViewport = this.centerRowContainerCon.getViewportElement();
        var scrollLeft = centerContainerViewport.scrollLeft;
        if (this.shouldBlockScrollUpdate('horizontal', scrollLeft, true)) {
            return;
        }
        // we do Math.round() rather than Math.floor(), to mirror how scroll values are applied.
        // eg if a scale is applied (ie user has zoomed the browser), then applying scroll=200
        // could result in 199.88, which then floor(199.88) = 199, however round(199.88) = 200.
        // initially Math.floor() was used, however this caused (almost) infinite loop with aligned grids,
        // as the scroll would move 1px at at time bouncing from one grid to the next (eg one grid would cause
        // scroll to 200px, the next to 199px, then the first back to 198px and so on).
        this.doHorizontalScroll(Math.round(getScrollLeft(eSource, this.enableRtl)));
        this.resetLastHorizontalScrollElementDebounced();
    };
    GridBodyScrollFeature.prototype.onVerticalScroll = function () {
        var scrollTop = this.eBodyViewport.scrollTop;
        if (this.shouldBlockScrollUpdate('vertical', scrollTop, true)) {
            return;
        }
        this.animationFrameService.setScrollTop(scrollTop);
        this.nextScrollTop = scrollTop;
        if (this.gridOptionsWrapper.isSuppressAnimationFrame()) {
            this.scrollTop = this.nextScrollTop;
            this.redrawRowsAfterScroll();
        }
        else {
            this.animationFrameService.schedule();
        }
    };
    GridBodyScrollFeature.prototype.resetLastHorizontalScrollElement = function () {
        this.lastHorizontalScrollElement = null;
    };
    GridBodyScrollFeature.prototype.doHorizontalScroll = function (scrollLeft) {
        this.scrollLeft = scrollLeft;
        var event = {
            type: Events.EVENT_BODY_SCROLL,
            api: this.gridApi,
            columnApi: this.columnApi,
            direction: 'horizontal',
            left: this.scrollLeft,
            top: this.scrollTop
        };
        this.eventService.dispatchEvent(event);
        this.horizontallyScrollHeaderCenterAndFloatingCenter(scrollLeft);
        this.onHorizontalViewportChanged();
    };
    GridBodyScrollFeature.prototype.shouldBlockScrollUpdate = function (direction, scrollTo, touchOnly) {
        // touch devices allow elastic scroll - which temporally scrolls the panel outside of the viewport
        // (eg user uses touch to go to the left of the grid, but drags past the left, the rows will actually
        // scroll past the left until the user releases the mouse). when this happens, we want ignore the scroll,
        // as otherwise it was causing the rows and header to flicker.
        if (touchOnly === void 0) { touchOnly = false; }
        // sometimes when scrolling, we got values that extended the maximum scroll allowed. we used to
        // ignore these scrolls. problem is the max scroll position could be skipped (eg the previous scroll event
        // could be 10px before the max position, and then current scroll event could be 20px after the max position).
        // if we just ignored the last event, we would be setting the scroll to 10px before the max position, when in
        // actual fact the user has exceeded the max scroll and thus scroll should be set to the max.
        if (touchOnly && !isIOSUserAgent()) {
            return false;
        }
        if (direction === 'vertical') {
            var clientHeight = getInnerHeight(this.eBodyViewport);
            var scrollHeight = this.eBodyViewport.scrollHeight;
            if (scrollTo < 0 || (scrollTo + clientHeight > scrollHeight)) {
                return true;
            }
        }
        if (direction === 'horizontal') {
            var clientWidth = this.centerRowContainerCon.getCenterWidth();
            var scrollWidth = this.centerRowContainerCon.getViewportElement().scrollWidth;
            if (this.enableRtl && isRtlNegativeScroll()) {
                if (scrollTo > 0) {
                    return true;
                }
            }
            else if (scrollTo < 0) {
                return true;
            }
            if (Math.abs(scrollTo) + clientWidth > scrollWidth) {
                return true;
            }
        }
        return false;
    };
    GridBodyScrollFeature.prototype.redrawRowsAfterScroll = function () {
        var event = {
            type: Events.EVENT_BODY_SCROLL,
            direction: 'vertical',
            api: this.gridApi,
            columnApi: this.columnApi,
            left: this.scrollLeft,
            top: this.scrollTop
        };
        this.eventService.dispatchEvent(event);
    };
    GridBodyScrollFeature.prototype.onHorizontalViewportChanged = function () {
        this.centerRowContainerCon.onHorizontalViewportChanged();
    };
    // this is to cater for AG-3274, where grid is removed from the dom and then inserted back in again.
    // (which happens with some implementations of tabbing). this can result in horizontal scroll getting
    // reset back to the left, however no scroll event is fired. so we need to get header to also scroll
    // back to the left to be kept in sync.
    // adding and removing the grid from the DOM both resets the scroll position and
    // triggers a resize event, so notify listeners if the scroll position has changed
    GridBodyScrollFeature.prototype.checkScrollLeft = function () {
        if (this.scrollLeft !== this.centerRowContainerCon.getCenterViewportScrollLeft()) {
            this.onBodyHorizontalScroll(this.centerRowContainerCon.getViewportElement());
        }
    };
    GridBodyScrollFeature.prototype.executeAnimationFrameScroll = function () {
        var frameNeeded = this.scrollTop != this.nextScrollTop;
        if (frameNeeded) {
            this.scrollTop = this.nextScrollTop;
            this.redrawRowsAfterScroll();
        }
        return frameNeeded;
    };
    // called by scrollHorizontally method and alignedGridsService
    GridBodyScrollFeature.prototype.setHorizontalScrollPosition = function (hScrollPosition) {
        var minScrollLeft = 0;
        var maxScrollLeft = this.centerRowContainerCon.getViewportElement().scrollWidth - this.centerRowContainerCon.getCenterWidth();
        if (this.shouldBlockScrollUpdate('horizontal', hScrollPosition)) {
            if (this.enableRtl && isRtlNegativeScroll()) {
                hScrollPosition = hScrollPosition > 0 ? 0 : maxScrollLeft;
            }
            else {
                hScrollPosition = Math.min(Math.max(hScrollPosition, minScrollLeft), maxScrollLeft);
            }
        }
        setScrollLeft(this.centerRowContainerCon.getViewportElement(), Math.abs(hScrollPosition), this.enableRtl);
        // we need to manually do the event handling (rather than wait for the event)
        // for the alignedGridsService, as if we don't, the aligned grid service gets
        // notified async, and then it's 'consuming' flag doesn't get used right, and
        // we can end up with an infinite loop
        this.doHorizontalScroll(hScrollPosition);
    };
    GridBodyScrollFeature.prototype.setVerticalScrollPosition = function (vScrollPosition) {
        this.eBodyViewport.scrollTop = vScrollPosition;
    };
    GridBodyScrollFeature.prototype.getVScrollPosition = function () {
        var result = {
            top: this.eBodyViewport.scrollTop,
            bottom: this.eBodyViewport.scrollTop + this.eBodyViewport.offsetHeight
        };
        return result;
    };
    GridBodyScrollFeature.prototype.getHScrollPosition = function () {
        return this.centerRowContainerCon.getHScrollPosition();
    };
    GridBodyScrollFeature.prototype.isHorizontalScrollShowing = function () {
        return this.centerRowContainerCon.isHorizontalScrollShowing();
    };
    // called by the headerRootComp and moveColumnController
    GridBodyScrollFeature.prototype.scrollHorizontally = function (pixels) {
        var oldScrollPosition = this.centerRowContainerCon.getViewportElement().scrollLeft;
        this.setHorizontalScrollPosition(oldScrollPosition + pixels);
        return this.centerRowContainerCon.getViewportElement().scrollLeft - oldScrollPosition;
    };
    // gets called by rowRenderer when new data loaded, as it will want to scroll to the top
    GridBodyScrollFeature.prototype.scrollToTop = function () {
        this.eBodyViewport.scrollTop = 0;
    };
    // Valid values for position are bottom, middle and top
    GridBodyScrollFeature.prototype.ensureNodeVisible = function (comparator, position) {
        if (position === void 0) { position = null; }
        // look for the node index we want to display
        var rowCount = this.rowModel.getRowCount();
        var comparatorIsAFunction = typeof comparator === 'function';
        var indexToSelect = -1;
        // go through all the nodes, find the one we want to show
        for (var i = 0; i < rowCount; i++) {
            var node = this.rowModel.getRow(i);
            if (comparatorIsAFunction) {
                if (comparator(node)) {
                    indexToSelect = i;
                    break;
                }
            }
            else {
                // check object equality against node and data
                if (comparator === node || comparator === node.data) {
                    indexToSelect = i;
                    break;
                }
            }
        }
        if (indexToSelect >= 0) {
            this.ensureIndexVisible(indexToSelect, position);
        }
    };
    // Valid values for position are bottom, middle and top
    // position should be {'top','middle','bottom', or undefined/null}.
    // if undefined/null, then the grid will to the minimal amount of scrolling,
    // eg if grid needs to scroll up, it scrolls until row is on top,
    //    if grid needs to scroll down, it scrolls until row is on bottom,
    //    if row is already in view, grid does not scroll
    GridBodyScrollFeature.prototype.ensureIndexVisible = function (index, position) {
        // if for print or auto height, everything is always visible
        if (this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT) {
            return;
        }
        var rowCount = this.paginationProxy.getRowCount();
        if (typeof index !== 'number' || index < 0 || index >= rowCount) {
            console.warn('invalid row index for ensureIndexVisible: ' + index);
            return;
        }
        var isPaging = this.gridOptionsWrapper.isPagination();
        var paginationPanelEnabled = isPaging && !this.gridOptionsWrapper.isSuppressPaginationPanel();
        if (!paginationPanelEnabled) {
            this.paginationProxy.goToPageWithIndex(index);
        }
        var rowNode = this.paginationProxy.getRow(index);
        var rowGotShiftedDuringOperation;
        do {
            var startingRowTop = rowNode.rowTop;
            var startingRowHeight = rowNode.rowHeight;
            var paginationOffset = this.paginationProxy.getPixelOffset();
            var rowTopPixel = rowNode.rowTop - paginationOffset;
            var rowBottomPixel = rowTopPixel + rowNode.rowHeight;
            var scrollPosition = this.getVScrollPosition();
            var heightOffset = this.heightScaler.getDivStretchOffset();
            var vScrollTop = scrollPosition.top + heightOffset;
            var vScrollBottom = scrollPosition.bottom + heightOffset;
            var viewportHeight = vScrollBottom - vScrollTop;
            // work out the pixels for top, middle and bottom up front,
            // make the if/else below easier to read
            var pxTop = this.heightScaler.getScrollPositionForPixel(rowTopPixel);
            var pxBottom = this.heightScaler.getScrollPositionForPixel(rowBottomPixel - viewportHeight);
            // make sure if middle, the row is not outside the top of the grid
            var pxMiddle = Math.min((pxTop + pxBottom) / 2, rowTopPixel);
            var rowBelowViewport = vScrollTop > rowTopPixel;
            var rowAboveViewport = vScrollBottom < rowBottomPixel;
            var newScrollPosition = null;
            if (position === 'top') {
                newScrollPosition = pxTop;
            }
            else if (position === 'bottom') {
                newScrollPosition = pxBottom;
            }
            else if (position === 'middle') {
                newScrollPosition = pxMiddle;
            }
            else if (rowBelowViewport) {
                // if row is before, scroll up with row at top
                newScrollPosition = pxTop;
            }
            else if (rowAboveViewport) {
                // if row is below, scroll down with row at bottom
                newScrollPosition = pxBottom;
            }
            if (newScrollPosition !== null) {
                this.eBodyViewport.scrollTop = newScrollPosition;
                this.rowRenderer.redrawAfterScroll();
            }
            // the row can get shifted if during the rendering (during rowRenderer.redrawAfterScroll()),
            // the height of a row changes due to lazy calculation of row heights when using
            // colDef.autoHeight or gridOptions.getRowHeight.
            // if row was shifted, then the position we scrolled to is incorrect.
            rowGotShiftedDuringOperation = (startingRowTop !== rowNode.rowTop)
                || (startingRowHeight !== rowNode.rowHeight);
        } while (rowGotShiftedDuringOperation);
        // so when we return back to user, the cells have rendered
        this.animationFrameService.flushAllFrames();
    };
    GridBodyScrollFeature.prototype.ensureColumnVisible = function (key) {
        var column = this.columnController.getGridColumn(key);
        if (!column) {
            return;
        }
        if (column.isPinned()) {
            console.warn('calling ensureIndexVisible on a ' + column.getPinned() + ' pinned column doesn\'t make sense for column ' + column.getColId());
            return;
        }
        if (!this.columnController.isColumnDisplayed(column)) {
            console.warn('column is not currently visible');
            return;
        }
        var colLeftPixel = column.getLeft();
        var colRightPixel = colLeftPixel + column.getActualWidth();
        var viewportWidth = this.centerRowContainerCon.getCenterWidth();
        var scrollPosition = this.centerRowContainerCon.getCenterViewportScrollLeft();
        var bodyWidth = this.columnController.getBodyContainerWidth();
        var viewportLeftPixel;
        var viewportRightPixel;
        // the logic of working out left and right viewport px is both here and in the ColumnController,
        // need to refactor it out to one place
        if (this.enableRtl) {
            viewportLeftPixel = bodyWidth - scrollPosition - viewportWidth;
            viewportRightPixel = bodyWidth - scrollPosition;
        }
        else {
            viewportLeftPixel = scrollPosition;
            viewportRightPixel = viewportWidth + scrollPosition;
        }
        var viewportScrolledPastCol = viewportLeftPixel > colLeftPixel;
        var viewportScrolledBeforeCol = viewportRightPixel < colRightPixel;
        var colToSmallForViewport = viewportWidth < column.getActualWidth();
        var alignColToLeft = viewportScrolledPastCol || colToSmallForViewport;
        var alignColToRight = viewportScrolledBeforeCol;
        if (alignColToLeft || alignColToRight) {
            var newScrollPosition = void 0;
            if (this.enableRtl) {
                newScrollPosition = alignColToLeft ? (bodyWidth - viewportWidth - colLeftPixel) : (bodyWidth - colRightPixel);
            }
            else {
                newScrollPosition = alignColToLeft ? colLeftPixel : (colRightPixel - viewportWidth);
            }
            this.centerRowContainerCon.setCenterViewportScrollLeft(newScrollPosition);
        }
        else {
            // otherwise, col is already in view, so do nothing
        }
        // this will happen anyway, as the move will cause a 'scroll' event on the body, however
        // it is possible that the ensureColumnVisible method is called from within AG Grid and
        // the caller will need to have the columns rendered to continue, which will be before
        // the event has been worked on (which is the case for cell navigation).
        this.centerRowContainerCon.onHorizontalViewportChanged();
        // so when we return back to user, the cells have rendered
        this.animationFrameService.flushAllFrames();
    };
    __decorate([
        Autowired('controllersService')
    ], GridBodyScrollFeature.prototype, "controllersService", void 0);
    __decorate([
        Autowired('animationFrameService')
    ], GridBodyScrollFeature.prototype, "animationFrameService", void 0);
    __decorate([
        Autowired('columnApi')
    ], GridBodyScrollFeature.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridApi')
    ], GridBodyScrollFeature.prototype, "gridApi", void 0);
    __decorate([
        Autowired('paginationProxy')
    ], GridBodyScrollFeature.prototype, "paginationProxy", void 0);
    __decorate([
        Autowired('rowModel')
    ], GridBodyScrollFeature.prototype, "rowModel", void 0);
    __decorate([
        Autowired('rowContainerHeightService')
    ], GridBodyScrollFeature.prototype, "heightScaler", void 0);
    __decorate([
        Autowired('rowRenderer')
    ], GridBodyScrollFeature.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired('columnController')
    ], GridBodyScrollFeature.prototype, "columnController", void 0);
    __decorate([
        PostConstruct
    ], GridBodyScrollFeature.prototype, "postConstruct", null);
    return GridBodyScrollFeature;
}(BeanStub));
export { GridBodyScrollFeature };
