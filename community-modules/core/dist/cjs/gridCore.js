/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
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
var context_1 = require("./context/context");
var componentAnnotations_1 = require("./widgets/componentAnnotations");
var events_1 = require("./events");
var sideBar_1 = require("./entities/sideBar");
var moduleNames_1 = require("./modules/moduleNames");
var moduleRegistry_1 = require("./modules/moduleRegistry");
var managedFocusComponent_1 = require("./widgets/managedFocusComponent");
var utils_1 = require("./utils");
var GridCore = /** @class */ (function (_super) {
    __extends(GridCore, _super);
    function GridCore() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridCore.prototype.postConstruct = function () {
        var _this = this;
        this.logger = this.loggerFactory.create('GridCore');
        var template = this.createTemplate();
        this.setTemplate(template);
        // register with services that need grid core
        [
            this.gridApi,
            this.rowRenderer,
            this.popupService,
            this.focusController
        ].forEach(function (service) { return service.registerGridCore(_this); });
        if (moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.ClipboardModule)) {
            this.clipboardService.registerGridCore(this);
        }
        this.gridOptionsWrapper.addLayoutElement(this.getGui());
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
        var unsubscribeFromResize = this.resizeObserverService.observeResize(this.eGridDiv, this.onGridSizeChanged.bind(this));
        this.addDestroyFunc(function () { return unsubscribeFromResize(); });
        var eGui = this.getGui();
        this.addManagedListener(this.eventService, events_1.Events.EVENT_KEYBOARD_FOCUS, function () {
            utils_1._.addCssClass(eGui, 'ag-keyboard-focus');
        });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_MOUSE_FOCUS, function () {
            utils_1._.removeCssClass(eGui, 'ag-keyboard-focus');
        });
        _super.prototype.postConstruct.call(this);
    };
    GridCore.prototype.getFocusableElement = function () {
        return this.eRootWrapperBody;
    };
    GridCore.prototype.createTemplate = function () {
        var sideBarModuleLoaded = moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.SideBarModule);
        var statusBarModuleLoaded = moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.StatusBarModule);
        var rowGroupingLoaded = moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.RowGroupingModule);
        var enterpriseCoreLoaded = moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.EnterpriseCoreModule);
        var dropZones = rowGroupingLoaded ? '<ag-grid-header-drop-zones></ag-grid-header-drop-zones>' : '';
        var sideBar = sideBarModuleLoaded ? '<ag-side-bar ref="sideBar"></ag-side-bar>' : '';
        var statusBar = statusBarModuleLoaded ? '<ag-status-bar ref="statusBar"></ag-status-bar>' : '';
        var watermark = enterpriseCoreLoaded ? '<ag-watermark></ag-watermark>' : '';
        var template = "<div ref=\"eRootWrapper\" class=\"ag-root-wrapper\">\n                " + dropZones + "\n                <div class=\"ag-root-wrapper-body\" ref=\"rootWrapperBody\">\n                    <ag-grid-comp ref=\"gridPanel\"></ag-grid-comp>\n                    " + sideBar + "\n                </div>\n                " + statusBar + "\n                <ag-pagination></ag-pagination>\n                " + watermark + "\n            </div>";
        return template;
    };
    GridCore.prototype.isFocusableContainer = function () {
        return true;
    };
    GridCore.prototype.getFocusableContainers = function () {
        var focusableContainers = [
            this.gridPanel.getGui()
        ];
        if (this.sideBarComp) {
            focusableContainers.push(this.sideBarComp.getGui());
        }
        return focusableContainers.filter(function (el) { return utils_1._.isVisible(el); });
    };
    GridCore.prototype.focusNextInnerContainer = function (backwards) {
        var focusableContainers = this.getFocusableContainers();
        var idxWithFocus = utils_1._.findIndex(focusableContainers, function (container) { return container.contains(document.activeElement); });
        var nextIdx = idxWithFocus + (backwards ? -1 : 1);
        if (nextIdx < 0 || nextIdx >= focusableContainers.length) {
            return false;
        }
        if (nextIdx === 0) {
            return this.focusGridHeader();
        }
        return this.focusController.focusFirstFocusableElement(focusableContainers[nextIdx]);
    };
    GridCore.prototype.focusInnerElement = function (fromBottom) {
        var focusableContainers = this.getFocusableContainers();
        if (fromBottom && focusableContainers.length > 1) {
            return this.focusController.focusFirstFocusableElement(utils_1._.last(focusableContainers));
        }
        return this.focusGridHeader();
    };
    GridCore.prototype.focusGridHeader = function () {
        var firstColumn = this.columnController.getAllDisplayedColumns()[0];
        if (!firstColumn) {
            return false;
        }
        if (firstColumn.getParent()) {
            firstColumn = this.columnController.getColumnGroupAtLevel(firstColumn, 0);
        }
        this.focusController.focusHeaderPosition({
            headerRowIndex: 0,
            column: firstColumn
        });
        return true;
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
                console.warn('ag-Grid: sideBar is not loaded');
            }
            return;
        }
        this.sideBarComp.setDisplayed(show);
    };
    GridCore.prototype.setSideBarPosition = function (position) {
        if (!this.sideBarComp) {
            console.warn('ag-Grid: sideBar is not loaded');
            return;
        }
        this.sideBarComp.setSideBarPosition(position);
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
    GridCore.prototype.getToolPanelInstance = function (key) {
        if (!this.sideBarComp) {
            console.warn('ag-Grid: toolPanel is only available in ag-Grid Enterprise');
            return;
        }
        return this.sideBarComp.getToolPanelInstance(key);
    };
    GridCore.prototype.refreshSideBar = function () {
        if (this.sideBarComp) {
            this.sideBarComp.refresh();
        }
    };
    GridCore.prototype.setSideBar = function (def) {
        if (!this.sideBarComp) {
            return;
        }
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
        this.logger.log('Grid DOM removed');
        _super.prototype.destroy.call(this);
    };
    // Valid values for position are bottom, middle and top
    GridCore.prototype.ensureNodeVisible = function (comparator, position) {
        if (position === void 0) { position = null; }
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
    __decorate([
        context_1.Autowired('gridOptions')
    ], GridCore.prototype, "gridOptions", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], GridCore.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('rowModel')
    ], GridCore.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('resizeObserverService')
    ], GridCore.prototype, "resizeObserverService", void 0);
    __decorate([
        context_1.Autowired('rowRenderer')
    ], GridCore.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('filterManager')
    ], GridCore.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('eGridDiv')
    ], GridCore.prototype, "eGridDiv", void 0);
    __decorate([
        context_1.Autowired('$scope')
    ], GridCore.prototype, "$scope", void 0);
    __decorate([
        context_1.Autowired('quickFilterOnScope')
    ], GridCore.prototype, "quickFilterOnScope", void 0);
    __decorate([
        context_1.Autowired('popupService')
    ], GridCore.prototype, "popupService", void 0);
    __decorate([
        context_1.Autowired('columnController')
    ], GridCore.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('loggerFactory')
    ], GridCore.prototype, "loggerFactory", void 0);
    __decorate([
        context_1.Autowired('columnApi')
    ], GridCore.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi')
    ], GridCore.prototype, "gridApi", void 0);
    __decorate([
        context_1.Optional('clipboardService')
    ], GridCore.prototype, "clipboardService", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('gridPanel')
    ], GridCore.prototype, "gridPanel", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('sideBar')
    ], GridCore.prototype, "sideBarComp", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('rootWrapperBody')
    ], GridCore.prototype, "eRootWrapperBody", void 0);
    return GridCore;
}(managedFocusComponent_1.ManagedFocusComponent));
exports.GridCore = GridCore;

//# sourceMappingURL=gridCore.js.map
