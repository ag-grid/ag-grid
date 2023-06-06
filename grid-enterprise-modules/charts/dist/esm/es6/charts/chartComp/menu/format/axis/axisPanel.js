var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgCheckbox, AgSlider, Autowired, Component, PostConstruct, RefSelector, } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
import { AxisTicksPanel } from "./axisTicksPanel";
import { FontPanel } from "../fontPanel";
import { getMaxValue } from "../formatPanel";
import { AgAngleSelect } from "../../../../../widgets/agAngleSelect";
export class AxisPanel extends Component {
    constructor({ chartController, chartOptionsService, isExpandedOnInit = false }) {
        super();
        this.activePanels = [];
        this.axisLabelUpdateFuncs = [];
        this.prevXRotation = 0;
        this.prevYRotation = 0;
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.isExpandedOnInit = isExpandedOnInit;
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
        this.axisGroup
            .setTitle(this.translate("axis"))
            .toggleGroupExpand(this.isExpandedOnInit)
            .hideEnabledCheckbox(true);
        this.axisColorInput
            .setLabel(this.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getAxisProperty("line.color"))
            .onValueChange(newColor => this.chartOptionsService.setAxisProperty("line.color", newColor));
        const currentValue = this.chartOptionsService.getAxisProperty("line.width");
        this.axisLineWidthSlider
            .setMaxValue(getMaxValue(currentValue, 10))
            .setLabel(this.translate("thickness"))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setAxisProperty("line.width", newValue));
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
        };
        const params = {
            name: this.translate("labels"),
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
        this.addLabelPadding(labelPanelComp);
        const { xRotationComp, yRotationComp } = this.createRotationWidgets();
        const autoRotateCb = this.initLabelRotations(xRotationComp, yRotationComp);
        labelPanelComp.addCompToPanel(autoRotateCb);
        labelPanelComp.addCompToPanel(xRotationComp);
        labelPanelComp.addCompToPanel(yRotationComp);
    }
    initLabelRotations(xRotationComp, yRotationComp) {
        const getLabelRotation = (axisType) => {
            return this.chartOptionsService.getLabelRotation(axisType);
        };
        const setLabelRotation = (axisType, value) => {
            this.chartOptionsService.setLabelRotation(axisType, value);
        };
        const updateAutoRotate = (autoRotate) => {
            this.chartOptionsService.setAxisProperty("label.autoRotate", autoRotate);
            if (autoRotate) {
                // store prev rotations before we remove them from the options
                this.prevXRotation = getLabelRotation("xAxis");
                this.prevYRotation = getLabelRotation("yAxis");
                // `autoRotate` is only
                setLabelRotation("xAxis", undefined);
                setLabelRotation("yAxis", undefined);
            }
            else {
                // reinstate prev rotations
                setLabelRotation("xAxis", this.prevXRotation);
                setLabelRotation("yAxis", this.prevYRotation);
            }
            xRotationComp.setDisabled(autoRotate);
            yRotationComp.setDisabled(autoRotate);
        };
        const getAutoRotateValue = () => {
            const xRotation = getLabelRotation("xAxis");
            const yRotation = getLabelRotation("yAxis");
            if (xRotation == undefined && yRotation == undefined) {
                return this.chartOptionsService.getAxisProperty("label.autoRotate");
            }
            return false;
        };
        const autoRotate = getAutoRotateValue();
        const autoRotateCheckbox = this.createBean(new AgCheckbox())
            .setLabel(this.translate('autoRotate'))
            .setValue(autoRotate)
            .onValueChange(updateAutoRotate);
        // init rotation comp state
        xRotationComp.setDisabled(autoRotate);
        yRotationComp.setDisabled(autoRotate);
        return autoRotateCheckbox;
    }
    createRotationWidgets() {
        const degreesSymbol = String.fromCharCode(176);
        const createRotationComp = (labelKey, axisType) => {
            const label = `${this.chartTranslationService.translate(labelKey)} ${degreesSymbol}`;
            const value = this.chartOptionsService.getLabelRotation(axisType);
            const angleSelect = new AgAngleSelect()
                .setLabel(label)
                .setLabelWidth("flex")
                .setValue(value || 0)
                .onValueChange(newValue => this.chartOptionsService.setLabelRotation(axisType, newValue));
            // the axis label rotation needs to be updated when the default category changes in the data panel
            this.axisLabelUpdateFuncs.push(() => {
                const value = this.chartOptionsService.getLabelRotation(axisType);
                angleSelect.setValue(value || 0);
            });
            return this.createBean(angleSelect);
        };
        return {
            xRotationComp: createRotationComp("xRotation", "xAxis"),
            yRotationComp: createRotationComp("yRotation", "yAxis")
        };
    }
    addLabelPadding(labelPanelComp) {
        const labelPaddingSlider = this.createBean(new AgSlider());
        const currentValue = this.chartOptionsService.getAxisProperty("label.padding");
        labelPaddingSlider.setLabel(this.chartTranslationService.translate("padding"))
            .setMaxValue(getMaxValue(currentValue, 30))
            .setValue(`${currentValue}`)
            .setTextFieldWidth(45)
            .onValueChange(newValue => this.chartOptionsService.setAxisProperty("label.padding", newValue));
        labelPanelComp.addCompToPanel(labelPaddingSlider);
    }
    translate(key, defaultText) {
        return this.chartTranslationService.translate(key, defaultText);
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
    Autowired('chartTranslationService')
], AxisPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], AxisPanel.prototype, "init", null);
