/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
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
exports.ViewportSizeFeature = void 0;
const beanStub_1 = require("../context/beanStub");
const context_1 = require("../context/context");
const events_1 = require("../events");
const dom_1 = require("../utils/dom");
// listens to changes in the center viewport size, for column and row virtualisation,
// and adjusts grid as necessary. there are two viewports, one for horizontal and one for
// vertical scrolling.
class ViewportSizeFeature extends beanStub_1.BeanStub {
    constructor(centerContainerCtrl) {
        super();
        this.centerContainerCtrl = centerContainerCtrl;
    }
    postConstruct() {
        this.ctrlsService.whenReady(() => {
            this.gridBodyCtrl = this.ctrlsService.getGridBodyCtrl();
            this.listenForResize();
        });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_SCROLLBAR_WIDTH_CHANGED, this.onScrollbarWidthChanged.bind(this));
    }
    listenForResize() {
        const listener = () => this.onCenterViewportResized();
        // centerContainer gets horizontal resizes
        this.centerContainerCtrl.registerViewportResizeListener(listener);
        // eBodyViewport gets vertical resizes
        this.gridBodyCtrl.registerBodyViewportResizeListener(listener);
    }
    onScrollbarWidthChanged() {
        this.checkViewportAndScrolls();
    }
    onCenterViewportResized() {
        if (this.centerContainerCtrl.isViewportVisible()) {
            this.checkViewportAndScrolls();
            const newWidth = this.centerContainerCtrl.getCenterWidth();
            if (newWidth !== this.centerWidth) {
                this.centerWidth = newWidth;
                this.columnModel.refreshFlexedColumns({ viewportWidth: this.centerWidth, updateBodyWidths: true, fireResizedEvent: true });
            }
        }
        else {
            this.bodyHeight = 0;
        }
    }
    // gets called every time the viewport size changes. we use this to check visibility of scrollbars
    // in the grid panel, and also to check size and position of viewport for row and column virtualisation.
    checkViewportAndScrolls() {
        // results in updating anything that depends on scroll showing
        this.updateScrollVisibleService();
        // fires event if height changes, used by PaginationService, HeightScalerService, RowRenderer
        this.checkBodyHeight();
        // check for virtual columns for ColumnController
        this.onHorizontalViewportChanged();
        this.gridBodyCtrl.getScrollFeature().checkScrollLeft();
    }
    getBodyHeight() {
        return this.bodyHeight;
    }
    checkBodyHeight() {
        const eBodyViewport = this.gridBodyCtrl.getBodyViewportElement();
        const bodyHeight = dom_1.getInnerHeight(eBodyViewport);
        if (this.bodyHeight !== bodyHeight) {
            this.bodyHeight = bodyHeight;
            const event = {
                type: events_1.Events.EVENT_BODY_HEIGHT_CHANGED
            };
            this.eventService.dispatchEvent(event);
        }
    }
    updateScrollVisibleService() {
        // because of column animation (which takes 200ms), we have to do this twice.
        // eg if user removes cols anywhere except at the RHS, then the cols on the RHS
        // will animate to the left to fill the gap. this animation means just after
        // the cols are removed, the remaining cols are still in the original location
        // at the start of the animation, so pre animation the H scrollbar is still needed,
        // but post animation it is not.
        this.updateScrollVisibleServiceImpl();
        setTimeout(this.updateScrollVisibleServiceImpl.bind(this), 500);
    }
    updateScrollVisibleServiceImpl() {
        const params = {
            horizontalScrollShowing: this.isHorizontalScrollShowing(),
            verticalScrollShowing: this.gridBodyCtrl.isVerticalScrollShowing()
        };
        this.scrollVisibleService.setScrollsVisible(params);
        // fix - gridComp should just listen to event from above
        this.gridBodyCtrl.setVerticalScrollPaddingVisible(params.verticalScrollShowing);
    }
    isHorizontalScrollShowing() {
        const isAlwaysShowHorizontalScroll = this.gridOptionsService.is('alwaysShowHorizontalScroll');
        return isAlwaysShowHorizontalScroll || this.centerContainerCtrl.isViewportHScrollShowing();
    }
    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged
    onHorizontalViewportChanged() {
        const scrollWidth = this.centerContainerCtrl.getCenterWidth();
        const scrollPosition = this.centerContainerCtrl.getViewportScrollLeft();
        this.columnModel.setViewportPosition(scrollWidth, scrollPosition);
    }
}
__decorate([
    context_1.Autowired('ctrlsService')
], ViewportSizeFeature.prototype, "ctrlsService", void 0);
__decorate([
    context_1.Autowired('columnModel')
], ViewportSizeFeature.prototype, "columnModel", void 0);
__decorate([
    context_1.Autowired('scrollVisibleService')
], ViewportSizeFeature.prototype, "scrollVisibleService", void 0);
__decorate([
    context_1.PostConstruct
], ViewportSizeFeature.prototype, "postConstruct", null);
exports.ViewportSizeFeature = ViewportSizeFeature;
