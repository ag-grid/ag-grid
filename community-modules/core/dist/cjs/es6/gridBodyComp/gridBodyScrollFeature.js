/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
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
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
const dom_1 = require("../utils/dom");
const eventKeys_1 = require("../eventKeys");
const function_1 = require("../utils/function");
const browser_1 = require("../utils/browser");
const constants_1 = require("../constants/constants");
class GridBodyScrollFeature extends beanStub_1.BeanStub {
    constructor(eBodyViewport) {
        super();
        this.scrollLeft = -1;
        this.nextScrollTop = -1;
        this.scrollTop = -1;
        this.eBodyViewport = eBodyViewport;
        this.resetLastHorizontalScrollElementDebounced = function_1.debounce(this.resetLastHorizontalScrollElement.bind(this), 500);
    }
    postConstruct() {
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));
        this.ctrlsService.whenReady(p => {
            this.centerRowContainerCtrl = p.centerRowContainerCtrl;
            this.onDisplayedColumnsWidthChanged();
            this.addScrollListener();
        });
    }
    addScrollListener() {
        const fakeHScroll = this.ctrlsService.getFakeHScrollCtrl();
        this.addManagedListener(this.centerRowContainerCtrl.getViewportElement(), 'scroll', this.onCenterViewportScroll.bind(this));
        this.addManagedListener(fakeHScroll.getViewport(), 'scroll', this.onFakeHorizontalScroll.bind(this));
        const onVerticalScroll = this.gridOptionsWrapper.isDebounceVerticalScrollbar() ?
            function_1.debounce(this.onVerticalScroll.bind(this), 100)
            : this.onVerticalScroll.bind(this);
        this.addManagedListener(this.eBodyViewport, 'scroll', onVerticalScroll);
    }
    onDisplayedColumnsWidthChanged() {
        if (this.enableRtl) {
            // because RTL is all backwards, a change in the width of the row
            // can cause a change in the scroll position, without a scroll event,
            // because the scroll position in RTL is a function that depends on
            // the width. to be convinced of this, take out this line, enable RTL,
            // scroll all the way to the left and then resize a column
            this.horizontallyScrollHeaderCenterAndFloatingCenter();
        }
    }
    horizontallyScrollHeaderCenterAndFloatingCenter(scrollLeft) {
        // when doing RTL, this method gets called once prematurely
        const notYetInitialised = this.centerRowContainerCtrl == null;
        if (notYetInitialised) {
            return;
        }
        if (scrollLeft === undefined) {
            scrollLeft = this.centerRowContainerCtrl.getCenterViewportScrollLeft();
        }
        const offset = this.enableRtl ? scrollLeft : -scrollLeft;
        const topCenterContainer = this.ctrlsService.getTopCenterRowContainerCtrl();
        const stickyTopCenterContainer = this.ctrlsService.getStickyTopCenterRowContainerCtrl();
        const bottomCenterContainer = this.ctrlsService.getBottomCenterRowContainerCtrl();
        const fakeHScroll = this.ctrlsService.getFakeHScrollCtrl();
        const centerHeaderContainer = this.ctrlsService.getHeaderRowContainerCtrl();
        centerHeaderContainer.setHorizontalScroll(offset);
        bottomCenterContainer.setContainerTranslateX(offset);
        topCenterContainer.setContainerTranslateX(offset);
        stickyTopCenterContainer.setContainerTranslateX(offset);
        const centerViewport = this.centerRowContainerCtrl.getViewportElement();
        const isCenterViewportLastHorizontal = this.lastHorizontalScrollElement === centerViewport;
        const partner = isCenterViewportLastHorizontal ?
            fakeHScroll.getViewport() :
            this.centerRowContainerCtrl.getViewportElement();
        dom_1.setScrollLeft(partner, Math.abs(scrollLeft), this.enableRtl);
    }
    isControllingScroll(eDiv) {
        if (!this.lastHorizontalScrollElement) {
            this.lastHorizontalScrollElement = eDiv;
            return true;
        }
        return eDiv === this.lastHorizontalScrollElement;
    }
    onFakeHorizontalScroll() {
        const fakeHScrollViewport = this.ctrlsService.getFakeHScrollCtrl().getViewport();
        if (!this.isControllingScroll(fakeHScrollViewport)) {
            return;
        }
        this.onBodyHorizontalScroll(fakeHScrollViewport);
    }
    onCenterViewportScroll() {
        const centerContainerViewport = this.centerRowContainerCtrl.getViewportElement();
        if (!this.isControllingScroll(centerContainerViewport)) {
            return;
        }
        this.onBodyHorizontalScroll(centerContainerViewport);
    }
    onBodyHorizontalScroll(eSource) {
        const centerContainerViewport = this.centerRowContainerCtrl.getViewportElement();
        const { scrollLeft } = centerContainerViewport;
        if (this.shouldBlockScrollUpdate('horizontal', scrollLeft, true)) {
            return;
        }
        // we do Math.round() rather than Math.floor(), to mirror how scroll values are applied.
        // eg if a scale is applied (ie user has zoomed the browser), then applying scroll=200
        // could result in 199.88, which then floor(199.88) = 199, however round(199.88) = 200.
        // initially Math.floor() was used, however this caused (almost) infinite loop with aligned grids,
        // as the scroll would move 1px at at time bouncing from one grid to the next (eg one grid would cause
        // scroll to 200px, the next to 199px, then the first back to 198px and so on).
        this.doHorizontalScroll(Math.round(dom_1.getScrollLeft(eSource, this.enableRtl)));
        this.resetLastHorizontalScrollElementDebounced();
    }
    onVerticalScroll() {
        const scrollTop = this.eBodyViewport.scrollTop;
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
    }
    resetLastHorizontalScrollElement() {
        this.lastHorizontalScrollElement = null;
    }
    doHorizontalScroll(scrollLeft) {
        const fakeHScrollViewport = this.ctrlsService.getFakeHScrollCtrl().getViewport();
        const fakeScrollLeft = dom_1.getScrollLeft(fakeHScrollViewport, this.enableRtl);
        if (this.scrollLeft === scrollLeft && scrollLeft === fakeScrollLeft) {
            return;
        }
        this.scrollLeft = scrollLeft;
        this.fireScrollEvent('horizontal');
        this.horizontallyScrollHeaderCenterAndFloatingCenter(scrollLeft);
        this.onHorizontalViewportChanged();
    }
    fireScrollEvent(direction) {
        const bodyScrollEvent = {
            type: eventKeys_1.Events.EVENT_BODY_SCROLL,
            direction,
            left: this.scrollLeft,
            top: this.scrollTop
        };
        this.eventService.dispatchEvent(bodyScrollEvent);
        window.clearTimeout(this.scrollTimer);
        this.scrollTimer = undefined;
        this.scrollTimer = window.setTimeout(() => {
            const bodyScrollEndEvent = Object.assign({}, bodyScrollEvent, {
                type: eventKeys_1.Events.EVENT_BODY_SCROLL_END
            });
            this.eventService.dispatchEvent(bodyScrollEndEvent);
        }, 100);
    }
    shouldBlockScrollUpdate(direction, scrollTo, touchOnly = false) {
        // touch devices allow elastic scroll - which temporally scrolls the panel outside of the viewport
        // (eg user uses touch to go to the left of the grid, but drags past the left, the rows will actually
        // scroll past the left until the user releases the mouse). when this happens, we want ignore the scroll,
        // as otherwise it was causing the rows and header to flicker.
        // sometimes when scrolling, we got values that extended the maximum scroll allowed. we used to
        // ignore these scrolls. problem is the max scroll position could be skipped (eg the previous scroll event
        // could be 10px before the max position, and then current scroll event could be 20px after the max position).
        // if we just ignored the last event, we would be setting the scroll to 10px before the max position, when in
        // actual fact the user has exceeded the max scroll and thus scroll should be set to the max.
        if (touchOnly && !browser_1.isIOSUserAgent()) {
            return false;
        }
        if (direction === 'vertical') {
            const clientHeight = dom_1.getInnerHeight(this.eBodyViewport);
            const { scrollHeight } = this.eBodyViewport;
            if (scrollTo < 0 || (scrollTo + clientHeight > scrollHeight)) {
                return true;
            }
        }
        if (direction === 'horizontal') {
            const clientWidth = this.centerRowContainerCtrl.getCenterWidth();
            const { scrollWidth } = this.centerRowContainerCtrl.getViewportElement();
            if (this.enableRtl && dom_1.isRtlNegativeScroll()) {
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
    }
    redrawRowsAfterScroll() {
        this.fireScrollEvent('vertical');
    }
    onHorizontalViewportChanged() {
        this.centerRowContainerCtrl.onHorizontalViewportChanged();
    }
    // this is to cater for AG-3274, where grid is removed from the dom and then inserted back in again.
    // (which happens with some implementations of tabbing). this can result in horizontal scroll getting
    // reset back to the left, however no scroll event is fired. so we need to get header to also scroll
    // back to the left to be kept in sync.
    // adding and removing the grid from the DOM both resets the scroll position and
    // triggers a resize event, so notify listeners if the scroll position has changed
    checkScrollLeft() {
        if (this.scrollLeft !== this.centerRowContainerCtrl.getCenterViewportScrollLeft()) {
            this.onBodyHorizontalScroll(this.centerRowContainerCtrl.getViewportElement());
        }
    }
    executeAnimationFrameScroll() {
        const frameNeeded = this.scrollTop != this.nextScrollTop;
        if (frameNeeded) {
            this.scrollTop = this.nextScrollTop;
            this.redrawRowsAfterScroll();
        }
        return frameNeeded;
    }
    // called by scrollHorizontally method and alignedGridsService
    setHorizontalScrollPosition(hScrollPosition) {
        const minScrollLeft = 0;
        const maxScrollLeft = this.centerRowContainerCtrl.getViewportElement().scrollWidth - this.centerRowContainerCtrl.getCenterWidth();
        if (this.shouldBlockScrollUpdate('horizontal', hScrollPosition)) {
            if (this.enableRtl && dom_1.isRtlNegativeScroll()) {
                hScrollPosition = hScrollPosition > 0 ? 0 : maxScrollLeft;
            }
            else {
                hScrollPosition = Math.min(Math.max(hScrollPosition, minScrollLeft), maxScrollLeft);
            }
        }
        dom_1.setScrollLeft(this.centerRowContainerCtrl.getViewportElement(), Math.abs(hScrollPosition), this.enableRtl);
        // we need to manually do the event handling (rather than wait for the event)
        // for the alignedGridsService, as if we don't, the aligned grid service gets
        // notified async, and then it's 'consuming' flag doesn't get used right, and
        // we can end up with an infinite loop
        this.doHorizontalScroll(hScrollPosition);
    }
    setVerticalScrollPosition(vScrollPosition) {
        this.eBodyViewport.scrollTop = vScrollPosition;
    }
    getVScrollPosition() {
        const result = {
            top: this.eBodyViewport.scrollTop,
            bottom: this.eBodyViewport.scrollTop + this.eBodyViewport.offsetHeight
        };
        return result;
    }
    getHScrollPosition() {
        return this.centerRowContainerCtrl.getHScrollPosition();
    }
    isHorizontalScrollShowing() {
        return this.centerRowContainerCtrl.isHorizontalScrollShowing();
    }
    // called by the headerRootComp and moveColumnController
    scrollHorizontally(pixels) {
        const oldScrollPosition = this.centerRowContainerCtrl.getViewportElement().scrollLeft;
        this.setHorizontalScrollPosition(oldScrollPosition + pixels);
        return this.centerRowContainerCtrl.getViewportElement().scrollLeft - oldScrollPosition;
    }
    // gets called by rowRenderer when new data loaded, as it will want to scroll to the top
    scrollToTop() {
        this.eBodyViewport.scrollTop = 0;
    }
    // Valid values for position are bottom, middle and top
    ensureNodeVisible(comparator, position = null) {
        // look for the node index we want to display
        const rowCount = this.rowModel.getRowCount();
        let indexToSelect = -1;
        // go through all the nodes, find the one we want to show
        for (let i = 0; i < rowCount; i++) {
            const node = this.rowModel.getRow(i);
            if (typeof comparator === 'function') {
                // Have to assert type here, as type could be TData & Function
                const predicate = comparator;
                if (node && predicate(node)) {
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
    }
    // Valid values for position are bottom, middle and top
    // position should be {'top','middle','bottom', or undefined/null}.
    // if undefined/null, then the grid will to the minimal amount of scrolling,
    // eg if grid needs to scroll up, it scrolls until row is on top,
    //    if grid needs to scroll down, it scrolls until row is on bottom,
    //    if row is already in view, grid does not scroll
    ensureIndexVisible(index, position) {
        // if for print or auto height, everything is always visible
        if (this.gridOptionsWrapper.getDomLayout() === constants_1.Constants.DOM_LAYOUT_PRINT) {
            return;
        }
        const rowCount = this.paginationProxy.getRowCount();
        if (typeof index !== 'number' || index < 0 || index >= rowCount) {
            console.warn('invalid row index for ensureIndexVisible: ' + index);
            return;
        }
        const isPaging = this.gridOptionsWrapper.isPagination();
        const paginationPanelEnabled = isPaging && !this.gridOptionsWrapper.isSuppressPaginationPanel();
        if (!paginationPanelEnabled) {
            this.paginationProxy.goToPageWithIndex(index);
        }
        const gridBodyCtrl = this.ctrlsService.getGridBodyCtrl();
        const stickyTopHeight = gridBodyCtrl.getStickyTopHeight();
        const rowNode = this.paginationProxy.getRow(index);
        let rowGotShiftedDuringOperation;
        do {
            const startingRowTop = rowNode.rowTop;
            const startingRowHeight = rowNode.rowHeight;
            const paginationOffset = this.paginationProxy.getPixelOffset();
            const rowTopPixel = rowNode.rowTop - paginationOffset;
            const rowBottomPixel = rowTopPixel + rowNode.rowHeight;
            const scrollPosition = this.getVScrollPosition();
            const heightOffset = this.heightScaler.getDivStretchOffset();
            const vScrollTop = scrollPosition.top + heightOffset;
            const vScrollBottom = scrollPosition.bottom + heightOffset;
            const viewportHeight = vScrollBottom - vScrollTop;
            // work out the pixels for top, middle and bottom up front,
            // make the if/else below easier to read
            const pxTop = this.heightScaler.getScrollPositionForPixel(rowTopPixel);
            const pxBottom = this.heightScaler.getScrollPositionForPixel(rowBottomPixel - viewportHeight);
            // make sure if middle, the row is not outside the top of the grid
            const pxMiddle = Math.min((pxTop + pxBottom) / 2, rowTopPixel);
            const rowAboveViewport = (vScrollTop + stickyTopHeight) > rowTopPixel;
            const rowBelowViewport = vScrollBottom < rowBottomPixel;
            let newScrollPosition = null;
            if (position === 'top') {
                newScrollPosition = pxTop;
            }
            else if (position === 'bottom') {
                newScrollPosition = pxBottom;
            }
            else if (position === 'middle') {
                newScrollPosition = pxMiddle;
            }
            else if (rowAboveViewport) {
                // if row is before, scroll up with row at top
                newScrollPosition = pxTop - stickyTopHeight;
            }
            else if (rowBelowViewport) {
                // if row is after, scroll down with row at bottom
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
    }
    ensureColumnVisible(key, position = 'auto') {
        const column = this.columnModel.getGridColumn(key);
        if (!column) {
            return;
        }
        // calling ensureColumnVisible on a pinned column doesn't make sense
        if (column.isPinned()) {
            return;
        }
        // defensive
        if (!this.columnModel.isColumnDisplayed(column)) {
            return;
        }
        const newHorizontalScroll = this.getPositionedHorizontalScroll(column, position);
        if (newHorizontalScroll !== null) {
            this.centerRowContainerCtrl.setCenterViewportScrollLeft(newHorizontalScroll);
        }
        // this will happen anyway, as the move will cause a 'scroll' event on the body, however
        // it is possible that the ensureColumnVisible method is called from within AG Grid and
        // the caller will need to have the columns rendered to continue, which will be before
        // the event has been worked on (which is the case for cell navigation).
        this.centerRowContainerCtrl.onHorizontalViewportChanged();
        // so when we return back to user, the cells have rendered
        this.animationFrameService.flushAllFrames();
    }
    getPositionedHorizontalScroll(column, position) {
        const { columnBeforeStart, columnAfterEnd } = this.isColumnOutsideViewport(column);
        const viewportTooSmallForColumn = this.centerRowContainerCtrl.getCenterWidth() < column.getActualWidth();
        const viewportWidth = this.centerRowContainerCtrl.getCenterWidth();
        const isRtl = this.enableRtl;
        let alignColToStart = (isRtl ? columnBeforeStart : columnAfterEnd) || viewportTooSmallForColumn;
        let alignColToEnd = isRtl ? columnAfterEnd : columnBeforeStart;
        if (position !== 'auto') {
            alignColToStart = position === 'start';
            alignColToEnd = position === 'end';
        }
        const isMiddle = position === 'middle';
        if (alignColToStart || alignColToEnd || isMiddle) {
            const { colLeft, colMiddle, colRight } = this.getColumnBounds(column);
            if (isMiddle) {
                return colMiddle - viewportWidth / 2;
            }
            if (alignColToStart) {
                return isRtl ? colRight : colLeft;
            }
            return isRtl ? (colLeft - viewportWidth) : (colRight - viewportWidth);
        }
        return null;
    }
    isColumnOutsideViewport(column) {
        const { start: viewportStart, end: viewportEnd } = this.getViewportBounds();
        const { colLeft, colRight } = this.getColumnBounds(column);
        const isRtl = this.enableRtl;
        const columnBeforeStart = isRtl ? (viewportStart > colRight) : (viewportEnd < colRight);
        const columnAfterEnd = isRtl ? (viewportEnd < colLeft) : (viewportStart > colLeft);
        return { columnBeforeStart, columnAfterEnd };
    }
    getColumnBounds(column) {
        const isRtl = this.enableRtl;
        const bodyWidth = this.columnModel.getBodyContainerWidth();
        const colWidth = column.getActualWidth();
        const colLeft = column.getLeft();
        const multiplier = isRtl ? -1 : 1;
        const colLeftPixel = isRtl ? (bodyWidth - colLeft) : colLeft;
        const colRightPixel = colLeftPixel + colWidth * multiplier;
        const colMidPixel = colLeftPixel + colWidth / 2 * multiplier;
        return { colLeft: colLeftPixel, colMiddle: colMidPixel, colRight: colRightPixel };
    }
    getViewportBounds() {
        const viewportWidth = this.centerRowContainerCtrl.getCenterWidth();
        const scrollPosition = this.centerRowContainerCtrl.getCenterViewportScrollLeft();
        const viewportStartPixel = scrollPosition;
        const viewportEndPixel = viewportWidth + scrollPosition;
        return { start: viewportStartPixel, end: viewportEndPixel, width: viewportWidth };
    }
}
__decorate([
    context_1.Autowired('ctrlsService')
], GridBodyScrollFeature.prototype, "ctrlsService", void 0);
__decorate([
    context_1.Autowired('animationFrameService')
], GridBodyScrollFeature.prototype, "animationFrameService", void 0);
__decorate([
    context_1.Autowired('paginationProxy')
], GridBodyScrollFeature.prototype, "paginationProxy", void 0);
__decorate([
    context_1.Autowired('rowModel')
], GridBodyScrollFeature.prototype, "rowModel", void 0);
__decorate([
    context_1.Autowired('rowContainerHeightService')
], GridBodyScrollFeature.prototype, "heightScaler", void 0);
__decorate([
    context_1.Autowired('rowRenderer')
], GridBodyScrollFeature.prototype, "rowRenderer", void 0);
__decorate([
    context_1.Autowired('columnModel')
], GridBodyScrollFeature.prototype, "columnModel", void 0);
__decorate([
    context_1.PostConstruct
], GridBodyScrollFeature.prototype, "postConstruct", null);
exports.GridBodyScrollFeature = GridBodyScrollFeature;
