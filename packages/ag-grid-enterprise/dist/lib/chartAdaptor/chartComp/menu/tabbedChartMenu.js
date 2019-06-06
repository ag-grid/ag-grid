// ag-grid-enterprise v21.0.1
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
var chartSettingsPanel_1 = require("./chartSettingsPanel");
var chartDataPanel_1 = require("./chartDataPanel");
var TabbedChartMenu = /** @class */ (function (_super) {
    __extends(TabbedChartMenu, _super);
    function TabbedChartMenu(params) {
        var _this = _super.call(this) || this;
        _this.tabs = [];
        _this.chartIcons = [];
        var controller = params.controller, type = params.type, panels = params.panels;
        _this.chartController = controller;
        _this.currentChartType = type;
        _this.panels = panels;
        return _this;
    }
    TabbedChartMenu.prototype.init = function () {
        var _this = this;
        this.panels.forEach(function (panel) {
            var panelType = panel.replace('chart', '').toLowerCase();
            var isMain = panelType === TabbedChartMenu.TAB_MAIN;
            var iconCls = isMain ? 'chart' : 'data';
            var panelClass = isMain ? chartSettingsPanel_1.ChartSettingsPanel : chartDataPanel_1.ChartDataPanel;
            var _a = _this.createTab(panelType, iconCls, panelClass), comp = _a.comp, tab = _a.tab;
            _this.tabs.push(tab);
            _this.addDestroyFunc(function () { return comp.destroy(); });
        });
        this.tabbedLayout = new ag_grid_community_1.TabbedLayout({
            items: this.tabs,
            cssClass: 'ag-chart-tabbed-menu'
        });
    };
    TabbedChartMenu.prototype.getMinDimensions = function () {
        return this.tabbedLayout.getMinDimensions();
    };
    TabbedChartMenu.prototype.createTab = function (name, iconName, ChildClass) {
        var _this = this;
        var eWrapperDiv = document.createElement('div');
        ag_grid_community_1._.addCssClass(eWrapperDiv, "ag-chart-" + name);
        var comp = new ChildClass(this.chartController);
        this.getContext().wireBean(comp);
        eWrapperDiv.appendChild(comp.getGui());
        return {
            comp: comp,
            tab: {
                title: ag_grid_community_1._.createIconNoSpan(iconName, this.gridOptionsWrapper, null),
                bodyPromise: ag_grid_community_1.Promise.resolve(eWrapperDiv),
                name: name,
                afterAttachedCallback: function () {
                    _this.parentComponent.setTitle("Chart " + ag_grid_community_1._.capitalise(name));
                }
            }
        };
    };
    TabbedChartMenu.prototype.updateCurrentChartType = function (chartType) {
        ag_grid_community_1._.removeCssClass(this.chartIcons[this.currentChartType], 'ag-selected');
        this.currentChartType = chartType;
        ag_grid_community_1._.addCssClass(this.chartIcons[chartType], 'ag-selected');
    };
    TabbedChartMenu.prototype.showTab = function (tab) {
        var tabItem = this.tabs[tab];
        this.tabbedLayout.showItem(tabItem);
    };
    TabbedChartMenu.prototype.getGui = function () {
        return this.tabbedLayout && this.tabbedLayout.getGui();
    };
    TabbedChartMenu.prototype.destroy = function () {
        if (this.parentComponent && this.parentComponent.isAlive()) {
            this.parentComponent.destroy();
        }
        _super.prototype.destroy.call(this);
    };
    TabbedChartMenu.EVENT_TAB_SELECTED = 'tabSelected';
    TabbedChartMenu.TAB_MAIN = 'settings';
    TabbedChartMenu.TAB_DATA = 'data';
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], TabbedChartMenu.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TabbedChartMenu.prototype, "init", null);
    return TabbedChartMenu;
}(ag_grid_community_1.Component));
exports.TabbedChartMenu = TabbedChartMenu;
