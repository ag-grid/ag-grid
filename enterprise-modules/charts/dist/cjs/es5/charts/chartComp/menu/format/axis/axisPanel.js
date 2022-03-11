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
var chartController_1 = require("../../../chartController");
var axisTicksPanel_1 = require("./axisTicksPanel");
var fontPanel_1 = require("../fontPanel");
var formatPanel_1 = require("../formatPanel");
var AxisPanel = /** @class */ (function (_super) {
    __extends(AxisPanel, _super);
    function AxisPanel(chartController, chartOptionsService) {
        var _this = _super.call(this) || this;
        _this.chartController = chartController;
        _this.chartOptionsService = chartOptionsService;
        _this.activePanels = [];
        _this.axisLabelUpdateFuncs = [];
        return _this;
    }
    AxisPanel.prototype.init = function () {
        var _this = this;
        var groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(AxisPanel.TEMPLATE, { axisGroup: groupParams });
        this.initAxis();
        this.initAxisTicks();
        this.initAxisLabels();
        var updateAxisLabelRotations = function () { return _this.axisLabelUpdateFuncs.forEach(function (func) { return func(); }); };
        this.addManagedListener(this.chartController, chartController_1.ChartController.EVENT_CHART_UPDATED, updateAxisLabelRotations);
    };
    AxisPanel.prototype.initAxis = function () {
        var _this = this;
        var chartTranslationService = this.chartTranslationService;
        this.axisGroup
            .setTitle(chartTranslationService.translate("axis"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
        this.axisColorInput
            .setLabel(chartTranslationService.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getAxisProperty("line.color"))
            .onValueChange(function (newColor) { return _this.chartOptionsService.setAxisProperty("line.color", newColor); });
        var currentValue = this.chartOptionsService.getAxisProperty("line.width");
        this.axisLineWidthSlider
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 10))
            .setLabel(chartTranslationService.translate("thickness"))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setAxisProperty("line.width", newValue); });
        if (core_1._.includes(['line', 'scatter', 'bubble'], this.chartController.getChartType()) && !this.chartController.isGrouping()) {
            var options_1 = [
                { value: '', text: chartTranslationService.translate('automatic') }
            ];
            ['category', 'time', 'number'].forEach(function (type) {
                options_1.push({ value: type, text: chartTranslationService.translate(type) });
            });
            this.xAxisTypeSelect
                .setLabel(chartTranslationService.translate('xType'))
                .setLabelWidth('flex')
                .addOptions(options_1)
                .setValue(this.chartOptionsService.getChartOption('xAxis.type') || '')
                .onValueChange(function (newValue) {
                _this.chartOptionsService.setChartOption('xAxis.type', typeof newValue === 'string' && newValue.length && newValue);
                _this.chartController.updateForDataChange();
            });
        }
        else {
            this.xAxisTypeSelect.setDisplayed(false);
        }
    };
    AxisPanel.prototype.initAxisTicks = function () {
        var axisTicksComp = this.createBean(new axisTicksPanel_1.AxisTicksPanel(this.chartOptionsService));
        this.axisGroup.addItem(axisTicksComp);
        this.activePanels.push(axisTicksComp);
    };
    AxisPanel.prototype.initAxisLabels = function () {
        var _this = this;
        var initialFont = {
            family: this.chartOptionsService.getAxisProperty("label.fontFamily"),
            style: this.chartOptionsService.getAxisProperty("label.fontStyle"),
            weight: this.chartOptionsService.getAxisProperty("label.fontWeight"),
            size: this.chartOptionsService.getAxisProperty("label.fontSize"),
            color: this.chartOptionsService.getAxisProperty("label.color")
        };
        var setFont = function (font) {
            if (font.family) {
                _this.chartOptionsService.setAxisProperty("label.fontFamily", font.family);
            }
            if (font.weight) {
                _this.chartOptionsService.setAxisProperty("label.fontWeight", font.weight);
            }
            if (font.style) {
                _this.chartOptionsService.setAxisProperty("label.fontStyle", font.style);
            }
            if (font.size) {
                _this.chartOptionsService.setAxisProperty("label.fontSize", font.size);
            }
            if (font.color) {
                _this.chartOptionsService.setAxisProperty("label.color", font.color);
            }
            _this.chartController.getChartProxy().getChart().layoutPending = true;
        };
        var params = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };
        var labelPanelComp = this.createBean(new fontPanel_1.FontPanel(params));
        this.axisGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
        this.addAdditionalLabelComps(labelPanelComp);
    };
    AxisPanel.prototype.addAdditionalLabelComps = function (labelPanelComp) {
        var _this = this;
        var createAngleComp = function (label, axisType) {
            var value = _this.chartOptionsService.getLabelRotation(axisType);
            var angleSelect = new core_1.AgAngleSelect()
                .setLabel(label)
                .setLabelWidth("flex")
                .setValue(value || 0)
                .onValueChange(function (newValue) { return _this.chartOptionsService.setLabelRotation(axisType, newValue); });
            // the axis label rotation needs to be updated when the default category changes in the data panel
            _this.axisLabelUpdateFuncs.push(function () {
                var value = _this.chartOptionsService.getLabelRotation(axisType);
                angleSelect.setValue(value);
            });
            var rotationInput = _this.createBean(angleSelect);
            labelPanelComp.addCompToPanel(rotationInput);
        };
        var degreesSymbol = String.fromCharCode(176);
        var xRotationLabel = this.chartTranslationService.translate("xRotation") + " " + degreesSymbol;
        var yRotationLabel = this.chartTranslationService.translate("yRotation") + " " + degreesSymbol;
        createAngleComp(xRotationLabel, "xAxis");
        createAngleComp(yRotationLabel, "yAxis");
        var labelPaddingSlider = this.createBean(new core_1.AgSlider());
        var currentValue = this.chartOptionsService.getAxisProperty("label.padding");
        labelPaddingSlider.setLabel(this.chartTranslationService.translate("padding"))
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 30))
            .setValue("" + currentValue)
            .setTextFieldWidth(45)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setAxisProperty("label.padding", newValue); });
        labelPanelComp.addCompToPanel(labelPaddingSlider);
    };
    AxisPanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            core_1._.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    AxisPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    AxisPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"axisGroup\">\n                <ag-color-picker ref=\"axisColorInput\"></ag-color-picker>\n                <ag-slider ref=\"axisLineWidthSlider\"></ag-slider>\n                <ag-select ref=\"xAxisTypeSelect\"></ag-select>\n            </ag-group-component>\n        </div>";
    __decorate([
        core_1.RefSelector('axisGroup')
    ], AxisPanel.prototype, "axisGroup", void 0);
    __decorate([
        core_1.RefSelector('axisColorInput')
    ], AxisPanel.prototype, "axisColorInput", void 0);
    __decorate([
        core_1.RefSelector('axisLineWidthSlider')
    ], AxisPanel.prototype, "axisLineWidthSlider", void 0);
    __decorate([
        core_1.RefSelector('xAxisTypeSelect')
    ], AxisPanel.prototype, "xAxisTypeSelect", void 0);
    __decorate([
        core_1.Autowired('chartTranslationService')
    ], AxisPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        core_1.PostConstruct
    ], AxisPanel.prototype, "init", null);
    return AxisPanel;
}(core_1.Component));
exports.AxisPanel = AxisPanel;
//# sourceMappingURL=axisPanel.js.map