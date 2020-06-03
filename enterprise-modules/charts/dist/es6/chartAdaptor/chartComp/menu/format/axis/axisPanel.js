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
import { _, AgAngleSelect, AgSlider, Autowired, Component, PostConstruct, RefSelector, } from "@ag-grid-community/core";
import { AxisTicksPanel } from "./axisTicksPanel";
import { FontPanel } from "../fontPanel";
import { ChartAxisPosition, find } from "ag-charts-community";
var AxisPanel = /** @class */ (function (_super) {
    __extends(AxisPanel, _super);
    function AxisPanel(chartController) {
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.chartController = chartController;
        return _this;
    }
    AxisPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(AxisPanel.TEMPLATE, { axisGroup: groupParams });
        this.initAxis();
        this.initAxisTicks();
        this.initAxisLabels();
    };
    AxisPanel.prototype.initAxis = function () {
        var _this = this;
        var chartTranslator = this.chartTranslator;
        this.axisGroup
            .setTitle(chartTranslator.translate("axis"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
        this.axisColorInput
            .setLabel(chartTranslator.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.getChartProxy().getAxisProperty("line.color"))
            .onValueChange(function (newColor) { return _this.getChartProxy().setAxisProperty("line.color", newColor); });
        this.axisLineWidthSlider
            .setLabel(chartTranslator.translate("thickness"))
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(this.getChartProxy().getAxisProperty("line.width"))
            .onValueChange(function (newValue) { return _this.getChartProxy().setAxisProperty("line.width", newValue); });
        if (_.includes(['line', 'scatter', 'bubble'], this.chartController.getChartType()) && !this.chartController.isGrouping()) {
            var options_1 = [
                { value: '', text: chartTranslator.translate('automatic') }
            ];
            ['category', 'time', 'number'].forEach(function (type) {
                options_1.push({ value: type, text: chartTranslator.translate(type) });
            });
            this.xAxisTypeSelect
                .setLabel(chartTranslator.translate('xType'))
                .setLabelWidth('flex')
                .addOptions(options_1)
                .setValue(this.getChartProxy().getChartOption('xAxis.type') || '')
                .onValueChange(function (newValue) {
                var chartProxy = _this.getChartProxy();
                chartProxy.setChartOption('xAxis.type', newValue.length && newValue);
                _this.chartController.updateForDataChange();
            });
        }
        else {
            this.xAxisTypeSelect.setDisplayed(false);
        }
    };
    AxisPanel.prototype.initAxisTicks = function () {
        var axisTicksComp = this.createBean(new AxisTicksPanel(this.chartController));
        this.axisGroup.addItem(axisTicksComp);
        this.activePanels.push(axisTicksComp);
    };
    AxisPanel.prototype.initAxisLabels = function () {
        var _this = this;
        var chartProxy = this.getChartProxy();
        var initialFont = {
            family: chartProxy.getAxisProperty("label.fontFamily"),
            style: chartProxy.getAxisProperty("label.fontStyle"),
            weight: chartProxy.getAxisProperty("label.fontWeight"),
            size: chartProxy.getAxisProperty("label.fontSize"),
            color: chartProxy.getAxisProperty("label.color")
        };
        var setFont = function (font) {
            var chartProxy = _this.getChartProxy();
            if (font.family) {
                chartProxy.setAxisProperty("label.fontFamily", font.family);
            }
            if (font.weight) {
                chartProxy.setAxisProperty("label.fontWeight", font.weight);
            }
            if (font.style) {
                chartProxy.setAxisProperty("label.fontStyle", font.style);
            }
            if (font.size) {
                chartProxy.setAxisProperty("label.fontSize", font.size);
            }
            if (font.color) {
                chartProxy.setAxisProperty("label.color", font.color);
            }
            chartProxy.getChart().performLayout();
        };
        var params = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };
        var labelPanelComp = this.createBean(new FontPanel(params));
        this.axisGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
        this.addAdditionalLabelComps(labelPanelComp);
    };
    AxisPanel.prototype.addAdditionalLabelComps = function (labelPanelComp) {
        var _this = this;
        var createAngleComp = function (label, initialValue, updateFunc) {
            var rotationInput = _this.createBean(new AgAngleSelect()
                .setLabel(label)
                .setLabelWidth("flex")
                .setValue(initialValue || 0)
                .onValueChange(updateFunc));
            labelPanelComp.addCompToPanel(rotationInput);
        };
        var degreesSymbol = String.fromCharCode(176);
        var createLabelUpdateFunc = function (axisPosition) { return function (newValue) {
            var chartProxy = _this.getChartProxy();
            var chart = chartProxy.getChart();
            var axis = find(chart.axes, function (axis) { return axis.position === axisPosition; });
            if (axis) {
                axis.label.rotation = newValue;
                if (axis.position === ChartAxisPosition.Bottom) {
                    _.set(chartProxy.getChartOptions().xAxis, "label.rotation", newValue);
                }
                else if (axis.position === ChartAxisPosition.Left) {
                    _.set(chartProxy.getChartOptions().yAxis, "label.rotation", newValue);
                }
                chart.performLayout();
            }
        }; };
        var xRotationLabel = this.chartTranslator.translate("xRotation") + " " + degreesSymbol;
        var yRotationLabel = this.chartTranslator.translate("yRotation") + " " + degreesSymbol;
        createAngleComp(xRotationLabel, this.getChartProxy().getChartOption("xAxis.label.rotation"), createLabelUpdateFunc(ChartAxisPosition.Bottom));
        createAngleComp(yRotationLabel, this.getChartProxy().getChartOption("yAxis.label.rotation"), createLabelUpdateFunc(ChartAxisPosition.Left));
        var labelPaddingSlider = this.createBean(new AgSlider());
        labelPaddingSlider.setLabel(this.chartTranslator.translate("padding"))
            .setValue(this.getChartProxy().getAxisProperty("label.padding"))
            .setMaxValue(30)
            .setTextFieldWidth(45)
            .onValueChange(function (newValue) { return _this.getChartProxy().setAxisProperty("label.padding", newValue); });
        labelPanelComp.addCompToPanel(labelPaddingSlider);
    };
    AxisPanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            _.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    AxisPanel.prototype.getChartProxy = function () {
        return this.chartController.getChartProxy();
    };
    AxisPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    AxisPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"axisGroup\">\n                <ag-color-picker ref=\"axisColorInput\"></ag-color-picker>\n                <ag-slider ref=\"axisLineWidthSlider\"></ag-slider>\n                <ag-select ref=\"xAxisTypeSelect\"></ag-select>\n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('axisGroup')
    ], AxisPanel.prototype, "axisGroup", void 0);
    __decorate([
        RefSelector('axisColorInput')
    ], AxisPanel.prototype, "axisColorInput", void 0);
    __decorate([
        RefSelector('axisLineWidthSlider')
    ], AxisPanel.prototype, "axisLineWidthSlider", void 0);
    __decorate([
        RefSelector('xAxisTypeSelect')
    ], AxisPanel.prototype, "xAxisTypeSelect", void 0);
    __decorate([
        Autowired('chartTranslator')
    ], AxisPanel.prototype, "chartTranslator", void 0);
    __decorate([
        PostConstruct
    ], AxisPanel.prototype, "init", null);
    return AxisPanel;
}(Component));
export { AxisPanel };
