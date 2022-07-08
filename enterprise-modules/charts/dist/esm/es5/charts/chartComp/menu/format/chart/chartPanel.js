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
import { _, Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { PaddingPanel } from "./paddingPanel";
import { BackgroundPanel } from "./backgroundPanel";
import TitlePanel from "./titlePanel";
var ChartPanel = /** @class */ (function (_super) {
    __extends(ChartPanel, _super);
    function ChartPanel(chartOptionsService) {
        var _this = _super.call(this) || this;
        _this.chartOptionsService = chartOptionsService;
        _this.activePanels = [];
        return _this;
    }
    ChartPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(ChartPanel.TEMPLATE, { chartGroup: groupParams });
        this.initGroup();
        this.initTitles();
        this.initPaddingPanel();
        this.initBackgroundPanel();
    };
    ChartPanel.prototype.initGroup = function () {
        this.chartGroup
            .setTitle(this.chartTranslationService.translate('chart'))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
    };
    ChartPanel.prototype.initTitles = function () {
        var titlePanelComp = this.createBean(new TitlePanel(this.chartOptionsService));
        this.chartGroup.addItem(titlePanelComp);
        this.activePanels.push(titlePanelComp);
    };
    ChartPanel.prototype.initPaddingPanel = function () {
        var paddingPanelComp = this.createBean(new PaddingPanel(this.chartOptionsService));
        this.chartGroup.addItem(paddingPanelComp);
        this.activePanels.push(paddingPanelComp);
    };
    ChartPanel.prototype.initBackgroundPanel = function () {
        var backgroundPanelComp = this.createBean(new BackgroundPanel(this.chartOptionsService));
        this.chartGroup.addItem(backgroundPanelComp);
        this.activePanels.push(backgroundPanelComp);
    };
    ChartPanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            _.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    ChartPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    ChartPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"chartGroup\"></ag-group-component>\n        </div>";
    __decorate([
        RefSelector('chartGroup')
    ], ChartPanel.prototype, "chartGroup", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], ChartPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], ChartPanel.prototype, "init", null);
    return ChartPanel;
}(Component));
export { ChartPanel };
