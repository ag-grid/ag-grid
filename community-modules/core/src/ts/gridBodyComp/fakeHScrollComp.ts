import { ColumnModel } from "../columns/columnModel";
import { Autowired, PostConstruct } from "../context/context";
import { CtrlsService } from "../ctrlsService";
import { Events } from "../eventKeys";
import { BodyScrollEvent } from "../events";
import { PinnedRowModel } from "../pinnedRowModel/pinnedRowModel";
import { isInvisibleScrollbar, isIOSUserAgent, isMacOsUserAgent } from "../utils/browser";
import { setFixedHeight, setFixedWidth } from "../utils/dom";
import { Component } from "../widgets/component";
import { RefSelector } from "../widgets/componentAnnotations";
import { CenterWidthFeature } from "./centerWidthFeature";
import { ScrollVisibleService } from "./scrollVisibleService";

export class FakeHScrollComp extends Component {

    private static TEMPLATE = /* html */
        `<div class="ag-body-horizontal-scroll" aria-hidden="true">
            <div class="ag-horizontal-left-spacer" ref="eLeftSpacer"></div>
            <div class="ag-body-horizontal-scroll-viewport" ref="eViewport">
                <div class="ag-body-horizontal-scroll-container" ref="eContainer"></div>
            </div>
            <div class="ag-horizontal-right-spacer" ref="eRightSpacer"></div>
        </div>`;

    @RefSelector('eLeftSpacer') private eLeftSpacer: HTMLElement;
    @RefSelector('eRightSpacer') private eRightSpacer: HTMLElement;
    @RefSelector('eViewport') private eViewport: HTMLElement;
    @RefSelector('eContainer') private eContainer: HTMLElement;

    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('ctrlsService') public ctrlsService: CtrlsService;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;

    private enableRtl: boolean;
    private invisibleScrollbar: boolean;

    constructor() {
        super(FakeHScrollComp.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {

        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));

        // When doing printing, this changes whether cols are pinned or not
        const spacerWidthsListener = this.setFakeHScrollSpacerWidths.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, spacerWidthsListener);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, spacerWidthsListener);
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.addManagedPropertyListener('domLayout', spacerWidthsListener);
        this.onScrollVisibilityChanged();

        this.ctrlsService.registerFakeHScrollComp(this);
        this.addOrRemoveCssClass('ag-apple-scrollbar', isMacOsUserAgent() || isIOSUserAgent());

        this.createManagedBean(new CenterWidthFeature(width => this.eContainer.style.width = `${width}px`));
    }

    private addActiveListenerToggles(): void {
        const activateEvents = ['mouseenter', 'mousedown', 'touchstart'];
        const deactivateEvents = ['mouseleave', 'touchend'];
        const eGui = this.getGui();

        activateEvents.forEach(
            eventName => this.addManagedListener(
                eGui, eventName, () => this.addOrRemoveCssClass('ag-scrollbar-active', true)
            )
        );
        deactivateEvents.forEach(
            eventName => this.addManagedListener(
                eGui, eventName, () => this.addOrRemoveCssClass('ag-scrollbar-active', false)
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

        this.getGui().style.bottom = `${bottomPinnedHeight}px`
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
                this.addOrRemoveCssClass('ag-scrollbar-scrolling', true);
            }
        });
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL_END, () => this.addOrRemoveCssClass('ag-scrollbar-scrolling', false));
    }

    private setFakeHScrollSpacerWidths(): void {
        const vScrollShowing = this.scrollVisibleService.isVerticalScrollShowing();

        // we pad the right based on a) if cols are pinned to the right and
        // b) if v scroll is showing on the right (normal position of scroll)
        let rightSpacing = this.columnModel.getDisplayedColumnsRightWidth();
        const scrollOnRight = !this.enableRtl && vScrollShowing;
        const scrollbarWidth = this.gridOptionsService.getScrollbarWidth();

        if (scrollOnRight) {
            rightSpacing += scrollbarWidth;
        }
        setFixedWidth(this.eRightSpacer, rightSpacing);
        this.eRightSpacer.classList.toggle('ag-scroller-corner', rightSpacing <= scrollbarWidth);

        // we pad the left based on a) if cols are pinned to the left and
        // b) if v scroll is showing on the left (happens in LTR layout only)
        let leftSpacing = this.columnModel.getDisplayedColumnsLeftWidth();
        const scrollOnLeft = this.enableRtl && vScrollShowing;

        if (scrollOnLeft) {
            leftSpacing += scrollbarWidth;
        }

        setFixedWidth(this.eLeftSpacer, leftSpacing);
        this.eLeftSpacer.classList.toggle('ag-scroller-corner', leftSpacing <= scrollbarWidth);
    }

    private setScrollVisible(): void {
        const hScrollShowing = this.scrollVisibleService.isHorizontalScrollShowing();
        const invisibleScrollbar = this.invisibleScrollbar;
        const isSuppressHorizontalScroll = this.gridOptionsService.is('suppressHorizontalScroll');
        const scrollbarWidth = hScrollShowing ? (this.gridOptionsService.getScrollbarWidth() || 0) : 0;
        const adjustedScrollbarWidth = (scrollbarWidth === 0 && invisibleScrollbar) ? 15 : scrollbarWidth;
        const scrollContainerSize = !isSuppressHorizontalScroll ? adjustedScrollbarWidth : 0;

        this.addOrRemoveCssClass('ag-scrollbar-invisible', invisibleScrollbar);
        setFixedHeight(this.getGui(), scrollContainerSize);
        setFixedHeight(this.eViewport, scrollContainerSize);
        setFixedHeight(this.eContainer, scrollContainerSize);
        this.setDisplayed(hScrollShowing, { skipAriaHidden: true });
    }

    public getViewport(): HTMLElement {
        return this.eViewport;
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }
}