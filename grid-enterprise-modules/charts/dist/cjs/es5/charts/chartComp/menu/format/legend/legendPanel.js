"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
exports.LegendPanel = void 0;
var core_1 = require("@ag-grid-community/core");
var fontPanel_1 = require("../fontPanel");
var formatPanel_1 = require("../formatPanel");
var LegendPanel = /** @class */ (function (_super) {
    __extends(LegendPanel, _super);
    function LegendPanel(_a) {
        var chartOptionsService = _a.chartOptionsService, _b = _a.isExpandedOnInit, isExpandedOnInit = _b === void 0 ? false : _b;
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.chartOptionsService = chartOptionsService;
        _this.isExpandedOnInit = isExpandedOnInit;
        return _this;
    }
    LegendPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(LegendPanel.TEMPLATE, { legendGroup: groupParams });
        this.initLegendGroup();
        this.initLegendPosition();
        this.initLegendPadding();
        this.initLegendItems();
        this.initLabelPanel();
    };
    LegendPanel.prototype.initLegendGroup = function () {
        var _this = this;
        this.legendGroup
            .setTitle(this.chartTranslationService.translate("legend"))
            .hideEnabledCheckbox(false)
            .setEnabled(this.chartOptionsService.getChartOption("legend.enabled") || false)
            .toggleGroupExpand(this.isExpandedOnInit)
            .onEnableChange(function (enabled) {
            _this.chartOptionsService.setChartOption("legend.enabled", enabled);
            _this.legendGroup.toggleGroupExpand(true);
        });
    };
    LegendPanel.prototype.initLegendPosition = function () {
        var _this = this;
        var positions = ['top', 'right', 'bottom', 'left'];
        this.legendPositionSelect
            .setLabel(this.chartTranslationService.translate("position"))
            .setLabelWidth("flex")
            .setInputWidth(80)
            .addOptions(positions.map(function (position) { return ({
            value: position,
            text: _this.chartTranslationService.translate(position)
        }); }))
            .setValue(this.chartOptionsService.getChartOption("legend.position"))
            .onValueChange(function (newValue) { return _this.chartOptionsService.setChartOption("legend.position", newValue); });
    };
    LegendPanel.prototype.initLegendPadding = function () {
        var _this = this;
        var currentValue = this.chartOptionsService.getChartOption("legend.spacing");
        this.legendPaddingSlider
            .setLabel(this.chartTranslationService.translate("spacing"))
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 200))
            .setValue("" + currentValue)
            .setTextFieldWidth(45)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setChartOption("legend.spacing", newValue); });
    };
    LegendPanel.prototype.initLegendItems = function () {
        var _this = this;
        var initSlider = function (expression, labelKey, input, defaultMaxValue) {
            var currentValue = _this.chartOptionsService.getChartOption("legend." + expression);
            input.setLabel(_this.chartTranslationService.translate(labelKey))
                .setMaxValue(formatPanel_1.getMaxValue(currentValue, defaultMaxValue))
                .setValue("" + currentValue)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) {
                _this.chartOptionsService.setChartOption("legend." + expression, newValue);
            });
        };
        initSlider("item.marker.size", "markerSize", this.markerSizeSlider, 40);
        initSlider("item.marker.strokeWidth", "markerStroke", this.markerStrokeSlider, 10);
        initSlider("item.marker.padding", "itemSpacing", this.markerPaddingSlider, 20);
        initSlider("item.paddingX", "layoutHorizontalSpacing", this.itemPaddingXSlider, 50);
        initSlider("item.paddingY", "layoutVerticalSpacing", this.itemPaddingYSlider, 50);
    };
    LegendPanel.prototype.initLabelPanel = function () {
        var _this = this;
        var chartProxy = this.chartOptionsService;
        var initialFont = {
            family: chartProxy.getChartOption("legend.item.label.fontFamily"),
            style: chartProxy.getChartOption("legend.item.label.fontStyle"),
            weight: chartProxy.getChartOption("legend.item.label.fontWeight"),
            size: chartProxy.getChartOption("legend.item.label.fontSize"),
            color: chartProxy.getChartOption("legend.item.label.color")
        };
        var setFont = function (font) {
            var proxy = _this.chartOptionsService;
            if (font.family) {
                proxy.setChartOption("legend.item.label.fontFamily", font.family);
            }
            if (font.weight) {
                proxy.setChartOption("legend.item.label.fontWeight", font.weight);
            }
            if (font.style) {
                proxy.setChartOption("legend.item.label.fontStyle", font.style);
            }
            if (font.size) {
                proxy.setChartOption("legend.item.label.fontSize", font.size);
            }
            if (font.color) {
                proxy.setChartOption("legend.item.label.color", font.color);
            }
        };
        var params = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };
        var fontPanelComp = this.createBean(new fontPanel_1.FontPanel(params));
        this.legendGroup.addItem(fontPanelComp);
        this.activePanels.push(fontPanelComp);
    };
    LegendPanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            core_1._.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    LegendPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    LegendPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"legendGroup\">\n                <ag-select ref=\"legendPositionSelect\"></ag-select>\n                <ag-slider ref=\"legendPaddingSlider\"></ag-slider>\n                <ag-slider ref=\"markerSizeSlider\"></ag-slider>\n                <ag-slider ref=\"markerStrokeSlider\"></ag-slider>\n                <ag-slider ref=\"markerPaddingSlider\"></ag-slider>\n                <ag-slider ref=\"itemPaddingXSlider\"></ag-slider>\n                <ag-slider ref=\"itemPaddingYSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        core_1.RefSelector('legendGroup')
    ], LegendPanel.prototype, "legendGroup", void 0);
    __decorate([
        core_1.RefSelector('legendPositionSelect')
    ], LegendPanel.prototype, "legendPositionSelect", void 0);
    __decorate([
        core_1.RefSelector('legendPaddingSlider')
    ], LegendPanel.prototype, "legendPaddingSlider", void 0);
    __decorate([
        core_1.RefSelector('markerSizeSlider')
    ], LegendPanel.prototype, "markerSizeSlider", void 0);
    __decorate([
        core_1.RefSelector('markerStrokeSlider')
    ], LegendPanel.prototype, "markerStrokeSlider", void 0);
    __decorate([
        core_1.RefSelector('markerPaddingSlider')
    ], LegendPanel.prototype, "markerPaddingSlider", void 0);
    __decorate([
        core_1.RefSelector('itemPaddingXSlider')
    ], LegendPanel.prototype, "itemPaddingXSlider", void 0);
    __decorate([
        core_1.RefSelector('itemPaddingYSlider')
    ], LegendPanel.prototype, "itemPaddingYSlider", void 0);
    __decorate([
        core_1.Autowired('chartTranslationService')
    ], LegendPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        core_1.PostConstruct
    ], LegendPanel.prototype, "init", null);
    return LegendPanel;
}(core_1.Component));
exports.LegendPanel = LegendPanel;
