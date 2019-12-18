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
import { _, AgPanel, Autowired, Component, PostConstruct, Promise } from "@ag-grid-community/core";
import { TabbedChartMenu } from "./tabbedChartMenu";
var ChartMenu = /** @class */ (function (_super) {
    __extends(ChartMenu, _super);
    function ChartMenu(chartController) {
        var _this = _super.call(this, ChartMenu.TEMPLATE) || this;
        _this.buttons = {
            chartSettings: ['menu', function () { return _this.showMenu("chartSettings"); }],
            chartData: ['menu', function () { return _this.showMenu("chartData"); }],
            chartFormat: ['menu', function () { return _this.showMenu("chartFormat"); }],
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
        var tabOptions = [
            'chartSettings',
            'chartData',
            'chartFormat',
            'chartUnlink',
            'chartDownload'
        ];
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
        return tabOptions.filter(function (value) {
            return ignoreOptions.indexOf(value) !== -1 ||
                (_this.tabs.length && value === _this.tabs[0]);
        });
    };
    ChartMenu.prototype.toggleDetached = function (e) {
        var target = e.target;
        var active = _.containsClass(target, 'ag-icon-linked');
        _.addOrRemoveCssClass(target, 'ag-icon-linked', !active);
        _.addOrRemoveCssClass(target, 'ag-icon-unlinked', active);
        this.chartController.detachChartRange();
    };
    ChartMenu.prototype.createButtons = function () {
        var _this = this;
        var chartToolbarOptions = this.getToolbarOptions();
        chartToolbarOptions.forEach(function (button) {
            var buttonConfig = _this.buttons[button];
            var iconName = buttonConfig[0], callback = buttonConfig[1];
            var buttonEl = _.createIconNoSpan(iconName, _this.gridOptionsWrapper, undefined, true);
            _this.addDestroyableEventListener(buttonEl, 'click', callback);
            _this.getGui().appendChild(buttonEl);
        });
    };
    ChartMenu.prototype.saveChart = function () {
        var event = { type: ChartMenu.EVENT_DOWNLOAD_CHART };
        this.dispatchEvent(event);
    };
    ChartMenu.prototype.createMenu = function (defaultTab) {
        var _this = this;
        var chartComp = this.getParentComponent();
        var dockedContainer = chartComp.getDockedContainer();
        var context = this.getContext();
        var menuPanel = this.menuPanel = new AgPanel({
            minWidth: this.gridOptionsWrapper.chartMenuPanelWidth(),
            width: this.gridOptionsWrapper.chartMenuPanelWidth(),
            height: '100%',
            closable: true,
            hideTitleBar: true
        });
        context.wireBean(this.menuPanel);
        menuPanel.setParentComponent(this);
        dockedContainer.appendChild(menuPanel.getGui());
        this.tabbedMenu = new TabbedChartMenu({
            controller: this.chartController,
            type: chartComp.getCurrentChartType(),
            panels: this.tabs
        });
        context.wireBean(this.tabbedMenu);
        this.addDestroyableEventListener(this.menuPanel, Component.EVENT_DESTROYED, function () { return _this.tabbedMenu.destroy(); });
        return new Promise(function (res) {
            window.setTimeout(function () {
                menuPanel.setBodyComponent(_this.tabbedMenu);
                _this.tabbedMenu.showTab(defaultTab);
                _this.addDestroyableEventListener(chartComp.getChartComponentsWrapper(), 'click', function () {
                    if (_.containsClass(chartComp.getGui(), 'ag-has-menu')) {
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
            _.addCssClass(_this.getParentComponent().getGui(), 'ag-has-menu');
        }, 500);
    };
    ChartMenu.prototype.showMenu = function (tabName) {
        var _this = this;
        var tab = this.tabs.indexOf(tabName);
        if (!this.menuPanel) {
            this.createMenu(tab).then(function () {
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
        _.removeCssClass(this.getParentComponent().getGui(), 'ag-has-menu');
    };
    ChartMenu.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.menuPanel && this.menuPanel.isAlive()) {
            this.menuPanel.destroy();
        }
    };
    ChartMenu.EVENT_DOWNLOAD_CHART = "downloadChart";
    ChartMenu.TEMPLATE = "<div class=\"ag-chart-menu\"></div>";
    __decorate([
        Autowired("gridOptionsWrapper")
    ], ChartMenu.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        PostConstruct
    ], ChartMenu.prototype, "postConstruct", null);
    return ChartMenu;
}(Component));
export { ChartMenu };
