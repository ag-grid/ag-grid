import {
    Direction,
    _debounce,
    _getInnerHeight,
    _getInnerWidth,
    _getScrollLeft,
    _isIOSUserAgent,
    _setScrollLeft,
} from 'ag-stack';

import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { CtrlsService } from '../ctrlsService';
import type { AgColumn } from '../entities/agColumn';
import type { BodyScrollEvent } from '../events';
import { _isDomLayout } from '../gridOptionsUtils';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { IRowNode, VerticalScrollPosition } from '../interfaces/iRowNode';
import type { AnimationFrameService } from '../misc/animationFrameService';
import { _clamp } from '../utils/number';

const VIEWPORT = 'Viewport';
const FAKE_V_SCROLLBAR = 'fakeVScrollComp';
const HORIZONTAL_SOURCES = ['fakeHScrollComp'] as const;

type VerticalScrollSource = typeof VIEWPORT | typeof FAKE_V_SCROLLBAR;
type HorizontalScrollSource = typeof VIEWPORT | (typeof HORIZONTAL_SOURCES)[number];

// timeout used for the debounceVerticalScrollbar property
const SCROLL_DEBOUNCE_TIMEOUT = 100;
// timeout used to fire onBodyScrollEnd and to reset last scroll source
const SCROLL_END_TIMEOUT = 150;

export interface ScrollPartner {
    eViewport: HTMLElement;
    onScrollCallback(fn: () => void): void;
}

interface VerticalScrollComp extends ScrollPartner {
    getScrollPosition(): number;
    setScrollPosition(value: number, force?: boolean): void;
}

interface HorizontalScrollComp extends ScrollPartner {
    getScrollPosition(): number;
}

export class GridBodyScrollFeature extends BeanStub {
    private ctrlsSvc: CtrlsService;
    private animationFrameSvc?: AnimationFrameService;

    // listeners for when ensureIndexVisible is waiting for SSRM data to load
    private clearRetryListenerFncs: (() => void)[] = [];

    public wireBeans(beans: BeanCollection): void {
        this.ctrlsSvc = beans.ctrlsSvc;
        this.animationFrameSvc = beans.animationFrameSvc;
    }

    private enableRtl: boolean;

    private lastScrollSource: [VerticalScrollSource | null, HorizontalScrollSource | null] = [null, null];

    private readonly eGridViewport: HTMLElement;

    private scrollLeft = -1;
    private nextScrollTop = -1;
    private scrollTop = -1;

    // Used to provide approximate values of scrollTop and offsetHeight
    // without forcing the browser to recalculate styles.
    private lastOffsetHeight = -1;
    private lastScrollTop = -1;
    private lastIsHorizontalScrollShowing: boolean = false;

    private scrollTimer: number = 0;
    private isScrollActive = false;

    private isVerticalPositionInvalidated: boolean = true;
    private isHorizontalPositionInvalidated: boolean = true;

    private readonly resetLastHScrollDebounced: () => void;
    private readonly resetLastVScrollDebounced: () => void;

    private fakeVScrollComp: VerticalScrollComp;
    private fakeHScrollComp: HorizontalScrollComp;

    constructor(eGridViewport: HTMLElement) {
        super();
        this.eGridViewport = eGridViewport;
        this.resetLastHScrollDebounced = _debounce(
            this,
            () => (this.lastScrollSource[Direction.Horizontal] = null),
            SCROLL_END_TIMEOUT
        );
        this.resetLastVScrollDebounced = _debounce(
            this,
            () => (this.lastScrollSource[Direction.Vertical] = null),
            SCROLL_END_TIMEOUT
        );
    }

    public override destroy(): void {
        super.destroy();
        this.clearRetryListenerFncs = [];

        window.clearTimeout(this.scrollTimer);
    }

