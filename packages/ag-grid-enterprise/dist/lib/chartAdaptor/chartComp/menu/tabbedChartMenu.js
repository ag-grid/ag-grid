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
var chartDataPanel_1 = require("./data/chartDataPanel");
var chartFormatingPanel_1 = require("./format/chartFormatingPanel");
var chartSettingsPanel_1 = require("./settings/chartSettingsPanel");
var chartTranslator_1 = require("../chartTranslator");
var TabbedChartMenu = /** @class */ (function (_super) {
    __extends(TabbedChartMenu, _super);
    function TabbedChartMenu(params) {
        var _this = _super.call(this) || this;
        _this.tabs = [];
        _this.chartIcons = {};
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
            var _a = _this.createTab(panel, panelType, _this.getPanelClass(panelType)), comp = _a.comp, tab = _a.tab;
            _this.tabs.push(tab);
            _this.addDestroyFunc(function () { return comp.destroy(); });
        });
        this.tabbedLayout = new ag_grid_community_1.TabbedLayout({
            items: this.tabs,
            cssClass: 'ag-chart-tabbed-menu'
        });
    };
    TabbedChartMenu.prototype.createTab = function (name, title, ChildClass) {
        var eWrapperDiv = document.createElement('div');
        ag_grid_community_1._.addCssClass(eWrapperDiv, "ag-chart-" + title);
        var comp = new ChildClass(this.chartController);
        this.getContext().wireBean(comp);
        eWrapperDiv.appendChild(comp.getGui());
        var titleEl = document.createElement('div');
        titleEl.innerText = this.chartTranslator.translate(title);
        return {
            comp: comp,
            tab: {
                title: titleEl,
                bodyPromise: ag_grid_community_1.Promise.resolve(eWrapperDiv),
                name: name
            }
        };
    };
    TabbedChartMenu.prototype.getMinDimensions = function () {
        return this.tabbedLayout.getMinDimensions();
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
    TabbedChartMenu.prototype.getPanelClass = function (panelType) {
        var isDataPanel = panelType === TabbedChartMenu.TAB_DATA;
        var isFormatPanel = panelType === TabbedChartMenu.TAB_FORMAT;
        return isDataPanel ? chartDataPanel_1.ChartDataPanel : (isFormatPanel ? chartFormatingPanel_1.ChartFormattingPanel : chartSettingsPanel_1.ChartSettingsPanel);
    };
    TabbedChartMenu.EVENT_TAB_SELECTED = 'tabSelected';
    TabbedChartMenu.TAB_MAIN = 'settings';
    TabbedChartMenu.TAB_DATA = 'data';
    TabbedChartMenu.TAB_FORMAT = 'format';
    __decorate([
        ag_grid_community_1.Autowired('chartTranslator'),
        __metadata("design:type", chartTranslator_1.ChartTranslator)
    ], TabbedChartMenu.prototype, "chartTranslator", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TabbedChartMenu.prototype, "init", null);
    return TabbedChartMenu;
}(ag_grid_community_1.Component));
exports.TabbedChartMenu = TabbedChartMenu;
