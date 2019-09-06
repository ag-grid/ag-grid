/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var columnController_1 = require("../columnController/columnController");
var column_1 = require("../entities/column");
var context_1 = require("../context/context");
var headerContainer_1 = require("./headerContainer");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var component_1 = require("../widgets/component");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var gridApi_1 = require("../gridApi");
var autoWidthCalculator_1 = require("../rendering/autoWidthCalculator");
var constants_1 = require("../constants");
var utils_1 = require("../utils");
var HeaderRootComp = /** @class */ (function (_super) {
    __extends(HeaderRootComp, _super);
    function HeaderRootComp() {
        return _super.call(this, HeaderRootComp.TEMPLATE) || this;
    }
    HeaderRootComp.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
        this.childContainers.forEach(function (c) { return c.registerGridComp(gridPanel); });
    };
    HeaderRootComp.prototype.postConstruct = function () {
        var _this = this;
        this.printLayout = this.gridOptionsWrapper.getDomLayout() === constants_1.Constants.DOM_LAYOUT_PRINT;
        this.gridApi.registerHeaderRootComp(this);
        this.autoWidthCalculator.registerHeaderRootComp(this);
        var centerContainer = new headerContainer_1.HeaderContainer(this.eHeaderContainer, this.eHeaderViewport, null);
        var pinnedLeftContainer = new headerContainer_1.HeaderContainer(this.ePinnedLeftHeader, null, column_1.Column.PINNED_LEFT);
        var pinnedRightContainer = new headerContainer_1.HeaderContainer(this.ePinnedRightHeader, null, column_1.Column.PINNED_RIGHT);
        this.childContainers = [centerContainer, pinnedLeftContainer, pinnedRightContainer];
        this.childContainers.forEach(function (container) { return _this.getContext().wireBean(container); });
        // shotgun way to get labels to change, eg from sum(amount) to avg(amount)
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshHeader.bind(this));
        this.addDestroyableEventListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_DOM_LAYOUT, this.onDomLayoutChanged.bind(this));
        // for setting ag-pivot-on / ag-pivot-off CSS classes
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
        this.onPivotModeChanged();
        this.addPreventHeaderScroll();
        if (this.columnController.isReady()) {
            this.refreshHeader();
        }
    };
    HeaderRootComp.prototype.onDomLayoutChanged = function () {
        var newValue = this.gridOptionsWrapper.getDomLayout() === constants_1.Constants.DOM_LAYOUT_PRINT;
        if (this.printLayout !== newValue) {
            this.printLayout = newValue;
            this.refreshHeader();
        }
    };
    HeaderRootComp.prototype.setHorizontalScroll = function (offset) {
        this.eHeaderContainer.style.transform = "translateX(" + offset + "px)";
    };
    HeaderRootComp.prototype.forEachHeaderElement = function (callback) {
        this.childContainers.forEach(function (childContainer) { return childContainer.forEachHeaderElement(callback); });
    };
    HeaderRootComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.childContainers.forEach(function (container) { return container.destroy(); });
    };
    HeaderRootComp.prototype.refreshHeader = function () {
        this.childContainers.forEach(function (container) { return container.refresh(); });
    };
    HeaderRootComp.prototype.onPivotModeChanged = function () {
        var pivotMode = this.columnController.isPivotMode();
        utils_1._.addOrRemoveCssClass(this.getGui(), 'ag-pivot-on', pivotMode);
        utils_1._.addOrRemoveCssClass(this.getGui(), 'ag-pivot-off', !pivotMode);
    };
    HeaderRootComp.prototype.setHeight = function (height) {
        var px = height + "px";
        this.getGui().style.height = px;
        this.getGui().style.minHeight = px;
    };
    // if the user is in floating filter and hits tab a few times, the header can
    // end up scrolling to show items off the screen, leaving the grid and header
    // and the grid columns no longer in sync.
    HeaderRootComp.prototype.addPreventHeaderScroll = function () {
        var _this = this;
        this.addDestroyableEventListener(this.eHeaderViewport, 'scroll', function () {
            // if the header scrolls, the header will be out of sync. so we reset the
            // header scroll, and then scroll the body, which will in turn set the offset
            // on the header, giving the impression that the header scrolled as expected.
            var scrollLeft = _this.eHeaderViewport.scrollLeft;
            if (scrollLeft !== 0) {
                _this.gridPanel.scrollHorizontally(scrollLeft);
                _this.eHeaderViewport.scrollLeft = 0;
            }
        });
    };
    HeaderRootComp.prototype.setHeaderContainerWidth = function (width) {
        this.eHeaderContainer.style.width = width + "px";
    };
    HeaderRootComp.prototype.setLeftVisible = function (visible) {
        utils_1._.setDisplayed(this.ePinnedLeftHeader, visible);
    };
    HeaderRootComp.prototype.setRightVisible = function (visible) {
        utils_1._.setDisplayed(this.ePinnedRightHeader, visible);
    };
    HeaderRootComp.prototype.getHeaderRowCount = function () {
        if (this.childContainers.length === 0) {
            return 0;
        }
        return this.childContainers[0].getRowComps().length;
    };
    HeaderRootComp.TEMPLATE = "<div class=\"ag-header\" role=\"presentation\">\n            <div class=\"ag-pinned-left-header\" ref=\"ePinnedLeftHeader\" role=\"presentation\"></div>\n            <div class=\"ag-header-viewport\" ref=\"eHeaderViewport\" role=\"presentation\">\n                <div class=\"ag-header-container\" ref=\"eHeaderContainer\" role=\"rowgroup\"></div>\n            </div>\n            <div class=\"ag-pinned-right-header\" ref=\"ePinnedRightHeader\" role=\"presentation\"></div>\n        </div>";
    __decorate([
        componentAnnotations_1.RefSelector('ePinnedLeftHeader'),
        __metadata("design:type", HTMLElement)
    ], HeaderRootComp.prototype, "ePinnedLeftHeader", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('ePinnedRightHeader'),
        __metadata("design:type", HTMLElement)
    ], HeaderRootComp.prototype, "ePinnedRightHeader", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eHeaderContainer'),
        __metadata("design:type", HTMLElement)
    ], HeaderRootComp.prototype, "eHeaderContainer", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eHeaderViewport'),
        __metadata("design:type", HTMLElement)
    ], HeaderRootComp.prototype, "eHeaderViewport", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], HeaderRootComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], HeaderRootComp.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], HeaderRootComp.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], HeaderRootComp.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('autoWidthCalculator'),
        __metadata("design:type", autoWidthCalculator_1.AutoWidthCalculator)
    ], HeaderRootComp.prototype, "autoWidthCalculator", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], HeaderRootComp.prototype, "postConstruct", null);
    return HeaderRootComp;
}(component_1.Component));
exports.HeaderRootComp = HeaderRootComp;
