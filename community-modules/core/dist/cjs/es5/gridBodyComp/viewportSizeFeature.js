/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
exports.ViewportSizeFeature = void 0;
var beanStub_1 = require("../context/beanStub");
var context_1 = require("../context/context");
var events_1 = require("../events");
var dom_1 = require("../utils/dom");
// listens to changes in the center viewport size, for column and row virtualisation,
// and adjusts grid as necessary. there are two viewports, one for horizontal and one for
// vertical scrolling.
var ViewportSizeFeature = /** @class */ (function (_super) {
    __extends(ViewportSizeFeature, _super);
    function ViewportSizeFeature(centerContainerCtrl) {
        var _this = _super.call(this) || this;
        _this.centerContainerCtrl = centerContainerCtrl;
        return _this;
    }
    ViewportSizeFeature.prototype.postConstruct = function () {
        var _this = this;
        this.ctrlsService.whenReady(function () {
            _this.gridBodyCtrl = _this.ctrlsService.getGridBodyCtrl();
            _this.listenForResize();
        });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_SCROLLBAR_WIDTH_CHANGED, this.onScrollbarWidthChanged.bind(this));
    };
    ViewportSizeFeature.prototype.listenForResize = function () {
        var _this = this;
        var listener = function () { return _this.onCenterViewportResized(); };
        // centerContainer gets horizontal resizes
        this.centerContainerCtrl.registerViewportResizeListener(listener);
        // eBodyViewport gets vertical resizes
        this.gridBodyCtrl.registerBodyViewportResizeListener(listener);
    };
    ViewportSizeFeature.prototype.onScrollbarWidthChanged = function () {
        this.checkViewportAndScrolls();
    };
    ViewportSizeFeature.prototype.onCenterViewportResized = function () {
        if (this.centerContainerCtrl.isViewportVisible()) {
            this.checkViewportAndScrolls();
            var newWidth = this.centerContainerCtrl.getCenterWidth();
            if (newWidth !== this.centerWidth) {
                this.centerWidth = newWidth;
                this.columnModel.refreshFlexedColumns({ viewportWidth: this.centerWidth, updateBodyWidths: true, fireResizedEvent: true });
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
        this.gridBodyCtrl.getScrollFeature().checkScrollLeft();
    };
    ViewportSizeFeature.prototype.getBodyHeight = function () {
        return this.bodyHeight;
    };
    ViewportSizeFeature.prototype.checkBodyHeight = function () {
        var eBodyViewport = this.gridBodyCtrl.getBodyViewportElement();
        var bodyHeight = dom_1.getInnerHeight(eBodyViewport);
        if (this.bodyHeight !== bodyHeight) {
            this.bodyHeight = bodyHeight;
            var event_1 = {
                type: events_1.Events.EVENT_BODY_HEIGHT_CHANGED
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
            verticalScrollShowing: this.gridBodyCtrl.isVerticalScrollShowing()
        };
        this.scrollVisibleService.setScrollsVisible(params);
        // fix - gridComp should just listen to event from above
        this.gridBodyCtrl.setVerticalScrollPaddingVisible(params.verticalScrollShowing);
    };
    ViewportSizeFeature.prototype.isHorizontalScrollShowing = function () {
        var isAlwaysShowHorizontalScroll = this.gridOptionsService.is('alwaysShowHorizontalScroll');
        return isAlwaysShowHorizontalScroll || this.centerContainerCtrl.isViewportHScrollShowing();
    };
    // this gets called whenever a change in the viewport, so we can inform column controller it has to work
    // out the virtual columns again. gets called from following locations:
    // + ensureColVisible, scroll, init, layoutChanged, displayedColumnsChanged
    ViewportSizeFeature.prototype.onHorizontalViewportChanged = function () {
        var scrollWidth = this.centerContainerCtrl.getCenterWidth();
        var scrollPosition = this.centerContainerCtrl.getViewportScrollLeft();
        this.columnModel.setViewportPosition(scrollWidth, scrollPosition);
    };
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
    return ViewportSizeFeature;
}(beanStub_1.BeanStub));
exports.ViewportSizeFeature = ViewportSizeFeature;
