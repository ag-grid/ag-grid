import { BeanStub } from "../context/beanStub";
import { isBrowserIE } from "../utils/browser";
import { Autowired, PostConstruct } from "../context/context";
import { ScrollVisibleService } from "./scrollVisibleService";
import { Events } from "../eventKeys";
import { ColumnController } from "../columnController/columnController";
import { GridOptionsWrapper } from "../gridOptionsWrapper";

export interface FakeHorizontalScrollView {
    setHeight(height: number): void;
    setViewportHeight(height: number): void;
    setContainerHeight(height: number): void;
    setRightSpacerFixedWidth(width: number): void;
    setLeftSpacerFixedWidth(width: number): void;
    includeLeftSpacerScrollerCss(cssClass: string, include: boolean): void;
    includeRightSpacerScrollerCss(cssClass: string, include: boolean): void;
}

export class FakeHorizontalScrollController extends BeanStub {

    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Autowired('columnController') private columnController: ColumnController;

    private view: FakeHorizontalScrollView;

    private enableRtl: boolean;

    constructor(view: FakeHorizontalScrollView) {
        super();
        this.view = view;
    }

    @PostConstruct
    private postConstruct(): void {
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();

        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.onScrollVisibilityChanged();

        // When doing printing, this changes whether cols are pinned or not
        const spacerWidthsListener = this.setFakeHScrollSpacerWidths.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, spacerWidthsListener);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, spacerWidthsListener);
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, spacerWidthsListener);
        this.setFakeHScrollSpacerWidths();
    }

    private onScrollVisibilityChanged(): void {
        this.setScrollVisible();
        this.setFakeHScrollSpacerWidths();
    }

    private setFakeHScrollSpacerWidths(): void {
        const vScrollShowing = this.scrollVisibleService.isVerticalScrollShowing();

        // we pad the right based on a) if cols are pinned to the right and
        // b) if v scroll is showing on the right (normal position of scroll)
        let rightSpacing = this.columnController.getDisplayedColumnsRightWidth();
        const scrollOnRight = !this.enableRtl && vScrollShowing;
        const scrollbarWidth = this.gridOptionsWrapper.getScrollbarWidth();

        if (scrollOnRight) {
            rightSpacing += scrollbarWidth;
        }
        this.view.setRightSpacerFixedWidth(rightSpacing);
        this.view.includeRightSpacerScrollerCss('ag-scroller-corner', rightSpacing <= scrollbarWidth);

        // we pad the left based on a) if cols are pinned to the left and
        // b) if v scroll is showing on the left (happens in LTR layout only)
        let leftSpacing = this.columnController.getDisplayedColumnsLeftWidth();
        const scrollOnLeft = this.enableRtl && vScrollShowing;

        if (scrollOnLeft) {
            leftSpacing += scrollbarWidth;
        }

        this.view.setLeftSpacerFixedWidth(leftSpacing);
        this.view.includeLeftSpacerScrollerCss('ag-scroller-corner', leftSpacing <= scrollbarWidth);
    }

    private setScrollVisible(): void {
        const hScrollShowing = this.scrollVisibleService.isHorizontalScrollShowing();

        const isSuppressHorizontalScroll = this.gridOptionsWrapper.isSuppressHorizontalScroll();
        const scrollbarWidth = hScrollShowing ? (this.gridOptionsWrapper.getScrollbarWidth() || 0) : 0;
        const scrollContainerSize = !isSuppressHorizontalScroll ? scrollbarWidth : 0;
        const addIEPadding = isBrowserIE() && hScrollShowing;

        this.view.setHeight(scrollContainerSize);
        // we have to add an extra pixel to the scroller viewport on IE because
        // if the container has the same size as the scrollbar, the scroll button won't work
        this.view.setViewportHeight(scrollContainerSize + (addIEPadding ? 1 : 0));
        this.view.setContainerHeight(scrollContainerSize);
    }
}
