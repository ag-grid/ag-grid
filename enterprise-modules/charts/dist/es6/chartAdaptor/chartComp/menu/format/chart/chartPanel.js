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
import { FontPanel } from "../fontPanel";
import { BackgroundPanel } from "./backgroundPanel";
var ChartPanel = /** @class */ (function (_super) {
    __extends(ChartPanel, _super);
    function ChartPanel(chartController) {
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.chartController = chartController;
        _this.chartProxy = _this.chartController.getChartProxy();
        return _this;
    }
    ChartPanel.prototype.init = function () {
        this.setTemplate(ChartPanel.TEMPLATE);
        this.initGroup();
        this.initTitles();
        this.initPaddingPanel();
        this.initBackgroundPanel();
    };
    ChartPanel.prototype.initGroup = function () {
        this.chartGroup
            .setTitle(this.chartTranslator.translate('chart'))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
    };
    ChartPanel.prototype.initTitles = function () {
        var _this = this;
        var title = this.chartProxy.getChartOption('title');
        var text = title && title.text ? title.text : '';
        var setFont = function (font) {
            if (font.family) {
                _this.chartProxy.setTitleOption('fontFamily', font.family);
            }
            if (font.weight) {
                _this.chartProxy.setTitleOption('fontWeight', font.weight);
            }
            if (font.style) {
                _this.chartProxy.setTitleOption('fontStyle', font.style);
            }
            if (font.size) {
                _this.chartProxy.setTitleOption('fontSize', font.size);
            }
            if (font.color) {
                _this.chartProxy.setTitleOption('color', font.color);
            }
        };
        var initialFont = {
            family: title ? this.chartProxy.getChartOption('title.fontFamily') : 'Verdana, sans-serif',
            style: title ? this.chartProxy.getChartOption('title.fontStyle') : undefined,
            weight: title ? this.chartProxy.getChartOption('title.fontWeight') : undefined,
            size: title ? this.chartProxy.getChartOption('title.fontSize') : 22,
            color: title ? this.chartProxy.getChartOption('title.color') : 'black'
        };
        if (!title) {
            setFont(initialFont);
        }
        this.titleInput
            .setLabel(this.chartTranslator.translate('title'))
            .setLabelAlignment('top')
            .setLabelWidth('flex')
            .setValue(text)
            .onValueChange(function (value) {
            _this.chartProxy.setTitleOption('text', value);
            // only show font panel when title exists
            fontPanelComp.setEnabled(_.exists(value));
        });
        var params = {
            name: this.chartTranslator.translate('font'),
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont,
        };
        var fontPanelComp = this.wireBean(new FontPanel(params));
        this.chartGroup.addItem(fontPanelComp);
        this.activePanels.push(fontPanelComp);
        fontPanelComp.setEnabled(_.exists(text));
    };
    ChartPanel.prototype.initPaddingPanel = function () {
        var paddingPanelComp = this.wireBean(new PaddingPanel(this.chartController));
        this.chartGroup.addItem(paddingPanelComp);
        this.activePanels.push(paddingPanelComp);
    };
    ChartPanel.prototype.initBackgroundPanel = function () {
        var backgroundPanelComp = this.wireBean(new BackgroundPanel(this.chartController));
        this.chartGroup.addItem(backgroundPanelComp);
        this.activePanels.push(backgroundPanelComp);
    };
    ChartPanel.prototype.destroyActivePanels = function () {
        this.activePanels.forEach(function (panel) {
            _.removeFromParent(panel.getGui());
            panel.destroy();
        });
    };
    ChartPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    ChartPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"chartGroup\">\n                <ag-input-text-area ref=\"titleInput\"></ag-input-text-area>\n            </ag-group-component>\n        <div>";
    __decorate([
        RefSelector('chartGroup')
    ], ChartPanel.prototype, "chartGroup", void 0);
    __decorate([
        RefSelector('titleInput')
    ], ChartPanel.prototype, "titleInput", void 0);
    __decorate([
        Autowired('chartTranslator')
    ], ChartPanel.prototype, "chartTranslator", void 0);
    __decorate([
        PostConstruct
    ], ChartPanel.prototype, "init", null);
    return ChartPanel;
}(Component));
export { ChartPanel };
