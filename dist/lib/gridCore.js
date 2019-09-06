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
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var columnApi_1 = require("./columnController/columnApi");
var columnController_1 = require("./columnController/columnController");
var rowRenderer_1 = require("./rendering/rowRenderer");
var filterManager_1 = require("./filter/filterManager");
var eventService_1 = require("./eventService");
var gridPanel_1 = require("./gridPanel/gridPanel");
var logger_1 = require("./logger");
var popupService_1 = require("./widgets/popupService");
var context_1 = require("./context/context");
var focusedCellController_1 = require("./focusedCellController");
var component_1 = require("./widgets/component");
var gridApi_1 = require("./gridApi");
var componentAnnotations_1 = require("./widgets/componentAnnotations");
var events_1 = require("./events");
var resizeObserverService_1 = require("./misc/resizeObserverService");
var sideBar_1 = require("./entities/sideBar");
var utils_1 = require("./utils");
var GridCore = /** @class */ (function (_super) {
    __extends(GridCore, _super);
    function GridCore() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridCore.prototype.init = function () {
        var _this = this;
        this.logger = this.loggerFactory.create('GridCore');
        var template = this.enterprise ? GridCore.TEMPLATE_ENTERPRISE : GridCore.TEMPLATE_NORMAL;
        this.setTemplate(template);
        // register with services that need grid core
        [
            this.gridApi,
            this.filterManager,
            this.rowRenderer,
            this.popupService
        ].forEach(function (service) { return service.registerGridCore(_this); });
        if (this.enterprise) {
            this.clipboardService.registerGridCore(this);
        }
        this.gridOptionsWrapper.addLayoutElement(this.getGui());
        // see what the grid options are for default of toolbar
        this.setSideBarVisible(this.gridOptionsWrapper.isShowToolPanel());
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
        this.logger.log('ready');
        this.gridOptionsWrapper.addLayoutElement(this.eRootWrapperBody);
        var gridPanelEl = this.gridPanel.getGui();
        this.addDestroyableEventListener(gridPanelEl, 'focusin', function () {
            utils_1._.addCssClass(gridPanelEl, 'ag-has-focus');
        });
        this.addDestroyableEventListener(gridPanelEl, 'focusout', function (e) {
            if (!gridPanelEl.contains(e.relatedTarget)) {
                utils_1._.removeCssClass(gridPanelEl, 'ag-has-focus');
            }
        });
        var unsubscribeFromResize = this.resizeObserverService.observeResize(this.eGridDiv, this.onGridSizeChanged.bind(this));
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
    GridCore.prototype.addRtlSupport = function () {
        var cssClass = this.gridOptionsWrapper.isEnableRtl() ? 'ag-rtl' : 'ag-ltr';
        utils_1._.addCssClass(this.getGui(), cssClass);
    };
    GridCore.prototype.getRootGui = function () {
        return this.getGui();
    };
    GridCore.prototype.isSideBarVisible = function () {
        if (!this.sideBarComp) {
            return false;
        }
        return this.sideBarComp.isDisplayed();
    };
    GridCore.prototype.setSideBarVisible = function (show) {
        if (!this.sideBarComp) {
            if (show) {
                console.warn('ag-Grid: toolPanel is only available in ag-Grid Enterprise');
            }
            return;
        }
        this.sideBarComp.setDisplayed(show);
    };
    GridCore.prototype.closeToolPanel = function () {
        if (!this.sideBarComp) {
            console.warn('ag-Grid: toolPanel is only available in ag-Grid Enterprise');
            return;
        }
        this.sideBarComp.close();
    };
    GridCore.prototype.getSideBar = function () {
        return this.gridOptions.sideBar;
    };
    GridCore.prototype.refreshSideBar = function () {
        if (this.sideBarComp) {
            this.sideBarComp.refresh();
        }
    };
    GridCore.prototype.setSideBar = function (def) {
        this.eRootWrapperBody.removeChild(this.sideBarComp.getGui());
        this.gridOptions.sideBar = sideBar_1.SideBarDefParser.parse(def);
        this.sideBarComp.reset();
        this.eRootWrapperBody.appendChild(this.sideBarComp.getGui());
    };
    GridCore.prototype.getOpenedToolPanel = function () {
        if (!this.sideBarComp) {
            return null;
        }
        return this.sideBarComp.openedItem();
    };
    GridCore.prototype.openToolPanel = function (key) {
        if (!this.sideBarComp) {
            console.warn('ag-Grid: toolPanel is only available in ag-Grid Enterprise');
            return;
        }
        this.sideBarComp.openToolPanel(key);
    };
    GridCore.prototype.isToolPanelShowing = function () {
        return this.sideBarComp.isToolPanelShowing();
    };
    GridCore.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.logger.log('Grid DOM removed');
    };
    // Valid values for position are bottom, middle and top
    GridCore.prototype.ensureNodeVisible = function (comparator, position) {
        if (position === void 0) { position = 'top'; }
        if (this.doingVirtualPaging) {
            throw new Error('Cannot use ensureNodeVisible when doing virtual paging, as we cannot check rows that are not in memory');
        }
        // look for the node index we want to display
        var rowCount = this.rowModel.getRowCount();
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
    GridCore.TEMPLATE_ENTERPRISE = "<div class=\"ag-root-wrapper\">\n            <ag-grid-header-drop-zones></ag-grid-header-drop-zones>\n            <div ref=\"rootWrapperBody\" class=\"ag-root-wrapper-body\">\n                <ag-grid-comp ref=\"gridPanel\"></ag-grid-comp>\n                <ag-side-bar ref=\"sideBar\"></ag-side-bar>\n            </div>\n            <ag-status-bar ref=\"statusBar\"></ag-status-bar>\n            <ag-pagination></ag-pagination>\n            <ag-watermark></ag-watermark>\n        </div>";
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
        context_1.Autowired('resizeObserverService'),
        __metadata("design:type", resizeObserverService_1.ResizeObserverService)
    ], GridCore.prototype, "resizeObserverService", void 0);
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
        context_1.Optional('clipboardService'),
        __metadata("design:type", Object)
    ], GridCore.prototype, "clipboardService", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('gridPanel'),
        __metadata("design:type", gridPanel_1.GridPanel)
    ], GridCore.prototype, "gridPanel", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('sideBar'),
        __metadata("design:type", Object)
    ], GridCore.prototype, "sideBarComp", void 0);
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
    return GridCore;
}(component_1.Component));
exports.GridCore = GridCore;
