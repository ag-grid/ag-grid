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
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var columnApi_1 = require("./columnController/columnApi");
var columnController_1 = require("./columnController/columnController");
var rowRenderer_1 = require("./rendering/rowRenderer");
var filterManager_1 = require("./filter/filterManager");
var eventService_1 = require("./eventService");
var gridPanel_1 = require("./gridPanel/gridPanel");
var logger_1 = require("./logger");
var popupService_1 = require("./widgets/popupService");
var utils_1 = require("./utils");
var context_1 = require("./context/context");
var focusedCellController_1 = require("./focusedCellController");
var component_1 = require("./widgets/component");
var gridApi_1 = require("./gridApi");
var componentAnnotations_1 = require("./widgets/componentAnnotations");
var resizeObserver_1 = require("./resizeObserver");
var events_1 = require("./events");
var GridCore = (function (_super) {
    __extends(GridCore, _super);
    function GridCore() {
        return _super.call(this) || this;
    }
    GridCore_1 = GridCore;
    GridCore.prototype.init = function () {
        var _this = this;
        this.logger = this.loggerFactory.create('GridCore');
        var template = this.enterprise ? GridCore_1.TEMPLATE_ENTERPRISE : GridCore_1.TEMPLATE_NORMAL;
        this.setTemplate(template);
        this.instantiate(this.context);
        if (this.enterprise) {
            this.toolPanelComp.registerGridComp(this.gridPanel);
            this.statusBar.registerGridPanel(this.gridPanel);
        }
        this.gridOptionsWrapper.addLayoutElement(this.getGui());
        // see what the grid options are for default of toolbar
        this.showToolPanel(this.gridOptionsWrapper.isShowToolPanel());
        this.eGridDiv.appendChild(this.getGui());
        this.addDestroyFunc(function () {
            _this.eGridDiv.removeChild(_this.getGui());
        });
        // if using angular, watch for quickFilter changes
        if (this.$scope) {
            var quickFilterUnregisterFn = this.$scope.$watch(this.quickFilterOnScope, function (newFilter) { return _this.filterManager.setQuickFilter(newFilter); });
            this.addDestroyFunc(quickFilterUnregisterFn);
        }
        // important to set rtl before doLayout, as setting the RTL class impacts the scroll position,
        // which doLayout indirectly depends on
        this.addRtlSupport();
        this.finished = false;
        this.addDestroyFunc(function () { return _this.finished = true; });
        this.logger.log('ready');
        this.gridOptionsWrapper.addLayoutElement(this.eRootWrapperBody);
        var unsubscribeFromResize = resizeObserver_1.observeResize(this.eGridDiv, this.onGridSizeChanged.bind(this));
        this.addDestroyFunc(function () { return unsubscribeFromResize(); });
    };
    GridCore.prototype.onGridSizeChanged = function () {
        var event = {
            type: events_1.Events.EVENT_GRID_SIZE_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
            clientWidth: this.eGridDiv.clientWidth,
            clientHeight: this.eGridDiv.clientHeight
        };
        this.eventService.dispatchEvent(event);
    };
    GridCore.prototype.getPreferredWidth = function () {
        var widthForCols = this.columnController.getBodyContainerWidth()
            + this.columnController.getPinnedLeftContainerWidth()
            + this.columnController.getPinnedRightContainerWidth();
        var widthForToolpanel = this.toolPanelComp ? this.toolPanelComp.getPreferredWidth() : 0;
        return widthForCols + widthForToolpanel;
    };
    GridCore.prototype.addRtlSupport = function () {
        var cssClass = this.gridOptionsWrapper.isEnableRtl() ? 'ag-rtl' : 'ag-ltr';
        utils_1.Utils.addCssClass(this.getGui(), cssClass);
    };
    GridCore.prototype.getRootGui = function () {
        return this.getGui();
    };
    GridCore.prototype.showToolPanel = function (show) {
        if (!this.toolPanelComp) {
            if (show) {
                console.warn('ag-Grid: toolPanel is only available in ag-Grid Enterprise');
            }
            return;
        }
        this.toolPanelComp.showToolPanel(show);
    };
    GridCore.prototype.isToolPanelShowing = function () {
        return this.toolPanelComp.isToolPanelShowing();
    };
    // need to override, as parent class isn't marked with PreDestroy
    GridCore.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.logger.log('Grid DOM removed');
    };
    // Valid values for position are bottom, middle and top
    GridCore.prototype.ensureNodeVisible = function (comparator, position) {
        if (position === void 0) { position = 'top'; }
        if (this.doingVirtualPaging) {
            throw 'Cannot use ensureNodeVisible when doing virtual paging, as we cannot check rows that are not in memory';
        }
        // look for the node index we want to display
        var rowCount = this.rowModel.getPageLastRow() + 1;
        var comparatorIsAFunction = typeof comparator === 'function';
        var indexToSelect = -1;
        // go through all the nodes, find the one we want to show
        for (var i = 0; i < rowCount; i++) {
            var node = this.rowModel.getRow(i);
            if (comparatorIsAFunction) {
                if (comparator(node)) {
                    indexToSelect = i;
                    break;
                }
            }
            else {
                // check object equality against node and data
                if (comparator === node || comparator === node.data) {
                    indexToSelect = i;
                    break;
                }
            }
        }
        if (indexToSelect >= 0) {
            this.gridPanel.ensureIndexVisible(indexToSelect, position);
        }
    };
    GridCore.TEMPLATE_NORMAL = "<div class=\"ag-root-wrapper\">\n            <div class=\"ag-root-wrapper-body\" ref=\"rootWrapperBody\">\n                <ag-grid-comp ref=\"gridPanel\"></ag-grid-comp>\n            </div>\n            <ag-pagination></ag-pagination>\n        </div>";
    GridCore.TEMPLATE_ENTERPRISE = "<div class=\"ag-root-wrapper\">\n            <ag-header-column-drop></ag-header-column-drop>\n            <div ref=\"rootWrapperBody\" class=\"ag-root-wrapper-body\">\n                <ag-grid-comp ref=\"gridPanel\"></ag-grid-comp>\n                <ag-tool-panel ref=\"toolPanel\"></ag-tool-panel>\n            </div>\n            <ag-status-bar ref=\"statusBar\"></ag-status-bar>\n            <ag-pagination></ag-pagination>\n        </div>";
    __decorate([
        context_1.Autowired('enterprise'),
        __metadata("design:type", Boolean)
    ], GridCore.prototype, "enterprise", void 0);
    __decorate([
        context_1.Autowired('gridOptions'),
        __metadata("design:type", Object)
    ], GridCore.prototype, "gridOptions", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], GridCore.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], GridCore.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('frameworkFactory'),
        __metadata("design:type", Object)
    ], GridCore.prototype, "frameworkFactory", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], GridCore.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('rowRenderer'),
        __metadata("design:type", rowRenderer_1.RowRenderer)
    ], GridCore.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('filterManager'),
        __metadata("design:type", filterManager_1.FilterManager)
    ], GridCore.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], GridCore.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('eGridDiv'),
        __metadata("design:type", HTMLElement)
    ], GridCore.prototype, "eGridDiv", void 0);
    __decorate([
        context_1.Autowired('$scope'),
        __metadata("design:type", Object)
    ], GridCore.prototype, "$scope", void 0);
    __decorate([
        context_1.Autowired('quickFilterOnScope'),
        __metadata("design:type", String)
    ], GridCore.prototype, "quickFilterOnScope", void 0);
    __decorate([
        context_1.Autowired('popupService'),
        __metadata("design:type", popupService_1.PopupService)
    ], GridCore.prototype, "popupService", void 0);
    __decorate([
        context_1.Autowired('focusedCellController'),
        __metadata("design:type", focusedCellController_1.FocusedCellController)
    ], GridCore.prototype, "focusedCellController", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], GridCore.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('loggerFactory'),
        __metadata("design:type", logger_1.LoggerFactory)
    ], GridCore.prototype, "loggerFactory", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], GridCore.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], GridCore.prototype, "gridApi", void 0);
    __decorate([
        context_1.Optional('rowGroupCompFactory'),
        __metadata("design:type", Object)
    ], GridCore.prototype, "rowGroupCompFactory", void 0);
    __decorate([
        context_1.Optional('pivotCompFactory'),
        __metadata("design:type", Object)
    ], GridCore.prototype, "pivotCompFactory", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('statusBar'),
        __metadata("design:type", Object)
    ], GridCore.prototype, "statusBar", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('gridPanel'),
        __metadata("design:type", gridPanel_1.GridPanel)
    ], GridCore.prototype, "gridPanel", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('toolPanel'),
        __metadata("design:type", Object)
    ], GridCore.prototype, "toolPanelComp", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('rootWrapperBody'),
        __metadata("design:type", HTMLElement)
    ], GridCore.prototype, "eRootWrapperBody", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], GridCore.prototype, "init", null);
    __decorate([
        context_1.PreDestroy,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], GridCore.prototype, "destroy", null);
    GridCore = GridCore_1 = __decorate([
        context_1.Bean('gridCore'),
        __metadata("design:paramtypes", [])
    ], GridCore);
    return GridCore;
    var GridCore_1;
}(component_1.Component));
exports.GridCore = GridCore;
