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
var axisTicksPanel_1 = require("./axisTicksPanel");
var labelPanel_1 = require("../label/labelPanel");
var chartTranslator_1 = require("../../../chartTranslator");
var AxisPanel = /** @class */ (function (_super) {
    __extends(AxisPanel, _super);
    function AxisPanel(chartController) {
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.chartController = chartController;
        _this.chartProxy = chartController.getChartProxy();
        return _this;
    }
    AxisPanel.prototype.init = function () {
        this.setTemplate(AxisPanel.TEMPLATE);
        this.initAxis();
        this.initAxisTicks();
        this.initAxisLabels();
    };
    AxisPanel.prototype.initAxis = function () {
        var _this = this;
        this.axisGroup
            .setTitle(this.chartTranslator.translate('axis'))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
        this.axisColorInput
            .setLabel(this.chartTranslator.translate('color'))
            .setLabelWidth('flex')
            .setInputWidth(45)
            .setValue(this.chartProxy.getCommonAxisProperty('lineColor'))
            .onValueChange(function (newColor) { return _this.chartProxy.setCommonAxisProperty('lineColor', newColor); });
        this.axisLineWidthSlider
            .setLabel(this.chartTranslator.translate('thickness'))
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(this.chartProxy.getCommonAxisProperty('lineWidth'))
            .onValueChange(function (newValue) { return _this.chartProxy.setCommonAxisProperty('lineWidth', newValue); });
    };
    AxisPanel.prototype.initAxisTicks = function () {
        var axisTicksComp = new axisTicksPanel_1.AxisTicksPanel(this.chartController);
        this.getContext().wireBean(axisTicksComp);
        this.axisGroup.addItem(axisTicksComp);
        this.activePanels.push(axisTicksComp);
    };
    AxisPanel.prototype.initAxisLabels = function () {
        var _this = this;
        var initialFont = {
            family: this.chartProxy.getCommonAxisProperty('labelFontFamily'),
            style: this.chartProxy.getCommonAxisProperty('labelFontStyle'),
            weight: this.chartProxy.getCommonAxisProperty('labelFontWeight'),
            size: parseInt(this.chartProxy.getCommonAxisProperty('labelFontSize')),
            color: this.chartProxy.getCommonAxisProperty('labelColor')
        };
        // note we don't set the font style via legend panel
        var setFont = function (font) {
            if (font.family) {
                _this.chartProxy.setCommonAxisProperty('labelFontFamily', font.family);
            }
            if (font.weight) {
                _this.chartProxy.setCommonAxisProperty('labelFontWeight', font.weight);
            }
            if (font.size) {
                _this.chartProxy.setCommonAxisProperty('labelFontSize', font.size);
            }
            if (font.color) {
                _this.chartProxy.setCommonAxisProperty('labelColor', font.color);
            }
            _this.chartProxy.getChart().performLayout();
        };
        var params = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };
        var labelPanelComp = new labelPanel_1.LabelPanel(params);
        this.getContext().wireBean(labelPanelComp);
        this.axisGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
        this.addAdditionalLabelComps(labelPanelComp);
    };
    AxisPanel.prototype.addAdditionalLabelComps = function (labelPanelComp) {
        var _this = this;
        var createAngleComp = function (label, initialValue, updateFunc) {
            var rotationInput = new ag_grid_community_1.AgAngleSelect()
                .setLabel(label)
                .setLabelWidth("flex")
                .setValue(initialValue)
                .onValueChange(updateFunc);
            _this.getContext().wireBean(rotationInput);
            labelPanelComp.addCompToPanel(rotationInput);
        };
        var degreesSymbol = String.fromCharCode(176);
        var xRotationLabel = this.chartTranslator.translate('xRotation') + " " + degreesSymbol;
        var xUpdateFunc = function (newValue) { return _this.chartProxy.setXRotation(newValue); };
        createAngleComp(xRotationLabel, this.chartProxy.getXRotation(), xUpdateFunc);
        var yRotationLabel = this.chartTranslator.translate('yRotation') + " " + degreesSymbol;
        var yUpdateFunc = function (newValue) { return _this.chartProxy.setYRotation(newValue); };
        createAngleComp(yRotationLabel, this.chartProxy.getYRotation(), yUpdateFunc);
    };
    AxisPanel.prototype.destroyActivePanels = function () {
        this.activePanels.forEach(function (panel) {
            ag_grid_community_1._.removeFromParent(panel.getGui());
            panel.destroy();
        });
    };
    AxisPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    AxisPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"axisGroup\">\n                <ag-color-picker ref=\"axisColorInput\"></ag-color-picker>\n                <ag-slider ref=\"axisLineWidthSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        ag_grid_community_1.RefSelector('axisGroup'),
        __metadata("design:type", ag_grid_community_1.AgGroupComponent)
    ], AxisPanel.prototype, "axisGroup", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('axisLineWidthSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], AxisPanel.prototype, "axisLineWidthSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('axisColorInput'),
        __metadata("design:type", ag_grid_community_1.AgColorPicker)
    ], AxisPanel.prototype, "axisColorInput", void 0);
    __decorate([
        ag_grid_community_1.Autowired('chartTranslator'),
        __metadata("design:type", chartTranslator_1.ChartTranslator)
    ], AxisPanel.prototype, "chartTranslator", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AxisPanel.prototype, "init", null);
    return AxisPanel;
}(ag_grid_community_1.Component));
exports.AxisPanel = AxisPanel;
