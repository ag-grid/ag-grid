/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
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
exports.FakeHScrollComp = void 0;
const context_1 = require("../context/context");
const abstractFakeScrollComp_1 = require("./abstractFakeScrollComp");
const dom_1 = require("../utils/dom");
const eventKeys_1 = require("../eventKeys");
const componentAnnotations_1 = require("../widgets/componentAnnotations");
const centerWidthFeature_1 = require("./centerWidthFeature");
class FakeHScrollComp extends abstractFakeScrollComp_1.AbstractFakeScrollComp {
    constructor() {
        super(FakeHScrollComp.TEMPLATE, 'horizontal');
    }
    postConstruct() {
        super.postConstruct();
        // When doing printing, this changes whether cols are pinned or not
        const spacerWidthsListener = this.setFakeHScrollSpacerWidths.bind(this);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, spacerWidthsListener);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, spacerWidthsListener);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_PINNED_ROW_DATA_CHANGED, this.onPinnedRowDataChanged.bind(this));
        this.addManagedPropertyListener('domLayout', spacerWidthsListener);
        this.ctrlsService.registerFakeHScrollComp(this);
        this.createManagedBean(new centerWidthFeature_1.CenterWidthFeature(width => this.eContainer.style.width = `${width}px`));
    }
    initialiseInvisibleScrollbar() {
        if (this.invisibleScrollbar !== undefined) {
            return;
        }
        this.enableRtl = this.gridOptionsService.is('enableRtl');
        super.initialiseInvisibleScrollbar();
        if (this.invisibleScrollbar) {
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
        this.getGui().style.bottom = `${bottomPinnedHeight}px`;
    }
    onScrollVisibilityChanged() {
        super.onScrollVisibilityChanged();
        this.setFakeHScrollSpacerWidths();
    }
    setFakeHScrollSpacerWidths() {
        const vScrollShowing = this.scrollVisibleService.isVerticalScrollShowing();
        // we pad the right based on a) if cols are pinned to the right and
        // b) if v scroll is showing on the right (normal position of scroll)
        let rightSpacing = this.columnModel.getDisplayedColumnsRightWidth();
        const scrollOnRight = !this.enableRtl && vScrollShowing;
        const scrollbarWidth = this.gridOptionsService.getScrollbarWidth();
        if (scrollOnRight) {
            rightSpacing += scrollbarWidth;
        }
        dom_1.setFixedWidth(this.eRightSpacer, rightSpacing);
        this.eRightSpacer.classList.toggle('ag-scroller-corner', rightSpacing <= scrollbarWidth);
        // we pad the left based on a) if cols are pinned to the left and
        // b) if v scroll is showing on the left (happens in LTR layout only)
        let leftSpacing = this.columnModel.getDisplayedColumnsLeftWidth();
        const scrollOnLeft = this.enableRtl && vScrollShowing;
        if (scrollOnLeft) {
            leftSpacing += scrollbarWidth;
        }
        dom_1.setFixedWidth(this.eLeftSpacer, leftSpacing);
        this.eLeftSpacer.classList.toggle('ag-scroller-corner', leftSpacing <= scrollbarWidth);
    }
    setScrollVisible() {
        const hScrollShowing = this.scrollVisibleService.isHorizontalScrollShowing();
        const invisibleScrollbar = this.invisibleScrollbar;
        const isSuppressHorizontalScroll = this.gridOptionsService.is('suppressHorizontalScroll');
        const scrollbarWidth = hScrollShowing ? (this.gridOptionsService.getScrollbarWidth() || 0) : 0;
        const adjustedScrollbarWidth = (scrollbarWidth === 0 && invisibleScrollbar) ? 16 : scrollbarWidth;
        const scrollContainerSize = !isSuppressHorizontalScroll ? adjustedScrollbarWidth : 0;
        this.addOrRemoveCssClass('ag-scrollbar-invisible', invisibleScrollbar);
        dom_1.setFixedHeight(this.getGui(), scrollContainerSize);
        dom_1.setFixedHeight(this.eViewport, scrollContainerSize);
        dom_1.setFixedHeight(this.eContainer, scrollContainerSize);
        this.setDisplayed(hScrollShowing, { skipAriaHidden: true });
    }
}
FakeHScrollComp.TEMPLATE = `<div class="ag-body-horizontal-scroll" aria-hidden="true">
            <div class="ag-horizontal-left-spacer" ref="eLeftSpacer"></div>
            <div class="ag-body-horizontal-scroll-viewport" ref="eViewport">
                <div class="ag-body-horizontal-scroll-container" ref="eContainer"></div>
            </div>
            <div class="ag-horizontal-right-spacer" ref="eRightSpacer"></div>
        </div>`;
__decorate([
    componentAnnotations_1.RefSelector('eLeftSpacer')
], FakeHScrollComp.prototype, "eLeftSpacer", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eRightSpacer')
], FakeHScrollComp.prototype, "eRightSpacer", void 0);
__decorate([
    context_1.Autowired('columnModel')
], FakeHScrollComp.prototype, "columnModel", void 0);
__decorate([
    context_1.Autowired('pinnedRowModel')
], FakeHScrollComp.prototype, "pinnedRowModel", void 0);
__decorate([
    context_1.PostConstruct
], FakeHScrollComp.prototype, "postConstruct", null);
exports.FakeHScrollComp = FakeHScrollComp;
