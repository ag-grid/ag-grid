/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var columnController_1 = require("./columnController/columnController");
var rowRenderer_1 = require("./rendering/rowRenderer");
var filterManager_1 = require("./filter/filterManager");
var eventService_1 = require("./eventService");
var gridPanel_1 = require("./gridPanel/gridPanel");
var logger_1 = require("./logger");
var constants_1 = require("./constants");
var popupService_1 = require("./widgets/popupService");
var events_1 = require("./events");
var utils_1 = require("./utils");
var borderLayout_1 = require("./layout/borderLayout");
var context_1 = require("./context/context");
var focusedCellController_1 = require("./focusedCellController");
var component_1 = require("./widgets/component");
var paginationComp_1 = require("./rowModels/pagination/paginationComp");
var GridCore = (function () {
    function GridCore(loggerFactory) {
        this.destroyFunctions = [];
        this.logger = loggerFactory.create('GridCore');
    }
    GridCore.prototype.init = function () {
        var _this = this;
        var eSouthPanel = this.createSouthPanel();
        var eastPanel;
        var westPanel;
        if (this.toolPanel && !this.gridOptionsWrapper.isForPrint()) {
            // if we are doing RTL, then the tool panel appears on the left
            if (this.gridOptionsWrapper.isEnableRtl()) {
                westPanel = this.toolPanel.getGui();
            }
            else {
                eastPanel = this.toolPanel.getGui();
            }
        }
        var createTopPanelGui = this.createNorthPanel();
        this.eRootPanel = new borderLayout_1.BorderLayout({
            center: this.gridPanel.getLayout(),
            east: eastPanel,
            west: westPanel,
            north: createTopPanelGui,
            south: eSouthPanel,
            dontFill: this.gridOptionsWrapper.isForPrint(),
            name: 'eRootPanel'
        });
        // see what the grid options are for default of toolbar
        this.showToolPanel(this.gridOptionsWrapper.isShowToolPanel());
        this.eGridDiv.appendChild(this.eRootPanel.getGui());
        // if using angular, watch for quickFilter changes
        if (this.$scope) {
            this.$scope.$watch(this.quickFilterOnScope, function (newFilter) { return _this.filterManager.setQuickFilter(newFilter); });
        }
        if (!this.gridOptionsWrapper.isForPrint()) {
            this.addWindowResizeListener();
        }
        // important to set rtl before doLayout, as setting the RTL class impacts the scroll position,
        // which doLayout indirectly depends on
        this.addRtlSupport();
        this.doLayout();
        this.finished = false;
        this.periodicallyDoLayout();
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onRowGroupChanged.bind(this));
        this.onRowGroupChanged();
        this.logger.log('ready');
    };
    GridCore.prototype.addRtlSupport = function () {
        if (this.gridOptionsWrapper.isEnableRtl()) {
            utils_1.Utils.addCssClass(this.eRootPanel.getGui(), 'ag-rtl');
        }
        else {
            utils_1.Utils.addCssClass(this.eRootPanel.getGui(), 'ag-ltr');
        }
    };
    GridCore.prototype.createNorthPanel = function () {
        var _this = this;
        if (!this.gridOptionsWrapper.isEnterprise()) {
            return null;
        }
        var topPanelGui = document.createElement('div');
        var dropPanelVisibleListener = this.onDropPanelVisible.bind(this);
        this.rowGroupComp = this.rowGroupCompFactory.create();
        this.pivotComp = this.pivotCompFactory.create();
        topPanelGui.appendChild(this.rowGroupComp.getGui());
        topPanelGui.appendChild(this.pivotComp.getGui());
        this.rowGroupComp.addEventListener(component_1.Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
        this.pivotComp.addEventListener(component_1.Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
        this.destroyFunctions.push(function () {
            _this.rowGroupComp.removeEventListener(component_1.Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
            _this.pivotComp.removeEventListener(component_1.Component.EVENT_VISIBLE_CHANGED, dropPanelVisibleListener);
        });
        this.onDropPanelVisible();
        return topPanelGui;
    };
    GridCore.prototype.onDropPanelVisible = function () {
        var bothVisible = this.rowGroupComp.isVisible() && this.pivotComp.isVisible();
        this.rowGroupComp.addOrRemoveCssClass('ag-width-half', bothVisible);
        this.pivotComp.addOrRemoveCssClass('ag-width-half', bothVisible);
    };
    GridCore.prototype.getRootGui = function () {
        return this.eRootPanel.getGui();
    };
    GridCore.prototype.createSouthPanel = function () {
        if (!this.statusBar && this.gridOptionsWrapper.isEnableStatusBar()) {
            console.warn('ag-Grid: status bar is only available in ag-Grid-Enterprise');
        }
        var statusBarEnabled = this.statusBar && this.gridOptionsWrapper.isEnableStatusBar();
        var isPaging = this.gridOptionsWrapper.isPagination() ||
            this.gridOptionsWrapper.isRowModelServerPagination();
        var paginationPanelEnabled = isPaging
            && !this.gridOptionsWrapper.isForPrint()
            && !this.gridOptionsWrapper.isSuppressPaginationPanel();
        if (!statusBarEnabled && !paginationPanelEnabled) {
            return null;
        }
        var eSouthPanel = document.createElement('div');
        if (statusBarEnabled) {
            eSouthPanel.appendChild(this.statusBar.getGui());
        }
        if (paginationPanelEnabled) {
            var paginationComp = new paginationComp_1.PaginationComp();
            this.context.wireBean(paginationComp);
            eSouthPanel.appendChild(paginationComp.getGui());
            this.destroyFunctions.push(paginationComp.destroy.bind(paginationComp));
        }
        return eSouthPanel;
    };
    GridCore.prototype.onRowGroupChanged = function () {
        if (!this.rowGroupComp) {
            return;
        }
        var rowGroupPanelShow = this.gridOptionsWrapper.getRowGroupPanelShow();
        if (rowGroupPanelShow === constants_1.Constants.ALWAYS) {
            this.rowGroupComp.setVisible(true);
        }
        else if (rowGroupPanelShow === constants_1.Constants.ONLY_WHEN_GROUPING) {
            var grouping = !this.columnController.isRowGroupEmpty();
            this.rowGroupComp.setVisible(grouping);
        }
        else {
            this.rowGroupComp.setVisible(false);
        }
        this.eRootPanel.doLayout();
    };
    GridCore.prototype.addWindowResizeListener = function () {
        var eventListener = this.doLayout.bind(this);
        window.addEventListener('resize', eventListener);
        this.destroyFunctions.push(function () { return window.removeEventListener('resize', eventListener); });
    };
    GridCore.prototype.periodicallyDoLayout = function () {
        var _this = this;
        if (!this.finished) {
            var intervalMillis = this.gridOptionsWrapper.getLayoutInterval();
            // if interval is negative, this stops the layout from happening
            if (intervalMillis > 0) {
                this.frameworkFactory.setTimeout(function () {
                    _this.doLayout();
                    _this.gridPanel.periodicallyCheck();
                    _this.periodicallyDoLayout();
                }, intervalMillis);
            }
            else {
                // if user provided negative number, we still do the check every 5 seconds,
                // in case the user turns the number positive again
                this.frameworkFactory.setTimeout(function () {
                    _this.periodicallyDoLayout();
                }, 5000);
            }
        }
    };
    GridCore.prototype.showToolPanel = function (show) {
        if (show && !this.toolPanel) {
            console.warn('ag-Grid: toolPanel is only available in ag-Grid Enterprise');
            this.toolPanelShowing = false;
            return;
        }
        this.toolPanelShowing = show;
        if (this.toolPanel) {
            this.toolPanel.setVisible(show);
            this.eRootPanel.doLayout();
        }
    };
    GridCore.prototype.isToolPanelShowing = function () {
        return this.toolPanelShowing;
    };
    GridCore.prototype.destroy = function () {
        this.finished = true;
        this.eGridDiv.removeChild(this.eRootPanel.getGui());
        this.logger.log('Grid DOM removed');
        this.destroyFunctions.forEach(function (func) { return func(); });
    };
    GridCore.prototype.ensureNodeVisible = function (comparator) {
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
            this.gridPanel.ensureIndexVisible(indexToSelect);
        }
    };
    GridCore.prototype.doLayout = function () {
        // need to do layout first, as drawVirtualRows and setPinnedColHeight
        // need to know the result of the resizing of the panels.
        var sizeChanged = this.eRootPanel.doLayout();
        // not sure why, this is a hack, but if size changed, it may need to be called
        // again - as the size change can change whether scrolls are visible or not (i think).
        // to see why, take this second 'doLayout' call out, and see example in docs for
        // width & height, the grid will flicker as it doesn't get laid out correctly with
        // one call to doLayout()
        if (sizeChanged) {
            this.eRootPanel.doLayout();
        }
        // both of the two below should be done in gridPanel, the gridPanel should register 'resize' to the panel
        if (sizeChanged) {
            this.rowRenderer.drawVirtualRowsWithLock();
            var event = {
                clientWidth: this.eRootPanel.getGui().clientWidth,
                clientHeight: this.eRootPanel.getGui().clientHeight
            };
            this.eventService.dispatchEvent(events_1.Events.EVENT_GRID_SIZE_CHANGED, event);
        }
    };
    return GridCore;
}());
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
    context_1.Autowired('gridPanel'),
    __metadata("design:type", gridPanel_1.GridPanel)
], GridCore.prototype, "gridPanel", void 0);
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
    context_1.Optional('rowGroupCompFactory'),
    __metadata("design:type", Object)
], GridCore.prototype, "rowGroupCompFactory", void 0);
__decorate([
    context_1.Optional('pivotCompFactory'),
    __metadata("design:type", Object)
], GridCore.prototype, "pivotCompFactory", void 0);
__decorate([
    context_1.Optional('toolPanel'),
    __metadata("design:type", component_1.Component)
], GridCore.prototype, "toolPanel", void 0);
__decorate([
    context_1.Optional('statusBar'),
    __metadata("design:type", component_1.Component)
], GridCore.prototype, "statusBar", void 0);
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
GridCore = __decorate([
    context_1.Bean('gridCore'),
    __param(0, context_1.Qualifier('loggerFactory')),
    __metadata("design:paramtypes", [logger_1.LoggerFactory])
], GridCore);
exports.GridCore = GridCore;
