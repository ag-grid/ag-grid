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
var chartTranslator_1 = require("../../../chartTranslator");
var AxisTicksPanel = /** @class */ (function (_super) {
    __extends(AxisTicksPanel, _super);
    function AxisTicksPanel(chartController) {
        var _this = _super.call(this) || this;
        _this.chartProxy = chartController.getChartProxy();
        return _this;
    }
    AxisTicksPanel.prototype.init = function () {
        this.setTemplate(AxisTicksPanel.TEMPLATE);
        this.initAxisTicks();
    };
    AxisTicksPanel.prototype.initAxisTicks = function () {
        var _this = this;
        this.axisTicksGroup
            .setTitle(this.chartTranslator.translate('ticks'))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);
        this.axisTicksColorPicker
            .setLabel(this.chartTranslator.translate('color'))
            .setLabelWidth('flex')
            .setInputWidth(45)
            .setValue(this.chartProxy.getCommonAxisProperty('tickColor'))
            .onValueChange(function (newColor) { return _this.chartProxy.setCommonAxisProperty('tickColor', newColor); });
        var initInput = function (property, input, label, maxValue) {
            input.setLabel(label)
                .setValue(_this.chartProxy.getCommonAxisProperty(property))
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) { return _this.chartProxy.setCommonAxisProperty(property, newValue); });
        };
        initInput('tickWidth', this.axisTicksWidthSlider, this.chartTranslator.translate('width'), 10);
        initInput('tickSize', this.axisTicksSizeSlider, this.chartTranslator.translate('length'), 30);
        initInput('tickPadding', this.axisTicksPaddingSlider, this.chartTranslator.translate('padding'), 30);
    };
    AxisTicksPanel.TEMPLATE = "<div>         \n            <ag-group-component ref=\"axisTicksGroup\">\n                <ag-color-picker ref=\"axisTicksColorPicker\"></ag-color-picker>\n                <ag-slider ref=\"axisTicksWidthSlider\"></ag-slider>\n                <ag-slider ref=\"axisTicksSizeSlider\"></ag-slider>\n                <ag-slider ref=\"axisTicksPaddingSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        ag_grid_community_1.RefSelector('axisTicksGroup'),
        __metadata("design:type", ag_grid_community_1.AgGroupComponent)
    ], AxisTicksPanel.prototype, "axisTicksGroup", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('axisTicksColorPicker'),
        __metadata("design:type", ag_grid_community_1.AgColorPicker)
    ], AxisTicksPanel.prototype, "axisTicksColorPicker", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('axisTicksWidthSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], AxisTicksPanel.prototype, "axisTicksWidthSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('axisTicksSizeSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], AxisTicksPanel.prototype, "axisTicksSizeSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('axisTicksPaddingSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], AxisTicksPanel.prototype, "axisTicksPaddingSlider", void 0);
    __decorate([
        ag_grid_community_1.Autowired('chartTranslator'),
        __metadata("design:type", chartTranslator_1.ChartTranslator)
    ], AxisTicksPanel.prototype, "chartTranslator", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AxisTicksPanel.prototype, "init", null);
    return AxisTicksPanel;
}(ag_grid_community_1.Component));
exports.AxisTicksPanel = AxisTicksPanel;
