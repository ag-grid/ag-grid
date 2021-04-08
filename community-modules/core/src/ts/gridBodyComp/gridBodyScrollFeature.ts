import { Autowired, Bean, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { getInnerHeight, getScrollLeft, isRtlNegativeScroll, setScrollLeft } from "../utils/dom";
import { ControllersService } from "../controllersService";
import { Events } from "../eventKeys";
import { debounce } from "../utils/function";
import { BodyScrollEvent } from "../events";
import { isIOSUserAgent } from "../utils/browser";
import { AnimationFrameService } from "../misc/animationFrameService";
import { ColumnApi } from "../columnController/columnApi";
import { GridApi } from "../gridApi";

type ScrollDirection = 'horizontal' | 'vertical';

export class GridBodyScrollFeature extends BeanStub {

    @Autowired('controllersService') public controllersService: ControllersService;
    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    private enableRtl: boolean;

    private lastHorizontalScrollElement: HTMLElement | undefined | null;

    private eBodyViewport: HTMLElement;

    private scrollLeft = -1;
    private nextScrollTop = -1;
    private scrollTop = -1;

    private readonly resetLastHorizontalScrollElementDebounced: () => void;

    constructor(eBodyViewport: HTMLElement) {
        super();
        this.eBodyViewport = eBodyViewport;
        this.resetLastHorizontalScrollElementDebounced = debounce(this.resetLastHorizontalScrollElement.bind(this), 500);
    }

    @PostConstruct
    private postConstruct(): void {
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));

        this.controllersService.whenReady( ()=> {
            this.onDisplayedColumnsWidthChanged();
            this.addScrollListener();
        });
    }

    private addScrollListener() {
        const centerContainer = this.controllersService.getCenterRowContainerCon();
        const fakeHScroll = this.controllersService.getFakeHScrollCon();

        this.addManagedListener(centerContainer.getViewportElement(), 'scroll', this.onCenterViewportScroll.bind(this));
        this.addManagedListener(fakeHScroll.getViewport(), 'scroll', this.onFakeHorizontalScroll.bind(this));

        const onVerticalScroll = this.gridOptionsWrapper.isDebounceVerticalScrollbar() ?
            debounce(this.onVerticalScroll.bind(this), 100)
            : this.onVerticalScroll.bind(this);

        this.addManagedListener(this.eBodyViewport, 'scroll', onVerticalScroll);
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

        if (scrollLeft === undefined) {
            scrollLeft = this.getCenterViewportScrollLeft();
        }

        const offset = this.enableRtl ? scrollLeft : -scrollLeft;

        const centerContainer = this.controllersService.getCenterRowContainerCon();
        const topCenterContainer = this.controllersService.getTopCenterRowContainerCon();
        const bottomCenterContainer = this.controllersService.getBottomCenterRowContainerCon();
        const headerRootComp = this.controllersService.getHeaderRootComp();
        const fakeHScroll = this.controllersService.getFakeHScrollCon();

        headerRootComp.setHorizontalScroll(offset);
        bottomCenterContainer.setContainerTranslateX(offset);
        topCenterContainer.setContainerTranslateX(offset);

        const partner = this.lastHorizontalScrollElement === centerContainer.getViewportElement() ? fakeHScroll.getViewport() : centerContainer.getViewportElement();

        setScrollLeft(partner, scrollLeft, this.enableRtl);
    }

    private getCenterViewportScrollLeft(): number {
        return this.controllersService.getCenterRowContainerCon().getCenterViewportScrollLeft();
    }

    private isControllingScroll(eDiv: HTMLElement): boolean {
        if (!this.lastHorizontalScrollElement) {
            this.lastHorizontalScrollElement = eDiv;
            return true;
        }

        return eDiv === this.lastHorizontalScrollElement;
    }

    private onFakeHorizontalScroll(): void {
        const fakeHScrollViewport = this.controllersService.getFakeHScrollCon().getViewport();
        if (!this.isControllingScroll(fakeHScrollViewport)) { return; }
        this.onBodyHorizontalScroll(fakeHScrollViewport);
    }

    private onCenterViewportScroll(): void {
        const centerContainerViewport = this.controllersService.getCenterRowContainerCon().getViewportElement();
        if (!this.isControllingScroll(centerContainerViewport)) { return; }
        this.onBodyHorizontalScroll(centerContainerViewport);
    }

    private onBodyHorizontalScroll(eSource: HTMLElement): void {
        const centerContainerViewport = this.controllersService.getCenterRowContainerCon().getViewportElement();
        const { scrollLeft } = centerContainerViewport;

        if (this.shouldBlockScrollUpdate('horizontal', scrollLeft, true)) {
            return;
        }

        this.doHorizontalScroll(Math.floor(getScrollLeft(eSource, this.enableRtl)));
        this.resetLastHorizontalScrollElementDebounced();
    }

    private onVerticalScroll(): void {
        const scrollTop: number = this.eBodyViewport.scrollTop;

        if (this.shouldBlockScrollUpdate('vertical', scrollTop, true)) { return; }
        this.animationFrameService.setScrollTop(scrollTop);
        this.nextScrollTop = scrollTop;

        if (this.gridOptionsWrapper.isSuppressAnimationFrame()) {
            this.scrollTop = this.nextScrollTop;
            this.redrawRowsAfterScroll();
        } else {
            this.animationFrameService.schedule();
        }
    }

    private resetLastHorizontalScrollElement() {
        this.lastHorizontalScrollElement = null;
    }

    private doHorizontalScroll(scrollLeft: number): void {
        this.scrollLeft = scrollLeft;

        const event: BodyScrollEvent = {
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
            const clientHeight = getInnerHeight(this.eBodyViewport);
            const { scrollHeight } = this.eBodyViewport;
            if (scrollTo < 0 || (scrollTo + clientHeight > scrollHeight)) {
                return true;
            }
        }

        if (direction === 'horizontal') {
            const centerRowContainerCon = this.controllersService.getCenterRowContainerCon();
            const clientWidth = centerRowContainerCon.getCenterWidth();
            const { scrollWidth } = centerRowContainerCon.getViewportElement();

            if (this.enableRtl && isRtlNegativeScroll()) {
                if (scrollTo > 0) { return true; }
            } else if (scrollTo < 0) { return true; }

            if (Math.abs(scrollTo) + clientWidth > scrollWidth) {
                return true;
            }
        }

        return false;
    }

    private redrawRowsAfterScroll(): void {
        const event: BodyScrollEvent = {
            type: Events.EVENT_BODY_SCROLL,
            direction: 'vertical',
            api: this.gridApi,
            columnApi: this.columnApi,
            left: this.scrollLeft,
            top: this.scrollTop
        };
        this.eventService.dispatchEvent(event);
    }

    private onHorizontalViewportChanged(): void {
        this.controllersService.getCenterRowContainerCon().onHorizontalViewportChanged();
    }

    // this is to cater for AG-3274, where grid is removed from the dom and then inserted back in again.
    // (which happens with some implementations of tabbing). this can result in horizontal scroll getting
    // reset back to the left, however no scroll event is fired. so we need to get header to also scroll
    // back to the left to be kept in sync.
    // adding and removing the grid from the DOM both resets the scroll position and
    // triggers a resize event, so notify listeners if the scroll position has changed
    public checkScrollLeft(): void {
        if (this.scrollLeft !== this.getCenterViewportScrollLeft()) {
            this.onBodyHorizontalScroll(this.controllersService.getCenterRowContainerCon().getViewportElement());
        }
    }

    public executeAnimationFrameScroll(): boolean {
        const frameNeeded = this.scrollTop != this.nextScrollTop;

        if (frameNeeded) {
            this.scrollTop = this.nextScrollTop;
            this.redrawRowsAfterScroll();
        }

        return frameNeeded;
    }

    // called by scrollHorizontally method and alignedGridsService
    public setHorizontalScrollPosition(hScrollPosition: number): void {

        const centerContainerCon = this.controllersService.getCenterRowContainerCon();

        const minScrollLeft = 0;
        const maxScrollLeft = centerContainerCon.getViewportElement().scrollWidth - centerContainerCon.getCenterWidth();

        if (this.shouldBlockScrollUpdate('horizontal', hScrollPosition)) {
            hScrollPosition = Math.min(Math.max(hScrollPosition, minScrollLeft), maxScrollLeft);
        }

        centerContainerCon.getViewportElement().scrollLeft = hScrollPosition;

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
        const centerContainer = this.controllersService.getCenterRowContainerCon();
        return centerContainer.getHScrollPosition();
    }

    public isHorizontalScrollShowing(): boolean {
        const centerContainer = this.controllersService.getCenterRowContainerCon();
        return centerContainer.isHorizontalScrollShowing();
    }

}