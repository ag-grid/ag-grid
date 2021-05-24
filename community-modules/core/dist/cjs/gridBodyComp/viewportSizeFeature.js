/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var beanStub_1 = require("../context/beanStub");
var context_1 = require("../context/context");
var events_1 = require("../events");
var dom_1 = require("../utils/dom");
// listens to changes in the center viewport size, for column and row virtualisation,
// and adjusts grid as necessary. there are two viewports, one for horizontal and one for
// vertical scrolling.
var ViewportSizeFeature = /** @class */ (function (_super) {
    __extends(ViewportSizeFeature, _super);
    function ViewportSizeFeature(centerContainer) {
        var _this = _super.call(this) || this;
        _this.centerContainerCon = centerContainer;
        return _this;
    }
    ViewportSizeFeature.prototype.postConstruct = function () {
        var _this = this;
        this.controllersService.whenReady(function () {
            _this.gridBodyCon = _this.controllersService.getGridBodyController();
            _this.listenForResize();
        });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_SCROLLBAR_WIDTH_CHANGED, this.onScrollbarWidthChanged.bind(this));
    };
    ViewportSizeFeature.prototype.listenForResize = function () {
        var listener = this.onCenterViewportResized.bind(this);
        // centerContainer gets horizontal resizes
        this.centerContainerCon.registerViewportResizeListener(listener);
        // eBodyViewport gets vertical resizes
        this.gridBodyCon.registerBodyViewportResizeListener(listener);
    };
    ViewportSizeFeature.prototype.onScrollbarWidthChanged = function () {
        this.checkViewportAndScrolls();
    };
    ViewportSizeFeature.prototype.onCenterViewportResized = function () {
        if (this.centerContainerCon.isViewportVisible()) {
            this.checkViewportAndScrolls();
            var newWidth = this.centerContainerCon.getCenterWidth();
            if (newWidth !== this.centerWidth) {
                this.centerWidth = newWidth;
                this.columnController.refreshFlexedColumns({ viewportWidth: this.centerWidth, updateBodyWidths: true, fireResizedEvent: true });
            }
        }
        else {
            this.bodyHeight = 0;
        }
    };
    // gets called every time the viewport size changes. we use this to check visibility of scrollbars
    // in the grid panel, and also to check size and position of viewport for row and column virtualisation.
    ViewportSizeFeature.prototype.checkViewportAndScrolls = function () {
        // results in updating anything that depends on scroll showing
        this.updateScrollVisibleService();
        // fires event if height changes, used by PaginationService, HeightScalerService, RowRenderer
        this.checkBodyHeight();
        // check for virtual columns for ColumnController
        this.onHorizontalViewportChanged();
        this.gridBodyCon.getScrollFeature().checkScrollLeft();
    };
    ViewportSizeFeature.prototype.getBodyHeight = function () {
        return this.bodyHeight;
    };
    ViewportSizeFeature.prototype.checkBodyHeight = function () {
        var eBodyViewport = this.gridBodyCon.getBodyViewportElement();
        var bodyHeight = dom_1.getInnerHeight(eBodyViewport);
        if (this.bodyHeight !== bodyHeight) {
            this.bodyHeight = bodyHeight;
            var event_1 = {
                type: events_1.Events.EVENT_BODY_HEIGHT_CHANGED,
                api: this.gridApi,
                columnApi: this.columnApi
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    ViewportSizeFeature.prototype.updateScrollVisibleService = function () {
        // because of column animation (which takes 200ms), we have to do this twice.
        // eg if user removes cols anywhere except at the RHS, then the cols on the RHS
        // will animate to the left to fill the gap. this animation means just after
        // the cols are removed, the remaining cols are still in the original location
        // at the start of the animation, so pre animation the H scrollbar is still needed,
        // but post animation it is not.
        this.updateScrollVisibleServiceImpl();
        setTimeout(this.updateScrollVisibleServiceImpl.bind(this), 500);
    };
    ViewportSizeFeature.prototype.updateScrollVisibleServiceImpl = function () {
        var params = {
            horizontalScrollShowing: this.isHorizontalScrollShowing(),
            verticalScrollShowing: this.gridBodyCon.isVerticalScrollShowing()
        };
        this.scrollVisibleService.setScrollsVisible(params);
        // fix - gridComp should just listen to event from above
        this.gridBodyCon.setVerticalScrollPaddingVisible(params.verticalScrollShowing);
    };
    ViewportSizeFeature.prototype.isHorizontalScrollShowing = function () {
        var isAlwaysShowHorizontalScroll = this.gridOptionsWrapper.isAlwaysShowHorizontalScroll();
        return isAlwaysShowHorizontalScroll || this.centerContainerCon.isViewportHScrollShowing();
    };
    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged, API (doLayout)
    ViewportSizeFeature.prototype.onHorizontalViewportChanged = function () {
        var scrollWidth = this.centerContainerCon.getCenterWidth();
        var scrollPosition = this.centerContainerCon.getViewportScrollLeft();
        this.columnController.setViewportPosition(scrollWidth, scrollPosition);
    };
    __decorate([
        context_1.Autowired('controllersService')
    ], ViewportSizeFeature.prototype, "controllersService", void 0);
    __decorate([
        context_1.Autowired('columnController')
    ], ViewportSizeFeature.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('scrollVisibleService')
    ], ViewportSizeFeature.prototype, "scrollVisibleService", void 0);
    __decorate([
        context_1.Autowired('columnApi')
    ], ViewportSizeFeature.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi')
    ], ViewportSizeFeature.prototype, "gridApi", void 0);
    __decorate([
        context_1.PostConstruct
    ], ViewportSizeFeature.prototype, "postConstruct", null);
    return ViewportSizeFeature;
}(beanStub_1.BeanStub));
exports.ViewportSizeFeature = ViewportSizeFeature;

//# sourceMappingURL=viewportSizeFeature.js.map
