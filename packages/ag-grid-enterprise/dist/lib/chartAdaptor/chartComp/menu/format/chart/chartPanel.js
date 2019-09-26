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
var paddingPanel_1 = require("./paddingPanel");
var labelPanel_1 = require("../label/labelPanel");
var caption_1 = require("../../../../../charts/caption");
var chartTranslator_1 = require("../../../chartTranslator");
var ChartPanel = /** @class */ (function (_super) {
    __extends(ChartPanel, _super);
    function ChartPanel(chartController) {
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.chartController = chartController;
        _this.chartProxy = _this.chartController.getChartProxy();
        _this.chart = _this.chartProxy.getChart();
        return _this;
    }
    ChartPanel.prototype.init = function () {
        this.setTemplate(ChartPanel.TEMPLATE);
        this.initGroup();
        this.initTitles();
        this.initPaddingPanel();
    };
    ChartPanel.prototype.initGroup = function () {
        this.chartGroup
            .setTitle(this.chartTranslator.translate('chart'))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
    };
    ChartPanel.prototype.initTitles = function () {
        var _this = this;
        var title = this.chart.title ? this.chart.title.text : '';
        var initialFont = {
            family: this.chart.title ? this.chartProxy.getTitleProperty('fontFamily') : 'Verdana, sans-serif',
            style: this.chart.title ? this.chartProxy.getTitleProperty('fontStyle') : '',
            weight: this.chart.title ? this.chartProxy.getTitleProperty('fontWeight') : 'Normal',
            size: this.chart.title ? parseInt(this.chartProxy.getTitleProperty('fontSize')) : 22,
            color: this.chart.title ? this.chartProxy.getTitleProperty('color') : 'black'
        };
        // note we don't set the font style via chart title panel
        var setFont = function (font) {
            if (font.family) {
                _this.chartProxy.setTitleProperty('fontFamily', font.family);
            }
            if (font.weight) {
                _this.chartProxy.setTitleProperty('fontWeight', font.weight);
            }
            if (font.size) {
                _this.chartProxy.setTitleProperty('fontSize', font.size);
            }
            if (font.color) {
                _this.chartProxy.setTitleProperty('color', font.color);
            }
        };
        this.titleInput
            .setLabel(this.chartTranslator.translate('title'))
            .setLabelAlignment('top')
            .setLabelWidth('flex')
            .setValue(title)
            .onValueChange(function (newValue) {
            if (!_this.chart.title) {
                _this.chart.title = caption_1.Caption.create({ text: title });
                setFont(initialFont);
            }
            var currentCaption = _this.chart.title;
            currentCaption.text = newValue;
            _this.chart.title = currentCaption;
            // only show font panel when title exists
            labelPanelComp.setEnabled(ag_grid_community_1._.exists(_this.chart.title.text));
        });
        var params = {
            name: this.chartTranslator.translate('font'),
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };
        var labelPanelComp = new labelPanel_1.LabelPanel(params);
        this.getContext().wireBean(labelPanelComp);
        this.chartGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
        labelPanelComp.setEnabled(ag_grid_community_1._.exists(title));
    };
    ChartPanel.prototype.initPaddingPanel = function () {
        var paddingPanelComp = new paddingPanel_1.PaddingPanel(this.chartController);
        this.getContext().wireBean(paddingPanelComp);
        this.chartGroup.addItem(paddingPanelComp);
        this.activePanels.push(paddingPanelComp);
    };
    ChartPanel.prototype.destroyActivePanels = function () {
        this.activePanels.forEach(function (panel) {
            ag_grid_community_1._.removeFromParent(panel.getGui());
            panel.destroy();
        });
    };
    ChartPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    ChartPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"chartGroup\">\n                <ag-input-text-area ref=\"titleInput\"></ag-input-text-area>\n            </ag-group-component>\n        <div>";
    __decorate([
        ag_grid_community_1.RefSelector('chartGroup'),
        __metadata("design:type", ag_grid_community_1.AgGroupComponent)
    ], ChartPanel.prototype, "chartGroup", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('titleInput'),
        __metadata("design:type", ag_grid_community_1.AgInputTextArea)
    ], ChartPanel.prototype, "titleInput", void 0);
    __decorate([
        ag_grid_community_1.Autowired('chartTranslator'),
        __metadata("design:type", chartTranslator_1.ChartTranslator)
    ], ChartPanel.prototype, "chartTranslator", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ChartPanel.prototype, "init", null);
    return ChartPanel;
}(ag_grid_community_1.Component));
exports.ChartPanel = ChartPanel;