    public postConstruct(): void {
        this.enableRtl = this.gos.get('enableRtl');

        const invalidateVerticalScroll = this.invalidateVerticalScroll.bind(this);
        const invalidateHorizontalScroll = this.invalidateHorizontalScroll.bind(this);

        this.addManagedEventListeners({
            displayedColumnsWidthChanged: this.onDisplayedColumnsWidthChanged.bind(this),
            bodyHeightChanged: invalidateVerticalScroll,
            // We only invalidate horizontal scrolling when the viewport switches
            // between scrollable and non-scrollable, avoiding unnecessary
            // invalidation on every gridSizeChanged event. If more properties
            // require invalidation, read/write DOM cycles may be needed.
            scrollGapChanged: invalidateHorizontalScroll,
        });

        this.addManagedElementListeners(this.eGridViewport, {
            scroll: () => {
                invalidateVerticalScroll();
                invalidateHorizontalScroll();
            },
        });

        this.ctrlsSvc.whenReady(this, (p) => {
            this.fakeVScrollComp = p.fakeVScrollComp;
            this.fakeHScrollComp = p.fakeHScrollComp;
            this.onDisplayedColumnsWidthChanged();
            this.addScrollListener();
        });
    }

    private invalidateHorizontalScroll(): void {
        this.isHorizontalPositionInvalidated = true;
    }

    private invalidateVerticalScroll(): void {
        this.isVerticalPositionInvalidated = true;
    }

    private addScrollListener() {
        this.addHorizontalScrollListeners();
        this.addVerticalScrollListeners();
    }

    private addHorizontalScrollListeners(): void {
        this.addManagedElementListeners(this.eGridViewport, {
            scroll: this.onHScroll.bind(this, VIEWPORT),
        });

        for (const source of HORIZONTAL_SOURCES) {
            const scrollPartner: ScrollPartner = this.ctrlsSvc.get(source);
            this.registerScrollPartner(scrollPartner, this.onHScroll.bind(this, source));
        }
    }

    private addVerticalScrollListeners(): void {
        const isDebounce = this.gos.get('debounceVerticalScrollbar');

        const onVScroll = isDebounce
            ? _debounce(this, this.onVScroll.bind(this, VIEWPORT), SCROLL_DEBOUNCE_TIMEOUT)
            : this.onVScroll.bind(this, VIEWPORT);
        const onFakeVScroll = isDebounce
            ? _debounce(this, this.onVScroll.bind(this, FAKE_V_SCROLLBAR), SCROLL_DEBOUNCE_TIMEOUT)
            : this.onVScroll.bind(this, FAKE_V_SCROLLBAR);

        this.addManagedElementListeners(this.eGridViewport, { scroll: onVScroll });
        this.registerScrollPartner(this.fakeVScrollComp, onFakeVScroll);
    }

