var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgAngleSelect, AgSlider, Autowired, Component, PostConstruct, RefSelector, } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
import { AxisTicksPanel } from "./axisTicksPanel";
import { FontPanel } from "../fontPanel";
import { getMaxValue } from "../formatPanel";
export class AxisPanel extends Component {
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
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, updateAxisLabelRotations);
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
            .setMaxValue(getMaxValue(currentValue, 10))
            .setLabel(chartTranslationService.translate("thickness"))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setAxisProperty("line.width", newValue));
        if (_.includes(['line', 'scatter', 'bubble'], this.chartController.getChartType()) && !this.chartController.isGrouping()) {
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
        const axisTicksComp = this.createBean(new AxisTicksPanel(this.chartOptionsService));
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
        const labelPanelComp = this.createBean(new FontPanel(params));
        this.axisGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);
        this.addAdditionalLabelComps(labelPanelComp);
    }
    addAdditionalLabelComps(labelPanelComp) {
        const createAngleComp = (label, axisType) => {
            const value = this.chartOptionsService.getLabelRotation(axisType);
            const angleSelect = new AgAngleSelect()
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
        const labelPaddingSlider = this.createBean(new AgSlider());
        const currentValue = this.chartOptionsService.getAxisProperty("label.padding");
        labelPaddingSlider.setLabel(this.chartTranslationService.translate("padding"))
            .setMaxValue(getMaxValue(currentValue, 30))
            .setValue(`${currentValue}`)
            .setTextFieldWidth(45)
            .onValueChange(newValue => this.chartOptionsService.setAxisProperty("label.padding", newValue));
        labelPanelComp.addCompToPanel(labelPaddingSlider);
    }
    destroyActivePanels() {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
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
    Autowired('chartTranslationService')
], AxisPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], AxisPanel.prototype, "init", null);
//# sourceMappingURL=axisPanel.js.map