// ag-grid-enterprise v21.1.1
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
var labelPanel_1 = require("../label/labelPanel");
var chartTranslator_1 = require("../../../chartTranslator");
var LegendPanel = /** @class */ (function (_super) {
    __extends(LegendPanel, _super);
    function LegendPanel(chartController) {
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.chartController = chartController;
        return _this;
    }
    LegendPanel.prototype.init = function () {
        this.setTemplate(LegendPanel.TEMPLATE);
        var chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();
        this.initLegendGroup();
        this.initLegendPosition();
        this.initLegendPadding();
        this.initLegendItems();
        this.initLabelPanel();
    };
    LegendPanel.prototype.initLegendGroup = function () {
        var _this = this;
        this.legendGroup
            .setTitle(this.chartTranslator.translate('legend'))
            .hideEnabledCheckbox(false)
            .toggleGroupExpand(false)
            .onEnableChange(function (enabled) {
            _this.chart.legend.enabled = enabled;
            _this.legendGroup.toggleGroupExpand(true);
        });
    };
    LegendPanel.prototype.initLegendPosition = function () {
        var _this = this;
        var positions = ['top', 'right', 'bottom', 'left'];
        this.legendPositionSelect
            .setLabel(this.chartTranslator.translate('position'))
            .setLabelWidth('flex')
            .setInputWidth(80)
            .addOptions(positions.map(function (position) { return ({
            value: position,
            text: _this.chartTranslator.translate(position)
        }); }))
            .onValueChange(function (value) {
            _this.chart.legendPosition = value;
        })
            .setValue(this.chart.legendPosition);
    };
    LegendPanel.prototype.initLegendPadding = function () {
        var _this = this;
        this.legendPaddingSlider
            .setLabel(this.chartTranslator.translate('padding'))
            .setValue("" + this.chart.legendPadding)
            .setTextFieldWidth(45)
            .setMaxValue(200)
            .onValueChange(function (newValue) { return _this.chart.legendPadding = newValue; });
    };
    LegendPanel.prototype.initLegendItems = function () {
        var _this = this;
        var initSlider = function (property, labelKey, input, initialValue, maxValue) {
            input.setLabel(_this.chartTranslator.translate(labelKey))
                .setValue(initialValue)
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) { return _this.chart.legend[property] = newValue; });
        };
        var initialMarkerSize = "" + this.chart.legend.markerSize;
        initSlider('markerSize', 'markerSize', this.markerSizeSlider, initialMarkerSize, 40);
        var initialMarkerStroke = "" + this.chart.legend.markerStrokeWidth;
        initSlider('markerStrokeWidth', 'markerStroke', this.markerStrokeSlider, initialMarkerStroke, 10);
        var initialMarkerPadding = "" + this.chart.legend.markerPadding;
        initSlider('markerPadding', 'markerPadding', this.markerPaddingSlider, initialMarkerPadding, 200);
        var initialItemPaddingX = "" + this.chart.legend.itemPaddingX;
        initSlider('itemPaddingX', 'itemPaddingX', this.itemPaddingXSlider, initialItemPaddingX, 50);
        var initialItemPaddingY = "" + this.chart.legend.itemPaddingY;
        initSlider('itemPaddingY', 'itemPaddingY', this.itemPaddingYSlider, initialItemPaddingY, 50);
    };
    LegendPanel.prototype.initLabelPanel = function () {
        var _this = this;
        var initialFont = {
            family: this.chart.legend.labelFontFamily,
            style: this.chart.legend.labelFontStyle,
            weight: this.chart.legend.labelFontWeight,
            size: this.chart.legend.labelFontSize,
            color: this.chart.legend.labelColor
        };
        var setFont = function (font) {
            if (font.family) {
                _this.chart.legend.labelFontFamily = font.family;
            }
            if (font.style) {
                _this.chart.legend.labelFontStyle = font.style;
            }
            if (font.weight) {
                _this.chart.legend.labelFontWeight = font.weight;
            }
            if (font.size) {
                _this.chart.legend.labelFontSize = font.size;
            }
            if (font.color) {
                _this.chart.legend.labelColor = font.color;
            }
        };
        var params = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };
        var labelPanelComp = new labelPanel_1.LabelPanel(this.chartController, params);
        this.getContext().wireBean(labelPanelComp);
        this.legendGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
    };
    LegendPanel.prototype.destroyActivePanels = function () {
        this.activePanels.forEach(function (panel) {
            ag_grid_community_1._.removeFromParent(panel.getGui());
            panel.destroy();
        });
    };
    LegendPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    LegendPanel.TEMPLATE = "<div>  \n            <ag-group-component ref=\"legendGroup\">\n                <ag-select ref=\"legendPositionSelect\"></ag-select>\n                <ag-slider ref=\"legendPaddingSlider\"></ag-slider>\n                <ag-slider ref=\"markerSizeSlider\"></ag-slider>\n                <ag-slider ref=\"markerStrokeSlider\"></ag-slider>\n                <ag-slider ref=\"markerPaddingSlider\"></ag-slider>\n                <ag-slider ref=\"itemPaddingXSlider\"></ag-slider>\n                <ag-slider ref=\"itemPaddingYSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        ag_grid_community_1.RefSelector('legendGroup'),
        __metadata("design:type", ag_grid_community_1.AgGroupComponent)
    ], LegendPanel.prototype, "legendGroup", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('legendPositionSelect'),
        __metadata("design:type", ag_grid_community_1.AgSelect)
    ], LegendPanel.prototype, "legendPositionSelect", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('legendPaddingSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], LegendPanel.prototype, "legendPaddingSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('markerSizeSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], LegendPanel.prototype, "markerSizeSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('markerStrokeSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], LegendPanel.prototype, "markerStrokeSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('markerPaddingSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], LegendPanel.prototype, "markerPaddingSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('itemPaddingXSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], LegendPanel.prototype, "itemPaddingXSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('itemPaddingYSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], LegendPanel.prototype, "itemPaddingYSlider", void 0);
    __decorate([
        ag_grid_community_1.Autowired('chartTranslator'),
        __metadata("design:type", chartTranslator_1.ChartTranslator)
    ], LegendPanel.prototype, "chartTranslator", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], LegendPanel.prototype, "init", null);
    return LegendPanel;
}(ag_grid_community_1.Component));
exports.LegendPanel = LegendPanel;
