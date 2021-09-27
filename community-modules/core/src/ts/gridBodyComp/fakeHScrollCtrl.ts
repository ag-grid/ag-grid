import { BeanStub } from "../context/beanStub";
import { isBrowserIE, isInvisibleScrollbar } from "../utils/browser";
import { Autowired, PostConstruct } from "../context/context";
import { ScrollVisibleService } from "./scrollVisibleService";
import { Events } from "../eventKeys";
import { ColumnModel } from "../columns/columnModel";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { CtrlsService } from "../ctrlsService";
import { BodyScrollEvent } from "../events";

export interface IFakeHScrollComp {
    setHeight(height: number): void;
    setViewportHeight(height: number): void;
    setContainerHeight(height: number): void;
    setRightSpacerFixedWidth(width: number): void;
    setLeftSpacerFixedWidth(width: number): void;
    setInvisibleStyles(isInvisible: boolean): void;
    setScrollingStyle(isScrolling: boolean): void;
    includeLeftSpacerScrollerCss(cssClass: string, include: boolean): void;
    includeRightSpacerScrollerCss(cssClass: string, include: boolean): void;
    addActiveListenerToggles(): void;
}

export class FakeHScrollCtrl extends BeanStub {

    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('ctrlsService') public ctrlsService: CtrlsService;

    private view: IFakeHScrollComp;

    private enableRtl: boolean;
    private invisibleScrollbar: boolean;
    private eViewport: HTMLElement;
    private eContainer: HTMLElement;

    constructor() {
        super();
    }

    public setComp(view: IFakeHScrollComp, eViewport: HTMLElement, eContainer: HTMLElement): void {
        this.view = view;
        this.eViewport = eViewport;
        this.eContainer = eContainer;

        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.onScrollVisibilityChanged();

        // When doing printing, this changes whether cols are pinned or not
        const spacerWidthsListener = this.setFakeHScrollSpacerWidths.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, spacerWidthsListener);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, spacerWidthsListener);
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, spacerWidthsListener);
        this.setFakeHScrollSpacerWidths();

        if (this.invisibleScrollbar) {
            this.hideAndShowInvisibleScrollAsNeeded();
            this.view.addActiveListenerToggles();
        }

        this.ctrlsService.registerFakeHScrollCtrl(this);
    }

    @PostConstruct
    private postConstruct(): void {
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.invisibleScrollbar = isInvisibleScrollbar();
    }

    private onScrollVisibilityChanged(): void {
        this.setScrollVisible();
        this.setFakeHScrollSpacerWidths();
    }

    private hideAndShowInvisibleScrollAsNeeded(): void {
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL, (params: BodyScrollEvent) => {
            if (params.direction === 'horizontal') {
                this.view.setScrollingStyle(true);
            }
        });
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL_END, () => this.view.setScrollingStyle(false));
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
        const isSuppressHorizontalScroll = this.gridOptionsWrapper.isSuppressHorizontalScroll();
        const scrollbarWidth = hScrollShowing ? (this.gridOptionsWrapper.getScrollbarWidth() || 0) : 0;
        const adjustedScrollbarWidth = (scrollbarWidth === 0 && invisibleScrollbar) ? 15 : scrollbarWidth;
        const scrollContainerSize = !isSuppressHorizontalScroll ? adjustedScrollbarWidth : 0;
        const addIEPadding = isBrowserIE() && hScrollShowing;

        this.view.setInvisibleStyles(invisibleScrollbar);
        this.view.setHeight(scrollContainerSize);
        // we have to add an extra pixel to the scroller viewport on IE because
        // if the container has the same size as the scrollbar, the scroll button won't work
        this.view.setViewportHeight(scrollContainerSize + (addIEPadding ? 1 : 0));
        this.view.setContainerHeight(scrollContainerSize);
    }

    public getViewport(): HTMLElement {
        return this.eViewport;
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }
}
