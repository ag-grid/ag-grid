var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { _, AgGroupComponent, AgSelect, AgSlider, Autowired, Component, PostConstruct, RefSelector, } from '@ag-grid-community/core';
import { FontPanel } from '../fontPanel';
import { getMaxValue } from '../formatPanel';
import { isPolar, isRadial } from '../../../utils/seriesTypeMapper';
var PolarAxisPanel = /** @class */ (function (_super) {
    __extends(PolarAxisPanel, _super);
    function PolarAxisPanel(_a) {
        var chartController = _a.chartController, chartOptionsService = _a.chartOptionsService, _b = _a.isExpandedOnInit, isExpandedOnInit = _b === void 0 ? false : _b;
        var _this = _super.call(this) || this;
        _this.dynamicComponents = [];
        _this.chartController = chartController;
        _this.chartOptionsService = chartOptionsService;
        _this.isExpandedOnInit = isExpandedOnInit;
        return _this;
    }
    PolarAxisPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
        };
        this.setTemplate(PolarAxisPanel.TEMPLATE, { axisGroup: groupParams });
        this.initAxis();
        this.initAxisLabels();
        this.initRadiusAxis();
    };
    PolarAxisPanel.prototype.initAxis = function () {
        var _this = this;
        this.axisGroup
            .setTitle(this.translate('axis'))
            .toggleGroupExpand(this.isExpandedOnInit)
            .hideEnabledCheckbox(true);
        this.axisColorInput
            .setLabel(this.translate('color'))
            .setLabelWidth('flex')
            .setInputWidth('flex')
            .setValue(this.chartOptionsService.getAxisProperty('line.color'))
            .onValueChange(function (newColor) { return _this.chartOptionsService.setAxisProperty('line.color', newColor); });
        var currentValue = this.chartOptionsService.getAxisProperty('line.width');
        this.axisLineWidthSlider
            .setMaxValue(getMaxValue(currentValue, 10))
            .setLabel(this.translate('thickness'))
            .setTextFieldWidth(45)
            .setValue("".concat(currentValue))
            .onValueChange(function (newValue) { return _this.chartOptionsService.setAxisProperty('line.width', newValue); });
        var chartType = this.chartController.getChartType();
        var hasConfigurableAxisShape = ['radarLine', 'radarArea'].includes(chartType);
        if (hasConfigurableAxisShape) {
            var options = [
                { value: 'circle', text: this.translate('circle') },
                { value: 'polygon', text: this.translate('polygon') },
            ];
            this.axisGroup.addItem(this.initSelect({
                label: 'shape',
                options: options,
                currentValue: this.chartOptionsService.getAxisProperty('shape'),
                onValueChange: function (newValue) { return _this.chartOptionsService.setAxisProperty('shape', newValue); }
            }));
        }
        if (isPolar(chartType)) {
            var currentValue_1 = this.chartOptionsService.getAxisProperty('innerRadiusRatio');
            this.axisGroup.addItem(this.initSlider({
                label: 'innerRadius',
                maxValue: 1,
                currentValue: currentValue_1 !== null && currentValue_1 !== void 0 ? currentValue_1 : 0,
                onValueChange: function (newValue) { return _this.chartOptionsService.setAxisProperty('innerRadiusRatio', newValue); }
            }));
        }
    };
    PolarAxisPanel.prototype.initAxisLabels = function () {
        var _this = this;
        var initialFont = {
            family: this.chartOptionsService.getAxisProperty('label.fontFamily'),
            style: this.chartOptionsService.getAxisProperty('label.fontStyle'),
            weight: this.chartOptionsService.getAxisProperty('label.fontWeight'),
            size: this.chartOptionsService.getAxisProperty('label.fontSize'),
            color: this.chartOptionsService.getAxisProperty('label.color'),
        };
        var setFont = function (font) {
            if (font.family) {
                _this.chartOptionsService.setAxisProperty('label.fontFamily', font.family);
            }
            if (font.weight) {
                _this.chartOptionsService.setAxisProperty('label.fontWeight', font.weight);
            }
            if (font.style) {
                _this.chartOptionsService.setAxisProperty('label.fontStyle', font.style);
            }
            if (font.size) {
                _this.chartOptionsService.setAxisProperty('label.fontSize', font.size);
            }
            if (font.color) {
                _this.chartOptionsService.setAxisProperty('label.color', font.color);
            }
        };
        var params = {
            name: this.translate('labels'),
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont,
        };
        var labelPanelComp = this.createBean(new FontPanel(params));
        var labelOrientationComp = this.createOrientationWidget();
        labelPanelComp.addItemToPanel(labelOrientationComp);
        this.axisGroup.addItem(labelPanelComp);
        this.dynamicComponents.push(labelPanelComp);
    };
    PolarAxisPanel.prototype.createOrientationWidget = function () {
        var _this = this;
        var options = [
            { value: 'fixed', text: this.translate('fixed') },
            { value: 'parallel', text: this.translate('parallel') },
            { value: 'perpendicular', text: this.translate('perpendicular') },
        ];
        return this.initSelect({
            label: 'orientation',
            options: options,
            currentValue: this.chartOptionsService.getAxisProperty('label.orientation'),
            onValueChange: function (newValue) { return _this.chartOptionsService.setAxisProperty('label.orientation', newValue); },
        });
    };
    PolarAxisPanel.prototype.initRadiusAxis = function () {
        var _this = this;
        var _a, _b;
        var chartType = this.chartController.getChartType();
        if (!isRadial(chartType))
            return;
        var paddingPanelComp = this.createBean(new AgGroupComponent({
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true,
            enabled: true,
            suppressEnabledCheckbox: true,
            title: this.translate('padding'),
        })).hideEnabledCheckbox(true).hideOpenCloseIcons(true);
        paddingPanelComp.addItem(this.initSlider({
            label: 'groupPadding',
            maxValue: 1,
            currentValue: (_a = this.chartOptionsService.getAxisProperty('paddingInner')) !== null && _a !== void 0 ? _a : 0,
            onValueChange: function (newValue) { return _this.chartOptionsService.setAxisProperty('paddingInner', newValue); }
        }));
        paddingPanelComp.addItem(this.initSlider({
            label: 'seriesPadding',
            maxValue: 1,
            currentValue: (_b = this.chartOptionsService.getAxisProperty('groupPaddingInner')) !== null && _b !== void 0 ? _b : 0,
            onValueChange: function (newValue) { return _this.chartOptionsService.setAxisProperty('groupPaddingInner', newValue); }
        }));
        this.axisGroup.addItem(paddingPanelComp);
        this.dynamicComponents.push(paddingPanelComp);
    };
    PolarAxisPanel.prototype.initSlider = function (config) {
        var label = config.label, maxValue = config.maxValue, _a = config.minValue, minValue = _a === void 0 ? 0 : _a, _b = config.step, step = _b === void 0 ? 0.05 : _b, currentValue = config.currentValue, onValueChange = config.onValueChange;
        var slider = this.createManagedBean(new AgSlider());
        slider
            .setLabel(this.translate(label))
            .setLabelWidth('flex')
            .setMinValue(minValue)
            .setMaxValue(maxValue)
            .setStep(step)
            .setValue("".concat(currentValue))
            .onValueChange(onValueChange);
        this.dynamicComponents.push(slider);
        return slider;
    };
    PolarAxisPanel.prototype.initSelect = function (config) {
        var label = config.label, options = config.options, currentValue = config.currentValue, onValueChange = config.onValueChange;
        var select = this.createManagedBean(new AgSelect());
        select
            .setLabel(this.translate(label))
            .setLabelAlignment('left')
            .setLabelWidth('flex')
            .setInputWidth('flex')
            .addOptions(options);
        if (currentValue !== undefined) {
            select.setValue(currentValue);
        }
        select.onValueChange(onValueChange);
        this.dynamicComponents.push(select);
        return select;
    };
    PolarAxisPanel.prototype.translate = function (key, defaultText) {
        return this.chartTranslationService.translate(key, defaultText);
    };
    PolarAxisPanel.prototype.destroyDynamicComponents = function () {
        var _this = this;
        this.dynamicComponents.forEach(function (component) {
            _.removeFromParent(component.getGui());
            _this.destroyBean(component);
        });
        this.dynamicComponents = [];
    };
    PolarAxisPanel.prototype.destroy = function () {
        this.destroyDynamicComponents();
        _super.prototype.destroy.call(this);
    };
    PolarAxisPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"axisGroup\">\n                <ag-color-picker ref=\"axisColorInput\"></ag-color-picker>\n                <ag-slider ref=\"axisLineWidthSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('axisGroup')
    ], PolarAxisPanel.prototype, "axisGroup", void 0);
    __decorate([
        RefSelector('axisColorInput')
    ], PolarAxisPanel.prototype, "axisColorInput", void 0);
    __decorate([
        RefSelector('axisLineWidthSlider')
    ], PolarAxisPanel.prototype, "axisLineWidthSlider", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], PolarAxisPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], PolarAxisPanel.prototype, "init", null);
    return PolarAxisPanel;
}(Component));
export { PolarAxisPanel };
