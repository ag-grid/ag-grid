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
import { _, Autowired, Component, LegendPosition, PostConstruct, RefSelector, } from "@ag-grid-community/core";
import { FontPanel } from "../fontPanel";
var LegendPanel = /** @class */ (function (_super) {
    __extends(LegendPanel, _super);
    function LegendPanel(chartController) {
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.chartController = chartController;
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
            .setTitle(this.chartTranslator.translate("legend"))
            .hideEnabledCheckbox(false)
            .setEnabled(this.chartController.getChartProxy().getChartOption("legend.enabled") || false)
            .toggleGroupExpand(false)
            .onEnableChange(function (enabled) {
            _this.chartController.getChartProxy().setChartOption("legend.enabled", enabled);
            _this.legendGroup.toggleGroupExpand(true);
        });
    };
    LegendPanel.prototype.initLegendPosition = function () {
        var _this = this;
        var positions = [LegendPosition.Top, LegendPosition.Right, LegendPosition.Bottom, LegendPosition.Left];
        this.legendPositionSelect
            .setLabel(this.chartTranslator.translate("position"))
            .setLabelWidth("flex")
            .setInputWidth(80)
            .addOptions(positions.map(function (position) { return ({
            value: position,
            text: _this.chartTranslator.translate(position)
        }); }))
            .setValue(this.chartController.getChartProxy().getChartOption("legend.position"))
            .onValueChange(function (newValue) { return _this.chartController.getChartProxy().setChartOption("legend.position", newValue); });
    };
    LegendPanel.prototype.initLegendPadding = function () {
        var _this = this;
        this.legendPaddingSlider
            .setLabel(this.chartTranslator.translate("spacing"))
            .setValue(this.chartController.getChartProxy().getChartOption("legend.spacing"))
            .setTextFieldWidth(45)
            .setMaxValue(200)
            .onValueChange(function (newValue) { return _this.chartController.getChartProxy().setChartOption("legend.spacing", newValue); });
    };
    LegendPanel.prototype.initLegendItems = function () {
        var _this = this;
        var initSlider = function (expression, labelKey, input, maxValue) {
            input.setLabel(_this.chartTranslator.translate(labelKey))
                .setValue(_this.chartController.getChartProxy().getChartOption("legend." + expression))
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) { return _this.chartController.getChartProxy().setChartOption("legend." + expression, newValue); });
        };
        initSlider("item.marker.size", "markerSize", this.markerSizeSlider, 40);
        initSlider("item.marker.strokeWidth", "markerStroke", this.markerStrokeSlider, 10);
        initSlider("item.marker.padding", "itemSpacing", this.markerPaddingSlider, 20);
        initSlider("item.paddingX", "layoutHorizontalSpacing", this.itemPaddingXSlider, 50);
        initSlider("item.paddingY", "layoutVerticalSpacing", this.itemPaddingYSlider, 50);
    };
    LegendPanel.prototype.initLabelPanel = function () {
        var _this = this;
        var chartProxy = this.chartController.getChartProxy();
        var initialFont = {
            family: chartProxy.getChartOption("legend.item.label.fontFamily"),
            style: chartProxy.getChartOption("legend.item.label.fontStyle"),
            weight: chartProxy.getChartOption("legend.item.label.fontWeight"),
            size: chartProxy.getChartOption("legend.item.label.fontSize"),
            color: chartProxy.getChartOption("legend.item.label.color")
        };
        var setFont = function (font) {
            var chartProxy = _this.chartController.getChartProxy();
            if (font.family) {
                chartProxy.setChartOption("legend.item.label.fontFamily", font.family);
            }
            if (font.weight) {
                chartProxy.setChartOption("legend.item.label.fontWeight", font.weight);
            }
            if (font.style) {
                chartProxy.setChartOption("legend.item.label.fontStyle", font.style);
            }
            if (font.size) {
                chartProxy.setChartOption("legend.item.label.fontSize", font.size);
            }
            if (font.color) {
                chartProxy.setChartOption("legend.item.label.color", font.color);
            }
        };
        var params = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };
        var fontPanelComp = this.createBean(new FontPanel(params));
        this.legendGroup.addItem(fontPanelComp);
        this.activePanels.push(fontPanelComp);
    };
    LegendPanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            _.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    LegendPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    LegendPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"legendGroup\">\n                <ag-select ref=\"legendPositionSelect\"></ag-select>\n                <ag-slider ref=\"legendPaddingSlider\"></ag-slider>\n                <ag-slider ref=\"markerSizeSlider\"></ag-slider>\n                <ag-slider ref=\"markerStrokeSlider\"></ag-slider>\n                <ag-slider ref=\"markerPaddingSlider\"></ag-slider>\n                <ag-slider ref=\"itemPaddingXSlider\"></ag-slider>\n                <ag-slider ref=\"itemPaddingYSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('legendGroup')
    ], LegendPanel.prototype, "legendGroup", void 0);
    __decorate([
        RefSelector('legendPositionSelect')
    ], LegendPanel.prototype, "legendPositionSelect", void 0);
    __decorate([
        RefSelector('legendPaddingSlider')
    ], LegendPanel.prototype, "legendPaddingSlider", void 0);
    __decorate([
        RefSelector('markerSizeSlider')
    ], LegendPanel.prototype, "markerSizeSlider", void 0);
    __decorate([
        RefSelector('markerStrokeSlider')
    ], LegendPanel.prototype, "markerStrokeSlider", void 0);
    __decorate([
        RefSelector('markerPaddingSlider')
    ], LegendPanel.prototype, "markerPaddingSlider", void 0);
    __decorate([
        RefSelector('itemPaddingXSlider')
    ], LegendPanel.prototype, "itemPaddingXSlider", void 0);
    __decorate([
        RefSelector('itemPaddingYSlider')
    ], LegendPanel.prototype, "itemPaddingYSlider", void 0);
    __decorate([
        Autowired('chartTranslator')
    ], LegendPanel.prototype, "chartTranslator", void 0);
    __decorate([
        PostConstruct
    ], LegendPanel.prototype, "init", null);
    return LegendPanel;
}(Component));
export { LegendPanel };
