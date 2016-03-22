/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.5
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var paginationController_1 = require("./rowControllers/paginationController");
var columnController_1 = require("./columnController/columnController");
var rowRenderer_1 = require("./rendering/rowRenderer");
var filterManager_1 = require("./filter/filterManager");
var eventService_1 = require("./eventService");
var gridPanel_1 = require("./gridPanel/gridPanel");
var constants_1 = require("./constants");
var popupService_1 = require("./widgets/popupService");
var logger_1 = require("./logger");
var events_1 = require("./events");
var borderLayout_1 = require("./layout/borderLayout");
var context_1 = require("./context/context");
var context_2 = require("./context/context");
var context_3 = require("./context/context");
var context_4 = require("./context/context");
var focusedCellController_1 = require("./focusedCellController");
var context_5 = require("./context/context");
var component_1 = require("./widgets/component");
var GridCore = (function () {
    function GridCore(loggerFactory) {
        this.logger = loggerFactory.create('GridCore');
    }
    GridCore.prototype.init = function () {
        var _this = this;
        // and the last bean, done in it's own section, as it's optional
        var toolPanelGui;
        var eSouthPanel = this.createSouthPanel();
        if (this.toolPanel && !this.gridOptionsWrapper.isForPrint()) {
            toolPanelGui = this.toolPanel.getGui();
        }
        var rowGroupGui;
        if (this.rowGroupPanel) {
            rowGroupGui = this.rowGroupPanel.getGui();
        }
        this.eRootPanel = new borderLayout_1.BorderLayout({
            center: this.gridPanel.getLayout(),
            east: toolPanelGui,
            north: rowGroupGui,
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
        this.doLayout();
        this.finished = false;
        this.periodicallyDoLayout();
        this.popupService.setPopupParent(this.eRootPanel.getGui());
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.onRowGroupChanged.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onRowGroupChanged.bind(this));
        this.onRowGroupChanged();
        this.logger.log('ready');
    };
    GridCore.prototype.createSouthPanel = function () {
        if (!this.statusBar && this.gridOptionsWrapper.isEnableStatusBar()) {
            console.warn('ag-Grid: status bar is only available in ag-Grid-Enterprise');
        }
        var statusBarEnabled = this.statusBar && this.gridOptionsWrapper.isEnableStatusBar();
        var paginationPanelEnabled = this.gridOptionsWrapper.isRowModelPagination() && !this.gridOptionsWrapper.isForPrint();
        if (!statusBarEnabled && !paginationPanelEnabled) {
            return null;
        }
        var eSouthPanel = document.createElement('div');
        if (statusBarEnabled) {
            eSouthPanel.appendChild(this.statusBar.getGui());
        }
        if (paginationPanelEnabled) {
            eSouthPanel.appendChild(this.paginationController.getGui());
        }
        return eSouthPanel;
    };
    GridCore.prototype.onRowGroupChanged = function () {
        if (!this.rowGroupPanel) {
            return;
        }
        var rowGroupPanelShow = this.gridOptionsWrapper.getRowGroupPanelShow();
        if (rowGroupPanelShow === constants_1.Constants.ALWAYS) {
            this.eRootPanel.setNorthVisible(true);
        }
        else if (rowGroupPanelShow === constants_1.Constants.ONLY_WHEN_GROUPING) {
            var grouping = !this.columnController.isRowGroupEmpty();
            this.eRootPanel.setNorthVisible(grouping);
        }
        else {
            this.eRootPanel.setNorthVisible(false);
        }
    };
    GridCore.prototype.agApplicationBoot = function () {
        var readyEvent = {
            api: this.gridOptions.api,
            columnApi: this.gridOptions.columnApi
        };
        this.eventService.dispatchEvent(events_1.Events.EVENT_GRID_READY, readyEvent);
    };
    GridCore.prototype.addWindowResizeListener = function () {
        var that = this;
        // putting this into a function, so when we remove the function,
        // we are sure we are removing the exact same function (i'm not
        // sure what 'bind' does to the function reference, if it's safe
        // the result from 'bind').
        this.windowResizeListener = function resizeListener() {
            that.doLayout();
        };
        window.addEventListener('resize', this.windowResizeListener);
    };
    GridCore.prototype.periodicallyDoLayout = function () {
        if (!this.finished) {
            var that = this;
            setTimeout(function () {
                that.doLayout();
                that.gridPanel.periodicallyCheck();
                that.periodicallyDoLayout();
            }, 500);
        }
    };
    GridCore.prototype.showToolPanel = function (show) {
        if (show && !this.toolPanel) {
            console.warn('ag-Grid: toolPanel is only available in ag-Grid Enterprise');
            this.toolPanelShowing = false;
            return;
        }
        this.toolPanelShowing = show;
        this.eRootPanel.setEastVisible(show);
    };
    GridCore.prototype.isToolPanelShowing = function () {
        return this.toolPanelShowing;
    };
    GridCore.prototype.agDestroy = function () {
        if (this.windowResizeListener) {
            window.removeEventListener('resize', this.windowResizeListener);
            this.logger.log('Removing windowResizeListener');
        }
        this.finished = true;
        this.eGridDiv.removeChild(this.eRootPanel.getGui());
        this.logger.log('Grid DOM removed');
    };
    GridCore.prototype.ensureNodeVisible = function (comparator) {
        if (this.doingVirtualPaging) {
            throw 'Cannot use ensureNodeVisible when doing virtual paging, as we cannot check rows that are not in memory';
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
            this.gridPanel.ensureIndexVisible(indexToSelect);
        }
    };
    GridCore.prototype.doLayout = function () {
        // need to do layout first, as drawVirtualRows and setPinnedColHeight
        // need to know the result of the resizing of the panels.
        var sizeChanged = this.eRootPanel.doLayout();
        // both of the two below should be done in gridPanel, the gridPanel should register 'resize' to the panel
        if (sizeChanged) {
            this.rowRenderer.drawVirtualRows();
            var event = {
                clientWidth: this.eRootPanel.getGui().clientWidth,
                clientHeight: this.eRootPanel.getGui().clientHeight
            };
            this.eventService.dispatchEvent(events_1.Events.EVENT_GRID_SIZE_CHANGED, event);
        }
    };
    __decorate([
        context_3.Autowired('gridOptions'), 
        __metadata('design:type', Object)
    ], GridCore.prototype, "gridOptions", void 0);
    __decorate([
        context_3.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], GridCore.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_3.Autowired('paginationController'), 
        __metadata('design:type', paginationController_1.PaginationController)
    ], GridCore.prototype, "paginationController", void 0);
    __decorate([
        context_3.Autowired('rowModel'), 
        __metadata('design:type', Object)
    ], GridCore.prototype, "rowModel", void 0);
    __decorate([
        context_3.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], GridCore.prototype, "columnController", void 0);
    __decorate([
        context_3.Autowired('rowRenderer'), 
        __metadata('design:type', rowRenderer_1.RowRenderer)
    ], GridCore.prototype, "rowRenderer", void 0);
    __decorate([
        context_3.Autowired('filterManager'), 
        __metadata('design:type', filterManager_1.FilterManager)
    ], GridCore.prototype, "filterManager", void 0);
    __decorate([
        context_3.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], GridCore.prototype, "eventService", void 0);
    __decorate([
        context_3.Autowired('gridPanel'), 
        __metadata('design:type', gridPanel_1.GridPanel)
    ], GridCore.prototype, "gridPanel", void 0);
    __decorate([
        context_3.Autowired('eGridDiv'), 
        __metadata('design:type', HTMLElement)
    ], GridCore.prototype, "eGridDiv", void 0);
    __decorate([
        context_3.Autowired('$scope'), 
        __metadata('design:type', Object)
    ], GridCore.prototype, "$scope", void 0);
    __decorate([
        context_3.Autowired('quickFilterOnScope'), 
        __metadata('design:type', String)
    ], GridCore.prototype, "quickFilterOnScope", void 0);
    __decorate([
        context_3.Autowired('popupService'), 
        __metadata('design:type', popupService_1.PopupService)
    ], GridCore.prototype, "popupService", void 0);
    __decorate([
        context_3.Autowired('focusedCellController'), 
        __metadata('design:type', focusedCellController_1.FocusedCellController)
    ], GridCore.prototype, "focusedCellController", void 0);
    __decorate([
        context_5.Optional('rowGroupPanel'), 
        __metadata('design:type', component_1.Component)
    ], GridCore.prototype, "rowGroupPanel", void 0);
    __decorate([
        context_5.Optional('toolPanel'), 
        __metadata('design:type', component_1.Component)
    ], GridCore.prototype, "toolPanel", void 0);
    __decorate([
        context_5.Optional('statusBar'), 
        __metadata('design:type', component_1.Component)
    ], GridCore.prototype, "statusBar", void 0);
    __decorate([
        context_4.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], GridCore.prototype, "init", null);
    GridCore = __decorate([
        context_1.Bean('gridCore'),
        __param(0, context_2.Qualifier('loggerFactory')), 
        __metadata('design:paramtypes', [logger_1.LoggerFactory])
    ], GridCore);
    return GridCore;
})();
exports.GridCore = GridCore;
