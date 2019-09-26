// ag-grid-enterprise v21.2.2
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
var ag_grid_community_1 = require("ag-grid-community");
var tabbedChartMenu_1 = require("./tabbedChartMenu");
var ChartMenu = /** @class */ (function (_super) {
    __extends(ChartMenu, _super);
    function ChartMenu(chartController) {
        var _this = _super.call(this, ChartMenu.TEMPLATE) || this;
        _this.buttons = {
            chartSettings: ['menu', function () { return _this.showMenu('chartSettings'); }],
            chartData: ['menu', function () { return _this.showMenu('chartData'); }],
            chartFormat: ['menu', function () { return _this.showMenu('chartFormat'); }],
            chartUnlink: ['linked', function (e) { return _this.toggleDetached(e); }],
            chartDownload: ['save', function () { return _this.saveChart(); }]
        };
        _this.tabs = [];
        _this.chartController = chartController;
        return _this;
    }
    ChartMenu.prototype.postConstruct = function () {
        this.createButtons();
    };
    ChartMenu.prototype.getToolbarOptions = function () {
        var _this = this;
        var tabOptions = ['chartSettings', 'chartData', 'chartFormat', 'chartUnlink', 'chartDownload'];
        var toolbarItemsFunc = this.gridOptionsWrapper.getChartToolbarItemsFunc();
        if (toolbarItemsFunc) {
            var params = {
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                defaultItems: tabOptions
            };
            tabOptions = toolbarItemsFunc(params).filter(function (option) {
                if (!_this.buttons[option]) {
                    console.warn("ag-Grid: '" + option + " is not a valid Chart Toolbar Option");
                    return false;
                }
                return true;
            });
        }
        // pivot charts use the column tool panel instead of the data panel
        if (this.chartController.isPivotChart()) {
            tabOptions = tabOptions.filter(function (option) { return option !== 'chartData'; });
        }
        var ignoreOptions = ['chartUnlink', 'chartDownload'];
        this.tabs = tabOptions.filter(function (option) { return ignoreOptions.indexOf(option) === -1; });
        return tabOptions.filter(function (value) { return ignoreOptions.indexOf(value) !== -1 || (_this.tabs.length && value === _this.tabs[0]); });
    };
    ChartMenu.prototype.toggleDetached = function (e) {
        var target = e.target;
        var active = ag_grid_community_1._.containsClass(target, 'ag-icon-linked');
        ag_grid_community_1._.addOrRemoveCssClass(target, 'ag-icon-linked', !active);
        ag_grid_community_1._.addOrRemoveCssClass(target, 'ag-icon-unlinked', active);
        this.chartController.detachChartRange();
    };
    ChartMenu.prototype.createButtons = function () {
        var _this = this;
        var chartToolbarOptions = this.getToolbarOptions();
        chartToolbarOptions.forEach(function (button) {
            var buttonConfig = _this.buttons[button];
            var iconName = buttonConfig[0], callback = buttonConfig[1];
            var buttonEl = ag_grid_community_1._.createIconNoSpan(iconName, _this.gridOptionsWrapper, undefined, true);
            _this.addDestroyableEventListener(buttonEl, 'click', callback);
            _this.getGui().appendChild(buttonEl);
        });
    };
    ChartMenu.prototype.saveChart = function () {
        var event = {
            type: ChartMenu.EVENT_DOWNLOAD_CHART
        };
        this.dispatchEvent(event);
    };
    ChartMenu.prototype.createMenu = function (defaultTab) {
        var _this = this;
        var chartComp = this.getParentComponent();
        var dockedContainer = chartComp.getDockedContainer();
        var context = this.getContext();
        var menuPanel = this.menuPanel = new ag_grid_community_1.AgPanel({
            minWidth: 220,
            width: 220,
            height: '100%',
            closable: true,
            hideTitleBar: true
        });
        context.wireBean(this.menuPanel);
        menuPanel.setParentComponent(this);
        dockedContainer.appendChild(menuPanel.getGui());
        this.tabbedMenu = new tabbedChartMenu_1.TabbedChartMenu({
            controller: this.chartController,
            type: chartComp.getCurrentChartType(),
            panels: this.tabs
        });
        context.wireBean(this.tabbedMenu);
        this.addDestroyableEventListener(this.menuPanel, ag_grid_community_1.Component.EVENT_DESTROYED, function () {
            _this.tabbedMenu.destroy();
        });
        return new ag_grid_community_1.Promise(function (res) {
            window.setTimeout(function () {
                menuPanel.setBodyComponent(_this.tabbedMenu);
                _this.tabbedMenu.showTab(defaultTab);
                _this.addDestroyableEventListener(chartComp.getChartComponentsWrapper(), 'click', function () {
                    if (ag_grid_community_1._.containsClass(chartComp.getGui(), 'ag-has-menu')) {
                        _this.hideMenu();
                    }
                });
                res(menuPanel);
            }, 100);
        });
    };
    ChartMenu.prototype.slideDockedContainer = function () {
        var _this = this;
        var chartComp = this.getParentComponent();
        chartComp.slideDockedOut(this.menuPanel.getWidth());
        window.setTimeout(function () {
            ag_grid_community_1._.addCssClass(_this.getParentComponent().getGui(), 'ag-has-menu');
        }, 500);
    };
    ChartMenu.prototype.showMenu = function (tabName) {
        var _this = this;
        var tab = this.tabs.indexOf(tabName);
        if (!this.menuPanel) {
            this.createMenu(tab)
                .then(function () {
                _this.slideDockedContainer();
            });
        }
        else {
            this.slideDockedContainer();
        }
    };
    ChartMenu.prototype.hideMenu = function () {
        var chartComp = this.getParentComponent();
        chartComp.slideDockedIn();
        ag_grid_community_1._.removeCssClass(this.getParentComponent().getGui(), 'ag-has-menu');
    };
    ChartMenu.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.menuPanel && this.menuPanel.isAlive()) {
            this.menuPanel.destroy();
        }
    };
    ChartMenu.EVENT_DOWNLOAD_CHART = 'downloadChart';
    ChartMenu.TEMPLATE = "<div class=\"ag-chart-menu\"></div>";
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], ChartMenu.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ChartMenu.prototype, "postConstruct", null);
    return ChartMenu;
}(ag_grid_community_1.Component));
exports.ChartMenu = ChartMenu;
