import { Autowired, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { getInnerHeight, getScrollLeft, isRtlNegativeScroll, setScrollLeft } from "../utils/dom";
import { CtrlsService } from "../ctrlsService";
import { Events } from "../eventKeys";
import { debounce } from "../utils/function";
import { BodyScrollEvent, BodyScrollEndEvent } from "../events";
import { isIOSUserAgent } from "../utils/browser";
import { AnimationFrameService } from "../misc/animationFrameService";
import { PaginationProxy } from "../pagination/paginationProxy";
import { IRowModel } from "../interfaces/iRowModel";
import { RowContainerHeightService } from "../rendering/rowContainerHeightService";
import { RowRenderer } from "../rendering/rowRenderer";
import { ColumnModel } from "../columns/columnModel";
import { RowContainerCtrl } from "./rowContainer/rowContainerCtrl";
import { Column } from "../entities/column";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { IRowNode } from "../interfaces/iRowNode";

type ScrollDirection = 'horizontal' | 'vertical';

export class GridBodyScrollFeature extends BeanStub {

    @Autowired('ctrlsService') public ctrlsService: CtrlsService;
    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('rowContainerHeightService') private heightScaler: RowContainerHeightService;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('columnModel') private columnModel: ColumnModel;

    private enableRtl: boolean;

    private eLastHScroll: HTMLElement | undefined | null;
    private eLastVScroll: HTMLElement | undefined | null;

    private eBodyViewport: HTMLElement;

    private scrollLeft = -1;
    private nextScrollTop = -1;
    private scrollTop = -1;

    private scrollTimer: number | undefined;

    private readonly resetLastHScrollDebounced: () => void;
    private readonly resetLastVScrollDebounced: () => void;

    private centerRowContainerCtrl: RowContainerCtrl;

    constructor(eBodyViewport: HTMLElement) {
        super();
        this.eBodyViewport = eBodyViewport;
        this.resetLastHScrollDebounced = debounce(() => this.eLastHScroll = null, 500);
        this.resetLastVScrollDebounced = debounce(() => this.eLastVScroll = null, 500);
    }

    @PostConstruct
    private postConstruct(): void {
        this.enableRtl = this.gridOptionsService.is('enableRtl');
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));

        this.ctrlsService.whenReady(p => {
            this.centerRowContainerCtrl = p.centerRowContainerCtrl;
            this.onDisplayedColumnsWidthChanged();
            this.addScrollListener();
        });
    }

    private addScrollListener() {
        const fakeHScroll = this.ctrlsService.getFakeHScrollComp();
        const fakeVScroll = this.ctrlsService.getFakeVScrollComp();

        this.addManagedListener(this.centerRowContainerCtrl.getViewportElement(), 'scroll', this.onHScroll.bind(this));
        this.addManagedListener(fakeHScroll.getViewport(), 'scroll', this.onFakeHScroll.bind(this));

        const isDebounce = this.gridOptionsService.is('debounceVerticalScrollbar');

        const onVScroll = isDebounce ?
            debounce(this.onVScroll.bind(this), 100) : this.onVScroll.bind(this);
        const onFakeVScroll = isDebounce ?
            debounce(this.onFakeVScroll.bind(this), 100) : this.onFakeVScroll.bind(this);

        this.addManagedListener(this.eBodyViewport, 'scroll', onVScroll);
        this.addManagedListener(fakeVScroll.getViewport(), 'scroll', onFakeVScroll);
    }

    private onDisplayedColumnsWidthChanged(): void {
        if (this.enableRtl) {
            // because RTL is all backwards, a change in the width of the row
            // can cause a change in the scroll position, without a scroll event,
            // because the scroll position in RTL is a function that depends on
            // the width. to be convinced of this, take out this line, enable RTL,
            // scroll all the way to the left and then resize a column
            this.horizontallyScrollHeaderCenterAndFloatingCenter();
        }
    }

    public horizontallyScrollHeaderCenterAndFloatingCenter(scrollLeft?: number): void {
        // when doing RTL, this method gets called once prematurely
        const notYetInitialised = this.centerRowContainerCtrl == null;
        if (notYetInitialised) { return; }

        if (scrollLeft === undefined) {
            scrollLeft = this.centerRowContainerCtrl.getCenterViewportScrollLeft();
        }

        const offset = this.enableRtl ? scrollLeft : -scrollLeft;
        const topCenterContainer = this.ctrlsService.getTopCenterRowContainerCtrl();
        const stickyTopCenterContainer = this.ctrlsService.getStickyTopCenterRowContainerCtrl();
        const bottomCenterContainer = this.ctrlsService.getBottomCenterRowContainerCtrl();
        const fakeHScroll = this.ctrlsService.getFakeHScrollComp();
        const centerHeaderContainer = this.ctrlsService.getHeaderRowContainerCtrl();

        centerHeaderContainer.setHorizontalScroll(-offset);
        bottomCenterContainer.setContainerTranslateX(offset);
        topCenterContainer.setContainerTranslateX(offset);
        stickyTopCenterContainer.setContainerTranslateX(offset);

        const centerViewport = this.centerRowContainerCtrl.getViewportElement();
        const isCenterViewportLastHorizontal = this.eLastHScroll === centerViewport;

        const partner = isCenterViewportLastHorizontal ?
            fakeHScroll.getViewport() :
            this.centerRowContainerCtrl.getViewportElement();

        setScrollLeft(partner, Math.abs(scrollLeft), this.enableRtl);
    }

    private isControllingHScroll(eDiv: HTMLElement): boolean {
        if (!this.eLastHScroll) {
            this.eLastHScroll = eDiv;
            return true;
        }

        return eDiv === this.eLastHScroll;
    }

    private isControllingVScroll(eDiv: HTMLElement): boolean {
        if (!this.eLastVScroll) {
            this.eLastVScroll = eDiv;
            return true;
        }

        return eDiv === this.eLastVScroll;
    }

    private onFakeHScroll(): void {
        const fakeHScrollViewport = this.ctrlsService.getFakeHScrollComp().getViewport();
        if (!this.isControllingHScroll(fakeHScrollViewport)) { return; }
        this.onHScrollCommon(fakeHScrollViewport);
    }

    private onHScroll(): void {
        const centerContainerViewport = this.centerRowContainerCtrl.getViewportElement();
        if (!this.isControllingHScroll(centerContainerViewport)) { return; }
        this.onHScrollCommon(centerContainerViewport);
    }

    private onHScrollCommon(eSource: HTMLElement): void {
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
        this.doHorizontalScroll(Math.round(getScrollLeft(eSource, this.enableRtl)));
        this.resetLastHScrollDebounced();
    }

    private onFakeVScroll(): void {
        const fakeVScrollViewport = this.ctrlsService.getFakeVScrollComp().getViewport();
        if (!this.isControllingVScroll(fakeVScrollViewport)) { return; }
        this.onVScrollCommon(fakeVScrollViewport);
    }

    private onVScroll(): void {
        if (!this.isControllingVScroll(this.eBodyViewport)) { return; }
        this.onVScrollCommon(this.eBodyViewport);
    }

    private onVScrollCommon(eSource: HTMLElement): void {
        const scrollTop: number = eSource.scrollTop;

        if (this.shouldBlockScrollUpdate('vertical', scrollTop, true)) { return; }
        this.animationFrameService.setScrollTop(scrollTop);
        this.nextScrollTop = scrollTop;

        if (eSource === this.eBodyViewport) {
            const fakeVScrollViewport = this.ctrlsService.getFakeVScrollComp().getViewport();
            fakeVScrollViewport.scrollTop = scrollTop;
        } else {
            this.eBodyViewport.scrollTop = scrollTop;
        }

        // the `scrollGridIfNeeded` will recalculate the rows to be rendered by the grid
        // so it should only be called after `eBodyViewport` has been scrolled to the correct
        // position, otherwise the `first` and `last` row could be miscalculated.
        if (this.gridOptionsService.is('suppressAnimationFrame')) {
            this.scrollGridIfNeeded();
        } else {
            this.animationFrameService.schedule();
        }

        this.resetLastVScrollDebounced();
    }

    private doHorizontalScroll(scrollLeft: number): void {
        const fakeHScrollViewport = this.ctrlsService.getFakeHScrollComp().getViewport();
        const fakeScrollLeft = getScrollLeft(fakeHScrollViewport, this.enableRtl);

        if (this.scrollLeft === scrollLeft && scrollLeft === fakeScrollLeft) { return; }

        this.scrollLeft = scrollLeft;

        this.fireScrollEvent('horizontal');
        this.horizontallyScrollHeaderCenterAndFloatingCenter(scrollLeft);
        this.onHorizontalViewportChanged();
    }

    private fireScrollEvent(direction: 'horizontal' | 'vertical'): void {
        const bodyScrollEvent: WithoutGridCommon<BodyScrollEvent> = {
            type: Events.EVENT_BODY_SCROLL,
            direction,
            left: this.scrollLeft,
            top: this.scrollTop
        };

        this.eventService.dispatchEvent(bodyScrollEvent);

        window.clearTimeout(this.scrollTimer);
        this.scrollTimer = undefined;

        this.scrollTimer = window.setTimeout(() => {
            const bodyScrollEndEvent: WithoutGridCommon<BodyScrollEndEvent> = {
                ...bodyScrollEvent,
                type: Events.EVENT_BODY_SCROLL_END
            };

            this.eventService.dispatchEvent(bodyScrollEndEvent);
        }, 100);
    }

    private shouldBlockScrollUpdate(direction: ScrollDirection, scrollTo: number, touchOnly: boolean = false): boolean {
        // touch devices allow elastic scroll - which temporally scrolls the panel outside of the viewport
        // (eg user uses touch to go to the left of the grid, but drags past the left, the rows will actually
        // scroll past the left until the user releases the mouse). when this happens, we want ignore the scroll,
        // as otherwise it was causing the rows and header to flicker.

        // sometimes when scrolling, we got values that extended the maximum scroll allowed. we used to
        // ignore these scrolls. problem is the max scroll position could be skipped (eg the previous scroll event
        // could be 10px before the max position, and then current scroll event could be 20px after the max position).
        // if we just ignored the last event, we would be setting the scroll to 10px before the max position, when in
        // actual fact the user has exceeded the max scroll and thus scroll should be set to the max.

        if (touchOnly && !isIOSUserAgent()) { return false; }

        if (direction === 'vertical') {
            return this.shouldBlockVerticalScroll(scrollTo)
        }

        return this.shouldBlockHorizontalScroll(scrollTo);
    }

    private shouldBlockVerticalScroll(scrollTo: number): boolean {
        const clientHeight = getInnerHeight(this.eBodyViewport);
        const { scrollHeight } = this.eBodyViewport;

        if (scrollTo < 0 || (scrollTo + clientHeight > scrollHeight)) {
            return true;
        }

        return false;
    }

    private shouldBlockHorizontalScroll(scrollTo: number): boolean {
        const clientWidth = this.centerRowContainerCtrl.getCenterWidth();
        const { scrollWidth } = this.centerRowContainerCtrl.getViewportElement();

        if (this.enableRtl && isRtlNegativeScroll()) {
            if (scrollTo > 0) { return true; }
        } else if (scrollTo < 0) { return true; }

        if (Math.abs(scrollTo) + clientWidth > scrollWidth) {
            return true;
        }

        return false;
    }

    private redrawRowsAfterScroll(): void {
        this.fireScrollEvent('vertical');
    }

    private onHorizontalViewportChanged(): void {
        this.centerRowContainerCtrl.onHorizontalViewportChanged();
    }

    // this is to cater for AG-3274, where grid is removed from the dom and then inserted back in again.
    // (which happens with some implementations of tabbing). this can result in horizontal scroll getting
    // reset back to the left, however no scroll event is fired. so we need to get header to also scroll
    // back to the left to be kept in sync.
    // adding and removing the grid from the DOM both resets the scroll position and
    // triggers a resize event, so notify listeners if the scroll position has changed
    public checkScrollLeft(): void {
        if (this.scrollLeft !== this.centerRowContainerCtrl.getCenterViewportScrollLeft()) {
            this.onHScrollCommon(this.centerRowContainerCtrl.getViewportElement());
        }
    }

    public scrollGridIfNeeded(): boolean {
        const frameNeeded = this.scrollTop != this.nextScrollTop;

        if (frameNeeded) {
            this.scrollTop = this.nextScrollTop;
            this.redrawRowsAfterScroll();
        }

        return frameNeeded;
    }

    // called by scrollHorizontally method and alignedGridsService
    public setHorizontalScrollPosition(hScrollPosition: number): void {
        const minScrollLeft = 0;
        const maxScrollLeft = this.centerRowContainerCtrl.getViewportElement().scrollWidth - this.centerRowContainerCtrl.getCenterWidth();

        if (this.shouldBlockScrollUpdate('horizontal', hScrollPosition)) {
            if (this.enableRtl && isRtlNegativeScroll()) {
                hScrollPosition = hScrollPosition > 0 ? 0 : maxScrollLeft;
            } else {
                hScrollPosition = Math.min(Math.max(hScrollPosition, minScrollLeft), maxScrollLeft);
            }
        }

        setScrollLeft(this.centerRowContainerCtrl.getViewportElement(), Math.abs(hScrollPosition), this.enableRtl);

        // we need to manually do the event handling (rather than wait for the event)
        // for the alignedGridsService, as if we don't, the aligned grid service gets
        // notified async, and then it's 'consuming' flag doesn't get used right, and
        // we can end up with an infinite loop
        this.doHorizontalScroll(hScrollPosition);
    }

    public setVerticalScrollPosition(vScrollPosition: number): void {
        this.eBodyViewport.scrollTop = vScrollPosition;
    }

    public getVScrollPosition(): { top: number, bottom: number; } {
        const result = {
            top: this.eBodyViewport.scrollTop,
            bottom: this.eBodyViewport.scrollTop + this.eBodyViewport.offsetHeight
        };
        return result;
    }

    public getHScrollPosition(): { left: number, right: number; } {
        return this.centerRowContainerCtrl.getHScrollPosition();
    }

    public isHorizontalScrollShowing(): boolean {
        return this.centerRowContainerCtrl.isHorizontalScrollShowing();
    }

    // called by the headerRootComp and moveColumnController
    public scrollHorizontally(pixels: number): number {
        const oldScrollPosition = this.centerRowContainerCtrl.getViewportElement().scrollLeft;

        this.setHorizontalScrollPosition(oldScrollPosition + pixels);
        return this.centerRowContainerCtrl.getViewportElement().scrollLeft - oldScrollPosition;
    }

    // gets called by rowRenderer when new data loaded, as it will want to scroll to the top
    public scrollToTop(): void {
        this.eBodyViewport.scrollTop = 0;
    }

    // Valid values for position are bottom, middle and top
    public ensureNodeVisible<TData = any>(
        comparator: TData | IRowNode<TData> | ((row: IRowNode<TData>) => boolean),
        position: 'top' | 'bottom' | 'middle' | null = null
    ) {
        // look for the node index we want to display
        const rowCount = this.rowModel.getRowCount();
        let indexToSelect = -1;
        // go through all the nodes, find the one we want to show
        for (let i = 0; i < rowCount; i++) {
            const node = this.rowModel.getRow(i);
            if (typeof comparator === 'function') {
                // Have to assert type here, as type could be TData & Function
                const predicate = comparator as ((row: IRowNode<TData>) => boolean);
                if (node && predicate(node)) {
                    indexToSelect = i;
                    break;
                }
            } else {
                // check object equality against node and data
                if (comparator === node || comparator === node!.data) {
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
    public ensureIndexVisible(index: number, position?: 'top' | 'bottom' | 'middle' | null) {
        // if for print or auto height, everything is always visible
        if (this.gridOptionsService.isDomLayout('print')) { return; }

        const rowCount = this.paginationProxy.getRowCount();

        if (typeof index !== 'number' || index < 0 || index >= rowCount) {
            console.warn('AG Grid: Invalid row index for ensureIndexVisible: ' + index);
            return;
        }

        const isPaging = this.gridOptionsService.is('pagination');
        const paginationPanelEnabled = isPaging && !this.gridOptionsService.is('suppressPaginationPanel');

        if (!paginationPanelEnabled) {
            this.paginationProxy.goToPageWithIndex(index);
        }

        const gridBodyCtrl = this.ctrlsService.getGridBodyCtrl();
        const stickyTopHeight = gridBodyCtrl.getStickyTopHeight();

        const rowNode = this.paginationProxy.getRow(index);
        let rowGotShiftedDuringOperation: boolean;

        do {
            const startingRowTop = rowNode!.rowTop;
            const startingRowHeight = rowNode!.rowHeight;

            const paginationOffset = this.paginationProxy.getPixelOffset();
            const rowTopPixel = rowNode!.rowTop! - paginationOffset;
            const rowBottomPixel = rowTopPixel + rowNode!.rowHeight!;

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

            let newScrollPosition: number | null = null;

            if (position === 'top') {
                newScrollPosition = pxTop;
            } else if (position === 'bottom') {
                newScrollPosition = pxBottom;
            } else if (position === 'middle') {
                newScrollPosition = pxMiddle;
            } else if (rowAboveViewport) {
                // if row is before, scroll up with row at top
                newScrollPosition = pxTop - stickyTopHeight;
            } else if (rowBelowViewport) {
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
            rowGotShiftedDuringOperation = (startingRowTop !== rowNode!.rowTop)
                || (startingRowHeight !== rowNode!.rowHeight);

        } while (rowGotShiftedDuringOperation);

        // so when we return back to user, the cells have rendered
        this.animationFrameService.flushAllFrames();
    }

    public ensureColumnVisible(key: any, position: 'auto' | 'start' | 'middle' | 'end' = 'auto'): void {
        const column = this.columnModel.getGridColumn(key);

        if (!column) { return; }

        // calling ensureColumnVisible on a pinned column doesn't make sense
        if (column.isPinned()) { return; }

        // defensive
        if (!this.columnModel.isColumnDisplayed(column)) { return; }

        const newHorizontalScroll: number | null = this.getPositionedHorizontalScroll(column, position);

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

    private getPositionedHorizontalScroll(column: Column, position: 'auto' | 'start' | 'middle' | 'end'): number | null {
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
                return isRtl ?  colRight : colLeft;
            }

            return isRtl ? (colLeft - viewportWidth) : (colRight - viewportWidth);
        }

        return null;
    }

    private isColumnOutsideViewport(column: Column): { columnBeforeStart: boolean, columnAfterEnd: boolean } {
        const { start: viewportStart, end: viewportEnd } = this.getViewportBounds();
        const { colLeft, colRight } = this.getColumnBounds(column);

        const isRtl = this.enableRtl;

        const columnBeforeStart = isRtl ? (viewportStart > colRight) : (viewportEnd < colRight);
        const columnAfterEnd = isRtl ? (viewportEnd < colLeft) : (viewportStart > colLeft);

        return { columnBeforeStart, columnAfterEnd };
    }

    private getColumnBounds(column: Column): { colLeft: number, colMiddle: number, colRight: number } {
        const isRtl = this.enableRtl;
        const bodyWidth = this.columnModel.getBodyContainerWidth();
        const colWidth = column.getActualWidth();
        const colLeft = column.getLeft()!;
        const multiplier = isRtl ? -1 : 1;

        const colLeftPixel = isRtl ? (bodyWidth - colLeft) : colLeft;
        const colRightPixel = colLeftPixel + colWidth * multiplier;
        const colMidPixel = colLeftPixel + colWidth / 2 * multiplier;

        return { colLeft: colLeftPixel, colMiddle: colMidPixel, colRight: colRightPixel };
    }

    private getViewportBounds(): { start: number, end: number, width: number } {
        const viewportWidth = this.centerRowContainerCtrl.getCenterWidth();
        const scrollPosition = this.centerRowContainerCtrl.getCenterViewportScrollLeft();

        const viewportStartPixel = scrollPosition;
        const viewportEndPixel = viewportWidth + scrollPosition;

        return { start: viewportStartPixel, end: viewportEndPixel, width: viewportWidth };
    }
}