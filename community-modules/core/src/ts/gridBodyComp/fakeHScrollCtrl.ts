import { ColumnModel } from "../columns/columnModel";
import { BeanStub } from "../context/beanStub";
import { Autowired } from "../context/context";
import { CtrlsService } from "../ctrlsService";
import { Events } from "../eventKeys";
import { BodyScrollEvent } from "../events";
import { PinnedRowModel } from "../pinnedRowModel/pinnedRowModel";
import { isInvisibleScrollbar, isIOSUserAgent, isMacOsUserAgent } from "../utils/browser";
import { ScrollVisibleService } from "./scrollVisibleService";

export interface IFakeHScrollComp {
    setHeight(height: number): void;
    setBottom(bottom: number): void;
    setViewportHeight(height: number): void;
    setContainerHeight(height: number): void;
    setRightSpacerFixedWidth(width: number): void;
    setLeftSpacerFixedWidth(width: number): void;

    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    includeLeftSpacerScrollerCss(cssClass: string, include: boolean): void;
    includeRightSpacerScrollerCss(cssClass: string, include: boolean): void;
}

export class FakeHScrollCtrl extends BeanStub {

    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('ctrlsService') public ctrlsService: CtrlsService;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;

    private view: IFakeHScrollComp;

    private enableRtl: boolean;
    private invisibleScrollbar: boolean;
    private eViewport: HTMLElement;
    private eContainer: HTMLElement;
    private eGui: HTMLElement;

    public setComp(view: IFakeHScrollComp, eGui: HTMLElement, eViewport: HTMLElement, eContainer: HTMLElement): void {
        this.view = view;
        this.eViewport = eViewport;
        this.eContainer = eContainer;
        this.eGui = eGui;

        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));

        // When doing printing, this changes whether cols are pinned or not
        const spacerWidthsListener = this.setFakeHScrollSpacerWidths.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, spacerWidthsListener);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, spacerWidthsListener);
        this.addManagedPropertyListener('domLayout', spacerWidthsListener);
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.onScrollVisibilityChanged();

        this.ctrlsService.registerFakeHScrollCtrl(this);
        this.view.addOrRemoveCssClass('ag-apple-scrollbar', isMacOsUserAgent() || isIOSUserAgent());
    }

    addActiveListenerToggles(): void {
        const activateEvents = ['mouseenter', 'mousedown', 'touchstart'];
        const deactivateEvents = ['mouseleave', 'touchend'];

        activateEvents.forEach(
            eventName => this.addManagedListener(
                this.eGui, eventName, () => this.view.addOrRemoveCssClass('ag-scrollbar-active', true)
            )
        );
        deactivateEvents.forEach(
            eventName => this.addManagedListener(
                this.eGui, eventName, () => this.view.addOrRemoveCssClass('ag-scrollbar-active', false)
            )
        );
    }

    private initialiseInvisibleScrollbar(): void {
        if (this.invisibleScrollbar !== undefined) { return; }

        this.enableRtl = this.gridOptionsService.is('enableRtl');
        this.invisibleScrollbar = isInvisibleScrollbar();

        if (this.invisibleScrollbar) {
            this.hideAndShowInvisibleScrollAsNeeded();
            this.addActiveListenerToggles();
            this.refreshCompBottom();
        }
    }

    private onPinnedRowDataChanged(): void {
        this.refreshCompBottom();
    }

    private refreshCompBottom(): void {
        if (!this.invisibleScrollbar) { return; }
        const bottomPinnedHeight = this.pinnedRowModel.getPinnedBottomTotalHeight();

        this.view.setBottom(bottomPinnedHeight);
    }

    private onScrollVisibilityChanged(): void {
        // initialiseInvisibleScrollbar should only be called once, but the reason
        // this can't be inside `setComp` or `PostConstruct` is the DOM might not
        // be ready, so we call it until eventually, it gets calculated.
        if (this.invisibleScrollbar === undefined) {
            this.initialiseInvisibleScrollbar();
        }
        this.setScrollVisible();
        this.setFakeHScrollSpacerWidths();
    }

    private hideAndShowInvisibleScrollAsNeeded(): void {
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL, (params: BodyScrollEvent) => {
            if (params.direction === 'horizontal') {
                this.view.addOrRemoveCssClass('ag-scrollbar-scrolling', true);
            }
        });
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL_END, () => this.view.addOrRemoveCssClass('ag-scrollbar-scrolling', false));
    }

    private setFakeHScrollSpacerWidths(): void {
        const vScrollShowing = this.scrollVisibleService.isVerticalScrollShowing();

        // we pad the right based on a) if cols are pinned to the right and
        // b) if v scroll is showing on the right (normal position of scroll)
        let rightSpacing = this.columnModel.getDisplayedColumnsRightWidth();
        const scrollOnRight = !this.enableRtl && vScrollShowing;
        const scrollbarWidth = this.gridOptionsWrapper.getScrollbarWidth();

        if (scrollOnRight) {
            rightSpacing += scrollbarWidth;
        }
        this.view.setRightSpacerFixedWidth(rightSpacing);
        this.view.includeRightSpacerScrollerCss('ag-scroller-corner', rightSpacing <= scrollbarWidth);

        // we pad the left based on a) if cols are pinned to the left and
        // b) if v scroll is showing on the left (happens in LTR layout only)
        let leftSpacing = this.columnModel.getDisplayedColumnsLeftWidth();
        const scrollOnLeft = this.enableRtl && vScrollShowing;

        if (scrollOnLeft) {
            leftSpacing += scrollbarWidth;
        }

        this.view.setLeftSpacerFixedWidth(leftSpacing);
        this.view.includeLeftSpacerScrollerCss('ag-scroller-corner', leftSpacing <= scrollbarWidth);
    }

    private setScrollVisible(): void {
        const hScrollShowing = this.scrollVisibleService.isHorizontalScrollShowing();
        const invisibleScrollbar = this.invisibleScrollbar;
        const isSuppressHorizontalScroll = this.gridOptionsService.is('suppressHorizontalScroll');
        const scrollbarWidth = hScrollShowing ? (this.gridOptionsWrapper.getScrollbarWidth() || 0) : 0;
        const adjustedScrollbarWidth = (scrollbarWidth === 0 && invisibleScrollbar) ? 15 : scrollbarWidth;
        const scrollContainerSize = !isSuppressHorizontalScroll ? adjustedScrollbarWidth : 0;

        this.view.addOrRemoveCssClass('ag-scrollbar-invisible', invisibleScrollbar);
        this.view.setHeight(scrollContainerSize);
        this.view.setViewportHeight(scrollContainerSize);
        this.view.setContainerHeight(scrollContainerSize);
        this.view.addOrRemoveCssClass('ag-hidden', !hScrollShowing);
    }

    public getViewport(): HTMLElement {
        return this.eViewport;
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }
}
