/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
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
import { BeanStub } from "../context/beanStub";
import { isInvisibleScrollbar, isIOSUserAgent, isMacOsUserAgent } from "../utils/browser";
import { Autowired } from "../context/context";
import { Events } from "../eventKeys";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
var FakeHScrollCtrl = /** @class */ (function (_super) {
    __extends(FakeHScrollCtrl, _super);
    function FakeHScrollCtrl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FakeHScrollCtrl.prototype.setComp = function (view, eGui, eViewport, eContainer) {
        this.view = view;
        this.eViewport = eViewport;
        this.eContainer = eContainer;
        this.eGui = eGui;
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        // When doing printing, this changes whether cols are pinned or not
        var spacerWidthsListener = this.setFakeHScrollSpacerWidths.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, spacerWidthsListener);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, spacerWidthsListener);
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, spacerWidthsListener);
        this.addManagedListener(this.eventService, Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.onScrollVisibilityChanged();
        this.ctrlsService.registerFakeHScrollCtrl(this);
        this.view.addOrRemoveCssClass('ag-apple-scrollbar', isMacOsUserAgent() || isIOSUserAgent());
    };
    FakeHScrollCtrl.prototype.addActiveListenerToggles = function () {
        var _this = this;
        var activateEvents = ['mouseenter', 'mousedown', 'touchstart'];
        var deactivateEvents = ['mouseleave', 'touchend'];
        activateEvents.forEach(function (eventName) { return _this.addManagedListener(_this.eGui, eventName, function () { return _this.view.addOrRemoveCssClass('ag-scrollbar-active', true); }); });
        deactivateEvents.forEach(function (eventName) { return _this.addManagedListener(_this.eGui, eventName, function () { return _this.view.addOrRemoveCssClass('ag-scrollbar-active', false); }); });
    };
    FakeHScrollCtrl.prototype.initialiseInvisibleScrollbar = function () {
        if (this.invisibleScrollbar !== undefined) {
            return;
        }
        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.invisibleScrollbar = isInvisibleScrollbar();
        if (this.invisibleScrollbar) {
            this.hideAndShowInvisibleScrollAsNeeded();
            this.addActiveListenerToggles();
            this.refreshCompBottom();
        }
    };
    FakeHScrollCtrl.prototype.onPinnedRowDataChanged = function () {
        this.refreshCompBottom();
    };
    FakeHScrollCtrl.prototype.refreshCompBottom = function () {
        if (!this.invisibleScrollbar) {
            return;
        }
        var bottomPinnedHeight = this.pinnedRowModel.getPinnedBottomTotalHeight();
        this.view.setBottom(bottomPinnedHeight);
    };
    FakeHScrollCtrl.prototype.onScrollVisibilityChanged = function () {
        // initialiseInvisibleScrollbar should only be called once, but the reason
        // this can't be inside `setComp` or `PostConstruct` is the DOM might not
        // be ready, so we call it until eventually, it gets calculated.
        if (this.invisibleScrollbar === undefined) {
            this.initialiseInvisibleScrollbar();
        }
        this.setScrollVisible();
        this.setFakeHScrollSpacerWidths();
    };
    FakeHScrollCtrl.prototype.hideAndShowInvisibleScrollAsNeeded = function () {
        var _this = this;
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL, function (params) {
            if (params.direction === 'horizontal') {
                _this.view.addOrRemoveCssClass('ag-scrollbar-scrolling', true);
            }
        });
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL_END, function () { return _this.view.addOrRemoveCssClass('ag-scrollbar-scrolling', false); });
    };
    FakeHScrollCtrl.prototype.setFakeHScrollSpacerWidths = function () {
        var vScrollShowing = this.scrollVisibleService.isVerticalScrollShowing();
        // we pad the right based on a) if cols are pinned to the right and
        // b) if v scroll is showing on the right (normal position of scroll)
        var rightSpacing = this.columnModel.getDisplayedColumnsRightWidth();
        var scrollOnRight = !this.enableRtl && vScrollShowing;
        var scrollbarWidth = this.gridOptionsWrapper.getScrollbarWidth();
        if (scrollOnRight) {
            rightSpacing += scrollbarWidth;
        }
        this.view.setRightSpacerFixedWidth(rightSpacing);
        this.view.includeRightSpacerScrollerCss('ag-scroller-corner', rightSpacing <= scrollbarWidth);
        // we pad the left based on a) if cols are pinned to the left and
        // b) if v scroll is showing on the left (happens in LTR layout only)
        var leftSpacing = this.columnModel.getDisplayedColumnsLeftWidth();
        var scrollOnLeft = this.enableRtl && vScrollShowing;
        if (scrollOnLeft) {
            leftSpacing += scrollbarWidth;
        }
        this.view.setLeftSpacerFixedWidth(leftSpacing);
        this.view.includeLeftSpacerScrollerCss('ag-scroller-corner', leftSpacing <= scrollbarWidth);
    };
    FakeHScrollCtrl.prototype.setScrollVisible = function () {
        var hScrollShowing = this.scrollVisibleService.isHorizontalScrollShowing();
        var invisibleScrollbar = this.invisibleScrollbar;
        var isSuppressHorizontalScroll = this.gridOptionsWrapper.isSuppressHorizontalScroll();
        var scrollbarWidth = hScrollShowing ? (this.gridOptionsWrapper.getScrollbarWidth() || 0) : 0;
        var adjustedScrollbarWidth = (scrollbarWidth === 0 && invisibleScrollbar) ? 15 : scrollbarWidth;
        var scrollContainerSize = !isSuppressHorizontalScroll ? adjustedScrollbarWidth : 0;
        this.view.addOrRemoveCssClass('ag-scrollbar-invisible', invisibleScrollbar);
        this.view.setHeight(scrollContainerSize);
        this.view.setViewportHeight(scrollContainerSize);
        this.view.setContainerHeight(scrollContainerSize);
        this.view.addOrRemoveCssClass('ag-hidden', !hScrollShowing);
    };
    FakeHScrollCtrl.prototype.getViewport = function () {
        return this.eViewport;
    };
    FakeHScrollCtrl.prototype.getContainer = function () {
        return this.eContainer;
    };
    __decorate([
        Autowired('scrollVisibleService')
    ], FakeHScrollCtrl.prototype, "scrollVisibleService", void 0);
    __decorate([
        Autowired('columnModel')
    ], FakeHScrollCtrl.prototype, "columnModel", void 0);
    __decorate([
        Autowired('ctrlsService')
    ], FakeHScrollCtrl.prototype, "ctrlsService", void 0);
    __decorate([
        Autowired('pinnedRowModel')
    ], FakeHScrollCtrl.prototype, "pinnedRowModel", void 0);
    return FakeHScrollCtrl;
}(BeanStub));
export { FakeHScrollCtrl };