    private registerScrollPartner(comp: ScrollPartner, callback: () => void) {
        comp.onScrollCallback(callback);
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

    private horizontallyScrollHeaderCenterAndFloatingCenter(scrollLeft?: number): void {
        // when doing RTL, this method gets called once prematurely
        const notYetInitialised = this.fakeHScrollComp == null;
        if (notYetInitialised) {
            return;
        }

        if (scrollLeft === undefined) {
            scrollLeft = _getScrollLeft(this.eGridViewport, this.enableRtl);
        }

        this.setScrollLeftForAllContainersExceptCurrent(Math.abs(scrollLeft));
    }

    private setScrollLeftForAllContainersExceptCurrent(scrollLeft: number): void {
        for (const container of [...HORIZONTAL_SOURCES, VIEWPORT] as const) {
            if (this.lastScrollSource[Direction.Horizontal] === container) {
                continue;
            }

            const viewport = this.getViewportForSource(container);
            _setScrollLeft(viewport, scrollLeft, this.enableRtl);
        }
    }

    private getViewportForSource(source: VerticalScrollSource | HorizontalScrollSource): HTMLElement {
        if (source === VIEWPORT) {
            return this.eGridViewport;
        }

        return this.ctrlsSvc.get(source).eViewport;
    }

    private isControllingScroll(source: HorizontalScrollSource | VerticalScrollSource, direction: Direction): boolean {
        if (this.lastScrollSource[direction] == null) {
            if (direction === Direction.Vertical) {
                this.lastScrollSource[0] = source as VerticalScrollSource;
            } else {
                this.lastScrollSource[1] = source as HorizontalScrollSource;
            }

            return true;
        }

        return this.lastScrollSource[direction] === source;
    }

    private onHScroll(source: HorizontalScrollSource): void {
        if (!this.isControllingScroll(source, Direction.Horizontal)) {
            return;
        }

        let newScrollLeft = _getScrollLeft(this.getViewportForSource(source), this.enableRtl);

        const clampedScrollLeft = this.clampHorizontalScrollPosition(newScrollLeft);
        if (Math.abs(clampedScrollLeft - newScrollLeft) > 0.1) {
            _setScrollLeft(this.getViewportForSource(source), Math.abs(clampedScrollLeft), this.enableRtl);
            newScrollLeft = clampedScrollLeft;
        }

        if (this.shouldBlockScrollUpdate(Direction.Horizontal, newScrollLeft, true)) {
            return;
        }

        if (source !== VIEWPORT) {
            _setScrollLeft(this.eGridViewport, Math.abs(newScrollLeft), this.enableRtl);
            newScrollLeft = _getScrollLeft(this.eGridViewport, this.enableRtl);
        }

        this.doHorizontalScroll(newScrollLeft);
        this.resetLastHScrollDebounced();
    }

    private onVScroll(source: VerticalScrollSource): void {
        if (!this.isControllingScroll(source, Direction.Vertical)) {
            return;
        }

        const requestedScrollTop =
            source === VIEWPORT ? this.eGridViewport.scrollTop : this.fakeVScrollComp.getScrollPosition();
        let scrollTop = requestedScrollTop;

        if (this.shouldBlockScrollUpdate(Direction.Vertical, scrollTop, true)) {
            return;
        }

        if (source === VIEWPORT) {
            this.fakeVScrollComp.setScrollPosition(scrollTop);
        } else {
            this.eGridViewport.scrollTop = requestedScrollTop;
            // resolve to the browser-applied value in case assignment is clamped.
            scrollTop = this.eGridViewport.scrollTop;
            // keep cached vertical metrics in sync even when the fake scrollbar drives scrolling,
            // as setting scrollTop programmatically may not emit a viewport scroll event.
            this.invalidateVerticalScroll();

            if (scrollTop !== requestedScrollTop) {
                this.fakeVScrollComp.setScrollPosition(scrollTop, true);
            }
        }

        const { animationFrameSvc } = this;
        animationFrameSvc?.setScrollTop(scrollTop);
        this.nextScrollTop = scrollTop;

        // the `scrollGridIfNeeded` will recalculate the rows to be rendered by the grid
        // so it should only be called after `eGridViewport` has been scrolled to the correct
        // position, otherwise the `first` and `last` row could be miscalculated.
        if (animationFrameSvc?.active) {
            animationFrameSvc.schedule();
        } else {
            this.scrollGridIfNeeded(true);
        }

        this.resetLastVScrollDebounced();
    }

    private doHorizontalScroll(scrollLeft: number): void {
        const fakeScrollLeft = this.fakeHScrollComp.getScrollPosition();

        if (this.scrollLeft === scrollLeft && scrollLeft === fakeScrollLeft) {
            return;
        }

        this.scrollLeft = scrollLeft;

        this.fireScrollEvent(Direction.Horizontal);
        this.horizontallyScrollHeaderCenterAndFloatingCenter(scrollLeft);
        this.ctrlsSvc.getGridBodyCtrl()?.updateColumnViewport(true);
    }

    public isScrolling(): boolean {
        return this.isScrollActive;
    }

    private fireScrollEvent(direction: Direction): void {
        const bodyScrollEvent: WithoutGridCommon<BodyScrollEvent> = {
            type: 'bodyScroll',
            direction: direction === Direction.Horizontal ? 'horizontal' : 'vertical',
            left: this.scrollLeft,
            top: this.scrollTop,
        };
        this.isScrollActive = true;
        this.eventSvc.dispatchEvent(bodyScrollEvent);

        window.clearTimeout(this.scrollTimer);

        this.scrollTimer = window.setTimeout(() => {
            this.scrollTimer = 0;
            this.isScrollActive = false;
            this.eventSvc.dispatchEvent({
                ...bodyScrollEvent,
                type: 'bodyScrollEnd',
            });
        }, SCROLL_END_TIMEOUT);
    }

    private shouldBlockScrollUpdate(direction: Direction, scrollTo: number, touchOnly: boolean = false): boolean {
        // touch devices allow elastic scroll - which temporally scrolls the panel outside of the viewport
        // (eg user uses touch to go to the left of the grid, but drags past the left, the rows will actually
        // scroll past the left until the user releases the mouse). when this happens, we want ignore the scroll,
        // as otherwise it was causing the rows and header to flicker.

        // sometimes when scrolling, we got values that extended the maximum scroll allowed. we used to
        // ignore these scrolls. problem is the max scroll position could be skipped (eg the previous scroll event
        // could be 10px before the max position, and then current scroll event could be 20px after the max position).
        // if we just ignored the last event, we would be setting the scroll to 10px before the max position, when in
        // actual fact the user has exceeded the max scroll and thus scroll should be set to the max.

        if (touchOnly && !_isIOSUserAgent()) {
            return false;
        }

        if (direction === Direction.Vertical) {
            return this.shouldBlockVerticalScroll(scrollTo);
        }

        return this.shouldBlockHorizontalScroll(scrollTo);
    }

    private shouldBlockVerticalScroll(scrollTo: number): boolean {
        const clientHeight = _getInnerHeight(this.eGridViewport);
        const { scrollHeight } = this.eGridViewport;

        return !!(scrollTo < 0 || scrollTo + clientHeight > scrollHeight);
    }

    private shouldBlockHorizontalScroll(scrollTo: number): boolean {
        return Math.abs(this.clampHorizontalScrollPosition(scrollTo) - scrollTo) > 0.1;
    }

    private redrawRowsAfterScroll(): void {
        this.fireScrollEvent(Direction.Vertical);
    }

    // this is to cater for AG-3274, where grid is removed from the dom and then inserted back in again.
    // (which happens with some implementations of tabbing). this can result in horizontal scroll getting
    // reset back to the left, however no scroll event is fired. so we need to get header to also scroll
    // back to the left to be kept in sync.
    // adding and removing the grid from the DOM both resets the scroll position and
    // triggers a resize event, so notify listeners if the scroll position has changed
    public checkScrollLeft(): void {
        const scrollLeft = _getScrollLeft(this.eGridViewport, this.enableRtl);
        let hasHorizontalScrollersOutOfSync = false;
        for (const source of HORIZONTAL_SOURCES) {
            const viewport = this.getViewportForSource(source);
            if (_getScrollLeft(viewport, this.enableRtl) !== scrollLeft) {
                hasHorizontalScrollersOutOfSync = true;
                break;
            }
        }

        if (hasHorizontalScrollersOutOfSync) {
            this.onHScroll(VIEWPORT);
        }
    }

    public scrollGridIfNeeded(suppressedAnimationFrame: boolean = false): boolean {
        const frameNeeded = this.scrollTop != this.nextScrollTop;

        if (frameNeeded) {
            this.scrollTop = this.nextScrollTop;
            if (suppressedAnimationFrame) {
                this.invalidateVerticalScroll();
            }
            this.redrawRowsAfterScroll();
        }

        return frameNeeded;
    }

    // called by scrollHorizontally method and alignedGridsService
    public setHorizontalScrollPosition(hScrollPosition: number, _fromAlignedGridsService = false): void {
        hScrollPosition = this.clampHorizontalScrollPosition(hScrollPosition);

        _setScrollLeft(this.eGridViewport, Math.abs(hScrollPosition), this.enableRtl);
        hScrollPosition = _getScrollLeft(this.eGridViewport, this.enableRtl);
        // we need to manually do the event handling (rather than wait for the event)
        // for the alignedGridsSvc, as if we don't, the aligned grid service gets
        // notified async, and then it's 'consuming' flag doesn't get used right, and
        // we can end up with an infinite loop
        this.doHorizontalScroll(hScrollPosition);
    }

    private getMaxHorizontalScrollLeft(): number {
        const viewportWidth = _getInnerWidth(this.eGridViewport);
        const gridBodyCtrl = this.ctrlsSvc.getGridBodyCtrl();
        if (!gridBodyCtrl) {
            const contentWidth = this.eGridViewport.scrollWidth;
            return Math.max(0, contentWidth - viewportWidth);
        }

        const contentWidth = Math.max(gridBodyCtrl.getHorizontalContentWidth(), viewportWidth);
        return Math.max(0, contentWidth - viewportWidth);
    }

    private clampHorizontalScrollPosition(scrollLeft: number): number {
        const maxScrollLeft = this.getMaxHorizontalScrollLeft();
        return _clamp(scrollLeft, 0, maxScrollLeft);
    }

    public setVerticalScrollPosition(vScrollPosition: number): void {
        this.invalidateVerticalScroll();
        this.eGridViewport.scrollTop = vScrollPosition;
    }

    public getVScrollPosition(): VerticalScrollPosition {
        if (!this.isVerticalPositionInvalidated) {
            const { lastOffsetHeight, lastScrollTop } = this;
            const bodyViewportHeight = this.getBodyViewportHeight(lastOffsetHeight);

            return {
                top: lastScrollTop,
                bottom: lastScrollTop + bodyViewportHeight,
            };
        }

        this.isVerticalPositionInvalidated = false;

        const { scrollTop, offsetHeight } = this.eGridViewport;
        this.lastScrollTop = scrollTop;
        this.lastOffsetHeight = offsetHeight;
        const bodyViewportHeight = this.getBodyViewportHeight(offsetHeight);

        return {
            top: scrollTop,
            bottom: scrollTop + bodyViewportHeight,
        };
    }

    /** Get an approximate scroll position that returns the last real value read.
     * This is useful for avoiding repeated DOM reads that force the browser to recalculate styles.
     * This can have big performance improvements but may not be 100% accurate so only use if this is acceptable.
     */
    public getApproximateVScollPosition(): VerticalScrollPosition {
        if (this.lastScrollTop >= 0 && this.lastOffsetHeight >= 0) {
            const bodyViewportHeight = this.getBodyViewportHeight(this.lastOffsetHeight);
            return {
                top: this.scrollTop,
                bottom: this.scrollTop + bodyViewportHeight,
            };
        }
        return this.getVScrollPosition();
    }

    private getBodyViewportHeight(totalViewportHeight: number): number {
        const gridBodyCtrl = this.ctrlsSvc.getGridBodyCtrl();
        return gridBodyCtrl ? gridBodyCtrl.getBodyViewportHeight(totalViewportHeight) : totalViewportHeight;
    }

    public getHScrollPosition(): { left: number; right: number } {
        return this.ctrlsSvc.getGridBodyCtrl()?.getHorizontalScrollPosition() ?? { left: 0, right: 0 };
    }

    public isHorizontalScrollShowing(): boolean {
        if (this.isHorizontalPositionInvalidated) {
            this.lastIsHorizontalScrollShowing = this.beans.scrollVisibleSvc.isHorizontalScrollShowing();
            this.isHorizontalPositionInvalidated = false;
        }
        return this.lastIsHorizontalScrollShowing;
    }

    // called by the headerRootComp and moveColumnController
    public scrollHorizontally(pixels: number): number {
        const oldScrollPosition = _getScrollLeft(this.eGridViewport, this.enableRtl);

        this.setHorizontalScrollPosition(oldScrollPosition + pixels);
        return _getScrollLeft(this.eGridViewport, this.enableRtl) - oldScrollPosition;
    }

    // gets called by rowRenderer when new data loaded, as it will want to scroll to the top
    public scrollToTop(): void {
        this.setVerticalScrollPosition(0);
    }

    // Valid values for position are bottom, middle and top
    public ensureNodeVisible<TData = any>(
        comparator: TData | IRowNode<TData> | ((row: IRowNode<TData>) => boolean),
        position: 'top' | 'bottom' | 'middle' | null = null
    ) {
        const { rowModel } = this.beans;
        // look for the node index we want to display
        const rowCount = rowModel.getRowCount();
        let indexToSelect = -1;
        // go through all the nodes, find the one we want to show
        for (let i = 0; i < rowCount; i++) {
            const node = rowModel.getRow(i);
            if (typeof comparator === 'function') {
                // Have to assert type here, as type could be TData & Function
                const predicate = comparator as (row: IRowNode<TData>) => boolean;
                if (node && predicate(node)) {
                    indexToSelect = i;
                    break;
                }
            }
            // check object equality against node and data
            else if (comparator === node || comparator === node!.data) {
                indexToSelect = i;
                break;
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
    public ensureIndexVisible(index: number, position?: 'top' | 'bottom' | 'middle' | null, retry = 0) {
        // if for print or auto height, everything is always visible
        if (_isDomLayout(this.gos, 'print')) {
            return;
        }

        const { rowModel } = this.beans;
        const rowCount = rowModel.getRowCount();

        if (typeof index !== 'number' || index < 0 || index >= rowCount) {
            this.warn(88, { index });
            return;
        }

        this.clearRetryListeners();

        const { frameworkOverrides, pageBounds, rowContainerHeight: heightScaler, rowRenderer } = this.beans;
        frameworkOverrides.wrapIncoming(() => {
            const gridBodyCtrl = this.ctrlsSvc.getGridBodyCtrl();

            const rowNode = rowModel.getRow(index);
            let rowGotShiftedDuringOperation: boolean;
            let stickyHeightsChanged: boolean;
            let attempt = 0;
            this.invalidateVerticalScroll();

            do {
                const { stickyTopHeight, stickyBottomHeight } = gridBodyCtrl;
                const startingRowTop = rowNode!.rowTop;
                const startingRowHeight = rowNode!.rowHeight;

                const paginationOffset = pageBounds.getPixelOffset();
                const rowTopPixel = rowNode!.rowTop! - paginationOffset;
                const rowBottomPixel = rowTopPixel + rowNode!.rowHeight!;

                const scrollPosition = this.getVScrollPosition();
                const heightOffset = heightScaler.divStretchOffset;

                const vScrollTop = scrollPosition.top + heightOffset;
                const vScrollBottom = scrollPosition.bottom + heightOffset;

                const viewportHeight = vScrollBottom - vScrollTop;

                // work out the pixels for top, middle and bottom up front,
                // make the if/else below easier to read
                const pxTop = heightScaler.getScrollPositionForPixel(rowTopPixel);
                const pxBottom = heightScaler.getScrollPositionForPixel(rowBottomPixel - viewportHeight);
                // make sure if middle, the row is not outside the top of the grid
                const pxMiddle = Math.min((pxTop + pxBottom) / 2, rowTopPixel);

                const rowAboveViewport = vScrollTop + stickyTopHeight > rowTopPixel;
                const rowBelowViewport = vScrollBottom - stickyBottomHeight < rowBottomPixel;

                let newScrollPosition: number | null = null;

                if (position === 'top') {
                    newScrollPosition = pxTop - stickyTopHeight;
                } else if (position === 'bottom') {
                    newScrollPosition = pxBottom + stickyBottomHeight;
                } else if (position === 'middle') {
                    newScrollPosition = pxMiddle;
                } else if (rowAboveViewport) {
                    // if row is before, scroll up with row at top
                    newScrollPosition = pxTop - stickyTopHeight;
                } else if (rowBelowViewport) {
                    // if row is taller than viewport, scroll down to the top of the row
                    if (pxBottom - pxTop > viewportHeight) {
                        newScrollPosition = pxTop - stickyTopHeight;
                    } else {
                        // if row is after, scroll down with row at bottom
                        newScrollPosition = pxBottom + stickyBottomHeight;
                    }
                }

                if (newScrollPosition !== null) {
                    this.setVerticalScrollPosition(newScrollPosition);
                    rowRenderer.redraw({ afterScroll: true });
                }

                // the row can get shifted if during the rendering (during rowRenderer.redraw()),
                // the height of a row changes due to lazy calculation of row heights when using
                // colDef.autoHeight or gridOptions.getRowHeight.
                // if row was shifted, then the position we scrolled to is incorrect.
                rowGotShiftedDuringOperation =
                    startingRowTop !== rowNode!.rowTop || startingRowHeight !== rowNode!.rowHeight;
                // `rowRenderer.redraw` can cause sticky heights to change, which means the row may no longer be visible
                stickyHeightsChanged =
                    stickyTopHeight !== gridBodyCtrl.stickyTopHeight ||
                    stickyBottomHeight !== gridBodyCtrl.stickyBottomHeight;
                attempt++;
                // prevent infinite loops
            } while ((rowGotShiftedDuringOperation || stickyHeightsChanged) && attempt < 10);

            // so when we return back to user, the cells have rendered
            this.animationFrameSvc?.flushAllFrames();

            // SSRM - if the node is a stub, give the grid a chance to load the data
            // when data loads, try again to scroll to the row.
            // Cancel if any other scroll event occurs.
            // also retry if the row is not measured yet, as this can happen when using autoHeight
            if (retry < 10 && (rowNode?.stub || !this.beans.rowAutoHeight?.areRowsMeasured())) {
                const scrollTop = this.getVScrollPosition().top;
                this.clearRetryListenerFncs = this.addManagedEventListeners({
                    bodyScroll: () => {
                        const newScrollTop = this.getVScrollPosition().top;

                        // allow horizontal scroll without cancelling/also allow also use scroll top as opposed to event direction
                        // as scrolling from this func will fire a scroll even asynchronously, but scroll top will be up to date
                        if (scrollTop === newScrollTop) {
                            return;
                        }

                        this.clearRetryListeners();
                    },
                    modelUpdated: () => {
                        this.clearRetryListeners();

                        // if index not in count, stop waiting
                        if (index >= rowModel.getRowCount()) {
                            return;
                        }

                        // try again to scroll to the row.
                        this.ensureIndexVisible(index, position, retry + 1);
                    },
                });
            }
        });
    }

    private clearRetryListeners(): void {
        for (const callback of this.clearRetryListenerFncs) {
            callback();
        }
        this.clearRetryListenerFncs = [];
    }

    public ensureColumnVisible(key: any, position: 'auto' | 'start' | 'middle' | 'end' = 'auto'): void {
        const { colModel, frameworkOverrides } = this.beans;
        const column = colModel.getCol(key);

        if (!column) {
            return;
        }

        if (column.isPinned()) {
            return; // calling ensureColumnVisible on a pinned column doesn't make sense
        }

        if (!column.displayed) {
            return; // defensive
        }

        const newHorizontalScroll: number | null = this.getPositionedHorizontalScroll(column, position);

        frameworkOverrides.wrapIncoming(() => {
            const ctrl = this.ctrlsSvc.getGridBodyCtrl();
            if (newHorizontalScroll !== null) {
                ctrl?.setHorizontalScrollLeft(newHorizontalScroll);
            }

            // this will happen anyway, as the move will cause a 'scroll' event on the body, however
            // it is possible that the ensureColumnVisible method is called from within AG Grid and
            // the caller will need to have the columns rendered to continue, which will be before
            // the event has been worked on (which is the case for cell navigation).
            ctrl?.updateColumnViewport();

            // so when we return back to user, the cells have rendered
            this.animationFrameSvc?.flushAllFrames();
        });
    }

    private getPositionedHorizontalScroll(
        column: AgColumn,
        position: 'auto' | 'start' | 'middle' | 'end'
    ): number | null {
        const { columnBeforeStart, columnAfterEnd } = this.isColumnOutsideViewport(column);

        const viewportWidth = this.ctrlsSvc.getGridBodyCtrl()?.getCenterWidth() ?? 0;
        const viewportTooSmallForColumn = viewportWidth < column.getActualWidth();

        // column left values and scroll positions are both "distance from start edge",
        // so the alignment logic is the same in LTR and RTL.
        let alignColToStart = columnAfterEnd || viewportTooSmallForColumn;
        let alignColToEnd = columnBeforeStart;

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
                return colLeft;
            }

            return colRight - viewportWidth;
        }

        return null;
    }

    private isColumnOutsideViewport(column: AgColumn): { columnBeforeStart: boolean; columnAfterEnd: boolean } {
        const { start: viewportStart, end: viewportEnd } = this.getViewportBounds();
        const { colLeft, colRight } = this.getColumnBounds(column);

        const columnBeforeStart = viewportEnd < colRight;
        const columnAfterEnd = viewportStart > colLeft;

        return { columnBeforeStart, columnAfterEnd };
    }

    private getColumnBounds(column: AgColumn): { colLeft: number; colMiddle: number; colRight: number } {
        const colLeft = column.getLeft()!;
        const colWidth = column.getActualWidth();

        return {
            colLeft,
            colMiddle: colLeft + colWidth / 2,
            colRight: colLeft + colWidth,
        };
    }

    private getViewportBounds(): { start: number; end: number; width: number } {
        const gridBodyCtrl = this.ctrlsSvc.getGridBodyCtrl();
        const viewportWidth = gridBodyCtrl?.getCenterWidth() ?? 0;
        const scrollPosition = gridBodyCtrl?.getHorizontalScrollLeft() ?? 0;

        const viewportStartPixel = scrollPosition;
        const viewportEndPixel = viewportWidth + scrollPosition;

        return { start: viewportStartPixel, end: viewportEndPixel, width: viewportWidth };
    }
}
