"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolarAxisPanel = void 0;
const core_1 = require("@ag-grid-community/core");
const fontPanel_1 = require("../fontPanel");
const formatPanel_1 = require("../formatPanel");
const seriesTypeMapper_1 = require("../../../utils/seriesTypeMapper");
class PolarAxisPanel extends core_1.Component {
    constructor({ chartController, chartOptionsService, isExpandedOnInit = false }) {
        super();
        this.dynamicComponents = [];
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.isExpandedOnInit = isExpandedOnInit;
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
        };
        this.setTemplate(PolarAxisPanel.TEMPLATE, { axisGroup: groupParams });
        this.initAxis();
        this.initAxisLabels();
        this.initRadiusAxis();
    }
    initAxis() {
        this.axisGroup
            .setTitle(this.translate('axis'))
            .toggleGroupExpand(this.isExpandedOnInit)
            .hideEnabledCheckbox(true);
        this.axisColorInput
            .setLabel(this.translate('color'))
            .setLabelWidth('flex')
            .setInputWidth('flex')
            .setValue(this.chartOptionsService.getAxisProperty('line.color'))
            .onValueChange((newColor) => this.chartOptionsService.setAxisProperty('line.color', newColor));
        const currentValue = this.chartOptionsService.getAxisProperty('line.width');
        this.axisLineWidthSlider
            .setMaxValue((0, formatPanel_1.getMaxValue)(currentValue, 10))
            .setLabel(this.translate('thickness'))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange((newValue) => this.chartOptionsService.setAxisProperty('line.width', newValue));
        const chartType = this.chartController.getChartType();
        const hasConfigurableAxisShape = ['radarLine', 'radarArea'].includes(chartType);
        if (hasConfigurableAxisShape) {
            const options = [
                { value: 'circle', text: this.translate('circle') },
                { value: 'polygon', text: this.translate('polygon') },
            ];
            this.axisGroup.addItem(this.initSelect({
                label: 'shape',
                options: options,
                currentValue: this.chartOptionsService.getAxisProperty('shape'),
                onValueChange: newValue => this.chartOptionsService.setAxisProperty('shape', newValue)
            }));
        }
        if ((0, seriesTypeMapper_1.isPolar)(chartType)) {
            const currentValue = this.chartOptionsService.getAxisProperty('innerRadiusRatio');
            this.axisGroup.addItem(this.initSlider({
                label: 'innerRadius',
                maxValue: 1,
                currentValue: currentValue !== null && currentValue !== void 0 ? currentValue : 0,
                onValueChange: newValue => this.chartOptionsService.setAxisProperty('innerRadiusRatio', newValue)
            }));
        }
    }
    initAxisLabels() {
        const initialFont = {
            family: this.chartOptionsService.getAxisProperty('label.fontFamily'),
            style: this.chartOptionsService.getAxisProperty('label.fontStyle'),
            weight: this.chartOptionsService.getAxisProperty('label.fontWeight'),
            size: this.chartOptionsService.getAxisProperty('label.fontSize'),
            color: this.chartOptionsService.getAxisProperty('label.color'),
        };
        const setFont = (font) => {
            if (font.family) {
                this.chartOptionsService.setAxisProperty('label.fontFamily', font.family);
            }
            if (font.weight) {
                this.chartOptionsService.setAxisProperty('label.fontWeight', font.weight);
            }
            if (font.style) {
                this.chartOptionsService.setAxisProperty('label.fontStyle', font.style);
            }
            if (font.size) {
                this.chartOptionsService.setAxisProperty('label.fontSize', font.size);
            }
            if (font.color) {
                this.chartOptionsService.setAxisProperty('label.color', font.color);
            }
        };
        const params = {
            name: this.translate('labels'),
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont,
            setFont,
        };
        const labelPanelComp = this.createBean(new fontPanel_1.FontPanel(params));
        const labelOrientationComp = this.createOrientationWidget();
        labelPanelComp.addItemToPanel(labelOrientationComp);
        this.axisGroup.addItem(labelPanelComp);
        this.dynamicComponents.push(labelPanelComp);
    }
    createOrientationWidget() {
        const options = [
            { value: 'fixed', text: this.translate('fixed') },
            { value: 'parallel', text: this.translate('parallel') },
            { value: 'perpendicular', text: this.translate('perpendicular') },
        ];
        return this.initSelect({
            label: 'orientation',
            options: options,
            currentValue: this.chartOptionsService.getAxisProperty('label.orientation'),
            onValueChange: newValue => this.chartOptionsService.setAxisProperty('label.orientation', newValue),
        });
    }
    initRadiusAxis() {
        var _a, _b;
        const chartType = this.chartController.getChartType();
        if (!(0, seriesTypeMapper_1.isRadial)(chartType))
            return;
        const paddingPanelComp = this.createBean(new core_1.AgGroupComponent({
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
            onValueChange: newValue => this.chartOptionsService.setAxisProperty('paddingInner', newValue)
        }));
        paddingPanelComp.addItem(this.initSlider({
            label: 'seriesPadding',
            maxValue: 1,
            currentValue: (_b = this.chartOptionsService.getAxisProperty('groupPaddingInner')) !== null && _b !== void 0 ? _b : 0,
            onValueChange: newValue => this.chartOptionsService.setAxisProperty('groupPaddingInner', newValue)
        }));
        this.axisGroup.addItem(paddingPanelComp);
        this.dynamicComponents.push(paddingPanelComp);
    }
    initSlider(config) {
        const { label, maxValue, minValue = 0, step = 0.05, currentValue, onValueChange } = config;
        const slider = this.createManagedBean(new core_1.AgSlider());
        slider
            .setLabel(this.translate(label))
            .setLabelWidth('flex')
            .setMinValue(minValue)
            .setMaxValue(maxValue)
            .setStep(step)
            .setValue(`${currentValue}`)
            .onValueChange(onValueChange);
        this.dynamicComponents.push(slider);
        return slider;
    }
    initSelect(config) {
        const { label, options, currentValue, onValueChange } = config;
        const select = this.createManagedBean(new core_1.AgSelect());
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
    }
    translate(key, defaultText) {
        return this.chartTranslationService.translate(key, defaultText);
    }
    destroyDynamicComponents() {
        this.dynamicComponents.forEach(component => {
            core_1._.removeFromParent(component.getGui());
            this.destroyBean(component);
        });
        this.dynamicComponents = [];
    }
    destroy() {
        this.destroyDynamicComponents();
        super.destroy();
    }
}
PolarAxisPanel.TEMPLATE = `<div>
            <ag-group-component ref="axisGroup">
                <ag-color-picker ref="axisColorInput"></ag-color-picker>
                <ag-slider ref="axisLineWidthSlider"></ag-slider>
            </ag-group-component>
        </div>`;
__decorate([
    (0, core_1.RefSelector)('axisGroup')
], PolarAxisPanel.prototype, "axisGroup", void 0);
__decorate([
    (0, core_1.RefSelector)('axisColorInput')
], PolarAxisPanel.prototype, "axisColorInput", void 0);
__decorate([
    (0, core_1.RefSelector)('axisLineWidthSlider')
], PolarAxisPanel.prototype, "axisLineWidthSlider", void 0);
__decorate([
    (0, core_1.Autowired)('chartTranslationService')
], PolarAxisPanel.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.PostConstruct
], PolarAxisPanel.prototype, "init", null);
exports.PolarAxisPanel = PolarAxisPanel;
