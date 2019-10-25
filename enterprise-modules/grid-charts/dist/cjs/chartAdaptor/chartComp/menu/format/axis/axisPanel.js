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
var grid_core_1 = require("@ag-community/grid-core");
var axisTicksPanel_1 = require("./axisTicksPanel");
var fontPanel_1 = require("../fontPanel");
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
            .setTitle(this.chartTranslator.translate("axis"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
        this.axisColorInput
            .setLabel(this.chartTranslator.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartProxy.getAxisProperty("line.color"))
            .onValueChange(function (newColor) { return _this.chartProxy.setAxisProperty("line.color", newColor); });
        this.axisLineWidthSlider
            .setLabel(this.chartTranslator.translate("thickness"))
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(this.chartProxy.getAxisProperty("line.width"))
            .onValueChange(function (newValue) { return _this.chartProxy.setAxisProperty("line.width", newValue); });
    };
    AxisPanel.prototype.initAxisTicks = function () {
        var axisTicksComp = this.wireBean(new axisTicksPanel_1.AxisTicksPanel(this.chartController));
        this.axisGroup.addItem(axisTicksComp);
        this.activePanels.push(axisTicksComp);
    };
    AxisPanel.prototype.initAxisLabels = function () {
        var _this = this;
        var initialFont = {
            family: this.chartProxy.getAxisProperty("label.fontFamily"),
            style: this.chartProxy.getAxisProperty("label.fontStyle"),
            weight: this.chartProxy.getAxisProperty("label.fontWeight"),
            size: this.chartProxy.getAxisProperty("label.fontSize"),
            color: this.chartProxy.getAxisProperty("label.color")
        };
        var setFont = function (font) {
            if (font.family) {
                _this.chartProxy.setAxisProperty("label.fontFamily", font.family);
            }
            if (font.weight) {
                _this.chartProxy.setAxisProperty("label.fontWeight", font.weight);
            }
            if (font.style) {
                _this.chartProxy.setAxisProperty("label.fontStyle", font.style);
            }
            if (font.size) {
                _this.chartProxy.setAxisProperty("label.fontSize", font.size);
            }
            if (font.color) {
                _this.chartProxy.setAxisProperty("label.color", font.color);
            }
            _this.chartProxy.getChart().performLayout();
        };
        var params = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };
        var labelPanelComp = this.wireBean(new fontPanel_1.FontPanel(params));
        this.axisGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
        this.addAdditionalLabelComps(labelPanelComp);
    };
    AxisPanel.prototype.addAdditionalLabelComps = function (labelPanelComp) {
        var _this = this;
        var createAngleComp = function (label, initialValue, updateFunc) {
            var rotationInput = _this.wireBean(new grid_core_1.AgAngleSelect()
                .setLabel(label)
                .setLabelWidth("flex")
                .setValue(initialValue || 0)
                .onValueChange(updateFunc));
            labelPanelComp.addCompToPanel(rotationInput);
        };
        var degreesSymbol = String.fromCharCode(176);
        var xRotationLabel = this.chartTranslator.translate("xRotation") + " " + degreesSymbol;
        var xUpdateFunc = function (newValue) {
            _this.chartProxy.setChartOption("xAxis.label.rotation", newValue);
            _this.chartProxy.getChart().performLayout();
        };
        createAngleComp(xRotationLabel, this.chartProxy.getChartOption("xAxis.label.rotation"), xUpdateFunc);
        var yRotationLabel = this.chartTranslator.translate("yRotation") + " " + degreesSymbol;
        var yUpdateFunc = function (newValue) {
            _this.chartProxy.setChartOption("yAxis.label.rotation", newValue);
            _this.chartProxy.getChart().performLayout();
        };
        createAngleComp(yRotationLabel, this.chartProxy.getChartOption("yAxis.label.rotation"), yUpdateFunc);
        var labelPaddingSlider = this.wireBean(new grid_core_1.AgSlider());
        labelPaddingSlider.setLabel(this.chartTranslator.translate("padding"))
            .setValue(this.chartProxy.getAxisProperty("label.padding"))
            .setMaxValue(30)
            .setTextFieldWidth(45)
            .onValueChange(function (newValue) { return _this.chartProxy.setAxisProperty("label.padding", newValue); });
        labelPanelComp.addCompToPanel(labelPaddingSlider);
    };
    AxisPanel.prototype.destroyActivePanels = function () {
        this.activePanels.forEach(function (panel) {
            grid_core_1._.removeFromParent(panel.getGui());
            panel.destroy();
        });
    };
    AxisPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    AxisPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"axisGroup\">\n                <ag-color-picker ref=\"axisColorInput\"></ag-color-picker>\n                <ag-slider ref=\"axisLineWidthSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        grid_core_1.RefSelector('axisGroup')
    ], AxisPanel.prototype, "axisGroup", void 0);
    __decorate([
        grid_core_1.RefSelector('axisLineWidthSlider')
    ], AxisPanel.prototype, "axisLineWidthSlider", void 0);
    __decorate([
        grid_core_1.RefSelector('axisColorInput')
    ], AxisPanel.prototype, "axisColorInput", void 0);
    __decorate([
        grid_core_1.Autowired('chartTranslator')
    ], AxisPanel.prototype, "chartTranslator", void 0);
    __decorate([
        grid_core_1.PostConstruct
    ], AxisPanel.prototype, "init", null);
    return AxisPanel;
}(grid_core_1.Component));
exports.AxisPanel = AxisPanel;
