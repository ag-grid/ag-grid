/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
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
const beanStub_1 = require("../context/beanStub");
const browser_1 = require("../utils/browser");
const context_1 = require("../context/context");
const eventKeys_1 = require("../eventKeys");
const gridOptionsWrapper_1 = require("../gridOptionsWrapper");
class FakeHScrollCtrl extends beanStub_1.BeanStub {
    setComp(view, eGui, eViewport, eContainer) {
        this.view = view;
        this.eViewport = eViewport;
        this.eContainer = eContainer;
        this.eGui = eGui;
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        // When doing printing, this changes whether cols are pinned or not
        const spacerWidthsListener = this.setFakeHScrollSpacerWidths.bind(this);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, spacerWidthsListener);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, spacerWidthsListener);
        this.addManagedListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_DOM_LAYOUT, spacerWidthsListener);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.onScrollVisibilityChanged();
        this.ctrlsService.registerFakeHScrollCtrl(this);
        this.view.addOrRemoveCssClass('ag-apple-scrollbar', browser_1.isMacOsUserAgent() || browser_1.isIOSUserAgent());
    }
    addActiveListenerToggles() {
        const activateEvents = ['mouseenter', 'mousedown', 'touchstart'];
        const deactivateEvents = ['mouseleave', 'touchend'];
        activateEvents.forEach(eventName => this.addManagedListener(this.eGui, eventName, () => this.view.addOrRemoveCssClass('ag-scrollbar-active', true)));
        deactivateEvents.forEach(eventName => this.addManagedListener(this.eGui, eventName, () => this.view.addOrRemoveCssClass('ag-scrollbar-active', false)));
    }
    initialiseInvisibleScrollbar() {
        if (this.invisibleScrollbar !== undefined) {
            return;
        }
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.invisibleScrollbar = browser_1.isInvisibleScrollbar();
        if (this.invisibleScrollbar) {
            this.hideAndShowInvisibleScrollAsNeeded();
            this.addActiveListenerToggles();
            this.refreshCompBottom();
        }
    }
    onPinnedRowDataChanged() {
        this.refreshCompBottom();
    }
    refreshCompBottom() {
        if (!this.invisibleScrollbar) {
            return;
        }
        const bottomPinnedHeight = this.pinnedRowModel.getPinnedBottomTotalHeight();
        this.view.setBottom(bottomPinnedHeight);
    }
    onScrollVisibilityChanged() {
        // initialiseInvisibleScrollbar should only be called once, but the reason
        // this can't be inside `setComp` or `PostConstruct` is the DOM might not
        // be ready, so we call it until eventually, it gets calculated.
        if (this.invisibleScrollbar === undefined) {
            this.initialiseInvisibleScrollbar();
        }
        this.setScrollVisible();
        this.setFakeHScrollSpacerWidths();
    }
    hideAndShowInvisibleScrollAsNeeded() {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_BODY_SCROLL, (params) => {
            if (params.direction === 'horizontal') {
                this.view.addOrRemoveCssClass('ag-scrollbar-scrolling', true);
            }
        });
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_BODY_SCROLL_END, () => this.view.addOrRemoveCssClass('ag-scrollbar-scrolling', false));
    }
    setFakeHScrollSpacerWidths() {
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
    setScrollVisible() {
        const hScrollShowing = this.scrollVisibleService.isHorizontalScrollShowing();
        const invisibleScrollbar = this.invisibleScrollbar;
        const isSuppressHorizontalScroll = this.gridOptionsWrapper.isSuppressHorizontalScroll();
        const scrollbarWidth = hScrollShowing ? (this.gridOptionsWrapper.getScrollbarWidth() || 0) : 0;
        const adjustedScrollbarWidth = (scrollbarWidth === 0 && invisibleScrollbar) ? 15 : scrollbarWidth;
        const scrollContainerSize = !isSuppressHorizontalScroll ? adjustedScrollbarWidth : 0;
        this.view.addOrRemoveCssClass('ag-scrollbar-invisible', invisibleScrollbar);
        this.view.setHeight(scrollContainerSize);
        this.view.setViewportHeight(scrollContainerSize);
        this.view.setContainerHeight(scrollContainerSize);
    }
    getViewport() {
        return this.eViewport;
    }
    getContainer() {
        return this.eContainer;
    }
}
__decorate([
    context_1.Autowired('scrollVisibleService')
], FakeHScrollCtrl.prototype, "scrollVisibleService", void 0);
__decorate([
    context_1.Autowired('columnModel')
], FakeHScrollCtrl.prototype, "columnModel", void 0);
__decorate([
    context_1.Autowired('ctrlsService')
], FakeHScrollCtrl.prototype, "ctrlsService", void 0);
__decorate([
    context_1.Autowired('pinnedRowModel')
], FakeHScrollCtrl.prototype, "pinnedRowModel", void 0);
exports.FakeHScrollCtrl = FakeHScrollCtrl;
