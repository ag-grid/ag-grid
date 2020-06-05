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
var core_1 = require("@ag-grid-community/core");
var chartDataPanel_1 = require("./data/chartDataPanel");
var chartFormattingPanel_1 = require("./format/chartFormattingPanel");
var chartSettingsPanel_1 = require("./settings/chartSettingsPanel");
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
            _this.addDestroyFunc(function () { return _this.destroyBean(comp); });
        });
        this.tabbedLayout = new core_1.TabbedLayout({
            items: this.tabs,
            cssClass: 'ag-chart-tabbed-menu'
        });
        this.getContext().createBean(this.tabbedLayout);
    };
    TabbedChartMenu.prototype.createTab = function (name, title, ChildClass) {
        var eWrapperDiv = document.createElement('div');
        core_1._.addCssClass(eWrapperDiv, 'ag-chart-tab');
        core_1._.addCssClass(eWrapperDiv, "ag-chart-" + title);
        var comp = new ChildClass(this.chartController);
        this.getContext().createBean(comp);
        eWrapperDiv.appendChild(comp.getGui());
        var titleEl = document.createElement('div');
        var translatedTitle = this.chartTranslator.translate(title);
        titleEl.innerText = translatedTitle;
        return {
            comp: comp,
            tab: {
                title: titleEl,
                titleLabel: translatedTitle,
                bodyPromise: core_1.Promise.resolve(eWrapperDiv),
                name: name
            }
        };
    };
    TabbedChartMenu.prototype.getMinDimensions = function () {
        return this.tabbedLayout.getMinDimensions();
    };
    TabbedChartMenu.prototype.updateCurrentChartType = function (chartType) {
        core_1._.removeCssClass(this.chartIcons[this.currentChartType], 'ag-selected');
        this.currentChartType = chartType;
        core_1._.addCssClass(this.chartIcons[chartType], 'ag-selected');
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
            this.destroyBean(this.parentComponent);
        }
        _super.prototype.destroy.call(this);
    };
    TabbedChartMenu.prototype.getPanelClass = function (panelType) {
        switch (panelType) {
            case TabbedChartMenu.TAB_DATA:
                return chartDataPanel_1.ChartDataPanel;
            case TabbedChartMenu.TAB_FORMAT:
                return chartFormattingPanel_1.ChartFormattingPanel;
            default:
                return chartSettingsPanel_1.ChartSettingsPanel;
        }
    };
    TabbedChartMenu.EVENT_TAB_SELECTED = 'tabSelected';
    TabbedChartMenu.TAB_MAIN = 'settings';
    TabbedChartMenu.TAB_DATA = 'data';
    TabbedChartMenu.TAB_FORMAT = 'format';
    __decorate([
        core_1.Autowired('chartTranslator')
    ], TabbedChartMenu.prototype, "chartTranslator", void 0);
    __decorate([
        core_1.PostConstruct
    ], TabbedChartMenu.prototype, "init", null);
    return TabbedChartMenu;
}(core_1.Component));
exports.TabbedChartMenu = TabbedChartMenu;
//# sourceMappingURL=tabbedChartMenu.js.map