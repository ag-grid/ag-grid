/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var scrollVisibleService_1 = require("../gridPanel/scrollVisibleService");
var component_1 = require("../widgets/component");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var utils_1 = require("../utils");
var gridApi_1 = require("../gridApi");
var autoWidthCalculator_1 = require("../rendering/autoWidthCalculator");
var HeaderRootComp = (function (_super) {
    __extends(HeaderRootComp, _super);
    function HeaderRootComp() {
        return _super.call(this, HeaderRootComp.TEMPLATE) || this;
    }
    HeaderRootComp.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
        this.centerContainer.registerGridComp(gridPanel);
        this.pinnedLeftContainer.registerGridComp(gridPanel);
        this.pinnedRightContainer.registerGridComp(gridPanel);
    };
    HeaderRootComp.prototype.postConstruct = function () {
        var _this = this;
        this.gridApi.registerHeaderRootComp(this);
        this.autoWidthCalculator.registerHeaderRootComp(this);
        this.centerContainer = new headerContainer_1.HeaderContainer(this.eHeaderContainer, this.eHeaderViewport, null);
        this.childContainers = [this.centerContainer];
        this.pinnedLeftContainer = new headerContainer_1.HeaderContainer(this.ePinnedLeftHeader, null, column_1.Column.PINNED_LEFT);
        this.pinnedRightContainer = new headerContainer_1.HeaderContainer(this.ePinnedRightHeader, null, column_1.Column.PINNED_RIGHT);
        this.childContainers.push(this.pinnedLeftContainer);
        this.childContainers.push(this.pinnedRightContainer);
        this.childContainers.forEach(function (container) { return _this.context.wireBean(container); });
        // shotgun way to get labels to change, eg from sum(amount) to avg(amount)
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshHeader.bind(this));
        // for setting ag-pivot-on / ag-pivot-off CSS classes
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.onPivotModeChanged.bind(this));
        this.addPreventHeaderScroll();
        if (this.columnController.isReady()) {
            this.refreshHeader();
        }
    };
    HeaderRootComp.prototype.setHorizontalScroll = function (offset) {
        this.eHeaderContainer.style.left = offset + 'px';
    };
    HeaderRootComp.prototype.forEachHeaderElement = function (callback) {
        this.childContainers.forEach(function (childContainer) { return childContainer.forEachHeaderElement(callback); });
    };
    HeaderRootComp.prototype.destroy = function () {
        this.childContainers.forEach(function (container) { return container.destroy(); });
    };
    HeaderRootComp.prototype.refreshHeader = function () {
        this.childContainers.forEach(function (container) { return container.refresh(); });
    };
    HeaderRootComp.prototype.onPivotModeChanged = function () {
        var pivotMode = this.columnController.isPivotMode();
        utils_1.Utils.addOrRemoveCssClass(this.getGui(), 'ag-pivot-on', pivotMode);
        utils_1.Utils.addOrRemoveCssClass(this.getGui(), 'ag-pivot-off', !pivotMode);
    };
    HeaderRootComp.prototype.setHeight = function (height) {
        this.getGui().style.height = height + 'px';
        this.getGui().style.minHeight = height + 'px';
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
    HeaderRootComp.prototype.setLeftVisible = function (visible) {
        utils_1.Utils.setVisible(this.ePinnedLeftHeader, visible);
    };
    HeaderRootComp.prototype.setRightVisible = function (visible) {
        utils_1.Utils.setVisible(this.ePinnedRightHeader, visible);
    };
    HeaderRootComp.TEMPLATE = "<div class=\"ag-header\" role=\"row\">\n            <div class=\"ag-pinned-left-header\" ref=\"ePinnedLeftHeader\" role=\"presentation\"></div>\n            <div class=\"ag-header-viewport\" ref=\"eHeaderViewport\" role=\"presentation\">\n                <div class=\"ag-header-container\" ref=\"eHeaderContainer\" role=\"presentation\"></div>\n            </div>\n            <div class=\"ag-pinned-right-header\" ref=\"ePinnedRightHeader\" role=\"presentation\"></div>\n        </div>";
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
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], HeaderRootComp.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], HeaderRootComp.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('scrollVisibleService'),
        __metadata("design:type", scrollVisibleService_1.ScrollVisibleService)
    ], HeaderRootComp.prototype, "scrollVisibleService", void 0);
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
    __decorate([
        context_1.PreDestroy,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], HeaderRootComp.prototype, "destroy", null);
    return HeaderRootComp;
}(component_1.Component));
exports.HeaderRootComp = HeaderRootComp;
