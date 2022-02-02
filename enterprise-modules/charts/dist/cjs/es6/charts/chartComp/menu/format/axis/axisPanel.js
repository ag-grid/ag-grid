"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const chartController_1 = require("../../../chartController");
const axisTicksPanel_1 = require("./axisTicksPanel");
const fontPanel_1 = require("../fontPanel");
const formatPanel_1 = require("../formatPanel");
class AxisPanel extends core_1.Component {
    constructor(chartController, chartOptionsService) {
        super();
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.activePanels = [];
        this.axisLabelUpdateFuncs = [];
    }
    init() {
        const groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(AxisPanel.TEMPLATE, { axisGroup: groupParams });
        this.initAxis();
        this.initAxisTicks();
        this.initAxisLabels();
        const updateAxisLabelRotations = () => this.axisLabelUpdateFuncs.forEach(func => func());
        this.addManagedListener(this.chartController, chartController_1.ChartController.EVENT_CHART_UPDATED, updateAxisLabelRotations);
    }
    initAxis() {
        const { chartTranslationService } = this;
        this.axisGroup
            .setTitle(chartTranslationService.translate("axis"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
        this.axisColorInput
            .setLabel(chartTranslationService.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getAxisProperty("line.color"))
            .onValueChange(newColor => this.chartOptionsService.setAxisProperty("line.color", newColor));
        const currentValue = this.chartOptionsService.getAxisProperty("line.width");
        this.axisLineWidthSlider
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 10))
            .setLabel(chartTranslationService.translate("thickness"))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setAxisProperty("line.width", newValue));
        if (core_1._.includes(['line', 'scatter', 'bubble'], this.chartController.getChartType()) && !this.chartController.isGrouping()) {
            const options = [
                { value: '', text: chartTranslationService.translate('automatic') }
            ];
            ['category', 'time', 'number'].forEach((type) => {
                options.push({ value: type, text: chartTranslationService.translate(type) });
            });
            this.xAxisTypeSelect
                .setLabel(chartTranslationService.translate('xType'))
                .setLabelWidth('flex')
                .addOptions(options)
                .setValue(this.chartOptionsService.getChartOption('xAxis.type') || '')
                .onValueChange(newValue => {
                this.chartOptionsService.setChartOption('xAxis.type', typeof newValue === 'string' && newValue.length && newValue);
                this.chartController.updateForDataChange();
            });
        }
        else {
            this.xAxisTypeSelect.setDisplayed(false);
        }
    }
    initAxisTicks() {
        const axisTicksComp = this.createBean(new axisTicksPanel_1.AxisTicksPanel(this.chartOptionsService));
        this.axisGroup.addItem(axisTicksComp);
        this.activePanels.push(axisTicksComp);
    }
    initAxisLabels() {
        const initialFont = {
            family: this.chartOptionsService.getAxisProperty("label.fontFamily"),
            style: this.chartOptionsService.getAxisProperty("label.fontStyle"),
            weight: this.chartOptionsService.getAxisProperty("label.fontWeight"),
            size: this.chartOptionsService.getAxisProperty("label.fontSize"),
            color: this.chartOptionsService.getAxisProperty("label.color")
        };
        const setFont = (font) => {
            if (font.family) {
                this.chartOptionsService.setAxisProperty("label.fontFamily", font.family);
            }
            if (font.weight) {
                this.chartOptionsService.setAxisProperty("label.fontWeight", font.weight);
            }
            if (font.style) {
                this.chartOptionsService.setAxisProperty("label.fontStyle", font.style);
            }
            if (font.size) {
                this.chartOptionsService.setAxisProperty("label.fontSize", font.size);
            }
            if (font.color) {
                this.chartOptionsService.setAxisProperty("label.color", font.color);
            }
            this.chartController.getChartProxy().getChart().layoutPending = true;
        };
        const params = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont,
            setFont
        };
        const labelPanelComp = this.createBean(new fontPanel_1.FontPanel(params));
        this.axisGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
        this.addAdditionalLabelComps(labelPanelComp);
    }
    addAdditionalLabelComps(labelPanelComp) {
        const createAngleComp = (label, axisType) => {
            const value = this.chartOptionsService.getLabelRotation(axisType);
            const angleSelect = new core_1.AgAngleSelect()
                .setLabel(label)
                .setLabelWidth("flex")
                .setValue(value || 0)
                .onValueChange(newValue => this.chartOptionsService.setLabelRotation(axisType, newValue));
            // the axis label rotation needs to be updated when the default category changes in the data panel
            this.axisLabelUpdateFuncs.push(() => {
                const value = this.chartOptionsService.getLabelRotation(axisType);
                angleSelect.setValue(value);
            });
            const rotationInput = this.createBean(angleSelect);
            labelPanelComp.addCompToPanel(rotationInput);
        };
        const degreesSymbol = String.fromCharCode(176);
        const xRotationLabel = `${this.chartTranslationService.translate("xRotation")} ${degreesSymbol}`;
        const yRotationLabel = `${this.chartTranslationService.translate("yRotation")} ${degreesSymbol}`;
        createAngleComp(xRotationLabel, "xAxis");
        createAngleComp(yRotationLabel, "yAxis");
        const labelPaddingSlider = this.createBean(new core_1.AgSlider());
        const currentValue = this.chartOptionsService.getAxisProperty("label.padding");
        labelPaddingSlider.setLabel(this.chartTranslationService.translate("padding"))
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 30))
            .setValue(`${currentValue}`)
            .setTextFieldWidth(45)
            .onValueChange(newValue => this.chartOptionsService.setAxisProperty("label.padding", newValue));
        labelPanelComp.addCompToPanel(labelPaddingSlider);
    }
    destroyActivePanels() {
        this.activePanels.forEach(panel => {
            core_1._.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }
    destroy() {
        this.destroyActivePanels();
        super.destroy();
    }
}
AxisPanel.TEMPLATE = `<div>
            <ag-group-component ref="axisGroup">
                <ag-color-picker ref="axisColorInput"></ag-color-picker>
                <ag-slider ref="axisLineWidthSlider"></ag-slider>
                <ag-select ref="xAxisTypeSelect"></ag-select>
            </ag-group-component>
        </div>`;
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
exports.AxisPanel = AxisPanel;
//# sourceMappingURL=axisPanel.js.map